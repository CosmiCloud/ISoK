require("dotenv").config();
const fs = require("fs");

const db = require("better-sqlite3")(process.env.GAME_DB, {
  verbose: console.log,
});

module.exports = trek = async (chat_id, username, command, area) => {
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
        .getData(chat_id, username,area, row)
        .then(async ({ result }) => {
          return result;
        })
        .catch((error) => console.log(`Error : ${error}`));

  
  if(trekEncounter.trek_status === `Failed`){
      treks = JSON.parse(row.treks)
      data =
      {
          "@context": "https://schema.org",
          "@type": "Event",
          "location": area,
          "eventStatus": trek_status,
          "item_earned": "Nothing!",
          "Journey": trekEncounter.story
      }
      treks.push(data)

      await db
          .prepare(
              `UPDATE player_header set treks = ? WHERE chat_id = ? AND username = ?`
          )
          .run(JSON.stringify(treks), chat_id, username);

      return {
          result:
          {
              story: trekEncounter.story,
              trek_status: trekEncounter.trek_status
          }
      };
    }

    if (trekEncounter.trek_status === `Completed`) {
        item_pool = await itemPool
            .getData(chat_id, username, command, area)
            .then(async ({ result }) => {
                return result;
            })
            .catch((error) => console.log(`Error : ${error}`));

        inventory = JSON.stringify(trekEncounter.inventory)
        pool = item_pool.pool
        //console.log(`POST TREK INV ${JSON.stringify(inventory)}`)

        item_roll = await addItemInventory
            .getData(chat_id, username, pool, inventory)
            .then(async ({ result }) => {
                return result;
            })
            .catch((error) => console.log(`Error : ${error}`));

        treks = JSON.parse(row.treks)
        data =
        {
            "@context": "https://schema.org",
            "@type": "Event",
            "location": area,
            "eventStatus": trek_status,
            "item_earned": item_roll.name,
            "Journey": trekEncounter.story
        }
        treks.push(data)

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

        await db
            .prepare(
                `UPDATE player_header set treks = ? WHERE chat_id = ? AND username = ?`
            )
            .run(JSON.stringify(treks), chat_id, username);

        return {
            result:
            {
                story: trekEncounter.story,
                quantity: item_roll.quantity,
                rarity: item_pool.rarity,
                item: item_roll.name,
                trek_status: trekEncounter.trek_status,
                color: color
            }
        };
    }
};
