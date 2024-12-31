export interface CookieCloudQueryParam {
    // domain of cookie
    domain: string;
    // optional cookie key, leave it undefined to get all cookie
    name?: string;
    // optional cookie path
    path?: string;
}

export type CookieMap = Map<string, CookieCloudQueryParam[]>;

export const cookieMap: CookieMap = new Map([
    ['JAV_SESSION', [{ domain: 'javdb.com', name: '_jdb_session' }]]
]);
