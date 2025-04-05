FROM node:18

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./
COPY tsconfig.json ./

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 3000

# 프로덕션 모드로 실행
CMD ["yarn", "start"] 