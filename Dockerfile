
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install necessary libs for Prisma
RUN apk add --no-cache openssl

# Use yarn with mirror and relaxed SSL
RUN yarn config set registry https://registry.npmmirror.com \
    && yarn config set strict-ssl false \
    && yarn config set network-timeout 600000 \
    && yarn install

COPY . .

# Generate Client for type definitions
RUN DATABASE_URL="postgresql://dummy:5432/db" npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
