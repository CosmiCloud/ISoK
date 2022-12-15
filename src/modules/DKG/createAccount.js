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

module.exports = createAccount = async (chat_id, username) => {
  const row = await db
    .prepare("SELECT ual FROM user_header WHERE chat_id = ? AND username = ?")
    .get(chat_id, username);

  if (row) {
    return {
      result: `ACCOUNT CREATION FAILED: You already have a UAL for this discord account: ${row.ual}`,
    };
  }

  data = fs.readFileSync(`${__dirname}/context/account.json`, "utf8");
  data = JSON.parse(data);

  public_key = "";
  private_key = "";
  if (!public_key || !private_key) {
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

  console.log(`Creating account UAL with ` + JSON.stringify(data));
  account = await dkg.asset
    .create(data, {
      keywords: keywords,
      epochsNum: 200,
      maxNumberOfRetries: 30,
      frequency: 1,
      tokenAmount: ethers.utils.parseEther(process.env.TRAC_PAYMENT),
      blockchain: {
        name: process.env.DKG_NETWORK,
        publicKey: public_key,
        privateKey: private_key,
      },
    })
    .then((result) => {
      return result;
    })
    .catch((error) => {
      console.log(error);
    });

  if (!account) {
    return {
      result: `ACCOUNT CREATION FAILED: The DKG node encounted a transaction error while interacting with the blockchain. Please try again.`,
    };
  }

  if (account.operation.errorMessage) {
    console.log(account.operation.errorMessage);
    return {
      result: `ACCOUNT CREATION FAILED: The DKG node encountered an error while interacting with the knowledge graph. Please try again.`,
    };
  }

  console.log(account);
  console.log(`Created Account UAL: ${account.UAL}!`);

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
