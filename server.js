const express = require('express');
const httpProxy = require('http-proxy');
const axios = require('axios');

// 创建代理服务器
const proxy = httpProxy.createProxyServer({
  target: 'https://api.openai.com',
  changeOrigin: true,
  secure: true,     // 验证SSL证书
  followRedirects: true,
  timeout: 120000   // 2分钟超时
});

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

// 记录错误
proxy.on('error', (err, req, res) => {
  console.error('代理错误:', err);
  
  // 直接用axios尝试
  if (req.method === 'POST' && req.url.includes('/chat/completions')) {
    console.log('代理失败，尝试直接请求...');
    
    // 解析请求体
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        // 从请求中获取授权头
        let auth = req.headers.authorization;
        
        // 如果环境变量中设置了API_KEY，则使用它
        if (API_KEY) {
          auth = `Bearer ${API_KEY}`;
        }
        
        // 直接使用axios发送请求
        const response = await axios({
          method: 'post',
          url: `https://api.openai.com${req.url}`,
          data: JSON.parse(body),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth
          },
          timeout: 120000
        });
        
        // 发送响应
        res.status(response.status).json(response.data);
      } catch (error) {
        console.error('直接请求错误:', error.message);
        
        if (error.response) {
          // 服务器响应错误
          res.status(error.response.status).json(error.response.data);
        } else {
          // 其他错误
          res.status(500).json({
            status: 'error',
            message: '请求失败',
            error: error.message
          });
        }
      }
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: '代理服务器错误',
      error: err.message
    });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '代理服务正常' });
});

// 直接连接测试端点
app.get('/test-direct', async (req, res) => {
  try {
    // 尝试直接连接到OpenAI API
    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': API_KEY ? `Bearer ${API_KEY}` : 'Bearer sk-test'
      },
      timeout: 10000
    });
    
    res.status(200).json({
      status: 'success',
      message: '直接连接到OpenAI API成功',
      openai_status: response.status,
      sample_data: response.data.data.slice(0, 3)
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '直接连接到OpenAI API失败',
      error: error.message,
      error_code: error.code,
      response_status: error.response ? error.response.status : null,
      response_data: error.response ? error.response.data : null
    });
  }
});

// 使用前缀的代理路由
app.all('/api/openai/*', (req, res) => {
  // 重写URL路径
  req.url = req.url.replace('/api/openai', '');
  
  // 如果设置了API_KEY，则使用它
  if (API_KEY) {
    req.headers.authorization = `Bearer ${API_KEY}`;
  }
  
  proxy.web(req, res);
});

// 直接代理路由
app.all('/v1/*', (req, res) => {
  // 如果设置了API_KEY，则使用它
  if (API_KEY) {
    req.headers.authorization = `Bearer ${API_KEY}`;
  }
  
  proxy.web(req, res);
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: '未找到。请使用 /api/openai/* 或 /v1/* 来访问OpenAI API。'
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`代理服务器运行在端口 ${PORT}`);
  console.log(`API密钥配置: ${API_KEY ? '是' : '否'}`);
  console.log(`请访问 http://localhost:${PORT}/test-direct 测试直接连接`);
});
