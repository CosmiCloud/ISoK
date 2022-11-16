require("dotenv").config();
const fs = require("fs");

const db = require("better-sqlite3")(process.env.GAME_DB, {
    verbose: console.log,
});

module.exports = read = async (chat_id, username, knowledge) => {
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


    return {
        result: { pool: pool, rarity: rarity }
    };
};
