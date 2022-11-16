const spamCheck = require("../modules/control/spamCheck");
const reboot = require("../modules/control/reboot");
const createAccount = require("../modules/DKG/createAccount");
const saveAccount = require("../modules/DKG/saveAccount");
const loadAccount = require("../modules/DKG/loadAccount");
const mintItem = require("../modules/DKG/mintItem");
const levelCalc = require("../queries/levelCalc");
const addItemInventory = require("../queries/addItemInventory");
const itemPool = require("../queries/itemPool");
const explore = require("../modules/game/explore");
const trek = require("../modules/game/trek");
const trekEncounter = require("../modules/game/trekEncounter");
const read = require("../modules/game/read");

const queryTypes = [
  {
    name: "spamCheck",
    getData: () => spamCheck(command),
  },
  {
    name: "reboot",
    getData: () => reboot(chat_id, username),
  },
  {
    name: "createAccount",
    getData: () => createAccount(chat_id, username),
  },
  {
    name: "saveAccount",
    getData: () => saveAccount(chat_id, username),
  },
  {
    name: "loadAccount",
    getData: () => loadAccount(chat_id, username, args),
  },
  {
    name: "mintItem",
    getData: () => mintItem(chat_id, username, args),
  },
  {
    name: "levelCalc",
    getData: () => levelCalc(experience),
  },
  {
    name: "addItemInventory",
    getData: () => addItemInventory(chat_id, username, pool,inventory),
  },
  {
    name: "itemPool",
    getData: () => itemPool(chat_id,username, command, area),
  },
  {
    name: "explore",
    getData: () => explore(chat_id, username, command,area),
  },
  {
    name: "trek",
    getData: () => trek(chat_id, username, command, area),
  },
  {
   name: "trekEncounter",
   getData: () => trekEncounter(chat_id, username, area, row),
   },
   {
    name: "read",
    getData: () => trekEncounter(chat_id, username, knowledge),
   }
];

module.exports = {
  spamCheck: function spamCheck() {
    return queryTypes[0];
  },
  reboot: function reboot() {
    return queryTypes[1];
  },
  createAccount: function createAccount() {
    return queryTypes[2];
  },
  saveAccount: function saveAccount() {
    return queryTypes[3];
  },
  loadAccount: function loadAccount() {
    return queryTypes[4];
  },
  mintItem: function mintItem() {
    return queryTypes[5];
  },
  levelCalc: function levelCalc() {
    return queryTypes[6];
  },
  addItemInventory: function addItemInventory() {
    return queryTypes[7];
  },
  itemPool: function itemPool() {
    return queryTypes[8];
  },
  explore: function explore() {
    return queryTypes[9];
  },
  trek: function trek() {
    return queryTypes[10];
  },
  trekEncounter: function trekEncounter() {
    return queryTypes[11];
   },
   read: function read() {
     return queryTypes[12];
   },
};
