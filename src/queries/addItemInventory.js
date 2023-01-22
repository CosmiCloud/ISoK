const fs = require('fs-extra')
const db = require('better-sqlite3')(process.env.GAME_DB, {
  verbose: console.log
})

module.exports = addItemInventory = async (
  chat_id,
  username,
  pool,
  inventory
) => {
  function getRandomInt (max) {
    return Math.floor(Math.random() * max)
  }

  roll = getRandomInt(pool.length)
  item = pool[roll]
  console.log(`Item roll: ${JSON.stringify(item)}`)

  inventory = JSON.parse(inventory)
  if (inventory.filter(e => e.name === item.name).length > 0) {
    for (i = 0; i < inventory.length; ++i) {
      inv_item = inventory[i]
      if (inv_item.name == item.name && !inv_item.account) {
        inventory[i]['quantity'] =
          Number(inventory[i]['quantity']) + item.quantity
      }
    }
  } else {
    const row = await db
      .prepare('SELECT * FROM item_header WHERE name = ?')
      .get(item.name)

    added_item = {
      account: '',
      owner: '',
      name: row.name,
      description: row.description,
      quantity: item.quantity,
      knowledge: row.knowledge,
      boost: row.boost,
      rarity: row.rarity,
      effect: row.effect
    }
    inventory.push(added_item)
  }

  console.log(`POST ITEM ADD INV ${JSON.stringify(inventory)}`)
  await db
    .prepare(
      `UPDATE player_header set inventory = ? WHERE chat_id = ? AND username = ?`
    )
    .run(JSON.stringify(inventory), chat_id, username)

  return {
    result: {
      name: item.name,
      quantity: item.quantity,
      description: item.description
    }
  }
}
