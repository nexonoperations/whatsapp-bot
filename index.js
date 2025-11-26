import { Telegraf } from "telegraf";
import express from "express";

const app = express();

// Paste your **new token** here safely
const BOT_TOKEN = process.env.BOT_TOKEN; // We'll set this in Render's Environment Variables
const bot = new Telegraf(BOT_TOKEN);

// --- TELEGRAM BOT LOGIC ---

bot.start((ctx) => {
  ctx.reply(
    `👋 Welcome to Nexon Tutoring!\nType "menu" to see options.`
  );
});

bot.hears("hi", (ctx) => {
  ctx.reply("Hi! How can I help you today?");
});

bot.hears("menu", (ctx) => {
  ctx.reply(
    "📚 *Nexon Tutoring Menu*\n1) Book Lesson\n2) Pricing\n3) Subjects\n4) Contact Tutor",
    { parse_mode: "Markdown" }
  );
});

// You can add more commands like booking, subjects, or AI assistant here

// --- EXPRESS SERVER (keeps Render service alive) ---
app.get("/", (req, res) => res.send("Telegram Bot is running!"));

app.listen(process.env.PORT || 3000, () => {
  console.log("Express server running");
  bot.launch(); // Launch the bot
});

// Optional graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
