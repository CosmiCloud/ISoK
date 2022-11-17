const db = require("better-sqlite3")(process.env.GAME_DB, {
  verbose: console.log,
});

module.exports = spamCheck = async (command) => {
  if (command) {
    //check for spam
    const spam_result = await db
      .prepare("SELECT date_last_used FROM command_history WHERE command = ?")
      .get(command);

    expireDate = new Date(spam_result.date_last_used);
    currentDate = new Date();

    timeDif = Math.abs(currentDate - expireDate);
    expireDate = Math.abs(expireDate);
    //default 1 min
    cooldown = 1 * 1 * 1000;

    if (command == "createaccount") {
      cooldown = Number(process.env.CREATE_ACCOUNT_COOLDOWN) * 60 * 1000;
    }

    if (command == "load") {
      cooldown = Number(process.env.LOAD_COOLDOWN) * 60 * 1000;
    }

    if (command == "save") {
      cooldown = Number(process.env.SAVE_COOLDOWN) * 60 * 1000;
    }

    if (command == "mintitem") {
      cooldown = Number(process.env.MINTING_COOLDOWN) * 60 * 1000;
    }

    if (command == "explore") {
      cooldown = Number(process.env.EXPLORE_COOLDOWN) * 60 * 1000;
    }

    if (command == "trek") {
      cooldown = Number(process.env.TREK_COOLDOWN) * 60 * 1000;
    }
    if (command == "read") {
      cooldown = Number(process.env.READ_COOLDOWN) * 60 * 1000;
    }

    if (timeDif > cooldown) {
      permission = `allow`;
      console.log(`Command: ${command} is allowed`);

      //insert a new time stamp
      time_stamp = new Date();
      time_stamp = Math.abs(time_stamp);
      await db
        .prepare("REPLACE INTO command_history VALUES (?,?)")
        .run(command, time_stamp);
    } else {
      permission = `block`;
      remaining = cooldown - timeDif;
      console.log(
        `Command: ${command} was blocked. Time remaining: ${remaining} milliseconds.`
      );
    }
  } else {
    permission = `allow`;
  }

  return {
    permission: permission,
  };
};
