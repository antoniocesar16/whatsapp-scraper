# WhatsApp Scraper Client

WhatsApp Scraper public Data

## Install

```bash
npm install @antoniocesar/whatsapp-scraper
```

## Get your API key

Create an app and subscribe on RapidAPI:
https://rapidapi.com/antoniocesar16794/api/whatsapp-scraper1

## Usage (Fetch-based client)

```js
const { createClient } = require("@antoniocesardev/whatsapp-scraper");

const client = createClient(process.env.RAPIDAPI_KEY);

async function run() {
  const single = await client.getProfile("5511999999999");
  console.log("Single profile:", single);

  const bodySingle = await client.postProfile("5511999999999");
  console.log("Single profile (POST):", bodySingle);

  const bulk = await client.getProfiles(["5511999999999", "12025551234"]);
  console.log("Bulk:", bulk);

  const status = await client.getStatus();
  console.log("Status:", status);
}

run().catch(console.error);
```

## API methods

- `getProfile(number)` -> GET `/profile?number=...`
- `postProfile(number)` -> POST `/profile` with `{ number }`
- `getProfiles(numbers)` -> POST `/profiles` with `{ numbers }`
- `getStatus()` -> GET `/status`

## API key validation

If key is missing, placeholder, invalid, or unauthorized, the client throws an error with guidance to get a valid key at:
https://rapidapi.com/antoniocesar16794/api/whatsapp-scraper1

## Node version

Requires Node.js 18+ (native Fetch support).
