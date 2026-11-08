import { MAX_CONTENT_LIMIT, MAX_TITLE_LIMIT } from '../constants';
import { z } from 'zod';
import { Draft } from '../services/publishService';

export const PostBodySchema = z.object({
	v: z.number(),
	userid: z.number().int().positive(),
	title: z.string().min(1).max(MAX_TITLE_LIMIT),
	content: z.string().max(MAX_CONTENT_LIMIT),
	created: z.number().int().positive(),
});

export type PostBody = z.infer<typeof PostBodySchema>;

export const SignedPostSchema = z.object({
	payload: z.string().max(3000),
	signature: z.string(),
});

export type SignedPost = z.infer<typeof SignedPostSchema>;

export type Post = PostBody & {
	authorName: string;
	id: string;
};
