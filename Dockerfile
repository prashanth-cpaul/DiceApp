# specify the node base image with your desired version node:<version>
FROM node:10.3.0@sha256:28164a5d33cb6fd3fe5eb6fb0267c28459f4ce47314cb03dc089ee22bbb41926

# set docker working directory
WORKDIR /app

RUN npm install yarn

# copy current working directory to docker working directory
COPY package.json yarn.lock ./

# Install project dependencies
RUN yarn install

# copy current working directory to docker working directory
COPY . .

# replace this with your application's default port
EXPOSE 3000

# Start project
CMD npm run docker-start


