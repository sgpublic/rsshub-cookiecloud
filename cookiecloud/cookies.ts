import { directoryImport } from 'directory-import';
import path from 'node:path';

export interface CookieCloudQueryParam {
    // domain of cookie
    domain: string;
    // optional cookie key, leave it undefined to get all cookie
    name?: string;
    // optional cookie path
    path?: string;
}

export type CookieMap = Map<string, CookieCloudQueryParam[]>;

export const cookieMap: CookieMap = new Map();

const cookies: Record<string, Map<string, CookieCloudQueryParam>> = directoryImport({
    targetDirectoryPath: path.join(__dirname, './cookies'),
    importPattern: /\.json$/,
}) as typeof cookies;

for (const cookie in cookies) {
    for (const cookieKey in cookies[cookie]) {
        cookieMap[cookieKey] = cookies[cookie][cookieKey];
    }
}
