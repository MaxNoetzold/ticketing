# Very basic node image
FROM node:alpine
 
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci --omit=dev
COPY . .
 
CMD ["npm", "start"]