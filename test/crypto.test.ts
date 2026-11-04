import {test, expect} from "bun:test";
import {generateKeys, sign, verify} from "../src/crypto";

test("signature can be verified", async () => {
    const { publicKey, privateKey } = await generateKeys();

    const signature = await sign("hello world", privateKey);

    expect(await verify("hello world", signature, publicKey))
})