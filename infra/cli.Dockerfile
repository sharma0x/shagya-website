FROM node:20-alpine
RUN npm install -g pnpm@10.1.0
ENTRYPOINT ["pnpm"]
