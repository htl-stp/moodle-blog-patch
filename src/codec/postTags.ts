import { PostBodySchema, SignedPostSchema } from '../domain/schemas';
import { z } from 'zod';

const MAX_STRING_LENGTH = 255;

export const SignedPostTags = z.codec(z.array(z.string()), SignedPostSchema, {
	decode: (list, ctx) => {
		const fail = (message: string) => {
			ctx.issues.push({ code: 'custom', message, input: list });
			return z.NEVER;
		};

		if (list.length === 0) return fail('Invalid length: no chunks');

		const chunks = list.map((s) => PostChunkString.decode(s));

		const first = chunks[0]!;

		if (chunks.length !== first.max_chunks) {
			return fail(
				`Invalid length: expected ${first.max_chunks} chunks, got ${chunks.length}`,
			);
		}

		if (chunks.some((c) => c.user_id !== first.user_id)) {
			return fail("Chunks aren't from the same user");
		}

		if (chunks.some((c) => c.blog_id !== first.blog_id)) {
			return fail("Chunks aren't from the same blog");
		}

		if (chunks.some((c) => c.max_chunks !== first.max_chunks)) {
			return fail('Chunks do not have the same max_chunks');
		}

		const sorted = [...chunks].sort((a, b) => a.chunk_id - b.chunk_id);

		const startId = sorted[0]!.chunk_id;
		if (sorted.some((c, i) => c.chunk_id !== startId + i)) {
			return fail('Chunk ids are missing or duplicated');
		}

		const b64content = sorted.map((c) => c.content).join('');

		try {
			const bytes = Uint8Array.from(atob(b64content), (ch) => ch.charCodeAt(0));
			const json = new TextDecoder().decode(bytes);
			return JSON.parse(json);
		} catch {
			return fail('Chunks do not contain valid base64 encoded JSON');
		}
	},
	encode: (value) => {
		const post = PostBodySchema.parse(JSON.parse(value.payload));
		const user_id = post.userid;
		const blog_id = post.id;

		// StoredPost JSON -> UTF-8 bytes -> base64
		const bytes = new TextEncoder().encode(JSON.stringify(value));
		let bin = '';
		for (const b of bytes) bin += String.fromCharCode(b);
		const b64 = btoa(bin);

		// header: "b:{user_id}:{blog_id}:{chunk_id}:{max_chunks}:"
		const base = `b:${user_id}:${blog_id}:`.length;
		const roomFor = (n: number) =>
			MAX_STRING_LENGTH - (base + 2 * String(n).length + 2);

		// max_chunks digit count affects room per chunk, so iterate until stable
		let total = 1;

		while (true) {
			const needed = Math.max(1, Math.ceil(b64.length / roomFor(total)));
			const stable = String(needed).length <= String(total).length;
			total = needed;
			if (stable) break;
		}

		const room = roomFor(total);
		return Array.from({ length: total }, (_, i) =>
			PostChunkString.encode({
				user_id: user_id!, // user_id should be on all v0.0.4 posts
				blog_id,
				chunk_id: i + 1,
				max_chunks: total,
				content: b64.slice(i * room, (i + 1) * room),
			}),
		);
	},
});

export const PostChunk = z.object({
	user_id: z.coerce.number().int().positive(),
	blog_id: z.string(),
	chunk_id: z.coerce.number().int().positive(),
	max_chunks: z.coerce.number().int().positive(),
	content: z.string().min(1).max(255),
});

export const PostChunkString = z.codec(z.string(), PostChunk, {
	decode: (str, ctx) => {
		const [head, user_id, blog_id, chunk_id, max_chunks, content] =
			str.split(':');

		if (head !== 'b') {
			ctx.issues.push({ code: 'custom', message: 'Invalid Head', input: str });
			return z.NEVER;
		}

		return PostChunk.parse({
			user_id: user_id,
			blog_id: blog_id,
			chunk_id: chunk_id,
			max_chunks: max_chunks,
			content: content,
		});
	},
	encode: (v) =>
		`b:${v.user_id}:${v.blog_id}:${v.chunk_id}:${v.max_chunks}:${v.content}`,
});
