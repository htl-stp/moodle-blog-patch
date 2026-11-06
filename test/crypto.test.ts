import {test, expect, beforeAll} from "bun:test";
import {deriveKeypair, sign, verify} from "../src/crypto";

let publicKeyB64u: string;
let privateKey: Uint8Array;

beforeAll(async () => {
    const keys = await deriveKeypair('very secure phrase', 42)

    publicKeyB64u = keys.publicKeyB64u;
    privateKey = keys.privateKey;
})

test("signature can be verified", () => {
    const signature = sign("hello world", privateKey);

    expect(verify("hello world", signature, publicKeyB64u)).toBe(true);
})

test("signature fails for tampered payload", () => {
    const signature = sign("hello world", privateKey);

    expect(verify("tampered payload", signature, publicKeyB64u)).toBe(false);
})