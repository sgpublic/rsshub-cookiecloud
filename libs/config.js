const _env = process.env;
export const CookieCloudConfig = ('COOKIE_CLOUD_HOST' in _env && 'COOKIE_CLOUD_UUID' in _env && 'COOKIE_CLOUD_PASSWORD' in _env) ? {
    host: _env.COOKIE_CLOUD_HOST,
    uuid: _env.COOKIE_CLOUD_UUID,
    password: _env.COOKIE_CLOUD_PASSWORD,
    interval: (Number('COOKIE_CLOUD_INTERVAL' in _env ? _env.COOKIE_CLOUD_INTERVAL : '3600') || 3600) * 1000,
    debug: 'COOKIE_CLOUD_DEBUG' in _env ? _env.COOKIE_CLOUD_DEBUG === 'true' : false,
} : undefined;
