FROM node:10-alpine

###
# Install Chromium
###
RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      git \
      chromium@edge \
      nss@edge \
      freetype@edge \
      harfbuzz@edge \
      ttf-freefont@edge

###
# Install NotoSansCJK
###
RUN mkdir /noto

ADD https://noto-website.storage.googleapis.com/pkgs/NotoSansCJKjp-hinted.zip /noto

WORKDIR /noto

RUN unzip NotoSansCJKjp-hinted.zip && \
    mkdir -p /usr/share/fonts/noto && \
    cp *.otf /usr/share/fonts/noto && \
    chmod 755 /usr/share/fonts/noto && \
    chmod 644 /usr/share/fonts/noto/* && \
    fc-cache -fv

WORKDIR /
RUN rm -rf /noto

###
# Install taiko
###
ENV TAIKO_SKIP_CHROMIUM_DOWNLOAD true
ENV TAIKO_BROWSER_PATH /usr/bin/chromium-browser

RUN npm install -g getgauge/taiko#master

###
# Copy scripts
###
RUN mkdir -p /taiko/screenshot && chown -R node.node /taiko
USER node
WORKDIR /taiko
COPY . .

ENTRYPOINT ["taiko", "./index.js", "--"]
CMD ["{}"]
