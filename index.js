"use strict";

/*
    Imports
*/

let IrcClient = require("irc").Client;
const ytdl = require("ytdl-core");
const CONFIG = require("./config.json");
const EMOTE = require("./emote.json");
const colors = require("irc-colors");

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
  "did you hear about the party installgen2 was throwing? he said anything GHO-you know what this was a shitty pun",
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
    colors.cyan.bgblack("      ") +
      colors.black.bgwhite("  ║") +
      colors.purple.bgblack("         ☆     "),
    second,
    third,
    colors.cyan.bgteal("    ") +
      colors.cyan.bgteal("  ") +
      colors.black.bgwhite("  ║") +
      colors.cyan.bgteal("               "),
    colors.cyan.bgteal("                        "),
  ].forEach((line, i) => {
    bot.say(to, line);
  });
}

/*
    Program
*/

{
  let bot = new IrcClient(CONFIG.server, CONFIG.nick, CONFIG.connection);
  const cleave = (module.exports = function (s, separator = " ") {
    const i = s.indexOf(separator);
    return i === -1 ? [s, ""] : [s.slice(0, i), s.slice(i + 1)];
  });

  bot.addListener("message", (nick, to, message) => {
    // Regular expression to match both medium.com URLs and capture the last 12-character alphanumeric string
    const mediumUrlPattern =
      /https:\/\/medium\.com\/(?:@[^\/]+\/[^\/]+-|p\/)([a-zA-Z0-9]{12})/g;

    // Copy of the original message to be sent to "D_A_N"
    let messageToDan = message;

    // Check if there's a medium.com URL in the message
    let match;
    while ((match = mediumUrlPattern.exec(message)) !== null) {
      const mediumId = match[1]; // Extract the 12-character string
      const freediumUrl = `https://freedium.cfd/${mediumId}`; // Create the freedium URL

      // Replace the medium URL in the message with the freedium URL
      messageToDan = messageToDan.replace(match[0], freediumUrl);
    }

    // Always send the (potentially modified) message to D_A_N
    bot.say("D_A_N", `From ${colors.green(to)}: ${colors.red(nick)}: ${messageToDan}`);
    // Continue processing the message normally

    var msg_fragments = message.split(" ");
    msg_fragments.forEach(function (fragment) {
      if (youtube_parser(fragment))
        ytdl.getInfo(fragment).then((info) => {
          bot.say(to, `Title | ${info.videoDetails.title}`);
        });
    });

    if (
      nick == "tay" &&
      Math.floor(Math.random() * 25) == 24 &&
      message.toLowerCase().indexOf("youtube") == -1 &&
      message.toLowerCase().indexOf("[url]") == -1
    ) {
      bot.say(to, `${nick}: ${randomFromArray(TAYTAYMSGS)} ;)`);
      return;
    }

    if (CONFIG.ignoreList.indexOf(nick) > -1) {
      return;
    }

    const [f, x] = cleave(message);
    if (f == ".rip" && x.length < 30) {
      writeTombstone(bot, to, x);
    }

    if (message.toLowerCase() == ".bots") {
      bot.say(to, CONFIG.dotbots);
      return;
    }

    let res = "";
    message.split(" ").forEach((element) => {
      let word = element.toLowerCase().replace(/[^_-z]+/g, "");
      switch (word) {
        case "boo":
          res = randomFromArray(EMOTE.FEAR);
          break;
        case "kys":
        case "kms":
          res = "／(x~x)＼";
          break;
        case "jesus":
          res = `${nick}: jeebus *`;
          break;
      }
    });
    if (res != "") bot.say(to, res);
  });
  bot.addListener("ctcp-version", (nick) => {
    bot.notice(nick, "\u0001VERSION ayylmao\u0001");
  });

  bot.on("error", (message) => {
    console.log(message);
    return;
  });

  bot.on("motd", function (motd) {
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

function youtube_parser(url) {
  var regExp =
    /^https?\:\/\/(?:www\.youtube(?:\-nocookie)?\.com\/|m\.youtube\.com\/|youtube\.com\/)?(?:ytscreeningroom\?vi?=|youtu\.be\/|vi?\/|user\/.+\/u\/\w{1,2}\/|embed\/|watch\?(?:.*\&)?vi?=|\&vi?=|\?(?:.*\&)?vi?=)([^#\&\?\n\/<>"']*)/i;
  var match = url.match(regExp);
  return match && match[1].length == 11 ? match[1] : false;
}
