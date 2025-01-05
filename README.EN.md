# RSSHub Config Updater

[简体中文](/README.md) | English

This repository is used to solve the problem that the cookie expiration time of some websites is too short and it is not convenient for rsshub to update the cookie.

**Note: This repository does not yet contain all cookie synchronization methods. If you are willing to contribute a new synchronization method, please follow the format of the JSON file in the [cookiecloud/cookies](/cookiecloud/cookies) directory, add a new JSON file and create a PR.**

### Principle

When the cookie expires, the user logs in again with the browser, and then uses [easychen/CookieCloud](https://github.com/easychen/CookieCloud) to synchronize the cookie to RSSHub and update the configuration.

Although this method still requires the user to log in again manually, it is an improvement over the original version that can only modify the environment variables and restart.

### Usage method

1. Deploy [easychen/CookieCloud](https://github.com/easychen/CookieCloud).

2. Map the `cookiecloud` directory of this repository to `/app/lib/routes/cookiecloud` in the RSSHub image.
3. Add environment variables:

   | Variable name | Meaning | Instance value | Default value (required if left blank) |
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
      - ./cookiecloud/cookiecloud:/app/lib/api/cookiecloud
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