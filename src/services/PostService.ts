import { MoodleApi, UserData } from '../moodle/MoodleApi';
import { parsePostTags, signPost } from '../domain/post';
import { PostBody, PostBodySchema } from '../domain/schemas';
import { POST_VERSION } from '../constants';
import { SignedPostTags } from '../codec/postTags';
import { Draft } from './publishService';

export class PostService {
	static async addPost(
		userData: UserData,
		draft: Draft,
		privateKey: Uint8Array,
	) {
		const postIds = parsePostTags(userData.tags)
			.map((p) => PostBodySchema.parse(JSON.parse(p.payload)))
			.map((p) => p.id);

		let id: string;
		do {
			id = generateNewPostId();
		} while (postIds.includes(id));

		const p: PostBody = {
			v: POST_VERSION,
			userid: userData.userid,
			id: id,
			title: draft.title,
			content: draft.content,
			tags: [],
			created: Date.now(),
		};

		const signedPost = signPost(p, privateKey);

		const postTags = SignedPostTags.encode(signedPost);

		await MoodleApi.getInstance().addInterests(postTags);
	}
}

const generateNewPostId = () =>
	Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) =>
		b.toString(16).padStart(2, '0'),
	).join('');
