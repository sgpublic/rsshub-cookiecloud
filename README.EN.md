# RSSHub Config Updater

[简体中文](/README.md) | English

This repository is used to solve the problem that the cookie expiration time of some websites is too short and it is not convenient for rsshub to update the cookie.

**Note: This repository does not yet contain all cookie synchronization methods, you can submit an issue to request adaptation. If you are willing to contribute a new synchronization method, please refer to [Contributing](#Contributing) to add new JSON files and create a PR.**

## Principle

When the cookie expires, the user logs in again with the browser, and then uses [easychen/CookieCloud](https://github.com/easychen/CookieCloud) to synchronize the cookie to RSSHub and update the configuration.

Although this method still requires the user to log in again manually, it is an improvement over the original version that can only modify the environment variables and restart.

## Usage method

1. Deploy [easychen/CookieCloud](https://github.com/easychen/CookieCloud).

2. Map the `cookiecloud` directory of this repository as `/app/lib/routes/cookiecloud` in the RSSHub image.
3. Add environment variables:

   | Variable name | Meaning | Sample | Default (required if left blank) |
   |--|--|--|--|
   | COOKIE_CLOUD_HOST | CookieCloud server address | 127.0.0.1:8088 | |
   | COOKIE_CLOUD_UUID | User KEY · UUID | uuid | |
   | COOKIE_CLOUD_PASSWORD | End-to-end encryption password | password | |
   | COOKIE_CLOUD_INTERVAL | Update interval (in seconds) | 3600 | 3600 |
4. Change the startup command to `npm run dev`.
5. If `info: CookieCloud loaded.` appears in the log, it means the loading is successful.

Example (docker-compose.yaml):

```yaml
services:
  rsshub:
    image: diygod/rsshub:chromium-bundled
    restart: always
    ports:
      - 1200:1200
      - 4651:4651
    env_file: stack.env
    volumes:
      - ./cookiecloud/cookiecloud:/app/lib/routes/cookiecloud
    environment:
      COOKIE_CLOUD_HOST: 'http://cookiecloud:8088'
      COOKIE_CLOUD_UUID: 'rsshub'
      COOKIE_CLOUD_PASSWORD: 'rsshub-pwd'
      COOKIE_CLOUD_INTERVAL: 3600
    command: ["npm", "run", "dev"]
  cookiecloud:
    image: easychen/cookiecloud:2023.01.20.16.39
    volumes:
      - ./data:/data/api/data
    restart: always
```

## Contributing

When you wish to contribute to a site's sync method, you need to add a JSON file to [cookiecloud/cookies](/cookiecloud/cookies).

Here are some JSON examples:

+ [小红书](https://docs.rsshub.app/zh/routes/social-media#%E5%B0%8F%E7%BA%A2%E4%B9%A6)
   ```json
   {
       "XIAOHONGSHU_COOKIE": [
           {
               "domain": "xiaohongshu.com"
           }
       ]
   }
   ```
+ [javdb.com](https://docs.rsshub.app/zh/routes/multimedia#javdb)
   ```json
   {
       "JAVDB_SESSION": [
           {
               "domain": "javdb.com",
               "name": "_jdb_session"
           }
       ]
   }
   ```

Example description:

+ Each JSON file content is an object, the key is the environment variable name required by RSSHub, and the value is an array.
+ Each item in the array is a matching rule, which will be matched in order until the match succeeds. Each item is an object, containing the following fields:

| Name | Type | Optional | Meaning | Example |
| --- | --- | --- | --- | -- |
| domain | string | No | The keyword of the domain name to which the cookie belongs. When the domain name contains the keyword, it is considered a successful match. | `xiaohongshu.com` |
| name | string | Yes | Cookie name. When the cookie name is exactly the same, it is considered a successful match. If it is left blank, it means obtaining all cookies under the domain name. | `_jdb_session` |
| path | string | Yes | Cookie path. When the cookie path is exactly the same, it is considered a successful match. If it is left blank, the path match is ignored.<br/>PS: It is not usually used. If you don’t know what this is, just ignore it. | `/` |