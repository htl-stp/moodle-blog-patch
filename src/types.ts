import {VERSION} from "./constants";
import {z} from "zod";

export const CONFIG_VERSION = "0.0.2"

export const EncodedConfigSchema = z.object({
    v: z.literal(CONFIG_VERSION, {error: "Invalid Version"}),
    format: z.enum(['gzip', 'none']),
    configPayload: z.string(),
});

export const PostSchema = z.object({
    id: z.string(),
    title: z.string().min(1).max(128),
    content: z.string().max(2000),
    tags: z.array(z.string().min(1).max(32)).max(10),
    created: z.number().int().positive(),

    signature: z.unknown().optional(),
});

export type Post = z.infer<typeof PostSchema>;

export const StoredPostSchema = z.object({
    payload: z.string().max(3000),
    sig: z.string().optional() // to verify posts (in later versions)
});

export type StoredPost = z.infer<typeof StoredPostSchema>;

export const ConfigSchema = z.object({
    posts: z.array(StoredPostSchema).max(200).default([]),

    comments: z.unknown().optional(),
    likes: z.unknown().optional(),
    pubKey: z.unknown().optional()
});

export type Badge = {
    backgroundColor: string,
    color: string,
    text: string,
}

export type FetchedPost = Post & {
    author: string;
    authorId: number;
    badge: Badge | null;
};

export type ConfigData = z.infer<typeof ConfigSchema>;

export type SubmitHook = (title: string, description: string) => void;
