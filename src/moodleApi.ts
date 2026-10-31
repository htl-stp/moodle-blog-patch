import {MOODLE_DESCRIPTION_LIMIT} from "./constants";

export class MoodleApi {
	private static instance = new MoodleApi();

	private constructor() {}

	static getInstance() {
		return this.instance;
	}

	/**
	 * Gets the description of the user if specified, else the currently logged in one.
	 * @param userId
	 */
	async getDescription(userId?: number) {
		const res = await fetch(
			'https://moodle.htlstp.ac.at/user/profile.php' +
				(userId ? `?id=${userId}` : ''),
		);

		const html = await res.text();

		const doc = new DOMParser().parseFromString(html, 'text/html');

		return doc.querySelector(
			'div[id="region-main"] > div > div > div[class="description"]',
		)?.textContent;
	}

	private async getProfileForm() {
		const res = await fetch('https://moodle.htlstp.ac.at/user/edit.php');

		const html = await res.text();

		const doc = new DOMParser().parseFromString(html, 'text/html');

		const textarea = doc.querySelector(
			'textarea[id="id_description_editor"]',
		) as HTMLTextAreaElement;

		const form = textarea?.closest('form');

		if (!form || !textarea) {
			throw new Error('Could not find a form or textarea');
		}

		return form;
	}

	async addInterests(interests: string[]) {
		const form = await this.getProfileForm();
		const data = new FormData(form);

		for (const interest of interests) {
			data.append('interests[]', interest);
		}

		const result = await fetch(form.action, {
			method: 'POST',
			body: data,
			credentials: 'same-origin',
		});

		if (!result.ok) {
			throw new Error(`POST failed: ${result.status}`);
		}

		console.log(data);

		console.log('Submission response:', result.url, result.status);

		console.log(result.text());
	}

	async setDescription(description: string) {
		if (description.length > MOODLE_DESCRIPTION_LIMIT) {
			throw new Error('Description is too long!')
		}

		const form = await this.getProfileForm();
		const data = new FormData(form);

		data.set('description_editor[text]', description);

		const result = await fetch(form.action, {
			method: 'POST',
			body: data,
			credentials: 'same-origin',
		});

		if (!result.ok) {
			throw new Error(`POST failed: ${result.status}`);
		}

		console.log('Submission response:', result.url, result.status);
	}

	async fetchOwnUserId() {
		const res = await fetch('https://moodle.htlstp.ac.at/user/profile.php');

		const html = await res.text();

		const doc = new DOMParser().parseFromString(html, 'text/html');

		return doc.querySelector('div[data-userid]')?.getAttribute('data-userid');
	}

	async getEvidence() {
		const res = await fetch(
			'https://moodle.htlstp.ac.at/admin/tool/lp/user_evidence_list.php',
		);

		const html = await res.text();

		const doc = new DOMParser().parseFromString(html, 'text/html');

		const nodes = Array.from(
			doc
				.querySelectorAll("tr[data-region='user-evidence-node'][data-id]")
				.values(),
		);

		return nodes.map((node) => ({
			id: Number.parseInt(node.getAttribute('data-id')!, 10),
			name: node.querySelector('td > a')?.textContent,
		}));
	}
}
