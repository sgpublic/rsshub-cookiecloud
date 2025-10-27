import { cookieMap } from './cookies.js';
import { CookieCloudConfig } from './config.js'
import { setConfig } from './set-config.js'
import CryptoJS from 'crypto-js';

// interface CookieItem {
//     domain: string;
//     name: string;
//     value: string;
//     path: string;
//     expirationDate: number;
//     hostOnly: boolean;
//     httpOnly: boolean;
//     secure: boolean;
//     sameSite: string;
// }
//
// interface CookieData {
//     [key: string]: CookieItem[];
// }
//
// interface DecryptedData {
//     cookie_data: CookieData;
//     local_storage_data: Record<string, any>;
// }

const _envs = process.env;

const cloudCookie = async () => {
    let cookies = [];
    try {
        const url = `${CookieCloudConfig.host}/get/${CookieCloudConfig.uuid}`;
        const ret = await fetch(url);
        const json = await ret.json();
        if (json && json.encrypted) {
            const { cookie_data: cookieData } = cookieDecrypt(CookieCloudConfig.uuid, json.encrypted, CookieCloudConfig.password);
            for (const key of cookieData) {
                cookies = cookies.concat(
                    cookieData[key].map((item) => {
                        if (item.sameSite === 'unspecified') {
                            item.sameSite = 'Lax';
                        }
                        return item;
                    })
                );
            }
        }
    } catch (error) {
        console.log(`[CookieCloud] error during update: `, error);
        return;
    }

    const newEnvs = {};
    for (const [key, queryList] of cookieMap) {
        for (const query of queryList) {
            let result;
            for (const cookieCloudItem of cookies) {
                if (!cookieCloudItem.domain.includes(query.domain)) {
                    continue;
                }
                if (typeof query.name === 'string' && cookieCloudItem.name === query.name) {
                    result = cookieCloudItem.value;
                    break;
                }
                if (typeof query.name === typeof Array && !(cookieCloudItem.name in query.name)) {
                    continue;
                }
                if (result === undefined) {
                    result = {};
                }
                result[cookieCloudItem.name] = cookieCloudItem.value;
            }
            if (result === undefined) {
                break;
            }
            if (typeof result === 'object') {
                result = Object.entries(result).map(([k,v]) => `${k}=${v};`).join(' ');
            }

            if (_envs[key] === result) {
                continue;
            }
            newEnvs[key] = result;
            _envs[key] = result;
        }
    }
    if (Object.keys(newEnvs).length > 0) {
        if (CookieCloudConfig.debug) {
            console.log('[CookieCloud] start updating: ' + JSON.stringify(newEnvs));
        }
        setConfig(newEnvs);
        console.log("[CookieCloud] update success: " + Object.keys(newEnvs).join(', '));
    } else if (CookieCloudConfig.debug) {
        console.log('[CookieCloud] nothing to update.');
    }
};

const cookieDecrypt = (uuid, encrypted, password) => {
    const the_key = CryptoJS.MD5(`${uuid}-${password}`).toString().substring(0, 16);
    const decrypted = CryptoJS.AES.decrypt(encrypted, the_key).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
};

export const createCookieCloudSyncJob = async (once) => {
    await cloudCookie();
    if (!once) {
        setInterval(async () => await cloudCookie(), CookieCloudConfig.interval);
    }
};
