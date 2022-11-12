require("dotenv").config();
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("/Users/Tyler/Keyscape/db/keyscape.db");

async function build_db() {
  try {
    
    await db.exec(
        "CREATE TABLE IF NOT EXISTS item_header (name VARCHAR PRIMARY KEY NOT NULL, description VARCHAR, utility VARCHAR, rarity VARCHAR, power INT, special VARCHAR, experience INT)"
      );
      await db.exec(`INSERT INTO item_header VALUES ("bronze_pickaxe", "A pickaxe made of bronze.", "mining", "common", 1, "none",null)`);
      await db.exec(`INSERT INTO item_header VALUES ("bronze_axe", "An axe made of bronze.", "woodcutting", "common", 1, "none",null)`);
      await db.exec(`INSERT INTO item_header VALUES ("tinderbox", "I can light a fire with this.", "firemaking", "common", 1, "none",null)`);
      await db.exec(`INSERT INTO item_header VALUES ("small_net", "A small fishing net.", "fishing", "common", 1, "none",null)`);
      await db.exec(`INSERT INTO item_header VALUES ("tin_ore", "I can smelt a bronze bar with this if I have copper.", "smithing", "common", 1, "none", 100)`);
      await db.exec(`INSERT INTO item_header VALUES ("copper_ore", "I can smelt a bronze bar with this if I have tin.", "smithing", "common", 1, "none", 100)`);
      await db.exec(`INSERT INTO item_header VALUES ("iron_ore", "I can smelt this to create a iron bar.", "smithing", "common", 1, "none", 300)`);
      await db.exec(`INSERT INTO item_header VALUES ("mithril_ore", "I can smelt this to create a mithril bar.", "smithing", "rare", 2, "none", 400)`);
      await db.exec(`INSERT INTO item_header VALUES ("rune_essence", "I can use this to craft runes.", "runecrafting", "common", 1, "none", 200)`);
    await db.exec(`INSERT INTO item_header VALUES ("shrimp", "I can cook this to eat it.", "cooking", "common", 1, "none", 100)`);
    await db.exec(`INSERT INTO item_header VALUES ("anchovies", "I can cook this to eat it.", "cooking", "common", 1, "none", 150)`);
    await db.exec(`INSERT INTO item_header VALUES ("seaweed", "Yuck! Seaweed.", "crafting", "common", 1, "none", 50)`);
    await db.exec(`INSERT INTO item_header VALUES ("salmon", "Salmon is tasty!", "cooking", "common", 1, "none", 250)`);
    await db.exec(`INSERT INTO item_header VALUES ("gold_casket", "My lucky day!", "crafting", "common", 1, "none", 50)`);
    await db.exec(`INSERT INTO item_header VALUES ("logs", "These are just logs.", "firemaking, fletching", "common", 1, "none", 100)`);
    await db.exec(`INSERT INTO item_header VALUES ("oak_logs", "Oh look, oak logs.", "firemaking, fletching", "common", 1, "none", 200)`);
    await db.exec(`INSERT INTO item_header VALUES ("willow_logs", "Wow, nice willow log, bro.", "firemaking, fletching", "common", 1, "none", 300)`);
    await db.exec(`INSERT INTO item_header VALUES ("vines", "I can use this as a rope!", "crafting", "common", 1, "none", 50)`);
    await db.exec(`INSERT INTO item_header VALUES ("birds_nest", "I wonder if anything is in it.", "crafting", "common", 1, "none", 400)`);

    await db.exec(`INSERT INTO command_history VALUES ("woodcutting", "1")`);
    await db.exec(`INSERT INTO command_history VALUES ("fishing", "1")`);



    await db.close();
  } catch (e) {
    console.log(e);
    console.log("Database - BLAHRG");
  }
}
build_db();
