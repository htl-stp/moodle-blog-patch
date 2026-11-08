import { Post, PostBody, PostBodySchema, SignedPost } from './schemas';
import { sign, verify } from '../crypto/keypair';
import { PostChunkString, SignedPostTags } from '../codec/postTags';

export function signPost(body: PostBody, privateKey: Uint8Array): SignedPost {
	const payload = JSON.stringify(body);
	return { payload, signature: sign(payload, privateKey) };
}

export function openPost(
	signed: SignedPost,
	author: { id: number; name: string; publicKey: string },
): Post | null {
	if (!verify(signed.payload, signed.signature, author.publicKey)) return null;

	let json: unknown;
	try {
		json = JSON.parse(signed.payload);
	} catch {
		return null;
	}

	const parsed = PostBodySchema.safeParse(json);
	if (!parsed.success) return null;
	const body = parsed.data;

	if (body.userid !== author.id) return null;
	if (body.created > Date.now()) return null;
	if (new Date(body.created).getFullYear() < 2026) return null;

	return { ...body, authorName: author.name };
}

export function parsePostTags(strings: string[]) {
	const groups = new Map<string, string[]>();

	console.log(strings);

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
		const stored = SignedPostTags.safeDecode(list);
		if (!stored.success) {
			console.warn(`Skipping ${key}:`, stored.error.message);
			continue;
		}

		const post = PostBodySchema.safeParse(JSON.parse(stored.data.payload));
		if (!post.success) {
			console.warn(`Skipping ${key}: invalid payload`);
			continue;
		}

		posts.push(stored.data);
	}

	console.log(posts);

	return posts;
}
