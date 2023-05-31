FROM node:lts-alpine

MAINTAINER Sergio Rodríguez. <sergio.rdzsg@gmail.com>

ADD ./s /mapa-sla
WORKDIR /mapa-sla

RUN yarn add global yarn \
&& yarn global add serve \
&& yarn cache clean

#EXPOSE 5000

CMD ["serve"]
.
