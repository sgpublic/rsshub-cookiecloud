import { directoryImport } from 'directory-import';
import path from 'node:path';

export enum SyncMod {
    common,
    auto_fill
}

export interface CookieCloudQueryParam {
    // domain of cookie
    domain: string;
    // optional cookie key, leave it undefined to get all cookie
    name?: string;
    // optional cookie path
    path?: string;
}

export interface CookieCloudQueryItem {
    sync_mode: SyncMod,
    query: CookieCloudQueryParam[],
}

export type CookieMap = Map<string, CookieCloudQueryItem>;

export const cookieMap: CookieMap = new Map();

const cookies: Record<string, Map<string, CookieCloudQueryItem>> = directoryImport({
    targetDirectoryPath: path.join(__dirname, './cookies'),
    importPattern: /\.json$/,
}) as typeof cookies;

for (const cookie in cookies) {
    for (const cookieKey in cookies[cookie]) {
        cookieMap[cookieKey] = cookies[cookie][cookieKey];
    }
}

const mapJoinToCookies = (map: Map<string, string>) => {
    let result = "";
    for (const key in map) {
        result += `${key}=${map[key]}; `;
    }
    return result;
};


export type SyncModeFunc = (key: string, cookies: Map<string, string>) => { newKey: string, envValue: string };

const _SyncMod_common: SyncModeFunc = (key: string, cookies: Map<string, string>) => ({
    newKey: key,
    envValue: mapJoinToCookies(cookies)
});

const _SyncMod_auto_fill: SyncModeFunc = (key: string, cookies: Map<string, string>) => {
    const common = _SyncMod_common(key, cookies);
    for (const key in cookies) {
        common.newKey = common.newKey.replaceAll(`{${key}}`, cookies[key]);
    }
    return common;
};

export const getSyncMod: (syncMode: SyncMod) => SyncModeFunc = (syncMode: SyncMod) => {
    switch (syncMode) {
        case SyncMod.common:
            return _SyncMod_common;
        case SyncMod.auto_fill:
            return _SyncMod_auto_fill;
    }
};
