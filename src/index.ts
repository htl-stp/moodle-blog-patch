import {addBlogLink} from './html/addBlogLink';
import {modifyAddBlogPage} from './html/modifyAddBlogPage';
import {modifyBlogPage} from './html/modifyBlogPage';
import {MoodleApi} from './moodleApi';
import {FetchedPost, Post, PostSchema, StoredPost} from './types';
import {Config} from './Config';
import {isNewVersionAvailable} from "./versionChecker";
import {MAX_CONTENT_LIMIT, MAX_TITLE_LIMIT, POST_VERSION} from "./constants";

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

function setupFetchIntercept() {
	const originalFetch = window.fetch;

	window.fetch = async function (...args) {
		const [resource, options] = args;

		const request = resource instanceof Request ? resource : null;

		const url = new URL(
			request ? request.url : String(resource),
			location.href,
		);

		// intercept code here (when needed)

		const response = await originalFetch.apply(this, args);

		return response;
	};
}

async function saveConfig(config: Config) {
	const str = await config.serialize();

	await MoodleApi.getInstance().setDescription(str);
}

const generateNewPostId = () =>
	Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, '0')).join('');

async function addPost(
	config: Config,
	title: string,
	content: string,
	tags: string[],
) {
	const postIds = config.data.posts.map(p => PostSchema.parse(JSON.parse(p.payload))).map(p => p.id)

	let id: string;
	do {
		id = generateNewPostId();
	} while (postIds.includes(id));

	const p: Post = {
		v: POST_VERSION,
		id: id,
		title,
		content,
		tags,
		created: Date.now(),
	};
	config.data.posts.push({ payload: JSON.stringify(p) } satisfies StoredPost);
	await saveConfig(config);
}

async function loadConfig(): Promise<Config> {
	const str = await MoodleApi.getInstance().getDescription();

	try {
		const config = await Config.fromDescription(str!);

		return config;
	} catch (e) {
		const config = new Config({ posts: [] });

		await saveConfig(config);

		return config;
	}
}

async function getInterestedUsersForTag(tag: string) {
	const res = await fetch(
		`https://moodle.htlstp.ac.at/tag/index.php?tag=${tag}`,
	);

	const html = await res.text();

	const doc = new DOMParser().parseFromString(html, 'text/html');

	const nodes = doc.querySelectorAll(
		'div[id="tagarea-core-user"] > div > ul > li > div > div > a',
	);

	const users = Array.from(nodes).map((el) => ({
		user: el.textContent!,
		id: Number(el.getAttribute('href')?.split('?id=')[1]),
	}));

	return users;
}

function parsePostPayload(storedPost: StoredPost, authorId: number, author: string): FetchedPost | null {
	const json = JSON.parse(storedPost.payload)

	let badge = null;

	if (json.v === 1) {
		badge = {
			text: 'Legacy Post (v0.0.1)',
			backgroundColor: '#dd0000',
			color: '#fff',
		}
	} else if (json.v === undefined) {
		badge = {
			text: 'Unverified Post (v0.0.2)',
			backgroundColor: '#dd0000',
			color: '#fff',
		}
	} else if (json.v === '0.0.3') {
		badge = {
			text: 'Unverified Post',
			backgroundColor: '#dd0000',
			color: '#fff',
		}
	} else {
		badge = {
			text: `Newer Version (${json.v})`,
			backgroundColor: '#dd0000',
			color: '#fff',
		}
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
		badge: badge
	}
}

async function getFeed() {
	const users = await getInterestedUsersForTag('moodle');
	console.log(users);

	const posts: FetchedPost[] = [];

	for (const user of users) {
		const description = await MoodleApi.getInstance().getDescription(user.id);

		if (!description) {
			continue;
		}

		try {
			const config: Config = await Config.fromDescription(description);

			let fetchedPosts: FetchedPost[] = [];

			fetchedPosts = config.data.posts.map((p) =>
				parsePostPayload(p, user.id, user.user),
			).filter(p => p !== null)

			fetchedPosts = fetchedPosts.filter((p) => {
				return (
					!(p.created > Date.now()) &&
					!(new Date(p.created).getFullYear() < 2026)
				);
			});

			posts.push(...fetchedPosts);

			console.log(
				`received ${config.data.posts.length} posts from ${user.user}`,
			);
		} catch (e) {
			console.log(`Error for: ${user.user}`);
			console.error(e);
		}
	}

	posts.sort((a, b) => b.created - a.created);

	return posts;
}

let config: Config;

(async function () {
	'use strict';

	modifyHTML(addBlogLink);

	if (location.href.startsWith('https://moodle.htlstp.ac.at/blog/index.php')) {
		modifyHTML(modifyBlogPage([], false));

		const posts = await getFeed();
		const newVersion = await isNewVersionAvailable();

		modifyBlogPage(posts, newVersion)();
	} else if (
		location.href.startsWith('https://moodle.htlstp.ac.at/blog/edit.php')
	) {
		modifyHTML(
			modifyAddBlogPage(async (title, description) => {
				console.log(title, description);

				config = await loadConfig();

				if (title.length > MAX_TITLE_LIMIT) {
					alert(`Title is too long. Max length: 128, actual: ${title.length}`);
					return;
				}

				if (description.length > MAX_CONTENT_LIMIT) {
					alert(
						`Description is too long. Max length: 2000, actual: ${description.length}`,
					);
					return;
				}

				try {
					await addPost(config, title, description, []);

					await MoodleApi.getInstance().addInterests(['moodle']);

					location.href = 'https://moodle.htlstp.ac.at/blog/index.php';
				} catch (e) {
					alert(`Could not add post to blog. Reason: ${(e as Error).message}`);
				}
			}),
		);
	}

	// setupFetchIntercept();
})();
