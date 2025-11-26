import { Telegraf, Markup } from "telegraf";
import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

// --- Telegram Bot Token from Render Environment ---
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("Error: BOT_TOKEN is not set!");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// --- AI Answer Function (using free GPT-4o-mini endpoint) ---
async function getAIResponse(question) {
  try {
    // Replace with your free AI endpoint or API key
    const response = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: "gpt-4o-mini",
        input: question,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.output[0].content[0].text || "Sorry, I don't know the answer yet.";
  } catch (error) {
    console.error("AI Error:", error.message);
    return "Sorry, I couldn't get an answer at the moment.";
  }
}

// --- Menu Keyboard ---
const mainMenu = Markup.keyboard([
  ["Book Lesson", "Pricing"],
  ["Subjects", "Ask AI"]
]).resize();

// --- Bot Commands ---
bot.start((ctx) => {
  ctx.reply(
    "👋 Welcome to Nexon Tutoring!\nUse the menu below to navigate.",
    mainMenu
  );
});

bot.hears("hi", (ctx) => ctx.reply("Hi! How can I help you today?", mainMenu));

bot.hears("menu", (ctx) => ctx.reply("Main Menu:", mainMenu));

bot.hears("Book Lesson", (ctx) => {
  ctx.reply("📅 Please type your preferred date and time for a lesson.");
});

bot.hears("Pricing", (ctx) => {
  ctx.reply("💰 Tutoring Pricing:\n- 1hr session: $10\n- 5hr package: $45");
});

bot.hears("Subjects", (ctx) => {
  ctx.reply("📚 Subjects we cover:\n- Math\n- Science\n- Programming\n- English");
});

bot.hears("Ask AI", async (ctx) => {
  ctx.reply("🤖 Please type your question, and I will try to answer!");
  bot.on("text", async (msgCtx) => {
    if (["hi","menu","Book Lesson","Pricing","Subjects","Ask AI"].includes(msgCtx.message.text)) return;
    const answer = await getAIResponse(msgCtx.message.text);
    msgCtx.reply(answer);
  });
});

// --- Express Server ---
app.get("/", (req, res) => res.send("Telegram Nexon Tutoring Bot is running!"));
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  bot.launch();
});

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));


