# Use official Node.js runtime with Debian for Chromium compatibility
FROM node:20-bookworm-slim

# Install Chromium and system dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use the installed Chromium package
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PORT=3001 \
    NODE_ENV=production

WORKDIR /app

# Copy backend package files and install
COPY backend/package*.json ./
RUN npm install

# Copy backend source code
COPY backend/ ./

# Ensure data directory exists for SQLite
RUN mkdir -p data

EXPOSE 3001

CMD ["npm", "start"]
