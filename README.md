# openai-proxy-docker
方便通过vps代理访问openai的api

使用host网络模式：让容器直接使用主机网络，避免Docker网络层的问题
使用http-proxy库：更简单、更可靠的代理实现
增加直接连接测试端点：用于验证Docker容器内部是否能直接连接OpenAI API
错误处理升级：如果代理失败，会自动尝试使用axios直接连接

部署步骤

1、在您的VPS上创建部署脚本：

下载文件到你的vps目录openai-proxy

2、构建并启动Docker容器：

cd openai-proxy
sudo docker-compose up -d

3、验证代理是否正常工作
我创建了一个测试脚本，可以帮您验证代理是否正常工作。您需要一个有效的OpenAI API密钥来进行测试：
./test.sh YOUR_OPENAI_API_KEY

这个脚本会执行三项测试：

测试健康检查端点
使用代理前缀路径测试OpenAI API
使用原始路径测试OpenAI API

代码示例（Python）：
import openai

# 修改API基础URL
openai.api_base = "http://your-vps-ip:3000/v1"
openai.api_key = "your-openai-api-key"

# 正常使用OpenAI API
response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hello!"}]
)


JavaScript/Node.js:
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: "your-openai-api-key",
  basePath: "http://your-vps-ip:3000/v1",
});

const openai = new OpenAIApi(configuration);
