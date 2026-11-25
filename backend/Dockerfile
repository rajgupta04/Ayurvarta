FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install curl or wget for healthcheck
RUN apk add --no-cache curl

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend/ ./

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["node", "src/server.js"]
