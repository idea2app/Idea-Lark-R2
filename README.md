# idea2app-Lark-R2

This Cloudflare worker uploads images synchronously from Lark base to R2 object storage. To utilize this functionality, you need to set up a Lark base workflow which sends an HTTP request to the worker. Subsequently, the worker retrieves the image from Lark and transfers it to R2.

[![CI & CD](https://github.com/idea2app/idea2app-lark-r2/actions/workflows/main.yml/badge.svg)][1]
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)][2]
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)][3]
[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)][4]

## Preset

### Cloudflare authentication

You'll need to configure Wrangler using GitHub's Secrets feature - go to "Settings -> Secrets" and add your Cloudflare API token (for help finding this, see the [Workers documentation][5]). Your API token is encrypted by GitHub, and the action won't print it into logs, so it should be safe!

### Lark config

<!-- @todo add feishu and lark link -->

1.  [Create an workflow][6]

2.  Custom trigger
    Select the field where the image is located, use the image modification as a trigger condition

<!-- @todo add feishu and lark link -->

3.  [Send an HTTP request][7]
    Your HTTP request should resemble the following:
    `POST https://BUCKET_BASE_URL/lark?file_token=REDACTED&name=hello.png&type=image%2Fpng`
    There for, you are required to include the `file_token`, `name` and `type` fields in your query parameters

[![lark base tutorial](https://p16-hera-va.larksuitecdn.com/tos-useast2a-i-hn4qzgxq2n/de8c818e82744147bbef54882744a243~tplv-hn4qzgxq2n-image:0:0.image)]

### GitHub Actions configuration

Configure GitHub Actions variables to trigger automated deployments after each push.

<!-- @todo add feishu and lark link -->

```yml
# https://developers.cloudflare.com/workers/ci-cd/external-cicd/#api-token
apiToken:
secrets: |
# [en] https://open.larksuite.com/document/home/interactive-message-card-sending/create-app-request-permission
    LARK_ID
    LARK_SECRET
# Auth with custom header (X-Lark-Upload-Token)
    LARK_UPLOAD_KEY
vars: |
# default to be https://open.larksuite.com/open-apis/
    LARK_HOST
# your Bucket base URL, which you can set later with custom domains
    BUCKET_BASE_URL
```

```shell
npm i pnpm -g

pnpm i

npm start
```

## Deployment

```shell
pnpm deploy
```

[1]: https://github.com/idea2app/idea2app-lark-r2/actions/workflows/main.yml
[2]: https://codespaces.new/idea2app/idea2app-lark-r2
[3]: https://gitpod.io/?autostart=true#https://github.com/idea2app/idea2app-lark-r2
[4]: https://deploy.workers.cloudflare.com/?url=https://github.com/idea2app/idea-lark-r2
[5]: https://developers.cloudflare.com/workers/wrangler/ci-cd/#api-token
[6]: https://www.larksuite.com/hc/en-US/articles/360048487755-use-lark-flow
[7]: https://www.larksuite.com/hc/en-US/articles/125809335872-use-base-to-automate-the-sending-of-http-requests
