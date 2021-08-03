FROM node:12.20.0-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json ./
COPY yarn.lock ./
COPY .env.example ./
COPY .env ./
COPY ormconfig.json ./


RUN yarn

COPY . .

RUN yarn build

RUN chmod 777 /usr/src/app/uploads/images/
RUN chmod 777 /usr/src/app/dist/uploads/images/

ENV NODE_ENV production

EXPOSE 4000
CMD [ "node", "dist/index.js" ]
USER node