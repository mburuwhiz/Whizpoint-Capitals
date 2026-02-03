const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

exports.apiLimiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

exports.authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 failed login attempts per hour
  message: 'Too many login attempts, please try again after an hour'
});

exports.helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdn.tailwindcss.com"],
    },
  },
});

exports.advancedSecurity = (req, res, next) => {
  // Device Fingerprinting (Simplified)
  const deviceFingerprint = req.headers['user-agent'] + req.ip;
  req.deviceFingerprint = deviceFingerprint;

  // Risk Scoring Placeholder
  req.riskScore = 0;
  if (req.rateLimit && req.rateLimit.remaining === 0) req.riskScore += 50;

  // Geo-fencing (Simplified - check for allowed countries if configured)
  const allowedCountries = process.env.ALLOWED_COUNTRIES ? process.env.ALLOWED_COUNTRIES.split(',') : null;
  const userCountry = req.headers['cf-ipcountry'] || 'US';
  if (allowedCountries && !allowedCountries.includes(userCountry)) {
    return res.status(403).send('Access denied from your region');
  }

  // IP Reputation (Simplified - check against a mock blacklist)
  const ipBlacklist = process.env.IP_BLACKLIST ? process.env.IP_BLACKLIST.split(',') : [];
  if (ipBlacklist.includes(req.ip)) {
    return res.status(403).send('Your IP is restricted');
  }

  next();
};
