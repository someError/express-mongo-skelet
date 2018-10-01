FROM node:latest

WORKDIR /api

COPY package.json .

RUN npm install
#RUN npm run build

COPY . .

#CMD node dist/index.js
CMD npm run production