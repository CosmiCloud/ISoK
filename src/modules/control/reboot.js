require("dotenv").config();
const fs = require("fs");

const util = require("util");
const exec = util.promisify(require("child_process").exec);

module.exports = reboot = async (chat_id, user_name) => {
  console.log(chat_id);
  console.log(user_name);
  if (chat_id != process.env.ADMIN_ID && user_name != process.env.ADMIN_NAME) {
    return {
      result: `Only the chosen one can do this.`,
    };
  }

  reboot = "systemctl restart otnode";
  await exec(reboot);

  return {
    result: `Rebooted the DKG host node.`,
  };
};
