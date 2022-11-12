require("dotenv").config();
const fs = require("fs");
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

module.exports = mintItem = async (chat_id, username, args) => {
  const row = await db
    .prepare("SELECT * FROM user_header WHERE chat_id = ? AND username = ?")
    .get(chat_id, username);

  if (!row) {
    return {
      result: `ITEM MINTING FAILED: There is no UAL associated with your Discord profile. Please run !createprofile to create a profile.`,
    };
  }

  item_data = fs.readFileSync(`${__dirname}/context/item.json`, "utf8");
  account_data = fs.readFileSync(`${__dirname}/context/account.json`, "utf8");
  item_data = JSON.parse(item_data);
  account_data = JSON.parse(account_data);
  keywords = [];
  keywords.push("in_search_of_knowledge")
  keywords.push(row.ual)
  keywords.push(args)
  

  public_key = "";
  private_key = "";
  if (!public_key || !private_key) {
    public_key = process.env.DEFAULT_PUBLIC_KEY;
    private_key = process.env.DEFAULT_PRIVATE_KEY;
  }

  inventory = JSON.parse(row.inventory);

  item_found ="no"
  for (i = 0; i < inventory.length; ++i) {
    item = inventory[i];
    if (item.name == args) {
      item_found ="yes"
    }
  }

  if(item_found == "no"){
    return {
      result: `ITEM MINTING FAILED: You are not holding this item in your inventory.`,
    };
  }

  for (i = 0; i < inventory.length; ++i) {
    item = inventory[i];
    quantity = item.quantity

    if (item.name == args) {
      console.log(`MINTING: ${item.name}`)
      index = i

      item_data["owner"] = public_key;
      item_data["account"] = row.ual;
      item_data["name"] = item.name;
      item_data["description"] = item.description;
      item_data["knowledge"] = item.knowledge;
      item_data["boost"] = item.boost;
      item_data["rarity"] = item.rarity;
      item_data["effect"] = item.effect;
      item_data["quantity"] = 1;

      console.log(`CREATING ITEM: ` + JSON.stringify(item_data));
      item_asset = await dkg.asset
        .create(item_data, {
          visibility: "public",
          keywords: keywords,
          holdingTimeInYears: 1,
          tokenAmount: 1,
          blockchain: {
            name: "otp",
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

        i = inventory.length +1
    }
  }

  if (!item_asset) {
    return {
      result: `ITEM MINTING FAILED: The DKG node encounted a transaction error while interacting with the blockchain. Please try again.`,
    };
  }

  if (item_asset.operation.errorMessage) {
    console.log(item_asset.operation.errorMessage);
    return {
      result: `ITEM MINTING FAILED: The DKG node encountered an error while interacting with the knowledge graph. Please try again.`,
    };
  }
  
  console.log(`Created Item UAL: ${item_asset.UAL}!`);

  if (quantity - 1 == 0) {
    inventory.splice([index],1)
  }else{
    inventory[index]["quantity"] = quantity - 1;
  }

  item_data["ual"] = item_asset.UAL
  console.log(`THIS IS YOUR ITEM: ${item_data}`)
  inventory.push(item_data)


  console.log(`INVENTORY AFTER ITEM EXTRACT: ${JSON.stringify(inventory)}`)

  account_data["account"]["chat_id"] = chat_id;
  account_data["account"]["name"] = username;
  account_data["account"]["owner"] = public_key;
  account_data["account"]["knowledge"] = JSON.parse(row.knowledge);
  account_data["account"]["inventory"] = inventory;
  account_data["account"]["explores"] = JSON.parse(row.explores);
  account_data["account"]["treks"] = JSON.parse(row.treks);

  console.log(`Updating UAL: ${row.ual}`);
  console.log(`Saving Data: ${JSON.stringify(account_data)}`);
  dkg_update_result = await dkg.asset
    .update(row.ual, account_data, {
      visibility: "public",
      keywords: keywords,
      holdingTimeInYears: 1,
      tokenAmount: 1,
      blockchain: {
        name: "otp",
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

  await db
    .prepare(
      `UPDATE user_header SET inventory = ? WHERE chat_id = ? AND username = ?`
    )
    .run(
      JSON.stringify(inventory),
      chat_id,
      username
    );
  
  return {
    result: `ITEM MINTING SUCCEEDED: Your item has been created, you can view your item asset here: ${process.env.HOSTSITE}/account?ual=${row.ual}&item_ual=${item_asset.UAL}`,
  };
};
