const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const JavaScriptObfuscator = require("javascript-obfuscator");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// Slash command setup
const commands = [
    new SlashCommandBuilder()
        .setName("obfuscate")
        .setDescription("Obfuscate JavaScript code")
        .addStringOption(option =>
            option.setName("code")
                .setDescription("Paste JS code")
                .setRequired(true)
        )
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

// Register slash commands
(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );
        console.log("Slash commands registered");
    } catch (err) {
        console.log(err);
    }
})();

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Command handler
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "obfuscate") {

        const code = interaction.options.getString("code");

        await interaction.reply("🔄 Obfuscating...");

        try {
            const obfuscated = JavaScriptObfuscator.obfuscate(code, {
                compact: true,
                controlFlowFlattening: true,
                stringArray: true,
                stringArrayEncoding: ["base64"],
                renameGlobals: true
            }).getObfuscatedCode();

            const file = new AttachmentBuilder(
                Buffer.from(obfuscated),
                { name: "obfuscated.js" }
            );

            await interaction.followUp({
                content: "✅ Done!",
                files: [file]
            });

        } catch (err) {
            await interaction.followUp("❌ Error: " + err.message);
        }
    }
});

client.login(TOKEN);
