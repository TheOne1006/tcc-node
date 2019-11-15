FROM node:10.15.3

# Copy application files
COPY ./package.json /usr/src/app/package.json
WORKDIR /usr/src/app

RUN npm set registry https://registry.npm.taobao.org # 注册模块镜像
RUN npm set disturl https://npm.taobao.org/dist # node-gyp 编译依赖的 node 源码镜像
RUN npm install -g yarn nodeinstall cnpm pm2

# Install Yarn and Node.js dependencies & use taobao registry
RUN rm -rf node_modules
RUN nodeinstall --install-alinode ^3 --china
RUN cnpm install --production
COPY ./ /usr/src/app
# RUN npm run tsc

EXPOSE 7090

CMD [ "npm", "run", "start-pro" ]
