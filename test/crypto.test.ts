import {test, expect} from "bun:test";
import {deriveKeypair, sign, verify} from "../src/crypto";

const { publicKeyB64u, privateKey } = await deriveKeypair('very secure phrase', 42);

test("signature can be verified", () => {
    const signature = sign("hello world", privateKey);

    expect(verify("hello world", signature, publicKeyB64u)).toBe(true);
})

test("signature fails for tampered payload", () => {
    const signature = sign("hello world", privateKey);

    expect(verify("tampered payload", signature, publicKeyB64u)).toBe(false);
})