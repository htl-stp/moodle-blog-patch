import { addBlogLink } from './ui/addBlogLink';
import { modifyAddBlogPage } from './ui/pages/modifyAddBlogPage';
import { modifyBlogPage } from './ui/pages/modifyBlogPage';
import { MoodleApi } from './moodle/MoodleApi';
import {
	FetchedPost,
	Post,
	PostSchema,
	StoredPost,
	StoredPostSchema,
} from './domain/schemas';
import { MAX_CONTENT_LIMIT, MAX_TITLE_LIMIT, POST_VERSION } from './constants';
import { z } from 'zod';
import { openModal } from './ui/modal';
import { generatePassphrase } from './crypto/passphrase';
import { deriveKeypair, sign, verify } from './crypto/keypair';
import { Storage } from './storage/Storage';
import { PostChunkString, StoredPostTags } from './codec/postTags';
import {
	CryptoKeyEnvelope,
	CryptoKeyEnvelopeString,
} from './codec/keyEnvelope';

// required since types are now ["node", "bun"]
declare const window: Window;

function modifyHTML(fn: Function) {
	const observer = new MutationObserver(() => {
		if (fn()) {
			observer.disconnect();
		}
	});

	observer.observe(document, {
		childList: true,
		subtree: true,
	});

	if (fn()) {
		observer.disconnect();
	}
}

const generateNewPostId = () =>
	Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) =>
		b.toString(16).padStart(2, '0'),
	).join('');

async function addPost(
	userid: number,
	title: string,
	content: string,
	tags: string[],
	privateKey: Uint8Array,
) {
	const userData = await MoodleApi.getInstance().getUserData();

	const postIds = parsePostTags(userData.tags)
		.map((p) => PostSchema.parse(JSON.parse(p.payload)))
		.map((p) => p.id);

	let id: string;
	do {
		id = generateNewPostId();
	} while (postIds.includes(id));

	const p: Post = {
		v: POST_VERSION,
		userid: userid,
		id: id,
		title,
		content,
		tags,
		created: Date.now(),
	};

	const storedPost: StoredPost = { payload: JSON.stringify(p) };
	storedPost.signature = sign(storedPost.payload, privateKey);

	const postTags = StoredPostTags.encode(storedPost);

	await MoodleApi.getInstance().addInterests(postTags);
}

export function parsePostTags(strings: string[]) {
	const groups = new Map<string, string[]>();

	console.log(strings);

	for (const s of strings) {
		const chunk = PostChunkString.safeDecode(s);
		if (!chunk.success) continue; // not a chunk string, ignore it

		const key = `${chunk.data.user_id}:${chunk.data.blog_id}`;
		const list = groups.get(key);

		if (list) list.push(s);
		else groups.set(key, [s]);
	}

	// decode each group into a StoredPost, then parse the payload
	const posts: z.output<typeof StoredPostSchema>[] = [];

	for (const [key, list] of groups) {
		const stored = StoredPostTags.safeDecode(list);
		if (!stored.success) {
			console.warn(`Skipping ${key}:`, stored.error.message);
			continue;
		}

		const post = PostSchema.safeParse(JSON.parse(stored.data.payload));
		if (!post.success) {
			console.warn(`Skipping ${key}: invalid payload`);
			continue;
		}

		posts.push(stored.data);
	}

	console.log(posts);

	return posts;
}

function parsePostPayload(
	storedPost: StoredPost,
	authorId: number,
	author: string,
	public_key: string,
): FetchedPost | null {
	const json = JSON.parse(storedPost.payload);

	let badge = null;

	const verified =
		!!storedPost.signature &&
		verify(storedPost.payload, storedPost.signature, public_key);

	if (verified) {
		badge = {
			text: `Verified Post`,
			backgroundColor: '#00cc00',
			color: '#fff',
		};
	} else {
		return null;
	}

	let post: Post;
	const safe = PostSchema.safeParse(json);

	if (safe.success) {
		post = safe.data;
	} else {
		return null;
	}

	return {
		...post,
		author,
		authorId,
		badge: badge,
	};
}

function extractKeyEnvelopeFromTags(tags: string[], userId: number) {
	tags = tags.filter((t) => t.startsWith('p:'));

	for (const tag of tags) {
		try {
			const decoded = CryptoKeyEnvelopeString.decode(tag);

			if (decoded.user_id !== userId) {
				continue;
			}

			return decoded;
		} catch (_) {}
	}

	throw new Error('No public key found.');
}

async function getFeed() {
	const users =
		await MoodleApi.getInstance().getInterestedUsersForTag('moodle');
	console.log(users);

	const posts: FetchedPost[] = [];

	for (const user of users) {
		const { tags, description, userid } =
			await MoodleApi.getInstance().getUserData(user.id);

		if (!description) {
			continue;
		}

		try {
			let key = Storage.getPinnedKeys()[userid];
			if (!key) {
				const extracted = extractKeyEnvelopeFromTags(tags, userid);

				key = extracted.public_key;

				pinKey(extracted.user_id, extracted.name, extracted.public_key);
			}

			if (!key) {
				throw new Error('User has no public key');
			}

			let fetchedPosts: FetchedPost[] = [];

			fetchedPosts = parsePostTags(tags)
				.map((p) => parsePostPayload(p, user.id, user.user, key))
				.filter((p) => p !== null);

			fetchedPosts = fetchedPosts.filter((p) => {
				return (
					!(p.created > Date.now()) &&
					!(new Date(p.created).getFullYear() < 2026) // script exists since 2026, everything before that is invalid
				);
			});

			posts.push(...fetchedPosts);

			console.log(`received ${fetchedPosts.length} posts from ${user.user}`);
		} catch (e) {
			console.log(`Error for: ${user.user}`);
			console.error(e);
		}
	}

	console.log(posts);

	posts.sort((a, b) => b.created - a.created);

	return posts;
}

