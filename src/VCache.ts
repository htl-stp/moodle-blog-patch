import { StoredPost } from './types';

type TamperMonkeyValue = null | string | object | undefined | boolean | number;

declare function GM_setValue(key: string, data: TamperMonkeyValue): void;
declare function GM_getValue(
	key: string,
	fallback: TamperMonkeyValue,
): TamperMonkeyValue;
declare function GM_deleteValue(key: string): void;

export class VCache {
	private constructor() {}

	static getCachedPosts(): StoredPost[] {
		return GM_getValue('cached_posts', []) as StoredPost[];
	}

	static addCachedPost(storedPost: StoredPost) {
		const posts = VCache.getCachedPosts();

		posts.push(storedPost);

		VCache.setCachedPosts(posts);
	}

	static setCachedPosts(storedPosts: StoredPost[]) {
		GM_setValue('cached_posts', storedPosts);
	}

	static getPinnedKeys(): Record<number, string> {
		return GM_getValue('pinned_keys', {}) as Record<number, string>;
	}

	static setPinnedKey(userId: number, pinnedKey: string): void {
		const keys = VCache.getPinnedKeys();

		keys[userId] = pinnedKey;

		VCache.setPinnedKeys(keys);
	}

	/**
	 * Sets the pinned key only if it's not already set.
	 * @param userId id of the user
	 * @param pinnedKey public key to pin
	 * @return true if the key was set, false if it already existed.
	 */
	static addPinnedKey(userId: number, pinnedKey: string): boolean {
		const keys = VCache.getPinnedKeys();

		if (keys[userId]) {
			return false;
		}

		keys[userId] = pinnedKey;

		VCache.setPinnedKeys(keys);

		return true;
	}

	static setPinnedKeys(pinnedKeys: Record<number, string>): void {
		GM_setValue('pinned_keys', pinnedKeys);
	}
}
