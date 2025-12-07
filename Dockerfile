FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci --include=dev

COPY . .

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

# Copy built static files from the build stage
COPY --from=build /app/dist ./dist

# Install a tiny static server (serve) and run it on port 80
RUN npm install -g serve

EXPOSE 80

CMD ["serve", "-s", "dist", "-l", "80"]