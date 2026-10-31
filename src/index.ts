import { addBlogLink } from './html/addBlogLink';
import { modifyAddBlogPage } from './html/modifyAddBlogPage';
import { modifyBlogPage } from './html/modifyBlogPage';
import { MoodleApi } from './moodleApi';
import {Badge, FetchedPost, Post, PostSchema, StoredPost, StoredPostSchema} from './types';
import { Config } from './Config';
import {isNewVersionAvailable} from "./versionChecker";

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

async function addPost(
	config: Config,
	title: string,
	content: string,
	tags: string[],
) {
	const p: Post = {
		id: crypto.randomUUID(),
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

function parsePostPayload(str: string) {
	return PostSchema.parse(JSON.parse(str));
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

		console.log(description)

		try {
			const config: Config = await Config.fromDescription(description);

			let postPayloads: Post[] = [];
			let badge = {
				text: 'Unverified Post',
				backgroundColor: '#ff0000',
				color: '#fff'
			};

			postPayloads = config.data.posts.map((p) =>
				parsePostPayload(p.payload),
			)

			let fetchedPosts: FetchedPost[] = postPayloads.map((p) => ({
				...p,
				title: p.title.trim(),
				content: p.content.trim(),
				authorId: user.id,
				author: user.user,
				badge: badge
			}));

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

				if (title.length > 128) {
					alert(`Title is too long. Max length: 128, actual: ${title.length}`);
					return;
				}

				if (description.length > 2000) {
					alert(
						`Description is too long. Max length: 2000, actual: ${description.length}`,
					);
					return;
				}

				try {
					await addPost(config, title, description, []);
				} catch (e) {
					alert(`Could not add post to blog. Reason: ${(e as Error).message}`);
				}

				await MoodleApi.getInstance().addInterests(['moodle']);

				location.href = 'https://moodle.htlstp.ac.at/blog/index.php';
			}),
		);
	}

	// setupFetchIntercept();
})();
