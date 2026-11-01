export async function compressJson(json: string): Promise<string> {
	const stream = new Blob([json])
		.stream()
		.pipeThrough(new CompressionStream('gzip'));

	const bytes = new Uint8Array(await new Response(stream).arrayBuffer());

	let binary = '';
	for (let i = 0; i < bytes.length; i += 8192) {
		binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
	}

	return btoa(binary);
}

export async function decompressJson(
	encoded: string,
	maxBytes: number,
): Promise<string> {
	const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));

	const reader = new Blob([bytes])
		.stream()
		.pipeThrough(new DecompressionStream('gzip'))
		.getReader();

	const decoder = new TextDecoder('utf-8', { fatal: true });
	let total = 0;
	let out = '';

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			total += value.byteLength;
			if (total > maxBytes) {
				throw new Error('Decompressed payload too large');
			}

			out += decoder.decode(value, { stream: true });
		}
		out += decoder.decode();
		return out;
	} finally {
		reader.cancel().catch(() => {});
	}
}