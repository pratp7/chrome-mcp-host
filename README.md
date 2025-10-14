# Simple MCP Host

A minimal HTTP wrapper for chrome-devtools-mcp that can be deployed to cloud platforms.

## 🚀 Deploy to Railway (Free)

1. **Create Railway account**: https://railway.app
2. **Connect GitHub**: Fork this repo to your GitHub
3. **Deploy**: Railway → New Project → Deploy from GitHub → Select your repo
4. **Get URL**: Railway will give you a public URL like `https://your-app.railway.app`

## 🚀 Deploy to Render (Free)

1. **Create Render account**: https://render.com
2. **New Web Service** → Connect GitHub repo
3. **Settings**:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Deploy** → Get your URL

## 🚀 Deploy to DigitalOcean App Platform

1. **DigitalOcean account** → App Platform
2. **Create App** → GitHub repo
3. **Deploy** → Get URL

## 🎯 Usage

Your deployed URL will have these endpoints:

- `GET /health` - Check if server is running
- `GET /tools` - List available MCP tools
- `POST /execute` - Execute a tool

### Example Tool Execution:

```bash
# Navigate to a website
curl -X POST https://your-app.railway.app/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "navigate",
    "arguments": {"url": "https://example.com"}
  }'

# Fill a form
curl -X POST https://your-app.railway.app/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "fill_form",
    "arguments": {
      "fields": {
        "#username": "testuser",
        "#password": "testpass"
      }
    }
  }'

# Click an element
curl -X POST https://your-app.railway.app/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "click",
    "arguments": {"selector": "#login-button"}
  }'

# Take screenshot
curl -X POST https://your-app.railway.app/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "take_screenshot",
    "arguments": {"fullPage": true}
  }'
```