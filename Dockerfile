FROM node:18-alpine

WORKDIR /app

# 复制文件
COPY . .

# 安装依赖
RUN npm install

# 暴露应用运行的端口
EXPOSE 3000

# 运行应用的命令
CMD ["node", "server.js"]
