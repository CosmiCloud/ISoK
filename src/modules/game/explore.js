require("dotenv").config();
const fs = require("fs");

const db = require("better-sqlite3")(process.env.GAME_DB, {
  verbose: console.log,
});

module.exports = explore = async (chat_id, username, command, area) => {
  const queryTypes = require("../../util/queryTypes");
  //check if user exists
  row = await db
    .prepare("SELECT * FROM player_header WHERE chat_id = ? AND username = ?")
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
      result: `Your navigation knowledge must be at least 20 to explore the desert.`,
    };
  }

  if(area == `swamp` && navigation_level < 40){
    return {
      result: `Your navigation knowledge must be at least 40 to explore the swamp.`,
    };
  }

  if(area == `mountains` && navigation_level < 60){
    return {
      result: `Your navigation knowledge must be at least 60 to explore the mountains.`,
    };
  }

  itemPool = await queryTypes.itemPool();
  addItemInventory = await queryTypes.addItemInventory();

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

    if (item_pool.rarity == `common`) {
        color = `aba7a8`
    }

    if (item_pool.rarity == `prized`) {
        color = `3d90f5`
    }

    if (item_pool.rarity == `coveted`) {
        color = `21cf35`
    }

    if (item_pool.rarity == `fabled`) {
        color = `d90fc1`
    }

    if (item_pool.rarity == `ancient`) {
        color = `f2fa0f`
    }

  return {
      result:
          {
              quantity: item_roll.quantity,
              item: item_roll.name,
              rarity: item_pool.rarity,
              color: color,
              description: item_roll.description
          }
  };
};
