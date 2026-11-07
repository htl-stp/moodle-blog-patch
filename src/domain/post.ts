import {
	Post,
	PostBody,
	PostBodySchema,
	SignedPost,
	SignedPostSchema,
} from './schemas';
import { sign, verify } from '../crypto/keypair';

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
