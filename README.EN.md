# RSSHub Config Updater

[简体中文](/README.md) | English

This repository is designed to address the inconvenience of updating RSSHub cookies for websites with very short cookie expiration times.

**Note: This repository does not yet include all cookie synchronization methods. You can submit an issue to request support. If you want to contribute a new synchronization method, please follow [Contributing](#contributing) to add a new JS file and create a PR.**

## How It Works

When a cookie expires, the user logs in again using a browser and then uses [easychen/CookieCloud](https://github.com/easychen/CookieCloud) to sync the cookie to RSSHub and update the configuration.

Although this method still requires manual login, it is more convenient than the original approach, which requires modifying environment variables and restarting the service.

## Usage

1. Deploy [easychen/CookieCloud](https://github.com/easychen/CookieCloud) yourself.

2. Map the root directory of this repository to `/app/cookiecloud` in the RSSHub container.

3. Add the following environment variables:

   | Variable Name         | Description                                                                    | Example        | Default (leave empty if required) |
      |-----------------------|--------------------------------------------------------------------------------|----------------|-----------------------------------|
   | COOKIE_CLOUD_HOST     | CookieCloud server address                                                     | 127.0.0.1:8088 |                                   |
   | COOKIE_CLOUD_UUID     | User key · UUID                                                                | uuid           |                                   |
   | COOKIE_CLOUD_PASSWORD | End-to-end encryption password                                                 | password       |                                   |
   | COOKIE_CLOUD_INTERVAL | Update interval in seconds                                                     | 3600           | 3600                              |
   | COOKIE_CLOUD_DEBUG    | Set to `true` to allow the `/cookiecloud/:keys?` route to return config values | true           | false                             |

4. Change the start command to `node /app/cookiecloud/index.js`.

5. The log message `CookieCloud loaded.` indicates a successful load.

Example (`docker-compose.yaml`):

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
      - ./cookiecloud:/app/cookiecloud
    environment:
      COOKIE_CLOUD_HOST: 'http://cookiecloud:8088'
      COOKIE_CLOUD_UUID: 'rsshub'
      COOKIE_CLOUD_PASSWORD: 'rsshub-pwd'
      COOKIE_CLOUD_INTERVAL: 3600
    command: ["node", "/app/cookiecloud/index.js"]
  cookiecloud:
    image: easychen/cookiecloud:2023.01.20.16.39
    user: 1000:1001
    volumes:
      - ./data:/data/api/data
    restart: always
```

## Contributing

If you want to contribute a synchronization method for a website, you need to add a JS file in [cookiecloud/cookies](/libs/cookies).

Here are some JS examples:

* [Xiaohongshu](https://docs.rsshub.app/zh/routes/social-media#%E5%B0%8F%E7%BA%A2%E4%B9%A6)

  ```js
  export default {
      "XIAOHONGSHU_COOKIE": [
          {
              "domain": "xiaohongshu.com"
          }
      ]
  }
  ```
* [javdb.com](https://docs.rsshub.app/zh/routes/multimedia#javdb)

  ```js
  export default {
      "JAVDB_SESSION": [
          {
              "domain": "javdb.com",
              "name": "_jdb_session"
          }
      ]
  }
  ```

Example explanation:

* Each JS file exports an object where the key is the environment variable name required by RSSHub, and the value is an array.
* Each array item is a matching rule, which is checked sequentially until a match is found. Each item is an object with the following fields:

  | Name   | Type   | Optional | Description                                                                                                               | Example           |
    |--------|--------|----------|---------------------------------------------------------------------------------------------------------------------------|-------------------|
  | domain | string | No       | Keyword of the cookie domain. Match succeeds if the domain contains this keyword.                                         | `xiaohongshu.com` |
  | name   | string | Yes      | Cookie name. Match succeeds if the cookie name exactly matches. Leave empty to get all cookies under the domain.          | `_jdb_session`    |
