FROM node:20-bookworm
RUN apt-get update && apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl wget build-essential bird inetutils-traceroute mtr
RUN echo "deb [trusted=yes] https://apt.fury.io/caddy/ /" > /etc/apt/sources.list.d/caddy-fury.list
RUN apt-get update && apt-get install -y caddy
RUN mkdir -p /data
RUN mkdir -p /home/node/app/node_modules
WORKDIR /opt/tmp/
RUN dd if=/dev/urandom of=down.dat bs=100M count=20
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
