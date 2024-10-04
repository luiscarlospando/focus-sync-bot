require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let currentStatus = "online"; // Tracks the bot's current status

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
    const newStatus = req.query.status || "online"; // Default to 'online' if no status provided

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

    await client.user.setPresence({
        status: status,
        activities: [{ name: activityMessage }],
    });
}

// Login to Discord with bot token
client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Use the bot token from environment variables
client.login(process.env.DISCORD_BOT_TOKEN);
