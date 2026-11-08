import { test, expect, beforeAll } from 'bun:test';
import { PostBody } from '../src/domain/schemas';
import { POST_VERSION } from '../src/constants';
import { deriveKeypair } from '../src/crypto/keypair';
import { SignedPostTags } from '../src/codec/postTags';
import { CryptoKeyEnvelopeString } from '../src/codec/keyEnvelope';
import { signPost } from '../src/domain/post';

let publicKeyB64u: string;
let privateKey: Uint8Array;

beforeAll(async () => {
	const keys = await deriveKeypair('very secure phrase', 42);

	publicKeyB64u = keys.publicKeyB64u;
	privateKey = keys.privateKey;
});

test('post chunk roundtrip works (small post)', async () => {
	const postBody = {
		title: 'Title',
		created: Date.now(),
		tags: [],
		content: '12345',
		userid: 42,
		v: POST_VERSION,
		id: 'abcde12345',
	};

	const signedPost = await signPost(postBody, privateKey);

	const tags = SignedPostTags.encode(signedPost);

	const post = SignedPostTags.decode(tags);

	expect(JSON.parse(post.payload)).toEqual(postBody);
});

test('post chunk roundtrip works (large post)', async () => {
	const postBody = {
		title: 'Title',
		created: Date.now(),
		tags: [],
		content: '12345'.repeat(100),
		userid: 42,
		v: POST_VERSION,
		id: 'abcde12345',
	};

	const signedPost = await signPost(postBody, privateKey);

	const tags = SignedPostTags.encode(signedPost);

	const post = SignedPostTags.decode(tags);

	expect(JSON.parse(post.payload)).toEqual(postBody);
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
