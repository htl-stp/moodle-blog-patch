import {SignedPost} from "../domain/schemas";

type TamperMonkeyValue = null | string | object | undefined | boolean | number;

declare function GM_setValue(key: string, data: TamperMonkeyValue): void;
declare function GM_getValue(
	key: string,
	fallback: TamperMonkeyValue,
): TamperMonkeyValue;
declare function GM_deleteValue(key: string): void;

export class Storage {
	private constructor() {}

	static getPinnedKeys(): Record<number, string> {
		return GM_getValue('pinned_keys', {}) as Record<number, string>;
	}

	/**
	 * Sets the pinned key only if it's not already set.
	 * @param userId id of the user
	 * @param pinnedKey public key to pin
	 * @return true if the key was set, false if it already existed.
	 */
	static addPinnedKey(userId: number, pinnedKey: string): boolean {
		const keys = Storage.getPinnedKeys();

		if (keys[userId]) {
			return false;
		}

		keys[userId] = pinnedKey;

		Storage.setPinnedKeys(keys);

		return true;
	}

	static setPinnedKeys(pinnedKeys: Record<number, string>): void {
		GM_setValue('pinned_keys', pinnedKeys);
	}

	static getNames(): Record<number, string> {
		return GM_getValue('names', {}) as Record<number, string>;
	}

	static addName(userId: number, name: string): boolean {
		const names = Storage.getNames();

		if (names[userId]) {
			return false;
		}

		names[userId] = name;

		Storage.setNames(names);

		return true;
	}

	static setNames(names: Record<number, string>): void {
		GM_setValue('names', names);
	}

	// key is `${post.userid}:${post.id}`
	static getCachedPosts(): Record<string, SignedPost> {
		return GM_getValue('cached_posts', {}) as Record<string, SignedPost>;
	}

	// key is `${post.userid}:${post.id}`
	static setCachedPosts(posts: Record<string, SignedPost>): void {
		GM_setValue('cached_posts', posts);
	}
}
