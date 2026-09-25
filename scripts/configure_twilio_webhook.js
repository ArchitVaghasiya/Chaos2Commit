require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiKeySid = process.env.TWILIO_API_KEY_SID;
const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;

if (!accountSid) {
  console.error('TWILIO_ACCOUNT_SID missing in .env');
  process.exit(1);
}

const client =
  apiKeySid && apiKeySecret
    ? twilio(apiKeySid, apiKeySecret, { accountSid })
    : twilio(accountSid, authToken);

async function configureTwilioNumber() {
  try {
    const publicUrl = process.env.PUBLIC_WEBHOOK_URL;
    if (!publicUrl) {
      console.error('PUBLIC_WEBHOOK_URL missing in .env');
      return;
    }

    const voiceUrl = `${publicUrl}/api/voice/twilio/twiml`;
    const statusUrl = `${publicUrl}/api/voice/twilio/status`;

    const numbers = await client.incomingPhoneNumbers.list();
    for (const num of numbers) {
      console.log(`Configuring Twilio Number ${num.phoneNumber} (SID: ${num.sid})...`);
      const updated = await client.incomingPhoneNumbers(num.sid).update({
        voiceUrl,
        voiceMethod: 'POST',
        statusCallback: statusUrl,
        statusCallbackMethod: 'POST',
      });
      console.log(`Successfully updated ${updated.phoneNumber} Voice Webhook to: ${voiceUrl}`);
    }
  } catch (err) {
    console.error('Error configuring Twilio number:', err.message);
  }
}

configureTwilioNumber();
