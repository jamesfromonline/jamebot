require("dotenv").config()
const { TwitterApi } = require("twitter-api-v2")
const { GoogleSpreadsheet } = require("google-spreadsheet")
const googleCreds = require("./google_config")
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID)

const client = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET
})

const handleCreateNewTweet = async () => {
  try {
    await doc.useServiceAccountAuth(googleCreds)
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]
    const rows = await sheet.getRows()
    await sheet.loadCells("A2:A2")
    const nextTweet = sheet.getCellByA1("A2").value
    if (nextTweet) {
      try {
        await client.v1.tweet(nextTweet)
        await rows[0].delete()
        process.exit(0)
      } catch (err) {
        throw new Error(err)
      }
    }
  } catch (e) {
    throw e.message
  }
}

handleCreateNewTweet()
