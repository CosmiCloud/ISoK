require("dotenv").config();
const fs = require("fs");

const db = require("better-sqlite3")(process.env.GAME_DB, {
  verbose: console.log,
});

module.exports = trek = async (chat_id, username, command, area) => {
  const queryTypes = require("../../util/queryTypes");
  //check if user exists
  row = await db
    .prepare("SELECT * FROM user_header WHERE chat_id = ? AND username = ?")
    .get(chat_id, username);

  if (!row) {
    return {
      result: `No account found. Please run !createaccount to create an account.`,
    };
  }

  for (i = 0;i < row.knowledge.length;++i) {
    knowledge = row.knowledge[i]
    if(knowledge.name == 'navigation'){
      navigation_level = knowledge.level
    }
  }

  if(area == `desert` && navigation_level < 20){
    return {
      result: `Your navigation knowledge must be at least 20 to trek the desert.`,
    };
  }

  if(area == `swamp` && navigation_level < 40){
    return {
      result: `Your navigation knowledge must be at least 40 to trek the swamp.`,
    };
  }

  if(area == `mountains` && navigation_level < 60){
    return {
      result: `Your navigation knowledge must be at least 60 to trek the mountains.`,
    };
  }



  itemPool = await queryTypes.itemPool();
  addItemInventory = await queryTypes.addItemInventory();
  trekEncounter = await queryTypes.trekEncounter();

  trekEncounter = await trekEncounter
        .getData(area, row)
        .then(async ({ result }) => {
          return result;
        })
        .catch((error) => console.log(`Error : ${error}`));

  if(trekEncounter.trek_status == `failure`){
    return {
        result: trekEncounter.story,
      };
  }

  item_pool = await itemPool
        .getData(chat_id,username, command, area)
        .then(async ({ result }) => {
          return result;
        })
        .catch((error) => console.log(`Error : ${error}`));

  console.log(`${command} Pool: ${pool}`);
  
  inventory = row.inventory
  pool = item_pool.pool

  item_roll = await addItemInventory
        .getData(chat_id,username,pool,inventory)
        .then(async ({ result }) => {
          return result;
        })
        .catch((error) => console.log(`Error : ${error}`));

    treks = row.treks 
    data =
    {
        "@context": "https://schema.org",
        "@type": "Event",
        "location": area,
        "eventStatus": trek_status,
        "item_earned": item_roll.name,
        "description": trekEncounter.story
    }
    treks.push(data)

    await db
    .prepare(
      `UPDATE user_header set treks = ? WHERE chat_id = ? AND username = ?`
    )
    .run(JSON.stringify(treks), chat_id, username);

  return {
    result: ` recieved ${item_roll.quantity} ${item_pool.rarity} ${item_roll.name} from a trek! ${trekEncounter.story}`
  };
};
