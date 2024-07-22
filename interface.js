const fs = require("fs");
const path = require("path");
const tmi = require("tmi.js");

const configPath = path.join(__dirname, "config.json");

let client;

function startBot(config) {
  client = new tmi.Client({
    identity: {
      username: config.username,
      password: config.oauth,
    },
    channels: [config.channel],
  });

  client.connect().catch(console.error);

  client.on("message", (channel, tags, message, self) => {
    if (self) return;
    console.log(`${tags["display-name"]}: ${message}`);
  });

  console.log("Bot started");
}

function stopBot() {
  if (client) {
    client
      .disconnect()
      .then(() => {
        console.log("Bot stopped");
      })
      .catch(console.error);
  }
}

function loadConfig() {
  return new Promise((resolve, reject) => {
    fs.readFile(configPath, "utf8", (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(JSON.parse(data));
    });
  });
}

async function handleBot() {
  try {
    const config = await loadConfig();
    if (config.botStatus === "on") {
      startBot(config);
    } else {
      stopBot();
    }
  } catch (err) {
    console.error("Error handling bot:", err.message);
  }
}

setInterval(handleBot, 60000);

handleBot();
