FROM node:16-alpine
WORKDIR /app
COPY package.json .
ARG NODE_ENV=development
RUN if [ "${NODE_ENV}" = "development" ]; \
    then npm install; \
    else npm install --omit=dev; \
    fi
COPY . ./
ENV PORT=8080
EXPOSE ${PORT}
CMD [ "npm", "run", "dev" ]
