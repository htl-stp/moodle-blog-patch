import { MAX_CONTENT_LIMIT, MAX_TITLE_LIMIT } from '../constants';
import { z } from 'zod';

export const PostSchema = z.object({
	v: z.string().optional(),
	id: z.string(),
	userid: z.number().int().positive().optional(),
	title: z.string().min(1).max(MAX_TITLE_LIMIT),
	content: z.string().max(MAX_CONTENT_LIMIT),
	tags: z.array(z.string().min(1).max(32)).max(10),
	created: z.number().int().positive(),
});

export type Post = z.infer<typeof PostSchema>;

export const StoredPostSchema = z.object({
	payload: z.string().max(3000),
	signature: z.string().optional(), // to verify posts (in later versions)
});

export type StoredPost = z.infer<typeof StoredPostSchema>;

export type Badge = {
	backgroundColor: string;
	color: string;
	text: string;
};

export type FetchedPost = Post & {
	author: string;
	authorId: number;
	badge: Badge | null;
};

export type SubmitHook = (
	title: string,
	description: string,
	passphrase: string,
) => void;
