import {expect, test} from "bun:test";
import * as fs from "node:fs";
import * as crypto from "crypto";


test('eff_large_wordlist is valid', () => {
    const wordlist = fs.readFileSync(import.meta.dir + '/../assets/eff_large_wordlist.txt', 'utf8');

    const hash = crypto.createHash('sha256');
    hash.update(wordlist);

    const sha256hash = hash.digest("hex");

    // pinned hash
    expect(sha256hash).toBe("addd35536511597a02fa0a9ff1e5284677b8883b83e986e43f15a3db996b903e")
})