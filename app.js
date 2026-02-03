const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoStore = require('connect-mongo').MongoStore;
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const morgan = require('morgan');
const dotenv = require('dotenv');
const csrf = require('csurf');
const connectDB = require('./utils/db');
const { helmetConfig } = require('./middleware/security');

// Load env vars
dotenv.config();

// Connect to Database
if (process.env.NODE_ENV !== 'test' && !process.env.MOCK_DB) {
  connectDB();
}

const app = express();

// Security middleware
app.use(helmetConfig);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// CSRF Protection
const csrfProtection = csrf({ cookie: true });

// Exclude Daraja callback from CSRF
app.post('/daraja/callback', require('./controllers/walletController').postCallback);

app.use(csrfProtection);

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Method override
app.use(methodOverride('_method'));

// Session
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
};

if (process.env.NODE_ENV !== 'test' && !process.env.MOCK_DB) {
  sessionConfig.store = MongoStore.create({ mongoUrl: process.env.MONGODB_URI });
}

app.use(session(sessionConfig));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');

// Static folder
app.use(express.static('public'));

// Routes
app.use('/', require('./routes/publicRoutes'));
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/userRoutes'));
app.use('/', require('./routes/walletRoutes'));
app.use('/', require('./routes/verificationRoutes'));
app.use('/', require('./routes/adminRoutes'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

module.exports = app;
