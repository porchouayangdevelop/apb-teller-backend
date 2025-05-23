FROM node:20-alpine as builder
WORKDIR /app/backend

RUN apk add --no-cache gettext iproute2
RUN npm install pnpm@latest -g

COPY *.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install dotenv
RUN pnpm i --frozen-lockfile --prod


FROM node:20-alpine as production
RUN apk add --no-cache gettext iproute2
RUN npm install pnpm@latest -g

COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/pnpm-lock.yaml ./

COPY app/ ./app/
COPY certs/ ./certs/
COPY server.js ./

# RUN pnpm install

# env
ENV NODE_ENV=production

# COPY . .

EXPOSE 5000
EXPOSE 443

CMD ["pnpm", "start"]


# production deployment
# docker build --tag apb.registry-img.com/api/newcore/apb-teller-sv-prod:v1.0.0 .
# docker push apb.registry-img.com/api/newcore/apb-teller-sv-prod:v1.0.0
# docker ps