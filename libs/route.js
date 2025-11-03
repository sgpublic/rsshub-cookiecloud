import {createCookieCloudSyncJob} from './cookie-cloud.js';
import {CookieCloudConfig} from './config.js';
import {getConfig} from "./set-config.js";

async function handler(ctx) {
    const rawKeys = ctx.req.param('keys') ?? '';
    if (!CookieCloudConfig.debug || rawKeys === '') {
        return {
            title: 'CookieCloud 测试',
            allowEmpty: true,
        };
    }
    const useRemote = (ctx.req.query('remote') ?? '') !== '';

    if (useRemote) {
        await createCookieCloudSyncJob(CookieCloudConfig, true);
    }

    let config = getConfig(rawKeys);
    if (config === undefined) {
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
    } else {
        return {
            title: 'CookieCloud 测试',
            allowEmpty: true,
            item: [
                {
                    title: rawKeys,
                    description: config,
                }
            ],
            ttl: 0,
        };
    }
}

export const route = {
    routes: {
        '/:keys?': {
            path: '/:keys?',
            categories: ['other'],
            example: '/cookiecloud/javdb,session',
            parameters: {keys: '配置键'},
            features: {
                requireConfig: false,
                requirePuppeteer: false,
                antiCrawler: false,
                supportRadar: false,
                supportBT: false,
                supportPodcast: false,
                supportScihub: false,
                nfsw: false,
            },
            name: 'CookieCloud',
            maintainers: ['sgpublic'],
            handler: handler,
        }
    }
};
