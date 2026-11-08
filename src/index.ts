import { addBlogLink } from './ui/addBlogLink';
import { setPageShell } from './ui/pages/setPageShell';
import { setupKeys } from './ui/components/setupKeysModal';
import { Draft, publish } from './services/publishService';
import { installAddPostModal } from './ui/components/addPostModal';
import { mountBlogPage } from './ui/BlogPage';

export function waitFor<T extends Element>(selector: string): Promise<T> {
	return new Promise((resolve) => {
		const found = document.querySelector<T>(selector);
		if (found) return resolve(found);
		const obs = new MutationObserver(() => {
			const el = document.querySelector<T>(selector);
			if (el) {
				obs.disconnect();
				resolve(el);
			}
		});
		obs.observe(document, { childList: true, subtree: true });
	});
}

// let config = loadConfig();

async function onSubmit(draft: Draft) {
	try {
		await publish(draft);
		location.href = 'https://moodle.htlstp.ac.at/blog/index.php';
	} catch (e) {
		alert(`Could not add post to blog. Reason: ${(e as Error).message}`);
	}
}

// main
(async function () {
	'use strict';

	waitFor('#page-content').then(() => addBlogLink());

	installAddPostModal(onSubmit);

	if (
		location.href.startsWith('https://moodle.htlstp.ac.at/blog/index.php') ||
		location.href.startsWith('https://moodle.htlstp.ac.at/blog/edit.php')
	) {
		await waitFor('#page-content');
		setPageShell();

		await waitFor('#region-main [role="main"]');
		const main = document.querySelector('#region-main [role="main"]')!;

		main.replaceChildren();

		mountBlogPage(main);
	}

	await setupKeys();
})();
