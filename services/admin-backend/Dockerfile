FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Use npm install in the image to avoid requiring a package-lock.json during Docker builds
RUN npm install --production --no-audit --no-fund
COPY . .
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "src/index.js"]
