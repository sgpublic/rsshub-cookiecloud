import {importJs, findJs, readJs} from "./import-js.js";
import fs from "node:fs"

let _setConfig = undefined;
let _config = undefined;

export async function findSetConfigFunc() {
    if (_setConfig !== undefined) {
        return true;
    }

    const configRaw = await findJs("config");
    if (configRaw === undefined) {
        console.log('[CookieCloud] cannot find config-xxx.mjs, CookieCloud not load.')
        return false;
    }
    const configRawJs = await readJs("config");
    if (configRawJs === undefined) {
        console.log('[CookieCloud] cannot read config-xxx.mjs, CookieCloud not load.')
        return false;
    }
    let setConfigFuncName = configRawJs.match(/[A-Za-z0-9]+=\(\)/);
    if (!setConfigFuncName) {
        console.log('[CookieCloud] cannot find setConfig function, CookieCloud not load.');
        return false;
    }
    setConfigFuncName = setConfigFuncName[0]
    setConfigFuncName = setConfigFuncName.substring(0, setConfigFuncName.length - 3)
    let exports = configRawJs.match(/export{(.*?)}/);
    if (!exports) {
        console.log('[CookieCloud] cannot find exports in config-xxx.mjs, CookieCloud not load.');
        return false;
    }
    exports = exports[0];
    const exportsRegex = new RegExp(`${setConfigFuncName} as setConfig`);
    if (!exportsRegex.test(exports)) {
        let newExports = exports.substring(7, exports.length - 1);
        newExports = `${newExports},${setConfigFuncName} as setConfig`;
        const newConfigRawJs = configRawJs.replaceAll(exports, `export{${newExports}}`);
        await fs.writeFileSync(configRaw, newConfigRawJs);
    }

    const configJs = await importJs("config");
    for (const [name, value] of Object.entries(configJs)) {
        if (name === 'setConfig') {
            _setConfig = value;
        } else if (typeof value === 'object') {
            _config = value;
        }
    }
    return _setConfig !== undefined && _config;
}

export const setConfig = (env) => {
    if (_setConfig !== undefined) {
        _setConfig(env);
    }
}

export const getConfig = (rawKeys) => {
    const keys = rawKeys.split(',');
    let config = _config;
    for (const key of keys) {
        if (typeof config !== 'object' || !(key in config)) {
            return undefined;
        }
        config = config[key];
    }
    return typeof config === 'string' ? config : JSON.stringify(config);
}
