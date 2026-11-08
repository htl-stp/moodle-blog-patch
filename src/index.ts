import { addBlogLink } from './ui/addBlogLink';
import { modifyBlogPage } from './ui/pages/modifyBlogPage';
import { MoodleApi } from './moodle/MoodleApi';
import { MAX_CONTENT_LIMIT, MAX_TITLE_LIMIT } from './constants';
import { deriveKeypair } from './crypto/keypair';
import { extractKeyEnvelopeFromTags } from './codec/keyEnvelope';
import { setupKeys } from './ui/components/setupKeysModal';
import { FeedService } from './services/FeedService';
import { PostService } from './services/PostService';
import {modifyAddBlogPage} from "./ui/pages/modifyAddBlogPage";

// required since types are now ["node", "bun"]
declare const window: Window;

export function waitFor<T extends Element>(selector: string): Promise<T> {
	return new Promise((resolve) => {
		const found = document.querySelector<T>(selector);
		if (found) return resolve(found);
		const obs = new MutationObserver(() => {
			const el = document.querySelector<T>(selector);
			if (el) { obs.disconnect(); resolve(el); }
		});
		obs.observe(document, { childList: true, subtree: true });
	});
}

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

// let config = loadConfig();

// main
(async function () {
	'use strict';

	waitFor('#page-content').then(() => addBlogLink());

	const observer = new MutationObserver(() => {
		modifyAddBlogPage(async (title, description, passphrase) => {
			console.log(title, description, passphrase);

			const userData = await MoodleApi.getInstance().getUserData();

			const keys = await deriveKeypair(passphrase, userData.userid);

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

				await PostService.addPost(userid, title, description, [], keys.privateKey);

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

		const posts = await FeedService.getFeed();

		modifyBlogPage(posts)();
	}

	await setupKeys();
})();
