import { PostBody } from './schemas';
import { MAX_CONTENT_LIMIT, MAX_TITLE_LIMIT } from '../constants';
import { z } from 'zod';

export function bodyToTuple(b: PostBody): unknown[] {
	return [b.v, b.userid, b.title, b.content, b.created];
}

export function tupleToBody(t: unknown): PostBody | null {
	return PostWireSchema.safeParse(t).data ?? null;
}

const PostWireSchema = z
	.tuple([
		z.number().int(), // v
		z.number().int().positive(), // userid
		z.string().min(1).max(MAX_TITLE_LIMIT),
		z.string().max(MAX_CONTENT_LIMIT),
		z.number().int().positive(), // created
	])
	.transform(([v, userid, title, content, created]) => ({
		v,
		userid,
		title,
		content,
		created,
	}));
