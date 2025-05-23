import { cookieMap } from '@/routes/cookiecloud/cookies';
import { setConfig } from '@/config';
import logger from '@/utils/logger';
import CryptoJS from 'crypto-js';

interface CookieItem {
    domain: string;
    name: string;
    value: string;
    path: string;
    expirationDate: number;
    hostOnly: boolean;
    httpOnly: boolean;
    secure: boolean;
    sameSite: string;
}

interface CookieData {
    [key: string]: CookieItem[];
}

interface DecryptedData {
    cookie_data: CookieData;
    local_storage_data: Record<string, any>;
}

const _envs = process.env;

const cloudCookie = async (host: string, uuid: string, password: string) => {
    let cookies: CookieItem[] = [];
    try {
        const url = `${host}/get/${uuid}`;
        const ret = await fetch(url);
        const json = await ret.json();
        if (json && json.encrypted) {
            const { cookie_data } = cookieDecrypt(uuid, json.encrypted, password);
            for (const key in cookie_data) {
                if (!cookie_data.hasOwnProperty(key)) {
                    continue;
                }
                cookies = cookies.concat(
                    cookie_data[key].map((item) => {
                        if (item.sameSite === 'unspecified') {
                            item.sameSite = 'Lax';
                        }
                        return item;
                    })
                );
            }
        }
    } catch (error) {
        logger.error(`[CookieCloud] error during update: `, error);
        return;
    }

    const newEnvs = {};
    for (const key in cookieMap) {
        const queryList = cookieMap[key];
        for (const query of queryList) {
            let result: string | undefined;
            for (const cookieCloudItem of (cookies || [])) {
                if (!cookieCloudItem.domain.includes(query.domain) || (query.path !== undefined && cookieCloudItem.path !== query.path)) {
                    continue;
                }
                if (query.name === undefined) {
                    result = (result || '') + `${cookieCloudItem.name}=${cookieCloudItem.value};`;
                    continue;
                }
                if (cookieCloudItem.name === query.name) {
                    result = cookieCloudItem.value;
                    break;
                }
            }
            if (result !== undefined) {
                if (_envs[key] !== result) {
                    newEnvs[key] = result;
                    _envs[key] = result;
                }
                break;
            }
        }
    }
    if (Object.keys(newEnvs).length > 0) {
        logger.debug('[CookieCloud] start updating: ' + JSON.stringify(newEnvs));
        setConfig(newEnvs);
        logger.info("[CookieCloud] update success: " + Object.keys(newEnvs).join(', '));
    } else {
        logger.debug('[CookieCloud] nothing to update.');
    }
};

const cookieDecrypt = (uuid: string, encrypted: string, password: string) => {
    const the_key = CryptoJS.MD5(`${uuid}-${password}`).toString().substring(0, 16);
    const decrypted = CryptoJS.AES.decrypt(encrypted, the_key).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted) as DecryptedData;
};

export const createCookieCloudSyncJob = async (config, once) => {
    await cloudCookie(config.host, config.uuid, config.password);
    if (!once) {
        setInterval(async () => await cloudCookie(config.host, config.uuid, config.password), config.interval);
    }
};
