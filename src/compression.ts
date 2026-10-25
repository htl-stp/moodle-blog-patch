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

export async function decompressJson(encoded: string): Promise<string> {
	const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));

	const stream = new Blob([bytes])
		.stream()
		.pipeThrough(new DecompressionStream('gzip'));

	return new Response(stream).text();
}
