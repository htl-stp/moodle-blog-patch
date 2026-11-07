import { argon2id } from 'hash-wasm';
import { ed25519 } from '@noble/curves/ed25519.js';

const enc = new TextEncoder();

const normalizePhrase = (p: string) =>
	p.normalize('NFKD').trim().toLowerCase().split(/\s+/).join(' ');

const toB64u = (b: Uint8Array) =>
	btoa(String.fromCharCode(...b))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

const fromB64u = (s: string) =>
	Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) =>
		c.charCodeAt(0),
	);

export async function deriveKeypair(phrase: string, userId: number) {
	const privateKey = await argon2id({
		password: normalizePhrase(phrase),
		salt: enc.encode(`moodle-blog-v1|${userId}`),
		parallelism: 1,
		iterations: 4,
		memorySize: 131072, // KiB, so 128 MiB
		hashLength: 32,
		outputType: 'binary',
	});
	const publicKey = ed25519.getPublicKey(privateKey);
	return { privateKey, publicKey, publicKeyB64u: toB64u(publicKey) };
}

export function sign(message: string, privateKey: Uint8Array): string {
	return toB64u(ed25519.sign(enc.encode(message), privateKey));
}

export function verify(
	message: string,
	sigB64u: string,
	publicKeyB64u: string,
): boolean {
	try {
		return ed25519.verify(
			fromB64u(sigB64u),
			enc.encode(message),
			fromB64u(publicKeyB64u),
		);
	} catch {
		return false;
	}
}
