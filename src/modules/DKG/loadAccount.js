require("dotenv").config();
const ethers = require("ethers");
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

module.exports = saveAccount = async (chat_id, username,args) => {
    const row = await db
    .prepare("SELECT * FROM player_header WHERE chat_id = ? AND username = ?")
    .get(chat_id, username);

    if (row) {
        return {
        result: `LOAD REQUEST FAILED: Your account is already loaded.`,
        };
    }
    
    public_key = "";
    private_key = "";
    if (!public_key || !private_key) {
    public_key = process.env.DEFAULT_PUBLIC_KEY;
    private_key = process.env.DEFAULT_PRIVATE_KEY;
    }

    console.log(args[0])
    dkg_get_result = await dkg.asset
    .get(args[0], {
      validate: true,
      epochsNum: 2,
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
      //console.log(JSON.stringify(result));
      return result;
    })
    .catch((error) => {
      console.log(error);
    });

  if (!dkg_get_result) {
    return {
      result: `The DKG node encounted a transaction error while interacting with the blockchain. Please try again and make sure your UAL is correct.`,
    };
  }

  if (dkg_get_result.operation.errorMessage) {
    return {
      result: `The DKG node encountered an error while interacting with the knowledge graph. Please try again and make sure your UAL is correct.`,
    };
  }

  account = [];
  inventory = [];
  knowledge = [];
  explores = [];
  treks = [];

  console.log(`ASSERTIONS: ${dkg_get_result.assertion.length}`);

  for (i = 0; i < dkg_get_result.assertion.length; ++i) {
    current_assertion = dkg_get_result.assertion[i];
    if (current_assertion["@type"]) {
      console.log(`CURRENT ASSERTION: ${current_assertion["@type"][0]}`);

      if (current_assertion["@type"][0] == "http://schema.org/Person") {
        console.log(current_assertion);
        account.push(current_assertion["@id"]);
      }
    }
  }

  console.log(`ACCOUNT ID: ${account}`);

  for (x = 0; x < dkg_get_result.assertion.length; ++x) {
    current_assertion = dkg_get_result.assertion[x];

    if (account.includes(current_assertion["@id"], 0)) {
      get_chat_id = current_assertion["http://schema.org/chat_id"][0]["@value"];
      owner = current_assertion["http://schema.org/owner"][0]["@value"];
      username = current_assertion["http://schema.org/name"][0]["@value"];

      for (i = 0; i < current_assertion["http://schema.org/inventory"].length;++i) {
        item_id = current_assertion["http://schema.org/inventory"][i]["@id"];
        inventory.push(item_id);
      }
      console.log(`Inventory Done`);

      for (i = 0;i < current_assertion["http://schema.org/knowledge"].length;++i) {
        knowledge_id = current_assertion["http://schema.org/knowledge"][i]["@id"];
        knowledge.push(knowledge_id);
      }
      console.log(`knowledge Done`);

      if (current_assertion["http://schema.org/explores"]) {
        for (i = 0;i < current_assertion["http://schema.org/explores"].length;++i) {
          explore_id = current_assertion["http://schema.org/explores"][i]["@id"];
          explores.push(explore_id);
        }
        console.log(`equipment Done`);
      }

      if (current_assertion["http://schema.org/treks"]) {
        for (i = 0;i < current_assertion["http://schema.org/treks"].length;++i) {
          trek_id = current_assertion["http://schema.org/treks"][i]["@id"];
          treks.push(trek_id);
        }
        console.log(`treks Done`);
      }
    }
  }

  if(chat_id != get_chat_id || owner != public_key){
    return {
        result: `LOAD REQUEST FAILED: You are not the owner of this account!`,
    };
  }

  console.log(`INVENTORY IDs: ${inventory}`);
  console.log(`KNOWLEDGE IDs: ${knowledge}`);
  console.log(`EXPLORE IDs: ${explore}`);
  console.log(`TREK IDs: ${treks}`);

  item_inventory = [];
  knowledge_list = [];
  explore_list= [];
  trek_list = [];

  for (i = 0; i < dkg_get_result.assertion.length; ++i) {
    current_assertion = dkg_get_result.assertion[i];

    if (inventory.includes(current_assertion["@id"], 0)) {
        if (!current_assertion["http://schema.org/ual"]) {
            item = {
                name: current_assertion["http://schema.org/name"][0]["@value"],
                description: current_assertion["http://schema.org/description"][0]["@value"],
                quantity: current_assertion["http://schema.org/quantity"][0]["@value"],
                knowledge: current_assertion["http://schema.org/knowledge"][0]["@value"],
                boost: current_assertion["http://schema.org/boost"][0]["@value"],
                rarity: current_assertion["http://schema.org/rarity"][0]["@value"],
                effect: current_assertion["http://schema.org/effect"][0]["@value"],
              }; 
        }else{
            console.log(current_assertion["http://schema.org/ual"][0]["@value"]);
            item={
                owner: public_key,
                account: args[0],
                name: current_assertion["http://schema.org/name"][0]["@value"],
                description: current_assertion["http://schema.org/description"][0]["@value"],
                quantity: 1,
                knowledge: current_assertion["http://schema.org/knowledge"][0]["@value"],
                boost: current_assertion["http://schema.org/boost"][0]["@value"],
                rarity: current_assertion["http://schema.org/rarity"][0]["@value"],
                effect: current_assertion["http://schema.org/effect"][0]["@value"],
                ual: current_assertion["http://schema.org/ual"][0]["@value"]
            }
        }

      item_inventory.push(item);
    }

    if (knowledge.includes(current_assertion["@id"], 0)) {
      knowledge_name = current_assertion["http://schema.org/name"][0]["@value"];
      xp = current_assertion["http://schema.org/experience"][0]["@value"];
      lvl = current_assertion["http://schema.org/level"][0]["@value"];
      knowledge = { name: knowledge_name, level: lvl, experience: xp };
      knowledge_list.push(knowledge);
    }

    if (explore_list.includes(current_assertion["@id"], 0)) {
      console.log(current_assertion["@id"]);
    }

    if (trek_list.includes(current_assertion["@id"], 0)) {
      console.log(current_assertion["@id"]);
    }

    // if (owned_ids.includes(current_assertion["@id"], 0)) {
    //   console.log(current_assertion["@id"]);

    //   profile = current_assertion["http://schema.org/profile"][0]["@value"];
    //   owner = current_assertion["http://schema.org/owner"][0]["@value"];
    //   item_name = current_assertion["http://schema.org/name"][0]["@value"];
    //   description =
    //     current_assertion["http://schema.org/description"][0]["@value"];
    //   qty = current_assertion["http://schema.org/quantity"][0]["@value"];
    //   utility = current_assertion["http://schema.org/utility"][0]["@value"];
    //   power = current_assertion["http://schema.org/power"][0]["@value"];
    //   rarity = current_assertion["http://schema.org/rarity"][0]["@value"];
    //   special = current_assertion["http://schema.org/special"][0]["@value"];

    //   owned_item = {
    //     profile: profile,
    //     owner: owner,
    //     name: item_name,
    //     description: description,
    //     quantity: qty,
    //     utility: utility,
    //     power: power,
    //     rarity: rarity,
    //     special: special,
    //   };
    //   console.log(owned_item);
    //   owned_list.push(owned_item);
    // }
  }

  console.log(`ITEM INVENTORY: ${JSON.stringify(item_inventory)}`);
  console.log(`KNOWLEDGE LIST: ${JSON.stringify(knowledge_list)}`);
  console.log(`EXPORE LIST: ${JSON.stringify(explore_list)}`);
  console.log(`TREK LIST: ${JSON.stringify(trek_list)}`);

  await db
    .prepare(
      `REPLACE INTO player_header (chat_id, ual, username, owner, knowledge, inventory, explores, treks)
      VALUES(?,?,?,?,?,?,?,?)`
    )
    .run(
      get_chat_id,
      args[0],
      username,
      public_key,
      JSON.stringify(knowledge_list),
      JSON.stringify(item_inventory),
      JSON.stringify(explore_list),
      JSON.stringify(trek_list)
    );

  return {
    result: `LOAD REQUEST SUCCEEDED: The last state of your DKG asset has been loaded into your account. Find it here: ${process.env.HOSTSITE}/account?ual=${args}`,
  };
};
