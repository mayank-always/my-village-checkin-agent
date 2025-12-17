require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { WebClient } = require('@slack/web-api');

const app = express();
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

// Enable CORS for your React app
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json());

// Helper function to extract project name from message
const extractProject = (message) => {
  // Look for "working on [project]" pattern
  const projectMatch = message.match(/working on (?:my |the )?([^.!?]+)/i);
  if (projectMatch) return projectMatch[1].trim();
  
  // Look for "project:" pattern
  const projectLabel = message.match(/project:\s*([^.!?\n]+)/i);
  if (projectLabel) return projectLabel[1].trim();
  
  return "General Work";
};

// Helper function to extract technology tags from message
const extractTags = (message) => {
  const techKeywords = [
    'React', 'Python', 'JavaScript', 'Node.js', 'MongoDB', 'SQL', 'PostgreSQL',
    'HTML', 'CSS', 'Django', 'Flask', 'Express', 'Vue', 'Angular',
    'TypeScript', 'Java', 'C++', 'Ruby', 'PHP', 'Swift', 'Kotlin',
    'Docker', 'AWS', 'Git', 'API', 'Database', 'Frontend', 'Backend',
    'Tailwind', 'Bootstrap', 'Redux', 'GraphQL', 'REST', 'MySQL',
    'Firebase', 'Heroku', 'Vercel', 'Next.js', 'Gatsby', 'Webpack',
    'Babel', 'Jest', 'Cypress', 'Testing', 'CI/CD', 'DevOps'
  ];
  
  const foundTags = [];
  const lowerMessage = message.toLowerCase();
  
  techKeywords.forEach(tech => {
    if (lowerMessage.includes(tech.toLowerCase())) {
      foundTags.push(tech);
    }
  });
  
  return foundTags.slice(0, 5); // Limit to 5 tags
};

// API endpoint to get check-in messages
app.get('/api/checkins', async (req, res) => {
  try {
    console.log('📥 Fetching check-in messages from Slack...');
    
    // Fetch message history from Slack
    const result = await slack.conversations.history({
      channel: CHANNEL_ID,
      limit: 100 // Get last 100 messages
    });
    
    if (!result.ok) {
      throw new Error('Failed to fetch Slack messages');
    }
    
    // Transform Slack messages to our format
    const messages = await Promise.all(
      result.messages
        .filter(msg => msg.text && !msg.bot_id) // Filter out bot messages and empty messages
        .map(async (msg) => {
          try {
            // Get user information
            const userInfo = await slack.users.info({ user: msg.user });
            const date = new Date(msg.ts * 1000); // Convert Slack timestamp to JS Date
            
            return {
              user: userInfo.user.real_name || userInfo.user.name,
              date: date.toISOString().split('T')[0], // Format: YYYY-MM-DD
              timestamp: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              message: msg.text,
              project: extractProject(msg.text),
              tags: extractTags(msg.text)
            };
          } catch (error) {
            console.error('Error processing message:', error);
            return null;
          }
        })
    );
    
    // Filter out any failed messages and reverse to show oldest first
    const validMessages = messages.filter(m => m !== null).reverse();
    
    console.log(`✅ Successfully fetched ${validMessages.length} check-in messages`);
    res.json(validMessages);
    
  } catch (error) {
    console.error('❌ Error fetching check-ins:', error);
    res.status(500).json({ 
      error: 'Failed to fetch messages',
      details: error.message 
    });
  }
});

// API endpoint to get list of all students in the channel
app.get('/api/students', async (req, res) => {
  try {
    console.log('👥 Fetching student list from Slack...');
    
    // Get all members of the channel
    const members = await slack.conversations.members({
      channel: CHANNEL_ID
    });
    
    if (!members.ok) {
      throw new Error('Failed to fetch channel members');
    }
    
    // Get user info for each member
    const students = await Promise.all(
      members.members.map(async (userId) => {
        try {
          const userInfo = await slack.users.info({ user: userId });
          return {
            name: userInfo.user.real_name || userInfo.user.name,
            isBot: userInfo.user.is_bot
          };
        } catch (error) {
          console.error('Error fetching user:', error);
          return null;
        }
      })
    );
    
    // Filter out bots and null values, get just names
    const studentNames = students
      .filter(s => s && !s.isBot)
      .map(s => s.name);
    
    console.log(`✅ Found ${studentNames.length} students`);
    res.json(studentNames);
    
  } catch (error) {
    console.error('❌ Error fetching students:', error);
    res.status(500).json({ 
      error: 'Failed to fetch students',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    slackConnected: !!process.env.SLACK_BOT_TOKEN
  });
});

// Test Slack connection
app.get('/api/test-connection', async (req, res) => {
  try {
    const auth = await slack.auth.test();
    res.json({
      success: true,
      team: auth.team,
      user: auth.user,
      bot_id: auth.bot_id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 My Village Check-In Agent Backend');
  console.log('=====================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📱 Slack channel: ${CHANNEL_ID}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('📍 Available endpoints:');
  console.log(`   GET /api/checkins - Fetch check-in messages`);
  console.log(`   GET /api/students - Get list of students`);
  console.log(`   GET /api/health - Health check`);
  console.log(`   GET /api/test-connection - Test Slack connection`);
  console.log('');
  console.log('💡 Test connection: curl http://localhost:3001/api/test-connection');
  console.log('');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Shutting down gracefully...');
  process.exit(0);
});
