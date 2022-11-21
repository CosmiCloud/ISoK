require("dotenv").config();
const queryTypes = require("./src/util/queryTypes");
const db = require("better-sqlite3")(process.env.GAME_DB, {
  verbose: console.log,
});

const { REST, Routes, Client, GatewayIntentBits, Partials, EmbedBuilder } = require("discord.js");
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
    await message.channel.send(`${message.author}, Attempting to create your account... I will DM you the transaction to sign if everything goes well.`);
    
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
      if (args.length != 1) {
      return message.channel.send(
        `You didn't provide 1 item name, ${message.author}!`
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
    await message.channel.send(`${message.author}, Attempting to save your account... I will DM you the transaction to sign if everything goes well.`);

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
      if (args.length != 1) {
      return message.channel.send(
        `You didn't provide 1 area to explore, ${message.author}!`
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

      exampleEmbed = new EmbedBuilder()
          .setColor(`0x${result.color}`)
          .setTitle(`Exploration Completed!`)
          .setDescription(`${message.author} discovered ${result.quantity} ${result.item} from a ${result.rarity} exploration in the ${area}!`)
          //.setImage('https://i.imgur.com/AfFp7pu.png');

    //await message.channel.send(`${message.author} ${result}`);
    await message.channel.send({ embeds: [exampleEmbed] });
  }else if(command === `explore` && permission === `blocked`){
    await message.channel.send(
      `${message.author}, You can only ${command} once a minute.`
    );
  }

  if (command === `trek` && permission === `allow`) {
      if (args.length != 1) {
      return message.channel.send(
        `You didn't provide 1 area to trek, ${message.author}!`
      );
    }

    trek = await queryTypes.trek();
    area = args
    result = await trek
      .getData(chat_id, username, command,area)
      .then(async ({ result }) => {
        return result;
      })
      .catch((error) => console.log(`Error : ${error}`));

      if (result.trek_status === 'Failed') {
          exampleEmbed = new EmbedBuilder()
              .setColor(`0xe01b46`)
              .setTitle('Trek Failed!')
              .setDescription('You failed to complete your trek due to knowledge or item requirements')
              .addFields(
                  { name: 'Journey', value: `${trekEncounter.story}` }
              );
      }

      if (result.trek_status === 'Completed') {
          exampleEmbed = new EmbedBuilder()
              .setColor(`0x${result.color}`)
              .setTitle('Trek Completed!')
              .setDescription(`${message.author} At last you discover ${result.quantity} ${result.rarity} ${result.item} from a trek!`)
              .addFields(
                  { name: 'Journey', value: `${trekEncounter.story}` }
              );
      }

      await message.channel.send({ embeds: [exampleEmbed] });
  }else if(command === `trek` && permission === `blocked`){
    await message.channel.send(
      `${message.author}, You can only ${command} once a minute.`
    );
    }

    if (command === `read` && permission === `allow`) {
        if (args.length != 2) {
            return message.channel.send(
                `You didn't provide 1 book and 1 knowledge focus to read, ${message.author}!`
            );
        }

        read = await queryTypes.read();
        book_type = args[0]
        knowledge = args[1]

        result = await read
            .getData(chat_id, username, book_type, knowledge)
            .then(async ({ result }) => {
                return result;
            })
            .catch((error) => console.log(`Error : ${error}`));

        if (result.knowledge) {
            exampleEmbed = new EmbedBuilder()
                .setColor(`0x17e34d`)
                .setTitle('Knowledge Gained!')
                .setDescription(`${message.author} read a ${result.book} for ${result.book_xp} xp in ${result.knowledge}!`)
                .addFields(
                    { name: `${result.knowledge} knowledge level:`, value: `${result.level}` }
                );
        } else {
            return message.channel.send(
                `${result.message}, ${message.author}!`
            );
        }

        await message.channel.send({ embeds: [exampleEmbed] });
    }

  message.delete();
});

client.login(process.env.BOT_TOKEN);
