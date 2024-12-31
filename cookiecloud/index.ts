import logger from '@/utils/logger';
import { createCookieCloudSyncJob } from '@/routes/cookiecloud/cookie-cloud';

const _env = process.env;
const _config = ('COOKIE_CLOUD_HOST' in _env && 'COOKIE_CLOUD_UUID' in _env && 'COOKIE_CLOUD_PASSWORD' in _env) ? {
    host: _env.COOKIE_CLOUD_HOST,
    uuid: _env.COOKIE_CLOUD_UUID,
    password: _env.COOKIE_CLOUD_PASSWORD,
    interval: (Number('COOKIE_CLOUD_INTERVAL' in _env ? _env.COOKIE_CLOUD_INTERVAL! : '3600') || 3600) * 1000
} : undefined;

setTimeout(() => createCookieCloudSyncJob(_config, false), 10);

logger.info('CookieCloud loaded.');
