# Development Stage
FROM node:18-alpine AS development
WORKDIR /usr/src/app

# Copy package files
COPY package.json .
COPY yarn.lock .

# Copy TypeScript config files
COPY tsconfig.json .
COPY tsconfig.build.json .
COPY nest-cli.json .

# Copy the libs directory (contains @app/common)
COPY libs/ ./libs/

# Copy the specific app's files
COPY apps/reservations/tsconfig.app.json ./apps/reservations/
COPY apps/reservations/src/ ./apps/reservations/src/

# Install dependencies and build
RUN yarn install
RUN yarn build reservations

# Production Stage
FROM node:18-alpine AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package.json .
COPY yarn.lock .
RUN yarn install --production
COPY --from=development /usr/src/app/dist ./dist
CMD ["node", "dist/apps/reservations/main"]