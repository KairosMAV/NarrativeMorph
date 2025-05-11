# Use an official Node runtime as a parent image
FROM node:20.11.1-alpine3.19@sha256:b2da3316acdc2bec442190a1fe10dc094e7ba4121d029cb5bc75f3004e0db5fcf AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
# Copy nginx config if you have one, e.g., nginx.conf
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
