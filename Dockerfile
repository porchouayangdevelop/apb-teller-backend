FROM node:20-alpine
WORKDIR /app/backend

RUN apk add --no-cache gettext

RUN npm install pnpm@latest -g

COPY *.json ./

COPY pnpm-lock.yaml ./

RUN npm install dotenv

RUN pnpm install

# env
ENV NODE_ENV=production

COPY . .

EXPOSE 5000
EXPOSE 443

CMD ["pnpm", "start"]


# production deployment
# docker build --tag apb.registry-img.com/api/newcore/apb-teller-sv-prod:v1.0.0 .
# docker push apb.registry-img.com/api/newcore/apb-teller-sv-prod:v1.0.0
# docker ps