require("dotenv").config();
const twit = require("twit");
const { TwitterApi } = require("twitter-api-v2");
const Twitter = require("twitter-v2");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const googleCreds = require("./google_config");
const sheetId = process.env.GOOGLE_SHEET_ID;
const doc = new GoogleSpreadsheet(sheetId);

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

const client = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
})

const T = new twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET,
  timeout_ms: 60 * 1000,
  strictSSL: true,
});

// const client = new Twitter({
//   consumer_key: process.env.TWITTER_CONSUMER_KEY,
//   consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
//   access_token_key: process.env.TWITTER_ACCESS_TOKEN,
//   access_token_secret: process.env.TWITTER_ACCESS_SECRET,
// });


const handleSheetsUpdate = async () => {
  try {
    await doc.useServiceAccountAuth(googleCreds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    await sheet.loadCells("A2:A2");
    const nextTweet = sheet.getCellByA1("A2").value;
    if (nextTweet) {
      try {
        await client.v1.tweet(nextTweet)
        await rows[0].delete()
      } catch (err) {
        console.log(err);
      }
    }
  } catch (e) {
    throw e.message;
  }
};

handleSheetsUpdate();
