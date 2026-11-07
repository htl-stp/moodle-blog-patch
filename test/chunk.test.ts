import { test, expect } from 'bun:test';
import { CryptoKeyEnvelopeString, StoredPostTags } from '../src/tagStore';
import { Post } from '../src/types';
import { POST_VERSION } from '../src/constants';
import { deriveKeypair } from '../src/crypto';

test('post chunk roundtrip works (small post)', () => {
	const postPayload = JSON.stringify({
		title: 'Title',
		created: Date.now(),
		tags: [],
		content: '12345',
		userid: 42,
		v: POST_VERSION,
		id: 'abcde12345',
	} satisfies Post);

	const tags = StoredPostTags.encode({
		payload: postPayload,
	});

	const post = StoredPostTags.decode(tags);

	expect(post.payload).toEqual(postPayload);
});

test('post chunk roundtrip works (large post)', () => {
	const postPayload = JSON.stringify({
		title: 'Title',
		created: Date.now(),
		tags: [],
		content: '12345'.repeat(100),
		userid: 42,
		v: POST_VERSION,
		id: 'abcde12345',
	} satisfies Post);

	const tags = StoredPostTags.encode({
		payload: postPayload,
	});

	const post = StoredPostTags.decode(tags);

	expect(post.payload).toEqual(postPayload);
});

test('crypto key envelope works', () => {
	const data = {
		name: 'Some One',
		public_key: 'abcdefghijklmnopqrstuvwxyz1234567890',
		user_id: 42,
	};

	const str = CryptoKeyEnvelopeString.encode(data);

	const data2 = CryptoKeyEnvelopeString.decode(str);

	expect(data).toEqual(data2);
});

test('crypto key string shorter than 255 chars', async () => {
	const keys = await deriveKeypair('secret', 42);

	const str = CryptoKeyEnvelopeString.encode({
		name: 'Some One',
		public_key: keys.publicKeyB64u,
		user_id: 42,
	});

	expect(str.length).toBeLessThanOrEqual(255);
});
