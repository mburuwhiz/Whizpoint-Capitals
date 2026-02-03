const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PORT = 4000;

app.post('/stk-push', (req, res) => {
  const { phoneNumber, amount, reference, apiKey } = req.body;
  console.log(`[Daraja] STK Push requested for ${phoneNumber}, amount ${amount}, ref ${reference}`);

  if (!apiKey) {
    return res.status(401).json({ success: false, message: 'API Key missing' });
  }

  // Simulate success
  res.json({ success: true, message: 'Request accepted for processing', CheckoutRequestID: 'ws_CO_123456789' });

  // Simulate callback after 5 seconds
  setTimeout(async () => {
    try {
      await axios.post('http://localhost:3000/daraja/callback', {
        reference,
        status: 'Success'
      });
      console.log(`[Daraja] Callback sent for ${reference}`);
    } catch (err) {
      console.error(`[Daraja] Callback failed: ${err.message}`);
    }
  }, 5000);
});

app.get('/status/:reference', (req, res) => {
  const { reference } = req.params;
  // Simulate status check
  res.json({ success: true, status: 'Completed', reference });
});

app.listen(PORT, () => {
  console.log(`Simulated Daraja Server running on port ${PORT}`);
});
