import { MoodleApi } from '../moodle/MoodleApi';
import { parsePostTags, signPost } from '../domain/post';
import { PostBody, PostBodySchema } from '../domain/schemas';
import { POST_VERSION } from '../constants';
import { SignedPostTags } from '../codec/postTags';

export class PostService {
	static async addPost(
		userid: number,
		title: string,
		content: string,
		tags: string[],
		privateKey: Uint8Array,
	) {
		const userData = await MoodleApi.getInstance().getUserData();

		const postIds = parsePostTags(userData.tags)
			.map((p) => PostBodySchema.parse(JSON.parse(p.payload)))
			.map((p) => p.id);

		let id: string;
		do {
			id = generateNewPostId();
		} while (postIds.includes(id));

		const p: PostBody = {
			v: POST_VERSION,
			userid: userid,
			id: id,
			title,
			content,
			tags,
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
