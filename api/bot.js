require("dotenv").config();
const { Client } = require("discord.js");
const fetch = require("node-fetch");

const client = new Client({ intents: [] });

// Vercel serverless function handler
module.exports = async (req, res) => {
    const status = req.query.status || "online"; // Default to 'online' if no status provided

    try {
        await setDiscordStatus(status);
        return res.status(200).send(`Discord status set to ${status}`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Failed to set status");
    }
};

// Function to set Discord status
async function setDiscordStatus(status) {
    const userToken = process.env.USER_TOKEN;

    const response = await fetch(
        "https://discord.com/api/v9/users/@me/settings",
        {
            method: "PATCH",
            headers: {
                Authorization: userToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
        }
    );

    if (response.ok) {
        console.log(`Status set to ${status}`);
    } else {
        console.error("Failed to set status:", response.statusText);
        throw new Error("Failed to set status");
    }
}

// Login your bot (optional, only if you want to run Discord bot actions)
client.once("ready", () => {
    console.log(`Bot logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
