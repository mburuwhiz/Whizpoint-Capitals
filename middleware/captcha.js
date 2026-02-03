const svgCaptcha = require('svg-captcha');

exports.generateCaptcha = (req, res, next) => {
  const captcha = svgCaptcha.create({
    size: 6,
    noise: 3,
    color: true,
    background: '#f8fafc'
  });
  req.session.captcha = captcha.text.toLowerCase();
  res.locals.captchaSvg = captcha.data;
  next();
};

exports.validateCaptcha = (req, res, next) => {
  const userCaptcha = (req.body.captcha || '').toLowerCase();
  if (userCaptcha !== req.session.captcha) {
    req.captchaError = 'Invalid CAPTCHA code. Please try again.';
    // We don't return here because we want the controller to handle the error
    // and re-render the page with other form data if possible.
    // BUT for simplicity, many apps just error out here.
    // Let's attach it to req and let the controller decide.
  }
  next();
};
