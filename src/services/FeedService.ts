import { MoodleApi } from '../moodle/MoodleApi';
import { Post } from '../domain/schemas';
import { Storage } from '../storage/Storage';
import { extractKeyEnvelopeFromTags } from '../codec/keyEnvelope';
import { openPost, parsePostTags } from '../domain/post';
import { pinKey } from '../storage/pinKey';

export class FeedService {
	static async getFeed() {
		const users =
			await MoodleApi.getInstance().getInterestedUsersForTag('moodle');
		console.log(users);

		const posts: Post[] = [];

		for (const user of users) {
			const { tags, description, userid, name } =
				await MoodleApi.getInstance().getUserData(user.id);

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

				let fetchedPosts: Post[] = [];

				fetchedPosts = parsePostTags(tags)
					.map((p) => openPost(p, { id: userid, name: name, publicKey: key }))
					.filter((p) => p !== null);

				fetchedPosts = fetchedPosts.filter((p) => {
					return (
						!(p.created > Date.now()) &&
						!(new Date(p.created).getFullYear() < 2026) // script exists since 2026, everything before that is invalid
					);
				});

				posts.push(...fetchedPosts);

				console.log(`received ${fetchedPosts.length} posts from ${user.user}`);
			} catch (e) {
				console.log(`Error for: ${user.user}`);
				console.error(e);
			}
		}

		console.log(posts);

		posts.sort((a, b) => b.created - a.created);

		return posts;
	}
}
