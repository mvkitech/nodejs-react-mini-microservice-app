# Specify a base image
FROM node:alpine

# Setup a working directory
WORKDIR /app/blog/client

# Install dependencies
COPY ./package.json ./
RUN npm install
COPY ./ ./

# Setup default command when container is run
CMD ["node", "start"]
