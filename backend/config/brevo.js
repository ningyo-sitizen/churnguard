require("dotenv").config();
const SibApiV3Sdk = require("sib-api-v3-sdk");

let defaultClient = SibApiV3Sdk.ApiClient.instance;

// set API key
defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

// transactional email instance
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

module.exports = apiInstance;