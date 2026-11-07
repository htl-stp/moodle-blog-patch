import { z } from 'zod';

export const CryptoKeyEnvelope = z.object({
	user_id: z.coerce.number().int().positive(),
	name: z.string(),
	public_key: z.string(),
});

export const CryptoKeyEnvelopeString = z.codec(z.string(), CryptoKeyEnvelope, {
	decode: (str, ctx) => {
		const [head, user_id, name, public_key] = str.split(':');

		if (head !== 'p') {
			ctx.issues.push({ code: 'custom', message: 'Invalid Head', input: str });
			return z.NEVER;
		}

		return CryptoKeyEnvelope.parse({
			user_id,
			name,
			public_key,
		});
	},
	encode: (v) => `p:${v.user_id}:${v.name}:${v.public_key}`,
});
