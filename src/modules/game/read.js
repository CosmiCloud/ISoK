require("dotenv").config();
const fs = require("fs");

const db = require("better-sqlite3")(process.env.GAME_DB, {
    verbose: console.log,
});

module.exports = read = async (chat_id, username, book_type, knowledge) => {
    const queryTypes = require("../../util/queryTypes");
    //check if user exists
    row = await db
        .prepare("SELECT * FROM user_header WHERE chat_id = ? AND username = ?")
        .get(chat_id, username);

    if (!row) {
        return {
            result: `No account found. Please run !createaccount to create an account.`,
        };
    }

    inventory = JSON.parse(row.inventory)
    knowledge_list = JSON.parse(row.knowledge)


    knowledge_found = 'no'
    for (i = 0; i < knowledge_list.length; ++i) {
        cur_knowledge = knowledge_list[i];
        if (cur_knowledge.name == knowledge) {
            knowledge_found = 'yes'
            xp = cur_knowledge.experience
            level = cur_knowledge.level
        }
    }

    if (knowledge_found == 'no') {
        return {
            result: {
                knowledge: null,
                message: `You cant gain knowledge in that area`
            }
        };
    }

    multiplier = 0
    for (i = 0; i < inventory.length; ++i) {
        inv_item = inventory[i];
        if (inv_item.name == book_type) {

            if(book_type == `tattered_book_of_knowledge`){
                multiplier = 50
            }

            if(book_type == `book_of_knowledge`){
                multiplier = 100
            }

            if(!inv_item.account){
                inventory[i]["quantity"] = Number(inventory[i]["quantity"]) - 1;

                if (Number(inventory[i]["quantity"]) == 0) {
                    inventory.splice(i, 1)
                }
                i = inventory.length
            }

            if(inv_item.account){
                inventory.splice(i, 1)
                i = inventory.length
            }
        }
    }

    if (multiplier == 0) {
        return {
            result: {
                knowledge: null,
                message: `You dont have a book of knowledge of any quality to read`
            }
        };
    }

    book_xp = level * multiplier
    levelCalc = await queryTypes.levelCalc();
    total_xp = xp + book_xp;
    level_up = `no`

    for (i = 0; i < knowledge_list.length; ++i) {
        cur_knowledge = knowledge_list[i];
        if (cur_knowledge.name == knowledge) {
            knowledge_index = i
            old_level = cur_knowledge.level

            experience = cur_knowledge.experience
            level = await levelCalc
                .getData(experience)
                .then(async ({ result }) => {
                    return result;
                })
                .catch((error) => console.log(`Error : ${error}`));
            
            if(old_level < level){
                 level_up = `yes`
            }
        }

        if (cur_knowledge.name == "total") {
            knowledge_list[i]["experience"] = Number(knowledge_list[i]["experience"]) + book_xp
            total_index = i
        }
    }

    knowledge_list[knowledge_index].experience = total_xp;
    knowledge_list[knowledge_index].level = level;
    knowledge_list[total_index].experience = Number(knowledge_list[total_index].experience) + book_xp

    if(level_up == `yes`){
        knowledge_list[total_index].level = Number(knowledge_list[total_index].level) + 1
    }

    await db
        .prepare(
            `UPDATE user_header set inventory = ?,knowledge = ? WHERE chat_id = ? AND username = ?`
        )
        .run(JSON.stringify(inventory), JSON.stringify(knowledge_list), chat_id, username);

    return {
        result: {
            knowledge: knowledge,
            level: level,
            book_xp: book_xp,
            book: book_type
            }
    };
};
