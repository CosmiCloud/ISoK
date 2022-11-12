require("dotenv").config();
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("/Users/tybra/ISOK/db/isok.db");
const command_list = [
  //alphabetical
  "createaccount",
  "mintitem",
  "load",
  "reboot",
  "save",
  "explore",

];

async function build_db() {
  try {
    await db.exec(
      "CREATE TABLE IF NOT EXISTS user_header (chat_id VARCHAR PRIMARY KEY NOT NULL, ual VARCHAR, username VARCHAR, owner VARCHAR, knowledge VARCHAR, inventory VARCHAR, explores VARCHAR, treks VARCHAR)"
    );
    await db.exec(
      "CREATE TABLE IF NOT EXISTS command_history (command VARCHAR PRIMARY KEY NOT NULL, date_last_used DATE)"
    );
    await db.exec(
      "CREATE TABLE IF NOT EXISTS item_header (name VARCHAR PRIMARY KEY NOT NULL, description VARCHAR, knowledge VARCHAR, rarity VARCHAR, boost INT, effect VARCHAR)"
    );
    
    await db.exec(`INSERT INTO item_header VALUES ("ancient_coin", "Seems like this is the local currency.", "purchase", "common", 1, "none")`);
    await db.exec(`INSERT INTO item_header VALUES ("vine", "I could use this as a rope.", "cross-gap", "common", 1, "none")`);
    await db.exec(`INSERT INTO item_header VALUES ("kindling", "I can use this to make a fire.", "lightsource", "common", 1, "none")`);
    await db.exec(`INSERT INTO item_header VALUES ("tree_fruit", "Its not much, but a least its food.", "food", "common", 1, "none")`);
    await db.exec(`INSERT INTO item_header VALUES ("machete", "This should be in everyones survival kit.", "survival", "prized", 1, "none")`);
    
    await db.exec(`INSERT INTO item_header VALUES ("tattered_book_of_knowledge", "A beaten and worn book that containes ancient wisdom.", "knowledge", "rare", 1, "none")`);
    await db.exec(`INSERT INTO item_header VALUES ("dragonfly", "A dragonfly companion to combat bug swarms.", "companion", "common", 1, "pest_prevention")`);
    

    for (var i = 0; i < command_list.length; i++) {
      command = command_list[i];
      await db.exec(`INSERT INTO command_history VALUES ("${command}", "1")`);
    }

    await db.close();
  } catch (e) {
    console.log(e);
    console.log("Database - BLAHRG");
  }
}
build_db();
