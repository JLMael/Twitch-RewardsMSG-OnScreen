const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const configPath = path.join(__dirname, "config.json");

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

app.get("/get-config", (req, res) => {
  fs.readFile(configPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading config file:", err.message);
      return res.status(500).send({ error: "Error reading config file" });
    }
    res.send(JSON.parse(data));
  });
});

app.post("/save-config", (req, res) => {
  const { username, oauth, channel, rewardId } = req.body;
  const newConfig = { username, oauth, channel, rewardId, botStatus: "off" };

  fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), (err) => {
    if (err) {
      console.error("Error saving config file:", err.message);
      return res.status(500).send({ error: "Error saving config file" });
    }
    res.send(newConfig);
  });
});

app.get("/bot/:action", (req, res) => {
  const { action } = req.params;
  if (action !== "start" && action !== "stop") {
    return res.status(400).send({ error: "Invalid action" });
  }

  fs.readFile(configPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading config file:", err.message);
      return res.status(500).send({ error: "Error reading config file" });
    }

    const config = JSON.parse(data);
    config.botStatus = action === "start" ? "on" : "off";

    fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
      if (err) {
        console.error("Error saving config file:", err.message);
        return res.status(500).send({ error: "Error saving config file" });
      }
      res.send(config);
    });
  });
});

app.get("/interface", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "interface.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