async function pinKey(user_id: number, name: string, public_key: string) {
	const envelope = CryptoKeyEnvelope.parse({
		name,
		public_key,
		user_id,
	});

	const str = CryptoKeyEnvelopeString.encode(envelope);

	const wasSet = Storage.addPinnedKey(user_id, public_key);

	if (wasSet) {
		MoodleApi.getInstance().addInterests([str]);
	}
}

async function setupKeys() {
	const userData = await MoodleApi.getInstance().getUserData();
	const desc = userData.description;

	let key;
	try {
		const envelope = extractKeyEnvelopeFromTags(userData.tags, userData.userid);

		key = envelope.public_key;
	} catch (_) {}

	if (key) {
		return;
	}

	const modal = await openModal({
		title: 'Key Setup',
		body: `
	<p>To be able to use the moodle blog, you need a passphrase first.</p>
	<p>If you ever lose this passphrase, you will <strong>NEVER</strong> be able to post again!</p>
	
	<div style="display: flex; flex-direction: row; justify-content: space-between;">
		<code id="passphrase"></code>
		
		<div>
			<button id="btn-regenerate">Regenerate</button>
			<button id="btn-copy">Copy</button>
		</div>
	</div>
	
	<p>Retype Passphrase:</p>
	<input id="input-retype" type="text" onpaste="return false" style="width: 50%">
	
	<button id="btn-submit">Submit</button>
`,
		large: true,
	});

	let phrase = generatePassphrase();

	const passPhraseField = document.querySelector('#passphrase')!;
	const regenerateButton = document.querySelector('#btn-regenerate')!;
	const copyButton = document.querySelector('#btn-copy')!;
	const submitButton = document.querySelector('#btn-submit')!;
	const retypeInput = document.querySelector(
		'#input-retype',
	)! as HTMLInputElement;

	passPhraseField.textContent = phrase;

	regenerateButton.addEventListener('click', (e) => {
		phrase = generatePassphrase();
		passPhraseField.textContent = phrase;
	});

	copyButton.addEventListener('click', (e) => {
		navigator.clipboard.writeText(passPhraseField.textContent);
	});

	submitButton.addEventListener('click', async (e) => {
		if (retypeInput.value === phrase) {
			const keys = await deriveKeypair(phrase, userData.userid);

			console.log('Add crypto key');
			await MoodleApi.getInstance().addInterests([
				CryptoKeyEnvelopeString.encode({
					public_key: keys.publicKeyB64u,
					user_id: userData.userid,
					name: userData.name,
				}),
			]);

			openModal({
				title: 'Setup complete!',
				body: `<p>You're all set! The setup is complete.</p>
<p>Here's your passphrase once more, in case you still didn't save it:</p>
<code>${phrase}</code>`,
			});

			modal.destroy();
		} else {
			alert('Wrong passphrase!');
		}
	});
}

// let config = loadConfig();

// main
(async function () {
	'use strict';

	modifyHTML(addBlogLink);

	const observer = new MutationObserver(() => {
		modifyAddBlogPage(async (title, description, passphrase) => {
			console.log(title, description, passphrase);

			const userData = await MoodleApi.getInstance().getUserData();

			const keys = await deriveKeypair(passphrase, userData.userid);

			// FIXME: there might be errors here
			try {
				if (
					keys.publicKeyB64u !==
					extractKeyEnvelopeFromTags(userData.tags, userData.userid).public_key
				) {
					alert('Wrong passphrase!');
					return;
				}
			} catch (e) {
				console.log((e as Error).message);
			}

			if (title.length > MAX_TITLE_LIMIT) {
				alert(
					`Title is too long. Max length: ${MAX_TITLE_LIMIT}, actual: ${title.length}`,
				);
				return;
			}

			if (description.length > MAX_CONTENT_LIMIT) {
				alert(
					`Description is too long. Max length: ${MAX_CONTENT_LIMIT}, actual: ${description.length}`,
				);
				return;
			}

			try {
				const userid = (await MoodleApi.getInstance().getUserData()).userid;
				console.log(userid);

				await addPost(userid, title, description, [], keys.privateKey);

				await MoodleApi.getInstance().addInterests(['moodle']);

				location.href = 'https://moodle.htlstp.ac.at/blog/index.php';
			} catch (e) {
				alert(`Could not add post to blog. Reason: ${(e as Error).message}`);
			}
		})();
	});

	observer.observe(document, {
		childList: true,
		subtree: true,
	});

	if (
		location.href.startsWith('https://moodle.htlstp.ac.at/blog/index.php') ||
		location.href.startsWith('https://moodle.htlstp.ac.at/blog/edit.php')
	) {
		modifyHTML(modifyBlogPage([]));

		const posts = await getFeed();

		modifyBlogPage(posts)();
	}

	await setupKeys();

	// setupFetchIntercept();
})();
