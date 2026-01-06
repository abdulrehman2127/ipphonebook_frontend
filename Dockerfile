FROM node:22-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy code
COPY . .

# Build app
RUN npm run build

# Install simple server
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Serve built app
CMD ["serve", "-s", "dist", "-l", "3000"]
