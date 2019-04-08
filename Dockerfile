FROM node:10-alpine

RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      chromium@edge \
      nss@edge \
      freetype@edge \
      harfbuzz@edge \
      ttf-freefont@edge

RUN apk add --no-cache git

ENV TAIKO_SKIP_CHROMIUM_DOWNLOAD true
ENV TAIKO_BROWSER_PATH /usr/bin/chromium-browser

RUN npm install -g getgauge/taiko#master

RUN mkdir -p /taiko/screenshot && chown -R node.node /taiko

USER node

WORKDIR /taiko

COPY . .

ENTRYPOINT ["taiko", "./index.js", "--"]
