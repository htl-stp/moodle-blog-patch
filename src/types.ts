export type PostPayload = {
	v: 1;
	id: string;
	title: string;
	content: string;
	tags: string[];
	created: number;
};

export type Post = { payload: string };

export type UserConfig = { v: 1; posts: Post[] };

export type FetchedPost = PostPayload & {
	author: string;
	authorId: number;
};

export type SubmitHook = (title: string, description: string) => void;
