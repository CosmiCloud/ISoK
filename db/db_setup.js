require("dotenv").config();
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("C:/Users/Tyler/ISoK/db/isok.db");
const command_list = [
  //alphabetical
  "createaccount",
  "mintitem",
  "load",
  "reboot",
  "save",
  "explore",
  "trek",
  "read"

];

async function build_db() {
  try {
    await db.exec(
      "CREATE TABLE IF NOT EXISTS player_header (owner_address VARCHAR PRIMARY KEY NOT NULL, ual VARCHAR, username VARCHAR, chat_id VARCHAR, knowledge VARCHAR, inventory VARCHAR, explores VARCHAR, treks VARCHAR)"
    );
    await db.exec(
      "CREATE TABLE IF NOT EXISTS command_history (command VARCHAR PRIMARY KEY NOT NULL, date_last_used DATE)"
    );
    await db.exec(
      "CREATE TABLE IF NOT EXISTS item_header (name VARCHAR PRIMARY KEY NOT NULL, description VARCHAR, knowledge VARCHAR, rarity VARCHAR, boost INT, effect VARCHAR)"
    );
    
    //jungle area
    await db.exec(`INSERT INTO item_header VALUES ("ancient_coin", "Seems like this is the local currency.", "currency", "common", 0, "none")`);
    await db.exec(`INSERT INTO item_header VALUES ("vine", "I could use this as a rope.", "cross-gap", "common", 0, "none")`);
    await db.exec(`INSERT INTO item_header VALUES ("kindling", "I can use this to make a fire.", "lightsource", "common", 0, "none")`);
    await db.exec(`INSERT INTO item_header VALUES ("tree_fruit", "Its not much, but a least its food.", "food", "common", 0, "none")`);

    await db.exec(`INSERT INTO item_header VALUES ("machete", "This should be in everyones survival kit.", "survival", "prized", 5, "none")`);
    await db.exec(`INSERT INTO item_header VALUES ("metal_shard", "A rare stone condusive to the elements.", "elements", "coveted", 5, "none")`);
    await db.exec(`INSERT INTO item_header VALUES ("magic_rune", "An oddly shaped stone with magical properties.", "magic", "fabled", 5, "none")`);
    await db.exec(`INSERT INTO item_header VALUES ("dragonfly", "A dragonfly companion to combat bug swarms.", "taming", "ancient", 5, "pest_prevention")`);

    await db.exec(`INSERT INTO item_header VALUES ("dynomite", "A stick of dynomite.", "industry", "prized", 10, "none")`);
    await db.exec(`INSERT INTO item_header VALUES ("old_compass", "Hopefully I can find my way with this.", "navigation", "coveted", 10, "none")`);
    await db.exec(`INSERT INTO item_header VALUES ("pestle_and_mortar", "A must have for making medicines on the go.", "botany", "fabled", 10, "none")`);
    await db.exec(`INSERT INTO item_header VALUES ("jaguar", "A jaguar companion to protect me against animal attacks.", "taming", "ancient", 10, "animal_attack")`);

    await db.exec(`INSERT INTO item_header VALUES ("tattered_book_of_knowledge", "A beaten and worn book that contains ancient wisdom.", "knowledge", "common", 0, "none")`);
    await db.exec(`INSERT INTO item_header VALUES ("book_of_knowledge", "A book in fair condition that contains ancient wisdom.", "knowledge", "prized", 0, "none")`);
    

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
