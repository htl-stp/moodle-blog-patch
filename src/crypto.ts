const ALGO = { name: "ECDSA", namedCurve: "P-256" } as const;

export async function generateKeys() {
    return await crypto.subtle.generateKey(
        { name: "ECDSA", namedCurve: "P-256" },
        true,
        ["sign", "verify"]
    )
}

export async function exportKeys(publicKey: CryptoKey, privateKey: CryptoKey) {
    const pk = await crypto.subtle.exportKey("jwk", publicKey);
    const sk = await crypto.subtle.exportKey("jwk", privateKey);
    return JSON.stringify({ pk, sk });
}

export async function importKeys(json: string) {
    const { pk, sk } = JSON.parse(json);
    const publicKey = await crypto.subtle.importKey("jwk", pk, ALGO, true, ["verify"]);
    const privateKey = await crypto.subtle.importKey("jwk", sk, ALGO, true, ["sign"]);
    return { publicKey, privateKey };
}

// Sign a string
export async function sign(message: string, privateKey: CryptoKey): Promise<string> {
    const data = new TextEncoder().encode(message);
    const sig = await crypto.subtle.sign(
        { name: "ECDSA", hash: "SHA-256" },
        privateKey,
        data
    );
    return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

// Verify a signature
export async function verify(message: string, signatureB64: string, publicKey: CryptoKey): Promise<boolean> {
    const data = new TextEncoder().encode(message);
    const sig = Uint8Array.from(atob(signatureB64), (c) => c.charCodeAt(0));
    return crypto.subtle.verify(
        { name: "ECDSA", hash: "SHA-256" },
        publicKey,
        sig,
        data
    );
}


