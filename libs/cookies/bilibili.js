// Place this file under: cookiecloud/libs/cookies/bilibili.js
//
// RSSHub's Bilibili routes expect env vars of the form
// BILIBILI_COOKIE_{uid} — where {uid} is your numeric Bilibili user ID.
//
// To find your UID: log in to bilibili.com, open DevTools → Application →
// Cookies, look for "DedeUserID". Or visit:
//   https://api.bilibili.com/x/web-interface/nav
//
// 要查找您的 UID：登录 bilibili.com，打开开发者工具 → 应用程序 → Cookies，查找“DedeUserID”。或者访问：  找 mid
//   https://api.bilibili.com/x/web-interface/nav
//
// Replace 12345678 below with your real UID. Add more entries if you
//  请将下方的 12345678 替换为您的真实 UID。
// want to inject cookies for multiple Bilibili accounts.

export default {
    "BILIBILI_COOKIE_12345678": [
        {
            "domain": "bilibili.com"
        }
    ]
}