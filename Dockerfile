FROM debian
RUN apt-get update && apt-get install -y wget build-essential bird nginx paris-traceroute
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
COPY nginx.conf /etc/nginx/nginx.conf
COPY . .
CMD [ "node", "start" ]
