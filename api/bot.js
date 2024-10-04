require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let loggedIn = false; // Track whether the bot is logged in
let currentStatus = "online"; // Tracks the bot's current status

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
    const newStatus = req.query.status || "online"; // Default to 'online' if no status provided

    // Ensure the bot is logged in before proceeding
    if (!loggedIn) {
        await loginToDiscord();
    }

    // Proceed to update the bot status if it has changed
    if (newStatus !== currentStatus) {
        try {
            await updateBotStatus(newStatus);
            currentStatus = newStatus;
            return res.status(200).send(`Bot status updated to ${newStatus}`);
        } catch (error) {
            console.error("Failed to update status:", error);
            return res.status(500).send("Failed to update bot status");
        }
    } else {
        return res
            .status(200)
            .send("Bot status is already set to " + newStatus);
    }
};

// Function to update bot status
async function updateBotStatus(status) {
    let activityMessage = "Available";
    if (status === "dnd") {
        activityMessage = "In Work Focus";
    } else if (status === "idle") {
        activityMessage = "Taking a break";
    } else if (status === "invisible") {
        activityMessage = "Invisible";
    }

    // Ensure client.user exists (i.e., the bot is logged in and ready)
    if (client.user) {
        await client.user.setPresence({
            status: status,
            activities: [{ name: activityMessage }],
        });
    } else {
        throw new Error("Bot is not ready");
    }
}

// Login to Discord once
async function loginToDiscord() {
    client.once("ready", () => {
        console.log(`Logged in as ${client.user.tag}`);
    });

    // Use the bot token from environment variables
    try {
        await client.login(process.env.DISCORD_BOT_TOKEN);
        loggedIn = true; // Mark as logged in
    } catch (error) {
        console.error("Bot failed to log in:", error);
        throw new Error("Failed to log in");
    }
}
