require("dotenv").config();
const fs = require("fs");
const ethers = require("ethers");
const db = require("better-sqlite3")(process.env.GAME_DB, {
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

  data = fs.readFileSync(`${__dirname}/context/account.json`, "utf8");
  data = JSON.parse(data);

  let private_key;
  if (!public_key) {
    public_key = process.env.DEFAULT_PUBLIC_KEY;
    private_key = process.env.DEFAULT_PRIVATE_KEY;
  }

  data["account"]["chat_id"] = chat_id;
  data["account"]["name"] = username;
  data["account"]["owner"] = public_key;

  keywords = [];
  keywords.push("in_search_of_knowledge")
  keywords.push(chat_id)
  keywords.push(username)
  keywords.push(public_key)

  timestamp = new Date();
  abs_timestamp = Math.abs(timestamp);

  user = await blockheart_db
    .prepare(
      "SELECT * FROM player_header WHERE owner_address = ?"
    )
    .all(public_key);

  if(!user){
    return {
      result: `ACCOUNT CREATION FAILED: You already have a UAL for this discord account: ${row.ual}`,
    };
  }

  await blockheart_db
        .prepare("INSERT INTO txn_header (owner_address, action, type, keywords, timestamp, ual, assertionId, operationId, status, data, otp_fee, trac_fee, epochs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run([
          user[0].owner_address,
          "publish",
          "api",
          keywords,
          abs_timestamp,
          null,
          null,
          null,
          'Pending',
          assetData,
          otp_fee,
          trac_fee,
          epochs
        ]);

  await db
    .prepare(`REPLACE INTO user_header VALUES (?,?,?,?,?,?,?,?)`)
    .run(
      chat_id,
      account.UAL,
      username,
      public_key,
      JSON.stringify(data["account"]["knowledge"]),
      JSON.stringify(data["account"]["inventory"]),
      JSON.stringify(data["account"]["explores"]),
      JSON.stringify(data["account"]["treks"])
    );

  return {
    result: `ACCOUNT CREATION SUCCEEDED: Your account has been created, you can view your account asset here: ${process.env.HOSTSITE}/account?ual=${account.UAL}`,
  };
};
