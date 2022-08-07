

FROM node:lts

# Create app directory.
WORKDIR /usr/src/app

# Install app dependencies.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
COPY package*.json ./

# Building code for production.
RUN npm ci --only=production

# Bundle app source.
COPY . .

# Expose "8080" to be used in production.
# On development, running from "docker-compose" will let you choose a port to be exposed.
EXPOSE 8080
CMD [ "npm", "run", "start:production" ]
