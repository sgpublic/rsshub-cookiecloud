import logger from '@/utils/logger';
import { createCookieCloudSyncJob } from '@/routes/cookiecloud/cookie-cloud';
import { Route } from '@/types';
import { config as RSSHubConfig } from '@/config';

const _env = process.env;
const _config = ('COOKIE_CLOUD_HOST' in _env && 'COOKIE_CLOUD_UUID' in _env && 'COOKIE_CLOUD_PASSWORD' in _env) ? {
    host: _env.COOKIE_CLOUD_HOST,
    uuid: _env.COOKIE_CLOUD_UUID,
    password: _env.COOKIE_CLOUD_PASSWORD,
    interval: (Number('COOKIE_CLOUD_INTERVAL' in _env ? _env.COOKIE_CLOUD_INTERVAL! : '3600') || 3600) * 1000
} : undefined;

const cookiecloud_debug = (_env.COOKIE_CLOUD_DEBUG === "true");

export const route: Route = {
    path: '/:keys?',
    categories: ['other'],
    example: '/cookiecloud/javdb,session',
    parameters: { keys: '配置键' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'CookieCloud',
    maintainers: ['sgpublic'],
    handler,
};

async function handler(ctx) {
    const rawKeys: string = ctx.req.param('keys') ?? '';
    if (!cookiecloud_debug || rawKeys === '') {
        return {
            title: 'CookieCloud 测试',
            allowEmpty: true,
        };
    }
    const keys: string[] = rawKeys.split(',');
    const useRemote = (ctx.req.query('remote') ?? '') !== '';

    if (useRemote) {
        await createCookieCloudSyncJob(_config, true);
    }

    let config = RSSHubConfig;
    for (const key of keys) {
        if (typeof config !== 'object' || !(key in config)) {
            return {
                title: 'CookieCloud 测试',
                allowEmpty: true,
                item: [
                    {
                        title: rawKeys,
                        description: 'not found.',
                    }
                ],
                ttl: 0,
            };
        }
        config = config[key];
    }
    const content = typeof config === 'string' ? config : JSON.stringify(config);
    return {
        title: 'CookieCloud 测试',
        allowEmpty: true,
        item: [
            {
                title: rawKeys,
                description: content,
            }
        ],
        ttl: 0,
    };
}


setTimeout(async () => await createCookieCloudSyncJob(_config, false), 10);

logger.info('CookieCloud loaded.');
