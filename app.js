require('dotenv').config()
const queryTypes = require('./src/util/queryTypes')
const web_db = require('better-sqlite3')(process.env.WEB_DB, {
  verbose: console.log
})
const { ethers } = require('ethers')

const {
  REST,
  Routes,
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder
} = require('discord.js')
const { result } = require('underscore')
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN)

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('messageCreate', async message => {
  prefix = '!'
  if (!message.content.startsWith(prefix) || message.author.bot) return

  args = message.content.slice(prefix.length).trim().split(' ')
  command = args.shift().toLowerCase()

  chat_id = message.author.id
  username = message.author.username
  spamCheck = await queryTypes.spamCheck()
  permission = await spamCheck
    .getData(command)
    .then(async ({ permission }) => {
      return permission
    })
    .catch(error => console.log(`Error : ${error}`))

  if (command === `reboot` && permission === `allow`) {
    reboot = await queryTypes.reboot()

    reboot = await reboot
      .getData(chat_id, username)
      .then(async ({ result }) => {
        return result
      })
      .catch(error => console.log(`Error : ${error}`))

    await message.author.send(reboot)
  }

  if (command === `createaccount` && permission === `allow`) {
    if (args.length != 1 || ethers.utils.isAddress(args[0]) == false) {
      message.delete()
      return message.author.send(
        `You didn't provide a valid public key needed to create your account, ${message.author}!`
      )
    }

    existing_acc = await web_db
      .prepare(
        'SELECT * FROM txn_header WHERE owner_address = ? COLLATE NOCASE AND action = ? AND status = ?'
      )
      .get(args[0], 'account creation', 'Pending')

    if (existing_acc) {
      message.delete()
      return message.author.send(
        `ACCOUNT CREATION QUEUED: Account creation has been queued, please sign the transaction found here to take ownership: ${process.env.HOSTSITE}/isok/isokTransactions?owner_address=${args[0]}`
      )
    }

    public_key = args
    createAccount = await queryTypes.createAccount()
    account = await createAccount
      .getData(chat_id, username, args)
      .then(async ({ result }) => {
        return result
      })
      .catch(error => console.log(`Error : ${error}`))

    await message.author.send(account)
  }

  // if (command === `mintitem` && permission === `allow`) {
  //   if (args.length != 1) {
  //     return message.author.send(
  //       `You didn't provide 1 item name, ${message.author}!`
  //     )
  //   }

  //   await message.author.send(
  //     `${message.author}, Attempting to mint 1 ${args}... I will DM you the transaction to sign if everything goes well.`
  //   )
  //   mintItem = await queryTypes.mintItem()

  //   item = await mintItem
  //     .getData(chat_id, username, args)
  //     .then(async ({ result }) => {
  //       return result
  //     })
  //     .catch(error => console.log(`Error : ${error}`))

  //   await message.author.send(item)
  // } else if (command === `mintitem` && permission === `blocked`) {
  //   await message.author.send(
  //     `${message.author}, You can only mint 1 item every 5 minutes.`
  //   )
  // }

  // if (command === `save` && permission === `allow`) {
  //   await message.author.send(
  //     `${message.author}, Attempting to save your account... I will DM you the transaction to sign if everything goes well.`
  //   )

  //   saveAccount = await queryTypes.saveAccount()

  //   account = await saveAccount
  //     .getData(chat_id, username)
  //     .then(async ({ result }) => {
  //       return result
  //     })
  //     .catch(error => console.log(`Error : ${error}`))

  //   await message.author.send(account)
  // } else if (command === `save` && permission === `blocked`) {
  //   await message.author.send(
  //     `${message.author}, You can only save your profile once after 10 minutes.`
  //   )
  // }

  // if (command === `load` && permission === `allow`) {
  //   if (!args.length) {
  //     return message.author.send(
  //       `You didn't provide a UAL to load, ${message.author}!`
  //     )
  //   }

  //   await message.author.send(
  //     `${message.author}, Attempting to load your account... I will DM you the transaction to sign if everything goes well.`
  //   )

  //   loadAccount = await queryTypes.loadAccount()
  //   account = await loadAccount
  //     .getData(chat_id, username, args)
  //     .then(async ({ result }) => {
  //       return result
  //     })
  //     .catch(error => console.log(`Error : ${error}`))

  //   await message.author.send(account)
  // } else if (command === `load` && permission === `blocked`) {
  //   await message.author.send(
  //     `${message.author}, You can only load a profile every 30 minutes.`
  //   )
  // }

  if (command === `explore` && permission === `allow`) {
    if (args.length != 1) {
      return message.author.send(
        `You didn't provide 1 area to explore, ${message.author}!`
      )
    }

    explore = await queryTypes.explore()
    area = args
    explore_result = await explore
      .getData(chat_id, username, command, area)
      .then(async ({ result }) => {
        return result
      })
      .catch(error => console.log(`Error : ${error}`))

    if (explore_result.rarity) {
      exampleEmbed = new EmbedBuilder()
        .setColor(`0x${explore_result.color}`)
        .setTitle(`Exploration Completed!`)
        .setDescription(
          `${message.author} discovered ${explore_result.quantity} ${explore_result.item} from a ${explore_result.rarity} exploration in the ${area}!`
        )
      //.setImage('https://i.imgur.com/AfFp7pu.png');

      await message.channel.send({ embeds: [exampleEmbed] })
    } else {
      await message.channel.send(explore_result)
    }
  } else if (command === `explore` && permission === `blocked`) {
    await message.author.send(
      `${message.author}, You can only ${command} once a minute.`
    )
  }

  if (command === `trek` && permission === `allow`) {
    if (args.length != 1) {
      return message.author.send(
        `You didn't provide 1 area to trek, ${message.author}!`
      )
    }

    trek = await queryTypes.trek()
    area = args
    trek_result = await trek
      .getData(chat_id, username, command, area)
      .then(async ({ result }) => {
        return result
      })
      .catch(error => console.log(`Error : ${error}`))

    if (trek_result.trek_status === 'Failed') {
      exampleEmbed = new EmbedBuilder()
        .setColor(`0xe01b46`)
        .setTitle('Trek Failed!')
        .setDescription(
          'You failed to complete your trek due to knowledge or item requirements'
        )
        .addFields({ name: 'Journey', value: `${trekEncounter.story}` })
    }

    if (trek_result.trek_status === 'Completed') {
      exampleEmbed = new EmbedBuilder()
        .setColor(`0x${trek_result.color}`)
        .setTitle('Trek Completed!')
        .setDescription(
          `${message.author} At last you discover ${trek_result.quantity} ${trek_result.rarity} ${trek_result.item} from a trek!`
        )
        .addFields({ name: 'Journey', value: `${trekEncounter.story}` })
    }

    await message.channel.send({ embeds: [exampleEmbed] })
  } else if (command === `trek` && permission === `blocked`) {
    await message.author.send(
      `${message.author}, You can only ${command} once a minute.`
    )
  }

  if (command === `read` && permission === `allow`) {
    if (args.length != 2) {
      return message.author.send(
        `You didn't provide 1 book and 1 knowledge focus to read, ${message.author}!`
      )
    }

    read = await queryTypes.read()
    book_type = args[0]
    knowledge = args[1]

    read_result = await read
      .getData(chat_id, username, book_type, knowledge)
      .then(async ({ result }) => {
        return result
      })
      .catch(error => console.log(`Error : ${error}`))

    if (read_result.knowledge) {
      exampleEmbed = new EmbedBuilder()
        .setColor(`0x17e34d`)
        .setTitle('Knowledge Gained!')
        .setDescription(
          `${message.author} read a ${read_result.book} for ${read_result.book_xp} xp in ${read_result.knowledge}!`
        )
        .addFields({
          name: `${read_result.knowledge} knowledge level:`,
          value: `${read_result.level}`
        })
    } else {
      return message.channel.send(`${read_result.message}, ${message.author}!`)
    }

    await message.channel.send({ embeds: [exampleEmbed] })
  }

  await message.delete()
})

client.login(process.env.BOT_TOKEN)
