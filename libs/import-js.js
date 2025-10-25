import fs from 'node:fs';
import path from 'node:path';
import { CookieCloudDir } from "./dir.js";

export async function findJs(regex, prefix) {
    if (prefix === undefined) {
        prefix = path.resolve(CookieCloudDir, '../dist')
    }
    const appBootstrapJs = fs.readdirSync(prefix).filter(f => regex.test(f));
    if (appBootstrapJs.length <= 0) {
        return undefined;
    }
    return `${prefix}/${appBootstrapJs[0]}`
}

export async function importJs(regex, prefix) {
    if (prefix === undefined) {
        prefix = path.resolve(CookieCloudDir, '../dist')
    }
    const name = await findJs(regex, prefix);
    if (name === undefined) {
        return undefined;
    }
    return await import(name);
}
