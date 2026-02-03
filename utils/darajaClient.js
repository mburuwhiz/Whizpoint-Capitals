const axios = require('axios');

const darajaClient = {
  stkPush: async (phoneNumber, amount, reference) => {
    try {
      const response = await axios.post(`${process.env.DARAJA_API_URL}/stk-push`, {
        phoneNumber,
        amount,
        reference,
        apiKey: process.env.DARAJA_API_KEY
      });
      return response.data;
    } catch (error) {
      console.error('Daraja API Error:', error.message);
      return { success: false, message: error.message };
    }
  },

  checkStatus: async (reference) => {
    try {
      const response = await axios.get(`${process.env.DARAJA_API_URL}/status/${reference}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

module.exports = darajaClient;
