require("dotenv").config();
const fs = require("fs");
const ethers = require("ethers");
const db = require("better-sqlite3")(process.env.GAME_DB, {
  verbose: console.log,
});

const blockheart_db = require("better-sqlite3")(`C:/Users/Tyler/Blockheart/public/database/blockheart.db`, {
  verbose: console.log,
});


const DKGClient = require("dkg.js");
const OT_NODE_HOSTNAME = process.env.OT_NODE_HOSTNAME;
const OT_NODE_PORT = process.env.OT_NODE_PORT;
const node_options = {
  endpoint: OT_NODE_HOSTNAME,
  port: OT_NODE_PORT,
  useSSL: false,
  maxNumberOfRetries: 100,
};
const dkg = new DKGClient(node_options);

module.exports = createAccount = async (chat_id, username, public_key) => {
  const row = await db
    .prepare("SELECT ual FROM player_header WHERE chat_id = ? AND username = ?")
    .get(chat_id, username);

  if (row) {
    return {
      result: `ACCOUNT CREATION FAILED: You already have a UAL for this discord account: ${row.ual}`,
    };
  }

  assetData = fs.readFileSync(`${__dirname}/context/account.json`, "utf8");
  assetData = JSON.parse(assetData);

  let private_key;
  if (!public_key) {
    public_key = process.env.DEFAULT_PUBLIC_KEY;
    private_key = process.env.DEFAULT_PRIVATE_KEY;
  }

  assetData["account"]["chat_id"] = chat_id;
  assetData["account"]["name"] = username;
  assetData["account"]["owner"] = public_key;

  keywords = [];
  keywords.push("in_search_of_knowledge")
  keywords.push(chat_id)
  keywords.push(username)
  keywords.push(public_key)

  epochs = 200

  timestamp = new Date();
  abs_timestamp = Math.abs(timestamp);

  await blockheart_db
        .prepare("INSERT INTO txn_header (owner_address, action, type, keywords, timestamp, ual, assertionId, operationId, status, data, otp_fee, trac_fee, epochs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run([
          public_key,
          "publish",
          "account creation",
          keywords,
          abs_timestamp,
          null,
          null,
          null,
          'Pending',
          JSON.stringify(assetData),
          null,
          null,
          epochs
        ]);

  // await db
  //   .prepare(`REPLACE INTO player_header VALUES (?,?,?,?,?,?,?,?)`)
  //   .run(
  //     chat_id,
  //     account.UAL,
  //     username,
  //     public_key,
  //     JSON.stringify(data["account"]["knowledge"]),
  //     JSON.stringify(data["account"]["inventory"]),
  //     JSON.stringify(data["account"]["explores"]),
  //     JSON.stringify(data["account"]["treks"])
  //   );

  return {
    result: `ACCOUNT CREATION QUEUED: Account creation has been queued, please sign the transaction found here to take ownership: ${process.env.HOSTSITE}/isok/account?owner_address=${public_key}`,
  };
};
