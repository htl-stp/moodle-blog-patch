import {
	CryptoKeyEnvelope,
	CryptoKeyEnvelopeString,
} from '../codec/keyEnvelope';
import { Storage } from './Storage';
import { MoodleApi } from '../moodle/MoodleApi';

export async function pinKey(
	user_id: number,
	name: string,
	public_key: string,
) {
	const envelope = CryptoKeyEnvelope.parse({
		name,
		public_key,
		user_id,
	});

	const str = CryptoKeyEnvelopeString.encode(envelope);

	const wasSet = Storage.addPinnedKey(user_id, public_key);

	if (wasSet) {
		await MoodleApi.getInstance().addInterests([str]);
	}
}
