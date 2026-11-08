import { MoodleApi, UserData } from '../moodle/MoodleApi';
import { parsePostTags, signPost } from '../domain/post';
import { Post, PostBody, PostBodySchema } from '../domain/schemas';
import { POST_VERSION } from '../constants';
import { SignedPostTags } from '../codec/postTags';
import { Draft } from './publishService';

export class PostService {
	static async addPost(
		userData: UserData,
		draft: Draft,
		privateKey: Uint8Array,
	) {
		const p: Omit<PostBody, 'id'> = {
			v: POST_VERSION,
			userid: userData.userid,
			title: draft.title,
			content: draft.content,
			tags: [],
			created: Date.now(),
		};

		const signedPost = await signPost(p, privateKey);

		const postTags = SignedPostTags.encode(signedPost);

		await MoodleApi.getInstance().addInterests(postTags);
	}
}
