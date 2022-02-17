FROM node:14-alpine

RUN mkdir -p /data

WORKDIR /data

COPY package.json /data/package.json

RUN npm install

COPY . /data

CMD ["npm", "start"]
