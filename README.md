# My Village Check-In Agent - Backend Setup

Quick start guide to get your backend server running in 5 minutes! 🚀

## 📋 Prerequisites

- Node.js installed (version 14 or higher)
- Your Slack Bot Token
- Your #coding-in-color Channel ID

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server
- `@slack/web-api` - Slack API client
- `cors` - Enable cross-origin requests
- `dotenv` - Environment variables

### 2. Configure Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

Edit `.env` and add your values:
```env
SLACK_BOT_TOKEN=xoxb-your-actual-token-here
SLACK_CHANNEL_ID=C1234567890
```

### 3. Start the Server

```bash
npm start
```

You should see:
```
🚀 My Village Check-In Agent Backend
=====================================
✅ Server running on http://localhost:3001
📱 Slack channel: C1234567890
```

### 4. Test the Connection

Open a new terminal and run:
```bash
curl http://localhost:3001/api/test-connection
```

If successful, you'll see your Slack workspace info!

## 📍 API Endpoints

Once running, you can access:

- **GET** `/api/checkins` - Get all check-in messages
- **GET** `/api/students` - Get list of students
- **GET** `/api/health` - Health check
- **GET** `/api/test-connection` - Test Slack connection

### Example Usage

```bash
# Get check-ins
curl http://localhost:3001/api/checkins

# Get students
curl http://localhost:3001/api/students

# Health check
curl http://localhost:3001/api/health
```

## 🔧 Development Mode

For auto-restart on file changes:

```bash
npm run dev
```

## 🐛 Troubleshooting

### "Cannot find module 'express'"
Run: `npm install`

### "Invalid auth" error
- Check your `SLACK_BOT_TOKEN` in `.env`
- Make sure it starts with `xoxb-`
- Try regenerating the token in Slack

### "not_in_channel" error
Run in Slack: `/invite @My Village Check-In Agent`

### CORS errors
- Make sure FRONTEND_URL in `.env` matches your React app URL
- Default is `http://localhost:3000`

## 📦 Deployment

### Heroku

```bash
heroku create my-village-checkin
heroku config:set SLACK_BOT_TOKEN=xoxb-your-token
heroku config:set SLACK_CHANNEL_ID=C1234567890
git push heroku main
```

### Railway

```bash
railway init
railway up
```

### Render

1. Connect your GitHub repo
2. Add environment variables in dashboard
3. Deploy!

## 🔒 Security

- ✅ `.env` file is in `.gitignore`
- ✅ Never commit tokens to GitHub
- ✅ Use environment variables for all secrets
- ✅ CORS is configured for your frontend only

## 📚 Next Steps

1. Start your backend: `npm start`
2. Start your React frontend
3. Watch the magic happen! ✨

Need help? Check `SLACK_INTEGRATION_GUIDE.md` for detailed instructions.
