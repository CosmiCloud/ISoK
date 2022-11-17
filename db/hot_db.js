require("dotenv").config();
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("/Users/branhamt/source/repos/ISoK/db/isok.db");

async function build_db() {
  try {
    
    await db.exec(`INSERT INTO command_history VALUES ("read", "1")`);

    await db.close();
  } catch (e) {
    console.log(e);
    console.log("Database - BLAHRG");
  }
}
build_db();
