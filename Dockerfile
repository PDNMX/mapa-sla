FROM node:10-alpine

MAINTAINER Sergio Rodríguez <sergio.rdzsg@gmail.com>

ADD ./s /mapa-sla
WORKDIR /mapa-sla

RUN yarn add global yarn \
&& yarn global add http-server \
&& yarn cache clean

EXPOSE 8080

CMD ["http-server"]
