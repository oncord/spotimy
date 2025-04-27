// dependencies
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const crypto = require('crypto');
const { scheduleAnalyticsCollection } = require('./utils/scheduler');

// Load environment variables
dotenv.config();

// Import models
const SessionModel = require('./models/ExpressSession');

// import routes
const authRoutes = require('./routes/auth');
const spotifyRoutes = require('./routes/spotify');
const userRoutes = require('./routes/user');
const analyticsRoutes = require('./routes/analytics');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    scheduleAnalyticsCollection(); // Start the scheduler
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Custom session store
class MongoSessionStore extends session.Store {
  constructor() {
    super();
  }

  get(sid, callback) {
    SessionModel.findById(sid)
      .then(session => {
        if (!session) {
          return callback(null, null);
        }
        
        if (session.expires && session.expires < new Date()) {
          SessionModel.findByIdAndDelete(sid)
            .then(() => callback(null, null))
            .catch(err => callback(err));
          return;
        }
        
        callback(null, session.session);
      })
      .catch(err => callback(err));
  }

  set(sid, session, callback) {
    const expires = new Date(Date.now() + (session.cookie.maxAge || 86400000));
    
    SessionModel.findByIdAndUpdate(
      sid,
      {
        _id: sid,
        session: session,
        expires: expires
      },
      { upsert: true, new: true }
    )
    .then(() => callback(null))
    .catch(err => callback(err));
  }

  destroy(sid, callback) {
    SessionModel.findByIdAndDelete(sid)
      .then(() => callback(null))
      .catch(err => callback(err));
  }
}

// middleware
app.use(cors({
	origin: process.env.CLIENT_URL,
	credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  genid: function() {
    return crypto.randomBytes(16).toString('hex');
  },
	secret: process.env.SESSION_SECRET || 'spotify-analytics-secret',
	resave: false,
	saveUninitialized: false,
	store: new MongoSessionStore(),
	cookie: {
		secure: process.env.NODE_ENV === 'production',
		maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
	}
}));

// Debug middleware
app.use((req, res, next) => {
  console.log('Session ID:', req.session.id);
  console.log('Session data:', req.session);
  next();
});

// root routes
app.get('/', (req, res) => {
	res.json({ message: "Welcome to Spotimy API. Use /health to check server status." });
});

// API routes
app.use('/', authRoutes);
app.use('/', spotifyRoutes);
app.use('/', userRoutes);
app.use('/', analyticsRoutes);

// health check route
app.get('/health', (req, res) => {
	res.status(200).json({ status: 'Server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});