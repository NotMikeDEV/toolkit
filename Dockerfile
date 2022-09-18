FROM debian:buster
RUN apt-get update && apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl wget && \
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | apt-key add - && \
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
RUN apt-get update && apt-get install -y caddy build-essential bird inetutils-traceroute
RUN wget -O/dev/stdout https://deb.nodesource.com/setup_11.x | bash
RUN apt-get install -y nodejs
RUN mkdir -p /data
RUN mkdir -p /home/node/app/node_modules
WORKDIR /home/node/app
COPY package*.json ./
USER root
RUN npm install
EXPOSE 80
EXPOSE 443
EXPOSE 53
EXPOSE 53/UDP
COPY Caddyfile /etc/caddy/Caddyfile
COPY . .
CMD [ "node", "start" ]
