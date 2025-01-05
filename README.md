# RSSHub Config Updater

简体中文 | [English](/README.EN.md)

这个仓库用于解决某些网站 cookie 过期时间过短而 rsshub 更新 cookie 不太方便的问题。

**注意：此仓库暂未包含所有 cookie 同步方法，若您愿意贡献新的同步方法，请仿照 [cookiecloud/cookies](/cookiecloud/cookies) 目录中 JSON 文件的格式，添加新的 JSON 文件并创建 PR。**

### 原理

当 cookie 过期时，用户使用浏览器重新登录，然后利用 [easychen/CookieCloud](https://github.com/easychen/CookieCloud) 将 cookie 同步到 RSSHub 并更新配置。

尽管这种方法仍需要用户手动重新登陆，但相比原版仅能通过修改环境变量并重启的麻烦操作，这种方法已经有所进步。

### 食用方法

1. 自行部署 [easychen/CookieCloud](https://github.com/easychen/CookieCloud)
2. 将本仓库 `cookiecloud` 目录映射到 RSSHub 镜像中的 `/app/lib/routes/cookiecloud`。
3. 添加环境变量：

   | 变量名称 | 含义 | 实例值 | 默认值（留空则为必填） |
   |--|--|--|--|
   | COOKIE_CLOUD_HOST | CookieCloud 服务器地址 | 127.0.0.1:8088 |  |
   | COOKIE_CLOUD_UUID | 用户KEY · UUID | uuid |  |
   | COOKIE_CLOUD_PASSWORD | 端对端加密密码 | password |  |
   | COOKIE_CLOUD_INTERVAL | 更新间隔时间（单位：秒） | 3600 | 3600 |
   | COOKIE_CLOUD_DEBUG | 设置为 true 时将允许路由 `/cookiecloud/:keys?` 返回配置值 | true | false |
4. 修改启动命令为 `npm run dev`。
5. 日志中出现了 `info: CookieCloud loaded.` 即为加载成功。

示例（docker-compose.yaml）：

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
    user: 1000:1001
    volumes:
      - ./data:/data/api/data
    restart: always
```
