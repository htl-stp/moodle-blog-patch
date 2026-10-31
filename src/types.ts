import {MAX_CONTENT_LIMIT, MAX_TITLE_LIMIT, VERSION} from "./constants";
import {z} from "zod";

export const EncodedConfigSchema = z.object({
    v: z.string(),
    format: z.string(),
    configPayload: z.string(),
});

export const PostSchema = z.object({
    v: z.string().optional(),
    id: z.string(),
    title: z.string().min(1).max(MAX_TITLE_LIMIT),
    content: z.string().max(MAX_CONTENT_LIMIT),
    tags: z.array(z.string().min(1).max(32)).max(10),
    created: z.number().int().positive(),
});

export type Post = z.infer<typeof PostSchema>;

export const StoredPostSchema = z.object({
    payload: z.string().max(3000),
    signature: z.unknown().optional() // to verify posts (in later versions)
});

export type StoredPost = z.infer<typeof StoredPostSchema>;

export const ConfigSchema = z.object({
    posts: z.array(StoredPostSchema).max(100).default([]),

    comments: z.unknown().optional(),
    likes: z.unknown().optional(),
    pubKey: z.unknown().optional()
});

export const LegacyPostSchema = z.object({
    v: z.literal(1),
    id: z.string(),
    title: z.string().min(1).max(128),
    content: z.string().max(2000),
    tags: z.array(z.string().min(1).max(32)).max(10),
    created: z.number().int().positive(),
}).transform(p => {
    return PostSchema.parse(p)
});

export const LegacyConfigSchema = z.object({
    posts: z.array(
        z.object({
            payload: z.string().min(1)
        })
    ).max(100).default([]),
    v: z.number().int().positive(),
}).transform(c => {
    return ConfigSchema.parse(c)
})

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
