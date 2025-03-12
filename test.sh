#!/bin/bash

VPS_IP="localhost"
API_KEY=$1

if [ -z "$API_KEY" ]; then
  echo "请提供您的OpenAI API密钥作为参数"
  echo "用法: ./test.sh YOUR_OPENAI_API_KEY"
  exit 1
fi

echo "=== 测试健康检查端点 ==="
curl -s "http://$VPS_IP:3000/health"

echo ""
echo "=== 测试直接连接 ==="
curl -s "http://$VPS_IP:3000/test-direct"

echo ""
echo "=== 测试OpenAI API (使用代理前缀) ==="
curl -s -X POST "http://$VPS_IP:3000/api/openai/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 10
  }'

echo ""
echo "=== 测试OpenAI API (使用原始路径) ==="
curl -s -X POST "http://$VPS_IP:3000/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 10
  }'
