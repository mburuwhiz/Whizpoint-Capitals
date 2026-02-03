exports.generateCaptcha = (req, res, next) => {
  const num1 = Math.floor(Math.random() * 10);
  const num2 = Math.floor(Math.random() * 10);
  req.session.captcha = num1 + num2;
  res.locals.captchaQuestion = `What is ${num1} + ${num2}?`;
  next();
};

exports.validateCaptcha = (req, res, next) => {
  if (parseInt(req.body.captcha) !== req.session.captcha) {
    // If it's a view, we should ideally render the view with an error
    // For simplicity in this task, we'll just send an error or redirect
    return res.status(400).send('Invalid CAPTCHA. Please go back and try again.');
  }
  next();
};
