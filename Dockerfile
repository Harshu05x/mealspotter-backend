FROM node:18.17.0
WORKDIR /code
COPY . .
RUN npm install
CMD ["npm", "run", "dev"]