export default {
    "BILIBILI_COOKIE": [
        {
            "domain": "bilibili.com",
            "keyName": function (query) {
                const uid = query({
                    "domain": "bilibili.com",
                    "name": "DedeUserID"
                });
                return `BILIBILI_COOKIE_${uid}`;
            }
        }
    ]
}
