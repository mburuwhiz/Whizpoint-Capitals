exports.getHome = (req, res) => {
  res.render('index', {
    title: 'Home',
    testimonials: [
      { name: 'John Doe', country: 'USA', type: 'Retail', volume: '$10k+' },
      { name: 'Jane Smith', country: 'Kenya', type: 'Institutional', volume: '$1M+' }
    ]
  });
};

exports.getAbout = (req, res) => {
  res.render('about', { title: 'About Us' });
};

exports.getFees = (req, res) => {
  res.render('fees', { title: 'Fees' });
};

exports.getTerms = (req, res) => {
  res.render('terms', { title: 'Terms & Conditions' });
};

exports.getPrivacy = (req, res) => {
  res.render('privacy', { title: 'Privacy Policy' });
};
