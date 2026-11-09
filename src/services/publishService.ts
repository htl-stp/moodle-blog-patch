import { MAX_CONTENT_LIMIT, MAX_TITLE_LIMIT } from '../constants';
import { MoodleApi } from '../moodle/MoodleApi';
import { deriveKeypair } from '../crypto/keypair';
import { PostService } from './PostService';
import { findKeyEnvelope } from '../codec/keyEnvelope';

export type Draft = { title: string; content: string; passphrase: string };

function validate({ title, content }: Draft) {
	if (title.length > MAX_TITLE_LIMIT) {
		throw new Error(
			`Title is too long. Max length: ${MAX_TITLE_LIMIT}, actual: ${title.length}`,
		);
	}
	if (content.length > MAX_CONTENT_LIMIT) {
		throw new Error(
			`Description is too long. Max length: ${MAX_CONTENT_LIMIT}, actual: ${content.length}`,
		);
	}
}

export async function publish(draft: Draft): Promise<void> {
	validate(draft);

	const me = await MoodleApi.getInstance().getUserData();

	const registered = findKeyEnvelope(me.tags, me.userid);
	if (!registered) {
		throw new Error(
			'You have not set up a key yet. Reload the page to run setup.',
		);
	}

	const keys = await deriveKeypair(draft.passphrase, me.userid);
	if (keys.publicKeyB64u !== registered.public_key) {
		throw new Error('Wrong passphrase!');
	}

	await PostService.addPost(me, draft, keys.privateKey);
}
