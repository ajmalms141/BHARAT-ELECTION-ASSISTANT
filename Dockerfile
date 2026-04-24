FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --only=production

# Bundle app source
COPY . .

# Expose the port Cloud Run uses
EXPOSE 8080

# Start the server
CMD [ "node", "server.js" ]
