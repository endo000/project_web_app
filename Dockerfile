FROM node:16.14.2-slim
# WORKDIR ./
COPY package.json .
RUN npm install
COPY . .
CMD ["npm", "run", "start"]
EXPOSE 3001