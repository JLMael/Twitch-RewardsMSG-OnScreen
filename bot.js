const express = require("express");
const fs = require("fs");
const path = require("path");
const tmi = require("tmi.js");

const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, "public")));

const messagesPath = path.join(__dirname, "messages.log");
app.get("/messages", (req, res) => {
  fs.readFile(messagesPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading messages file:", err.message);
      return res.status(500).send({ error: "Error reading messages file" });
    }

    const messages = data
      .trim()
      .split("\n")
      .filter((line) => line.trim() !== "");
    res.json({ messages });
  });
});

const configPath = path.join(__dirname, "config.json");
let botClient;

function startBot() {
  fs.readFile(configPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading config file:", err.message);
      return;
    }

    const config = JSON.parse(data);

    botClient = new tmi.Client({
      channels: [config.channel],
      identity: {
        username: config.username,
        password: config.oauth,
      },
    });

    botClient.connect();

    botClient.on("message", (channel, tags, message, self) => {
      if (self) return;

      if (tags.customRewardId === config.rewardId) {
        const timestamp = new Date()
          .toISOString()
          .replace("T", " ")
          .slice(0, 19);
        const logEntry = `${timestamp} ${tags["display-name"]}: ${message}\n`;

        console.log(`Logging message to file: ${logEntry.trim()}`);

        fs.appendFile(messagesPath, logEntry, (err) => {
          if (err) {
            console.error("Error writing message to file:", err.message);
          } else {
            console.log(`Message received and logged: ${logEntry.trim()}`);
          }
        });
      } else {
        console.log(`Message ignored: ${message}`);
      }
    });
  });
}

function stopBot() {
  if (botClient) {
    botClient.disconnect();
    console.log("Bot disconnected");
  }
}

app.listen(PORT, () => {
  console.log(`Bot server is running on http://localhost:${PORT}`);
});

fs.watchFile(configPath, () => {
  fs.readFile(configPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading config file:", err.message);
      return;
    }

    const config = JSON.parse(data);
    if (config.botStatus === "on") {
      startBot();
    } else {
      stopBot();
    }
  });
});
