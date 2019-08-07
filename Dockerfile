FROM node:10-alpine

ENV LANG ja_JP.UTF-8
ENV LC_ALL ja_JP.UTF-8
###
# Install Chromium
###
RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      git \
      tini \
      chromium@edge \
      nss@edge \
      freetype@edge \
      harfbuzz@edge \
      ttf-freefont@edge \
      curl

###
# Install NotoSansCJK
###
RUN mkdir /noto && \
    cd /noto && \
    wget https://noto-website.storage.googleapis.com/pkgs/NotoSansCJKjp-hinted.zip && \
    unzip NotoSansCJKjp-hinted.zip && \
    mkdir -p /usr/share/fonts/noto && \
    cp *.otf /usr/share/fonts/noto && \
    chmod 755 /usr/share/fonts/noto && \
    chmod 644 /usr/share/fonts/noto/* && \
    fc-cache -fv && \
    cd / && \
    rm -rf /noto

###
# Change to general user
###
RUN mkdir -p /taiko/screenshot && mkdir -p /taiko/downloaded && chown -R node.node /taiko
RUN echo 'CHROMIUM_FLAGS="--lang=ja_JP,ja"' >> /etc/chromium/chromium.conf
USER node

###
# Install taiko
###
ENV NPM_CONFIG_PREFIX /home/node/.npm-global
ENV PATH $PATH:/home/node/.npm-global/bin

#ENV TAIKO_SKIP_CHROMIUM_DOWNLOAD true
#ENV TAIKO_BROWSER_PATH /usr/bin/chromium-browser

RUN npm install -g getgauge/taiko#master
RUN npm install -g @getgauge/cli 
###
# Copy scripts
###
WORKDIR /taiko

ENTRYPOINT [""]
CMD ["{}"]
