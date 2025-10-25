import { createCookieCloudSyncJob } from "./libs/cookie-cloud.js";
import { CookieCloudConfig } from "./libs/config.js";
import { CookieCloudDir } from "./libs/dir.js";
import { route } from "./libs/route.js";
import { findJs } from "./libs/import-js.js";
import fs from 'node:fs';

async function setupCookieCloud() {
    try {
        console.log("[CookieCloud] trying hacking RSSHub...");

        if (CookieCloudConfig === undefined) {
            console.log('[CookieCloud] config not valid, CookieCloud not load.');
            return;
        }

        const appBootstrapJs = await findJs(/^app-bootstrap-.*\.js$/);
        if (!appBootstrapJs) {
            console.log('[CookieCloud] cannot find app-bootstrap-xxx.js, CookieCloud not load.');
            return;
        }
        const appBootstrapJsContent = fs.readFileSync(appBootstrapJs, 'utf-8');

        let routersRegex = /case`production`:\w+=\(await import\(`\.\/routes-\w+\.js`\)\)\.default;/;
        let routersResult = appBootstrapJsContent.match(routersRegex)
        if (!routersResult) {
            console.log('[CookieCloud] failed to find routes-xxx.js, CookieCloud not load.');
            return;
        }
        routersRegex = /routes-\w+\.js/;
        routersResult = routersResult[0].match(routersRegex);
        const routes = (await import(`${CookieCloudDir}/../dist/${routersResult[0]}`)).default;

        routes['cookiecloud'] = route;

        setTimeout(async () => await createCookieCloudSyncJob(CookieCloudConfig, false), 10);
        console.log('[CookieCloud] CookieCloud loaded.');
    } catch (e) {
        console.log('[CookieCloud] CookieCloud load failed: ', e);
    }
}

process.env.NODE_ENV='production';
process.env.NODE_OPTIONS='--max-http-header-size=32768';

await setupCookieCloud();

import (`${CookieCloudDir}/../dist/index.js`);
