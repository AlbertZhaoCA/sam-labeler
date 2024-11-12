FROM node:latest
LABEL authors="albert"

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 3000

RUN yarn build

CMD ["yarn", "start"]


