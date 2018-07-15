"use strict";

/*
    Imports
*/

let IrcClient = require("irc").Client;
const CONFIG = require("./config.json");
const EMOTE = require('./emote.json');
const colors = require('irc-colors');

/*
    Constants
*/
// comment


const TAYTAYMSGS = [
  "your words always lift my spirits, taytay",
  "i've been dying to speak to you again, dear",
  "my longing for you is supernatural, baby",
  "just one more night. No wine, no BOOs",
  "i'd ask you out to a bar sometime, but they'd just say \"no spirits\"",
  "just make an album about me pls and i wont make any more BOOring puns",
  "the washington ghost says that you and i should get together",
  "remember the time when we were at blockbusters, and they said they had bambi, and i said bamBOO?",
  "i recently published a biography about you, but i used a ghostwriter",
  "i died so I could haunt you.",
  "did you hear about the party installgen2 was throwing? he said anything GHO-you know what this was a shitty pun"
];

/*
    Functions
*/

function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function writeTombstone(bot, to, victim) {
  let second = colors.navy.bgblack(" ☆ ") + colors.black.bgwhite(" R.I.P. ║");
  let third = colors.cyan.bgblack("      ") + colors.black.bgwhite("  ║");

  if (victim == "") {
    second += colors.navy.bgblack("       ☆    ");
    third += colors.cyan.bgblack("               ");
  } else {
    second += colors.cyan.bgblack("  HERE LIES ");
    third += colors.cyan.bgblack("     " + victim + "          ");
  }

  [
    colors.cyan.bgblack("      ") + colors.black.bgwhite("  ║") + colors.purple.bgblack("         ☆     "),
    second,
    third,
    colors.cyan.bgteal("    ") + colors.cyan.bgteal("  ") + colors.black.bgwhite("  ║") + colors.cyan.bgteal("               "),
    colors.cyan.bgteal("                        ")
  ].forEach((line, i) => {
    bot.say(to, line);
  });
}

/*
    Program
*/

{
  let bot = new IrcClient(CONFIG.server, CONFIG.nick, CONFIG.connection);
  const cleave = module.exports = function(s, separator = ' ') {
    const i = s.indexOf(separator)
    return (i === -1) ? [s, ''] : [
      s.slice(0, i),
      s.slice(i + 1),
    ]
  }

  bot.addListener("message", (nick, to, message) => {
    if (nick == "tay" && Math.floor(Math.random() * 25) == 24 && message.toLowerCase().indexOf("youtube") == -1 && message.toLowerCase().indexOf("[url]") == -1) { // 1/25 chance of replying to taylorswift. TODO: get taylorswift to always respond with "die"
      bot.say(to, `${nick}: ${randomFromArray(TAYTAYMSGS)} ;)`);
      return;
    }

    if (CONFIG.ignoreList.indexOf(nick) > -1) {
      return;
    }

    // split a string into two parts at the first instance of a separator
    const [f, x] = cleave(message);
    if (f == '.rip' && x.length < 30) {
      writeTombstone(bot, to, x);
    }



    if (message.toLowerCase() == ".bots") {
      bot.say(to, CONFIG.dotbots);
      return;
    }

    let res = "";
    message.split(" ").forEach((element) => {
      let word = element.toLowerCase().replace(/[^_-z]+/g, ""); // this limits words to being a-z, while still including '_' and '`'

      switch (word) {
        case "spooky":
        case "scary":
        case "skeletons":
        case "boo":
          res = randomFromArray(EMOTE.FEAR);
          break;
        case "kys":
        case "kms":
        case "dead":
          res = "／(x~x)＼";
          break;
        case "jesus":
          res = `${nick}: jeebus *`;
          break;
        case "ghost_bot":
          res = '(･_├┬┴┬┴┬';
          break;
      }
    });
    if (res != "")
      bot.say(to, res);
  });

  bot.addListener("ctcp-version", (nick) => {
    bot.notice(nick, "\u0001VERSION ayylmao\u0001");
  });

  bot.on("error", (message) => {
    console.log(message);
    return;
  });

  bot.on("motd", function(motd) {
    console.log(motd);
  });

  bot.on("registered", () => {
    if (CONFIG.nickserv.enabled) {
      bot.say("NickServ", `IDENTIFY ${CONFIG.nickserv.password}`);
    }
  });

  bot.on("invite", (channel, nick) => {
    bot.join(channel);
    bot.say(channel, `${nick} here lies ghost bot, rip dan!`);
    return;
  });
}
