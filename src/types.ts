import {VERSION} from "./constants";
import {z} from "zod";

export const EncodedConfigSchema = z.object({
	v: z.literal(VERSION, {error: "Invalid Version"}),
	format: z.enum(['gzip', 'none']),
	configPayload: z.string(),
});

export const PostSchema = z.object({
	id: z.string(),
	title: z.string().max(128),
	content: z.string().max(2000),
	tags: z.array(z.string()),
	created: z.number(),
});

export type Post = z.infer<typeof PostSchema>;

export const StoredPostSchema = z.object({
	payload: z.string(),
});

export type StoredPost = z.infer<typeof StoredPostSchema>;

export const ConfigSchema = z.object({
	posts: z.array(StoredPostSchema),
	// comments
	// likes
});

export type FetchedPost = Post & {
	author: string;
	authorId: number;
};

export type ConfigData = z.infer<typeof ConfigSchema>;

export type SubmitHook = (title: string, description: string) => void;
