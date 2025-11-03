import fs from 'node:fs';
import path from 'node:path';
import { CookieCloudDir } from "./dir.js";

// export interface CookieCloudQueryParam {
//     // domain of cookie
//     domain: string;
//     // optional cookie key, leave it undefined to get all cookie
//     name?: string;
//     // optional cookie path
//     path?: string;
// }

// export type CookieMap = Map<string, CookieCloudQueryParam[]>;
export const cookieMap = new Map();

const __cookiesDir = path.resolve(CookieCloudDir, './libs/cookies')
const files = fs.readdirSync(__cookiesDir).filter(f => f.endsWith('.js'));

for (const file of files) {
    const filePath = path.resolve(__cookiesDir, file);
    const obj = (await import(filePath)).default;

    for (const [key, value] of Object.entries(obj)) {
        if (!cookieMap.has(key)) {
            cookieMap.set(key, []);
        }
        cookieMap.get(key).push(...value);
    }
}
