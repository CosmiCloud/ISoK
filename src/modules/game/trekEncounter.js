require("dotenv").config();
const fs = require("fs");

const db = require("better-sqlite3")(process.env.GAME_DB, {
  verbose: console.log,
});

module.exports = trekEncounter = async (area, row) => {

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
            "rarity": "prized",
            "name": "Well equipped",
            "type": "item_check",
            "item_required": {
                "name": "machete"
            },
            "failed_description": "The jungle grows dense. Without a machete, you must end the trek.",
            "success_description": "The jungle grows dense. You break 1 machete clearing through the last bit of the jungle but at least you made it through.",
        },
        {   
            "rarity": "prized",
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
            "rarity": "fabled",
            "name": "Arcane vessel",
            "type": "item_check",
            "item_required": {
                "name": "magic_rune"
            },
            "failed_description": "A jungle ent has become of aware of your presence. Fearful of angering it, you decide to end the trek early.",
            "success_description": "A jungle ent has become of aware of your presence. You throw 1 magic rune at the ent and it becomes enamoured by the arcane energy.",
        },
        {   
            "rarity": "fabled",
            "name": "Herbal itch",
            "type": "item_check",
            "item_required": {
                "name": "pestle_and_mortar"
            },
            "failed_description": "A rash starts to break out on our face. You decide to call off the trek as your eyes start to swell up.",
            "success_description": "A rash starts to break out on our face. You are able to use 1 pestle and mortar to prepare medicine and continue the trek..",
        },
        {   
            "rarity": "ancient",
            "name": "Wasp attack",
            "type": "item_check",
            "item_required": {
                "name": "dragonfly"
            },
            "failed_description": "A pissed off pile of wasps has taken chase. You run away and call it quits on this trek.",
            "success_description": "A pissed off pile of wasps has taken chase. Your companion dragonfly somehow single handedly kills all of the wasps.",
        },
        {   
            "rarity": "ancient",
            "name": "Boar attack",
            "type": "item_check",
            "item_required": {
                "name": "jaguar"
            },
            "failed_description": "An angry piece of ham comes charging out at you from the bush. You are not prepared to deal with a boar and end the trek.",
            "success_description": "An angry piece of ham comes charging out at you from the bush. Your jaguar companion ambushes the boar and begins to devour it.",
        },
        {   
            "rarity": "common",
            "name": "Mushroom discovery",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "botany",
                "level": 5
            },
            "item_boosts": [
                "pestle_and_mortar",
            ],
            "failed_description": "You come across a radical looking mushroom but you didn't know enough about botany and were too afraid to eat it. You needed the psychadelic vision to find your way and failed the trek.",
            "success_description": "You come across a radical looking mushroom. Thanks to your botany knowledge, you utilize the mushrooms psychadelic properties to guide your trek.",
        },
        {   
            "rarity": "common",
            "name": "Sqwuaking bird",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "taming",
                "level": 5
            },
            "item_boosts": [
                "jaguar",
                "dragonfly",
            ],
            "failed_description": `A bird flys above and begins sqwuaking at you. "Out of my face bird!", you scream as shoo the bird away. You later get lost and fail the trek.`,
            "success_description": "A bird flys above and begins squaking at you. You decide to follow him to see what the buzz was about, and he leads you to and interesting new point on your trek.",
        },
        {   
            "rarity": "coveted",
            "name": "Crunchy",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "survival",
                "level": 5
            },
            "item_boosts": [
                "machete",
            ],
            "failed_description": `On the edge of starvation you find a colony of ants. You're too squimish to eat them. Maybe this trekking stuff isnt for you.`,
            "success_description": "On the edge of starvation you find a colony of ants. Looks like ants are back on the menu boys. The trek goes on.",
        },
        {   
            "rarity": "coveted",
            "name": "A windy day",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "elements",
                "level": 5
            },
            "item_boosts": [
                "metal_shard",
            ],
            "failed_description": `The wind picks up and messes up your hair. Your bad hair day ruins your trek.`,
            "success_description": "You feel a nice breeze on the back of your neck. Sweet.",
        },
        {   
            "rarity": "fabled",
            "name": "Are we there yet?",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "navigation",
                "level": 5
            },
            "item_boosts": [
                "compass",
            ],
            "failed_description": `Half way into the trek you realize youre totally lost. Where were we going again?`,
            "success_description": "Luckily you didnt attempt a trek through the jungle without any knowledge of navigation.",
        },
        {   
            "rarity": "fabled",
            "name": "Getting stoned",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "arcane",
                "level": 5
            },
            "item_boosts": [
                "magic_rune",
            ],
            "failed_description": `You come across a glowing stone in the jungle. Mesmerized, you reach out to grab it. Your hand melts as you touch it and the trek ends.`,
            "success_description": "You come across a glowing stone in the jungle. You dare not touch it after you remember a story from a 1 handed man back at camp.",
        },
        {   
            "rarity": "ancient",
            "name": "Are we there yet?",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "explosives",
                "level": 5
            },
            "item_boosts": [
                "dynomite",
            ],
            "failed_description": `You smell something funny in a dark cavern. The next thing you remember is waking up back at camp with no recollection of the trek.`,
            "success_description": "A strange smell is eminating from a dark cavern. You recognize the smell as toxic and avoid investigating for artifacts.",
        },
        {   
            "rarity": "prized",
            "name": "Carnivorous plant",
            "type": "knowledge_check",
            "knowledge_required": {
                "name": "botany",
                "level": 10
            },
            "item_boosts": [
                "pestle_and_mortar",
            ],
            "failed_description": "You come across a radical looking mushroom but you didn't know enough about botany and were too afraid to eat it. You needed the psychadelic vision to find your way and failed the trek.",
            "success_description": "You come across a radical looking mushroom. Thanks to your botany knowledge, you utilize the mushrooms psychadelic properties to guide your trek.",
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

  //CONTRUCT EVENT
  trek_step_rarity = []
    for (i = 0; i < steps; ++i) {
        pool_roll = Math.floor(Math.random() * 2010);
        //common
        if(pool_roll <= 2010 && pool_roll >= 0){
            trek_step_rarity.push('default')
        }

        //common
        // if(pool_roll < 1100 && pool_roll >= 600){
        //     trek_step_rarity.push('common')
        // }

        // //prized
        // if(pool_roll < 1500 && pool_roll >= 1100){
        //     trek_step_rarity.push('prized')
        // }

        // //coveted
        // if(pool_roll < 1800 && pool_roll >= 1500){
        //     trek_step_rarity.push('coveted')
        // }

        // //fabled
        // if(pool_roll < 2000 && pool_roll >= 1800){
        //     trek_step_rarity.push('fabled')
        // }

        // //ancient
        // if(pool_roll <= 2010 && pool_roll >= 2000){
        //     trek_step_rarity.push('ancient')
        // }
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
    for (i = 0; i < trek_events.length; ++i) {
        trek_event = trek_events[i]

        if (trek_event.type == 'knowledge_check') {
            for (i = 0; i < row.knowledge.length; ++i) {
                knowledge = row.knowledge[i]
            
                if(knowledge.name == trek_event.knowledge_required.name){
                    if(knowledge.level >= trek_event.knowledge_required.level){
                        event_result = trek_event.success_description
                    }else{
                        event_result = trek_event.failed_description
                    }
                }
            }
        }

        inventory = row.inventory
        if (trek_event.type == 'item_check') {
            for (i = 0; i < inventory.length; ++i) {
                inv_item = inventory[i]

                if (inv_item.name == trek_event.item_required.name) {
                    trek_status = `success`
                    event_result = trek_event.success_description
                    if(!inv_item.account && inv_item.knowledge != 'taming'){
                        inventory[i]["quantity"] =
                        Number(inventory[i]["quantity"]) -1;
                        break;
                    }
                }else{
                    trek_status = `failure`
                    event_result = trek_event.failed_description
                }
            }
        }

        event_story = event_story + event_result
    }

    console.log(event_story)
  return {
    result: {
        story: event_story,
        trek_status: trek_status
        }
  };
};
