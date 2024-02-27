# Stage 1: Build
FROM node:18.18.0-alpine AS build

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

RUN apk add --no-cache bash git sudo

WORKDIR /app

COPY package*.json ./
ENV TZ=Asia/Jakarta
RUN npm install -g yarn
RUN yarn install
COPY . .

# Build the application
RUN yarn run build

# Stage 2: Runtime
FROM node:18.18.0-alpine AS runtime

WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/yarn.lock /app/yarn.lock
COPY --from=build /app/.env /app/.env

CMD [ "node", "dist/main.js" ]
