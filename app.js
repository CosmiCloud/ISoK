require("dotenv").config();
const queryTypes = require("./src/util/queryTypes");
const db = require("better-sqlite3")(process.env.GAME_DB, {
  verbose: console.log,
});

const { REST, Routes, Client, GatewayIntentBits, Partials } = require("discord.js");
const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  prefix = "!";
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  args = message.content.slice(prefix.length).trim().split(" ");
  command = args.shift().toLowerCase();

  chat_id = message.author.id;
  username = message.author.username;
  spamCheck = await queryTypes.spamCheck();
  permission = await spamCheck
      .getData(command)
      .then(async ({ permission }) => {
        return permission;
      })
      .catch((error) => console.log(`Error : ${error}`));

  if (command === `reboot` && permission === `allow`) {
    reboot = await queryTypes.reboot();

    reboot = await reboot
      .getData(chat_id, username)
      .then(async ({ result }) => {
        return result;
      })
      .catch((error) => console.log(`Error : ${error}`));

    await message.channel.send(reboot);
  }

  if (command === `createaccount` && permission === `allow`) {
    createAccount = await queryTypes.createAccount();
    account = await createAccount
        .getData(chat_id, username)
        .then(async ({ result }) => {
          return result;
        })
        .catch((error) => console.log(`Error : ${error}`));

      await message.author.send(account);
  }

  if (command === `mintitem` && permission === `allow`) {
    if (!args.length) {
      return message.channel.send(
        `You didn't provide an item name, ${message.author}!`
      );
    }

    await message.channel.send(`${message.author}, Attempting to mint 1 ${args}... I will DM you the transaction to sign if everything goes well.`);
    mintItem = await queryTypes.mintItem();

    item = await mintItem
      .getData(chat_id, username, args)
      .then(async ({ result }) => {
        return result;
      })
      .catch((error) => console.log(`Error : ${error}`));

    await message.author.send(item);
  }else if(command === `mintitem` && permission === `blocked`){
    await message.channel.send(
      `${message.author}, You can only mint 1 item every 5 minutes.`
    );
  }

  if (command === `save` && permission === `allow`) {
    saveAccount = await queryTypes.saveAccount();

    account = await saveAccount
      .getData(chat_id, username)
      .then(async ({ result }) => {
        return result;
      })
      .catch((error) => console.log(`Error : ${error}`));

    await message.author.send(account); 
  }else if(command === `save` && permission === `blocked`){
    await message.channel.send(
      `${message.author}, You can only save your profile once after 10 minutes.`
    );
  }

  if (command === `load` && permission === `allow`) {
    if (!args.length) {
      return message.channel.send(
        `You didn't provide a UAL to load, ${message.author}!`
      );
    }

    await message.channel.send(`${message.author}, Attempting to load your account... I will DM you the transaction to sign if everything goes well.`);

    loadAccount = await queryTypes.loadAccount();
    account = await loadAccount
      .getData(chat_id, username,args)
      .then(async ({ result }) => {
        return result;
      })
      .catch((error) => console.log(`Error : ${error}`));

    await message.author.send(account);
  }else if(command === `load` && permission === `blocked`){
    await message.channel.send(
      `${message.author}, You can only load a profile every 30 minutes.`
    );
  }

  if (command === `explore` && permission === `allow`) {
    if (!args.length) {
      return message.channel.send(
        `You didn't provide an area to explore, ${message.author}!`
      );
    }

    explore = await queryTypes.explore();
    area = args
    result = await explore
      .getData(chat_id, username, command,area)
      .then(async ({ result }) => {
        return result;
      })
      .catch((error) => console.log(`Error : ${error}`));

    await message.channel.send(`${message.author} ${result}`);
  }else if(command === `explore` && permission === `blocked`){
    await message.channel.send(
      `${message.author}, You can only ${command} once a minute.`
    );
  }

  message.delete();
});

client.login(process.env.BOT_TOKEN);
