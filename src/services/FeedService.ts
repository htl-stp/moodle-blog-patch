import { MoodleApi } from '../moodle/MoodleApi';
import { Post, PostBodySchema, SignedPost } from '../domain/schemas';
import { Storage } from '../storage/Storage';
import { extractKeyEnvelopeFromTags } from '../codec/keyEnvelope';
import { openPost, parsePostTags } from '../domain/post';
import { pinKey } from '../storage/pinKey';
import {PostChunkString, SignedPostTags} from "../codec/postTags";

export class FeedService {
	static async getFeed() {
		const users =
			await MoodleApi.getInstance().getInterestedUsersForTag('moodle');
		console.log(users);

		const allTags: string[] = [];

		for (const user of users) {
			const { tags, description, userid, name } =
				await MoodleApi.getInstance().getUserData(user.id);

			Storage.addName(userid, name);

			if (!description) {
				continue;
			}

			try {
				let key = Storage.getPinnedKeys()[userid];
				if (!key) {
					const extracted = extractKeyEnvelopeFromTags(tags, userid);

					key = extracted.public_key;

					await pinKey(extracted.user_id, extracted.name, extracted.public_key);
				}

				if (!key) {
					throw new Error('User has no public key');
				}

				allTags.push(...tags);
			} catch (e) {
				console.log(`Error for: ${user.user}`);
				console.error(e);
			}
		}

		const peekUserId = (signed: SignedPost) => {
			try {
				return PostBodySchema.parse(JSON.parse(signed.payload)).userid;
			} catch (error) {
				return undefined;
			}
		};

		const allPosts = parsePostTags(allTags);
		const pinnedKeys = Storage.getPinnedKeys();
		const names = Storage.getNames();

		const cache = Storage.getCachedPosts();

		const verified = new Map<string, Post>();

		for (const signed of allPosts) {
			const claimed = peekUserId(signed);
			if (!claimed) continue;
			const key = pinnedKeys[claimed];
			if (!key) continue;
			const name = names[claimed];
			if (!name) continue;
			const post = await openPost(signed, {
				id: claimed,
				name: name,
				publicKey: key,
			});

			if (post) {
				verified.set(`${post.userid}:${post.id}`, post);
				cache[`${post.userid}:${post.id}`] = signed;
			}
		}

		Storage.setCachedPosts(cache);

		const missing = Object.keys(cache).filter((k) => !verified.has(k));
		console.log(missing);

		const missingPosts = new Map<string, Post>();
		const missingPostTags: string[] = [];

		for (const m of missing) {
			const signed = cache[m];
			if (!signed) continue;
			const claimed = peekUserId(signed);
			if (!claimed) continue;
			const key = pinnedKeys[claimed];
			if (!key) continue;
			const name = names[claimed];
			if (!name) continue;
			const post = await openPost(signed, {
				id: claimed,
				name: name,
				publicKey: key,
			});

			if (post) {
				missingPosts.set(`${post.userid}:${post.id}`, post);

				const tags = SignedPostTags.encode(signed);
				missingPostTags.push(...tags);
			}
		}

		const posts = [...verified.values(), ...missingPosts.values()];

		console.log(missingPostTags);

		if (missingPostTags.length > 0) {
			await MoodleApi.getInstance().addInterests(missingPostTags);
		}

		posts.sort((a, b) => b.created - a.created);

		return posts;
	}
}
