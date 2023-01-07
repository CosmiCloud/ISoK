require("dotenv").config();
const fs = require("fs");

const db = require("better-sqlite3")(process.env.GAME_DB, {
  verbose: console.log,
});

module.exports = trekEncounter = async (chat_id, username,area, row) => {

  knowledge =  JSON.parse(row.knowledge)
  for (i = 0; i < knowledge.length; ++i) {
    knowledge = knowledge[i]

    if(knowledge.name == 'total'){
        total_lv = knowledge.level
    }
  }
 
  //SETUP FOR JUNGLE EVENTS
  if(area == 'jungle'){

    jungle_encounters = [
        {   
            "rarity": "default",
            "name": "Swing the gap",
            "type": "item_check",
            "item_required": {
                "name": "vine"
            },
            "failed_description": "You come across a large fissure. If only you had some sort of rope to cross...",
            "success_description": "You come across a large fissure. You fashion a rope from 1 vine and swing across.",
        },
        {   
            "rarity": "default",
            "name": "Light the way",
            "type": "item_check",
            "item_required": {
                "name": "kindling"
            },
            "failed_description": "It got dark and you had no way to light a fire!",
            "success_description": "As night sets in, you use 1 kindling to light a fire.",
        },
        {   
            "rarity": "default",
            "name": "Hunger",
            "type": "item_check",
            "item_required": {
                "name": "tree_fruit"
            },
            "failed_description": "You get hungry on your trek but you have no food. Maybe you should prepare a bit more.",
            "success_description": "Your stomach growls from hunger and you eat 1 tree fruit.",
        },
        {   
            "rarity": "common",
            "name": "Pay up!",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "botany",
                "level": 3
            },
            "item_boosts": [
                "pestle_and_mortar",
            ],
            "failed_description": "You come across a radical looking mushroom but you didnt know enough about botany and were too afraid to eat it. You needed the psychadelic vision to find your way and failed the trek.",
            "success_description": "You come across a radical looking mushroom. Thanks to your botany knowledge, you utilize the mushrooms psychadelic properties to guide your trek.",
        },
        {   
            "rarity": "common",
            "name": "Mushroom discovery",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "botany",
                "level": 3
            },
            "item_boosts": [
                "pestle_and_mortar",
            ],
            "failed_description": "You come across a radical looking mushroom but you didnt know enough about botany and were too afraid to eat it. You needed the psychadelic vision to find your way and failed the trek.",
            "success_description": "You come across a radical looking mushroom. Thanks to your botany knowledge, you utilize the mushrooms psychadelic properties to guide your trek.",
        },
        {   
            "rarity": "common",
            "name": "Sqwuaking bird",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "taming",
                "level": 3
            },
            "item_boosts": [
                "jaguar",
                "dragonfly",
            ],
            "failed_description": `A bird flys above and begins sqwuaking at you. "Out of my face bird!", you scream as shoo the bird away. You later get lost and fail the trek.`,
            "success_description": "A bird flys above and begins squaking at you. You decide to follow him to see what the buzz was about, and he leads you to and interesting new point on your trek.",
        },
        {   
            "rarity": "common",
            "name": "Crunchy",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "survival",
                "level": 3
            },
            "item_boosts": [
                "machete",
            ],
            "failed_description": `On the edge of starvation you find a colony of ants. You're too squimish to eat them. Maybe this trekking stuff isnt for you.`,
            "success_description": "On the edge of starvation you find a colony of ants. Looks like ants are back on the menu boys. The trek goes on.",
        },
        {   
            "rarity": "common",
            "name": "A windy day",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "elements",
                "level": 3
            },
            "item_boosts": [
                "metal_shard",
            ],
            "failed_description": `The wind picks up and messes up your hair. Your bad hair day ruins your trek.`,
            "success_description": "You feel a nice breeze on the back of your neck. Sweet.",
        },
        {   
            "rarity": "common",
            "name": "Are we there yet?",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "navigation",
                "level": 3
            },
            "item_boosts": [
                "old_compass",
            ],
            "failed_description": `Half way into the trek you realize youre totally lost. Where were we going again?`,
            "success_description": "Luckily you didnt attempt a trek through the jungle without any knowledge of navigation.",
        },
        {   
            "rarity": "common",
            "name": "Getting stoned",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "arcane",
                "level": 3
            },
            "item_boosts": [
                "magic_rune",
            ],
            "failed_description": `You come across a glowing stone in the jungle. Mesmerized, you reach out to grab it. Your hand melts as you touch it and the trek ends.`,
            "success_description": "You come across a glowing stone in the jungle. You dare not touch it after you remember a story from a 1 handed man back at camp.",
        },
        {   
            "rarity": "common",
            "name": "Are we there yet?",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "explosives",
                "level": 3
            },
            "item_boosts": [
                "dynomite",
            ],
            "failed_description": `You smell something funny in a dark cavern. The next thing you remember is waking up back at camp with no recollection of the trek.`,
            "success_description": "A strange smell is eminating from a dark cavern. You recognize the smell as toxic and avoid investigating for artifacts.",
        },
        {   
            "rarity": "prized",
            "name": "Carnivorous Plants",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "botany",
                "level": 6
            },
            "item_boosts": [
                "pestle_and_mortar",
            ],
            "failed_description": "As you are walking through the underbrush, a giant cluster of carnivorous plants attacks! You do not have the botany knowledge to evade them.",
            "success_description": "As you are walking through the underbrush, a giant cluster of carnivorous plants attacks! You simply snip off their heads and continue.",
        },
        {   
            "rarity": "prized",
            "name": "Drop Snake",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "taming",
                "level": 6
            },
            "item_boosts": [
                "jaguar",
                "dragonfly",
            ],
            "failed_description": `A venomous jungle snake falls from the trees onto your shoulders. It delivers a deadly bite to your jugular.`,
            "success_description": "A venomous jungle snake falls from the trees onto your shoulders. The snake chramer in you does not panic and quickly tosses the snake aside.",
        },
        {   
            "rarity": "prized",
            "name": "Thirst",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "survival",
                "level": 6
            },
            "item_boosts": [
                "machete",
            ],
            "failed_description": `You become dehydrated from trekking through the jungle. Your lack of survival knowledge causes you to go mad with thrist.`,
            "success_description": "You become dehydrated from trekking through the jungle. A nearby giant leaf has captured enough water to quelch your thirst.",
        },
        {   
            "rarity": "prized",
            "name": "A windy day",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "elements",
                "level": 6
            },
            "item_boosts": [
                "metal_shard",
            ],
            "failed_description": `An impassable mud pit lies before you. You try to trek accross but get suck and slow die in the pit.`,
            "success_description": "An impassable mud pit lies before you. As the day progress, the sunlight dries the mud, enabling you to pass.",
        },
        {   
            "rarity": "prized",
            "name": "Are we there yet?",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "navigation",
                "level": 6
            },
            "item_boosts": [
                "old_compass",
            ],
            "failed_description": `You'v'e become lost in the jungle. Moss leads the way but youre not sure in which direction.`,
            "success_description": "Youve become lost in the jungle. Thankfully the moss on the trees helps you reorientate yourself.",
        },
        {   
            "rarity": "prized",
            "name": "Getting stoned",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "arcane",
                "level": 6
            },
            "item_boosts": [
                "magic_rune",
            ],
            "failed_description": `The jungle breaks to reveal a grand tree with slowing symbols carved into the side. If only you knew how to read them...`,
            "success_description": "The jungle breaks to reveal a grand tree with slowing symbols carved into the side. They reveal to you important clues on your trek.",
        },
        {   
            "rarity": "prized",
            "name": "Are we there yet?",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "explosives",
                "level": 6
            },
            "item_boosts": [
                "dynomite",
            ],
            "failed_description": `You find a trail of black powder. You snort a line and black out until the next day.`,
            "success_description": "You find a trail of black powder. You recognize it as gun powder and make sure not to ignite it.",
        },
        {   
            "rarity": "coveted",
            "name": "Well equipped",
            "type": "item_check",
            "item_required": {
                "name": "machete"
            },
            "failed_description": "The jungle grows dense. Without a machete, you must end the trek.",
            "success_description": "The jungle grows dense. You break 1 machete clearing through the last bit of the jungle but at least you made it through.",
        },
        {   
            "rarity": "coveted",
            "name": "Kerboom",
            "type": "item_check",
            "item_required": {
                "name": "dynomite"
            },
            "failed_description": "A massive stone sphere blocks your access to an intriguing cave. If only you had a way to move such a large obect.",
            "success_description": "A massive stone sphere blocks your access to an intriguing cave. You shove 1 stick of dynomite in a crevace near the spere and clear doorway with a mighty explosion.",
        },
        {   
            "rarity": "coveted",
            "name": "Metalic connections",
            "type": "item_check",
            "item_required": {
                "name": "metal_shard"
            },
            "failed_description": "You stumble upon an ancient door locked hidden in a tree with a small hole in the middle. It shocks you ask you touch it. If only you had a key...",
            "success_description": "You stumble upon an ancient door locked hidden in a tree with a small hole in the middle. The 1 metal shard in your inventory luckily unlocks it! Inside you find more insights to your trek.",
        },
        {   
            "rarity": "coveted",
            "name": "Standard navigation",
            "type": "item_check",
            "item_required": {
                "name": "compass"
            },
            "failed_description": "Wow you are lost. Very lost. A tool to help you navigate would have been nice.",
            "success_description": "You wind yourself wandering in circles, luckily you can use 1 compass to straighten your course.",
        },
        {   
            "rarity": "coveted",
            "name": "Arcane vessel",
            "type": "item_check",
            "item_required": {
                "name": "magic_rune"
            },
            "failed_description": "A jungle ent has become of aware of your presence. Fearful of angering it, you decide to end the trek early.",
            "success_description": "A jungle ent has become of aware of your presence. You throw 1 magic rune at the ent and it becomes enamoured by the arcane energy.",
        },
        {   
            "rarity": "coveted",
            "name": "Herbal itch",
            "type": "item_check",
            "item_required": {
                "name": "pestle_and_mortar"
            },
            "failed_description": "A rash starts to break out on our face. You decide to call off the trek as your eyes start to swell up.",
            "success_description": "A rash starts to break out on our face. You are able to use 1 pestle and mortar to prepare medicine and continue the trek..",
        },
        {   
            "rarity": "coveted",
            "name": "Wasp attack",
            "type": "item_check",
            "item_required": {
                "name": "dragonfly"
            },
            "failed_description": "A pissed off pile of wasps has taken chase. You run away and call it quits on this trek.",
            "success_description": "A pissed off pile of wasps has taken chase. Your companion dragonfly somehow single handedly kills all of the wasps.",
        },
        {   
            "rarity": "coveted",
            "name": "Boar attack",
            "type": "item_check",
            "item_required": {
                "name": "jaguar"
            },
            "failed_description": "An angry piece of ham comes charging out at you from the bush. You are not prepared to deal with a boar and end the trek.",
            "success_description": "An angry piece of ham comes charging out at you from the bush. Your jaguar companion ambushes the boar and begins to devour it.",
        }
    ]

    steps = 3
    if(total_lv >= 50){
        steps = 4
    }

    if(total_lv >= 100){
        steps = 5
    }
  }

  console.log(total_lv)
  //CONTRUCT EVENT
  trek_step_rarity = []
    for (i = 0; i < steps; ++i) {
        pool_roll = Math.floor(Math.random() * 2010);

        if(Number(total_lv) < 15 ){
            trek_step_rarity.push('default')
        }else if(Number(total_lv) >= 15 && Number(total_lv) < 35 ){// trek difficulty for 15+
                //default
            if(pool_roll <= 1100 && pool_roll >= 0){
                trek_step_rarity.push('default')
            }

            //common
            if(pool_roll < 1650 && pool_roll >= 1100){
                trek_step_rarity.push('common')
            }

            //prized
            if(pool_roll < 1850 && pool_roll >= 1650){
                trek_step_rarity.push('prized')
            }

            //coveted
            if(pool_roll < 1950 && pool_roll >= 1850){
                trek_step_rarity.push('coveted')
            }

            //fabled
            if(pool_roll < 2000 && pool_roll >= 1950){
                trek_step_rarity.push('fabled')
            }

            //ancient
            if(pool_roll <= 2010 && pool_roll >= 2000){
                trek_step_rarity.push('ancient')
            }
        }else if(Number(total_lv) >= 35 && Number(total_lv) < 65 ){//---------------trek diffulty for 35+
                //default
            if(pool_roll <= 900 && pool_roll >= 0){
                trek_step_rarity.push('default')
            }

            //common
            if(pool_roll < 1600 && pool_roll >= 900){
                trek_step_rarity.push('common')
            }

            //prized
            if(pool_roll < 1850 && pool_roll >= 1600){
                trek_step_rarity.push('prized')
            }

            //coveted
            if(pool_roll < 1950 && pool_roll >= 1850){
                trek_step_rarity.push('coveted')
            }

            //fabled
            if(pool_roll < 2000 && pool_roll >= 1950){
                trek_step_rarity.push('fabled')
            }

            //ancient
            if(pool_roll <= 2010 && pool_roll >= 2000){
                trek_step_rarity.push('ancient')
            }
        }else if(Number(total_lv) >= 65 && Number(total_lv) < 110 ){//---------------trek diffulty for 65+
                //default
            if(pool_roll <= 500 && pool_roll >= 0){
                trek_step_rarity.push('default')
            }

            //common
            if(pool_roll < 1100 && pool_roll >= 500){
                trek_step_rarity.push('common')
            }

            //prized
            if(pool_roll < 1600 && pool_roll >= 1100){
                trek_step_rarity.push('prized')
            }

            //coveted
            if(pool_roll < 1850 && pool_roll >= 1600){
                trek_step_rarity.push('coveted')
            }

            //fabled
            if(pool_roll < 2000 && pool_roll >= 1850){
                trek_step_rarity.push('fabled')
            }

            //ancient
            if(pool_roll <= 2010 && pool_roll >= 2000){
                trek_step_rarity.push('ancient')
            }
        }else if(Number(total_lv) >= 110 && Number(total_lv) < 170 ){//---------------trek diffulty for 110+
                //default
            if(pool_roll <= 200 && pool_roll >= 0){
                trek_step_rarity.push('default')
            }

            //common
            if(pool_roll < 800 && pool_roll >= 200){
                trek_step_rarity.push('common')
            }

            //prized
            if(pool_roll < 1400 && pool_roll >= 800){
                trek_step_rarity.push('prized')
            }

            //coveted
            if(pool_roll < 1800 && pool_roll >= 1400){
                trek_step_rarity.push('coveted')
            }

            //fabled
            if(pool_roll < 2000 && pool_roll >= 1800){
                trek_step_rarity.push('fabled')
            }

            //ancient
            if(pool_roll <= 2010 && pool_roll >= 2000){
                trek_step_rarity.push('ancient')
            }
        }
    }



    console.log(`TREK STEP RARITY ${JSON.stringify(trek_step_rarity)}`)
    curated_trek_events = []
    for (i = 0; i < trek_step_rarity.length; ++i) {
        rarity = trek_step_rarity[i]

        for (i = 0; i < jungle_encounters.length; ++i) {
            encounter = jungle_encounters[i]
            if(encounter.rarity == rarity){
                curated_trek_events.push(encounter)
            }
        }
    }

    trek_events = []
    for (i = 0; i < steps; ++i) {
        pool_roll = Math.floor(Math.random() * steps);

        trek_events.push(curated_trek_events[pool_roll])
    }

    console.log(`TREK EVENTS ${JSON.stringify(trek_events)}`)

    event_story =''
    trek_history = [];
    knowledge_list =  JSON.parse(row.knowledge)
    console.log(`EVENT LENGTH: ${trek_events.length}`)

    for (i = 0; i < trek_events.length; ++i) {
        trek_event = trek_events[i]
        if (trek_event.type == 'knowledge_check') {
            event_result = trek_event.failed_description
            for (a = 0; a < knowledge_list.length; ++a) {
                knowledge = knowledge_list[a]
                
                if(knowledge.name == trek_event.knowledge_required.name){
                    if (Number(knowledge.level) >= Number(trek_event.knowledge_required.level)) {
                        trek_history.push(`success`)
                        event_result = trek_event.success_description
                        a = row.knowledge.length
                    } else {
                        i = trek_events.length
                    }
                }
            }
        }

        inventory = JSON.parse(row.inventory)
        if (trek_event.type == 'item_check') {
            event_result = trek_event.failed_description

            for (b = 0; b < inventory.length; ++b) {
                inv_item = inventory[b]

                if (inv_item.name == trek_event.item_required.name) {
                    trek_history.push(`success`)
                    event_result = trek_event.success_description
                    if (!inv_item.account || (inv_item.rarity == `default` || inv_item.rarity == `common`)) {
                        inventory[b]["quantity"] = Number(inventory[b]["quantity"]) - 1;

                        if (Number(inventory[b]["quantity"]) == 0) {
                            inventory.splice(b, 1)
                        }
                    }
                    
                    await db
                        .prepare(
                            `UPDATE player_header set inventory = ? WHERE chat_id = ? AND username = ?`
                        )
                        .run(JSON.stringify(inventory), chat_id, username);

                    b = inventory.length
                }
            }
        }
        event_story = `${event_story} ${event_result}`
    }

    console.log(JSON.stringify(trek_history))
    console.log(event_story)

    if (trek_history.length != steps) {
        trek_status = 'Failed'
    }else{
        trek_status = 'Completed'
    }

  return {
    result: {
        story: event_story,
        trek_status: trek_status,
        inventory: inventory
        }
  };
};
