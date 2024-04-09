# FROM node:alpine

# WORKDIR /app

# COPY package.json ./

# RUN npm install

# COPY ./  ./

# CMD ["npm","run","dev"]

# Use an official Node.js image as the base
FROM node:alpine as builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Use Nginx to serve the production build
FROM nginx:alpine

# Copy the production build from the previous stage
COPY --from=builder /app/dist /usr/share/nginx/html


# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
