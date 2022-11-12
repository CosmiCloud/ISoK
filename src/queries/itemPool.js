require("dotenv").config();
const fs = require("fs");

const db = require("better-sqlite3")(process.env.GAME_DB, {
  verbose: console.log,
});

module.exports = itemPool = async (chat_id,username, command, area) => {
  const queryTypes = require("../util/queryTypes");
  //check if user exists
  row = await db
    .prepare("SELECT * FROM user_header WHERE chat_id = ? AND username = ?")
    .get(chat_id, username);

  if (!row) {
    return {
      result: `No account found. Please run !createaccount to create an account.`,
    };
  }

  if(area == 'jungle' && command == 'explore'){
    pool = [{name: "vine",quantity: 1},{name: "vine",quantity: 1},{name: "tree_fruit",quantity: 1}]

    pool_roll = Math.floor(Math.random() * 2010);

    //prized
    if(pool_roll < 1550 && pool_roll >= 900){
      pool.push({name: "ancient_coin",quantity: 1})
      pool.push({name: "machete",quantity: 1})
    }

    //coveted
    if(pool_roll < 1900 && pool_roll >= 1550){
      pool.push({name: "ancient_coin",quantity: 3})
      pool.push({name: "metal_shard",quantity: 1})
    }

    //fabled
    if(pool_roll < 2000 && pool_roll >= 1900){
      pool.push({name: "ancient_coin",quantity: 5})
      pool.push({name: "magic_rune",quantity: 1})
    }

    //ancient
    if(pool_roll <= 2010 && pool_roll >= 2000){
      pool.push({name: "ancient_coin",quantity: 10})
      pool.push({name: "dragonfly",quantity: 1})
    }
  }

  rarity = `common`
  if(area == 'jungle' && command == 'trek'){
    pool = [{name: "vine",quantity: 1},{name: "vine",quantity: 1},{name: "tree_fruit",quantity: 1}]

    pool_roll = Math.floor(Math.random() * 2010);

    //prized
    rarity = `prized`
    if(pool_roll < 1550 && pool_roll >= 900){
      pool.push({name: "ancient_coin",quantity: 1})
      pool.push({name: "machete",quantity: 1})
    }

    //coveted
    rarity = `coveted`
    if(pool_roll < 1900 && pool_roll >= 1550){
      pool.push({name: "ancient_coin",quantity: 3})
      pool.push({name: "metal_shard",quantity: 1})
    }

    //fabled
    rarity = `fabled`
    if(pool_roll < 2000 && pool_roll >= 1900){
      pool.push({name: "ancient_coin",quantity: 5})
      pool.push({name: "magic_rune",quantity: 1})
    }

    //ancient
    rarity = `ancient`
    if(pool_roll <= 2010 && pool_roll >= 2000){
      pool.push({name: "ancient_coin",quantity: 10})
      pool.push({name: "dragonfly",quantity: 1})
    }
  }

  return {
    result: {pool: pool,rarity: rarity}
  };
};
