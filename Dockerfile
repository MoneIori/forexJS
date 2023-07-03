# Base image
FROM node:14-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm ci --only=production

# Copy the source code to the working directory
COPY . .

# Expose the port on which the NestJS app will run (adjust if necessary)
EXPOSE 3000

# Start the NestJS application
CMD [ "npm", "start" ]
