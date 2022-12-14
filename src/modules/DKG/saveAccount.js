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

module.exports = saveAccount = async (chat_id, username) => {
  const row = await db
    .prepare("SELECT * FROM user_header WHERE chat_id = ? AND username = ?")
    .get(chat_id, username);

  if (!row) {
    return {
      result: `SAVE REQUEST FAILED: There is no UAL associated with your Discord profile. Please run !createaccount to create a account.`,
    };
  }

  console.log(`Gathering local state to update UAL: ${row.ual}...`);
  data = fs.readFileSync(`${__dirname}/context/account.json`, "utf8");
  data = JSON.parse(data);

  public_key = "";
  private_key = "";
  if (!public_key || !private_key) {
    public_key = process.env.DEFAULT_PUBLIC_KEY;
    private_key = process.env.DEFAULT_PRIVATE_KEY;
  }

  keywords = [];
  keywords.push("in_search_of_knowledge")
  keywords.push(chat_id)
  keywords.push(username)
  keywords.push(public_key)

  data["account"]["chat_id"] = chat_id;
  data["account"]["name"] = username;
  data["account"]["owner"] = public_key;
  data["account"]["knowledge"] = JSON.parse(row.knowledge);
  data["account"]["inventory"] = JSON.parse(row.inventory);
  data["account"]["explores"] = JSON.parse(row.explores);
  data["account"]["treks"] = JSON.parse(row.treks);

  console.log(`Updating UAL: ${row.ual}`);
  console.log(`Saving Data: ${JSON.stringify(data)}`);
  // dkg_update_result = await dkg.asset
  //   .update(row.ual, data, {
  //     keywords: keywords,
  //     epochsNum: 2,
  //     maxNumberOfRetries: 30,
  //     frequency: 1,
  //     tokenAmount: ethers.utils.parseEther(process.env.TRAC_PAYMENT),
  //     blockchain: {
  //       name: process.env.DKG_NETWORK,
  //       publicKey: public_key,
  //       privateKey: private_key,
  //     },
  //   })
  //   .then((result) => {
  //     return result;
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });

  if (!dkg_update_result) {
    result = `SAVE REQUEST FAILED: The DKG node encounted an error while interacting with the blockchain. Please try again later.`;
  }

  if (dkg_update_result.operation.errorMessage) {
    console.log(dkg_update_result.operation.errorMessage);
    return {
      result: `SAVE REQUEST FAILED: The DKG node encounted an error while interacting with the knowledge graph. Please try again later.`,
    };
  }

  return {
    result: `SAVE REQUEST SUCCEEDED: Saved account data to the DKG! Look it up at ${process.env.HOSTSITE}/account?ual=${row.ual}`,
  };
};
