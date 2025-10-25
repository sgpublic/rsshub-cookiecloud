import { importJs } from "./import-js.js";

let _setConfig = undefined;
let _config = undefined;

async function findSetConfigFunc() {
    if (_setConfig !== undefined) {
        return true;
    }

    const configJs = await importJs(/config-\w+\.js/);
    if (configJs === undefined) {
        return false;
    }

    for (const [_, value] of Object.entries(configJs)) {
        if (typeof value === 'function') {
            _setConfig = value;
        } else if (typeof value === 'object') {
            _config = value;
        }
    }
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
