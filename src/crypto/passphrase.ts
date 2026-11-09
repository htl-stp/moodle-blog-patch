import wordlist from '../../assets/eff_large_wordlist.txt' with { type: 'text' };

const WORDS = wordlist
	.trim()
	.split('\n')
	.map((l) => l.split('\t')[1]!);

function randomIndex(n: number) {
	// rejection sampling because of modulo bias
	const limit = Math.floor(2 ** 32 / n) * n;
	const buf = new Uint32Array(1);
	do {
		crypto.getRandomValues(buf);
	} while (buf[0]! >= limit);
	return buf[0]! % n;
}

export function generatePassphrase(words = 6) {
	const list = WORDS;

	return Array.from(
		{ length: words },
		() => list[randomIndex(list.length)],
	).join(' ');
}
