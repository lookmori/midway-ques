# 使用 Node.js 官方镜像
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 设置 npm 镜像源为淘宝镜像
RUN npm config set registry https://registry.npmmirror.com && \
    npm config set disturl https://npmmirror.com/dist && \
    npm config set sass_binary_site https://npmmirror.com/mirrors/node-sass && \
    npm config set electron_mirror https://npmmirror.com/mirrors/electron/ && \
    npm config set puppeteer_download_host https://npmmirror.com/mirrors && \
    npm config set chromedriver_cdnurl https://npmmirror.com/mirrors/chromedriver && \
    npm config set operadriver_cdnurl https://npmmirror.com/mirrors/operadriver && \
    npm config set phantomjs_cdnurl https://npmmirror.com/mirrors/phantomjs && \
    npm config set selenium_cdnurl https://npmmirror.com/mirrors/selenium && \
    npm config set node_inspector_cdnurl https://npmmirror.com/mirrors/node-inspector

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 7001

# 启动命令
CMD ["npm", "run", "start"] 