import makeWASocket, { useMultiFileAuthState } from "@adiwajshing/baileys";
import express from "express";

const app = express();
app.get("/", (req, res) => res.send("WhatsApp bot is running!"));
app.listen(3000, () => console.log("Web server running on port 3000"));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  const sock = makeWASocket({ auth: state });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { qr, connection } = update;
    if (qr) {
      console.log("Scan this QR:");
      console.log(qr);
    }
    if (connection === "open") {
      console.log("Bot is connected!");
    }
  });

  sock.ev.on("messages.upsert", async (msg) => {
    const m = msg.messages[0];
    if (!m.message) return;

    const text = m.message.conversation || "";
    const from = m.key.remoteJid;

    if (text.toLowerCase() === "hi") {
      await sock.sendMessage(from, { text: "Hello! How can I help you?" });
    }

    if (text.toLowerCase() === "menu") {
      await sock.sendMessage(from, {
        text: "📚 Nexon Tutoring Menu:\n1) Book lesson\n2) Pricing\n3) Help",
      });
    }
  });
}

startBot();
