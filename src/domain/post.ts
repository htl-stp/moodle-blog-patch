import { Post, PostBody, PostBodySchema, SignedPost } from './schemas';
import { sign, verify } from '../crypto/keypair';
import { PostChunkString, SignedPostTags } from '../codec/postTags';
import { bodyToTuple, tupleToBody } from './postWire';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/curves/utils.js';

export async function signPost(
	body: PostBody,
	privateKey: Uint8Array,
): Promise<SignedPost> {
	const payload = JSON.stringify(bodyToTuple(body));
	return { payload, signature: sign(payload, privateKey) };
}

export function openPost(
	signed: SignedPost,
	author: { id: number; name: string; publicKey: string },
): Post | null {
	if (!verify(signed.payload, signed.signature, author.publicKey)) return null;

	let json: unknown;
	try {
		json = tupleToBody(JSON.parse(signed.payload));
	} catch {
		return null;
	}

	const parsed = PostBodySchema.safeParse(json);
	if (!parsed.success) return null;
	const body = parsed.data;

	if (body.userid !== author.id) return null;
	if (body.created > Date.now()) return null;
	if (new Date(body.created).getFullYear() < 2026) return null;

	return { ...body, authorName: author.name, id: computeId(body) };
}

export function parsePostTags(strings: string[]) {
	const groups = new Map<string, string[]>();

	for (const s of strings) {
		const chunk = PostChunkString.safeDecode(s);
		if (!chunk.success) continue; // not a chunk string, ignore it

		const key = `${chunk.data.user_id}:${chunk.data.blog_id}`;
		const list = groups.get(key);

		if (list) list.push(s);
		else groups.set(key, [s]);
	}

	// decode each group into a StoredPost, then parse the payload
	const posts = [];

	for (const [key, list] of groups) {
		const signed = SignedPostTags.safeDecode(list);
		if (!signed.success) {
			console.warn(`Skipping ${key}:`, signed.error.message);
			continue;
		}

		try {
			const post = PostBodySchema.safeParse(
				tupleToBody(JSON.parse(signed.data.payload)),
			);
			if (!post.success) {
				console.warn(`Skipping ${key}: invalid payload`);
				continue;
			}
		} catch (e) {
			console.error(e);
			continue;
		}

		posts.push(signed.data);
	}

	return posts;
}

export function computeId(b: PostBody): string {
	const data = new TextEncoder().encode(
		JSON.stringify([b.v, b.userid, b.title, b.content, b.created]),
	);
	return bytesToHex(sha256(data).slice(0, 8));
}
