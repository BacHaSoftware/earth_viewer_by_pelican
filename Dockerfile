# build stage
FROM node:14 as build-stage

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3002
CMD ["npm", "run", "start"]