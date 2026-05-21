import { createCookieCloudSyncJob } from "./libs/cookie-cloud.js";
import { CookieCloudConfig } from "./libs/config.js";
import { CookieCloudDir } from "./libs/dir.js";
import { findSetConfigFunc } from "./libs/set-config.js";
import { route } from "./libs/route.js";
import {distJsRegExp, readJs} from "./libs/import-js.js";

async function setupCookieCloud() {
    try {
        console.log("[CookieCloud] trying hacking RSSHub...");

        if (CookieCloudConfig === undefined) {
            console.log('[CookieCloud] config not valid, CookieCloud not load.');
            return;
        }

        const indexJsContent = await readJs(/^index\.mjs$/);
        if (!indexJsContent) {
            console.log('[CookieCloud] cannot find index.mjs, CookieCloud not load.');
            return;
        }

        let routersRegex = distJsRegExp("routes", "case`production`:[A-Za-z0-9]+=\\(await import\\(`\\.\\/", "`\\)\\)\\.default;")
        let routersResult = indexJsContent.match(routersRegex)
        if (!routersResult) {
            console.log('[CookieCloud] failed to find routes-xxx.mjs in index.mjs, CookieCloud not load.');
            return;
        }
        routersRegex = distJsRegExp("routes", "", "");
        routersResult = routersResult[0].match(routersRegex);
        console.log(`[CookieCloud] hacking ${routersResult[0]}`)
        const routes = (await import(`${CookieCloudDir}/../dist/${routersResult[0]}`)).default;

        routes.cookiecloud = route;

        if (!(await findSetConfigFunc())) {
            console.log('[CookieCloud] cannot hacking config-xxx.mjs, CookieCloud not load.');
            return;
        }

        setTimeout(async () => await createCookieCloudSyncJob(false), 10);
        console.log('[CookieCloud] CookieCloud loaded.');
    } catch (e) {
        console.log('[CookieCloud] CookieCloud load failed: ', e);
    }
}

process.env.NODE_ENV='production';
process.env.NODE_OPTIONS='--max-http-header-size=32768';

await setupCookieCloud();

import (`${CookieCloudDir}/../dist/index.mjs`);
