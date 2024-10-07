FROM node:20 AS build-env
ADD . /app
WORKDIR /app
RUN npm install --omit=dev

FROM gcr.io/distroless/nodejs20-debian12
COPY --from=build-env /app/dist /app
COPY --from=build-env /app/node_modules /app/node_modules
WORKDIR /app
EXPOSE 3000
CMD ["index.js"]