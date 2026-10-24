import { FetchedPost, Post, PostPayload, UserConfig } from './types';
import { addBlogLink } from './html/addBlogLink';
import { modifyAddBlogPage } from './html/modifyAddBlogPage';
import { modifyBlogPage } from './html/modifyBlogPage';
import { MoodleApi } from './moodleApi';

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

async function saveConfig(config: UserConfig) {
	const str = JSON.stringify(config);

	await MoodleApi.getInstance().setDescription(str);
}

async function addPost(
	config: UserConfig,
	title: string,
	content: string,
	tags: string[],
) {
	const p: PostPayload = {
		v: 1,
		id: crypto.randomUUID(),
		title,
		content,
		tags,
		created: Date.now(),
	};
	config.posts.push({ payload: JSON.stringify(p) });
	await saveConfig(config);
}

async function loadConfig(): Promise<UserConfig> {
	const str = await MoodleApi.getInstance().getDescription();

	try {
		const config = parseConfig(str!);

		return config;
	} catch (e) {
		const config: UserConfig = {
			posts: [],
			v: 1,
		};

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
	const payload: PostPayload = JSON.parse(str);

	if (
		!Object.hasOwn(payload, 'v') ||
		!Object.hasOwn(payload, 'id') ||
		!Object.hasOwn(payload, 'title') ||
		!Object.hasOwn(payload, 'content') ||
		!Object.hasOwn(payload, 'tags') ||
		!Object.hasOwn(payload, 'created')
	) {
		throw new Error('invalid post payload');
	}

	if (!Array.isArray(payload.tags)) {
		throw new Error('tags must be an array');
	}

	if (
		!Number.isInteger(payload.v) ||
		!(payload.v > 0) ||
		!Number.isInteger(payload.created) ||
		!(payload.created > 0)
	) {
		throw new Error('invalid post payload');
	}

	if (payload.title.length > 128 || payload.content.length > 2000) {
		throw new Error('invalid post payload');
	}

	return payload;
}

function parseConfig(str: string) {
	const configJson: UserConfig = JSON.parse(str);

	if (!Object.hasOwn(configJson, 'posts') || !Object.hasOwn(configJson, 'v')) {
		throw new Error('invalid config');
	}

	for (const post of configJson.posts) {
		const payload = post.payload;

		parsePostPayload(payload);
	}

	return configJson;
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
			const conf: UserConfig = parseConfig(description);

			console.log(conf);

			const postPayloads: PostPayload[] = conf.posts.map((p) =>
				parsePostPayload(p.payload),
			);
			let fetchedPosts: FetchedPost[] = postPayloads.map((p) => ({
				...p,
				title: p.title.trim(),
				content: p.content.trim(),
				authorId: user.id,
				author: user.user,
			}));

			fetchedPosts = fetchedPosts.filter((p) => {
				return (
					!(p.created > Date.now()) &&
					!(new Date(p.created).getFullYear() < 2026)
				);
			});

			posts.push(...fetchedPosts);

			console.log(`received ${conf.posts.length} posts from ${user.user}`);
		} catch (e) {
			console.log(e);
		}
	}

	posts.sort((a, b) => b.created - a.created);

	return posts;
}

let config: UserConfig;

(async function () {
	'use strict';

	modifyHTML(addBlogLink);

	if (location.href.startsWith('https://moodle.htlstp.ac.at/blog/index.php')) {
		modifyHTML(modifyBlogPage([]));

		const posts = await getFeed();
		modifyBlogPage(posts)();
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
					alert('Could not add post to blog');
				}

				await MoodleApi.getInstance().addInterests(['moodle']);

				location.href = 'https://moodle.htlstp.ac.at/blog/index.php';
			}),
		);
	}

	// setupFetchIntercept();
})();
