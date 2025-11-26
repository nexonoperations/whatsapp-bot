import makeWASocket, { useMultiFileAuthState } from "@adiwajshing/baileys";
import qrcode from "qrcode-terminal";
import express from "express";

const app = express();

// keeps Render service alive
app.get("/", (req, res) => {
  res.send("Nexon WhatsApp Bot is running!");
});

app.listen(3000, () => console.log("Web server started on port 3000"));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  const sock = makeWASocket({
    printQRInTerminal: false,
    auth: state,
  });

  // Show QR Code in terminal when deploying locally
  sock.ev.on("connection.update", ({ qr, connection }) => {
    if (qr) {
      console.log("Scan this QR to connect:");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "open") {
      console.log("WhatsApp bot connected!");
    }
    if (connection === "close") {
      console.log("Connection closed, reconnecting...");
      startBot();
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async (msg) => {
    const m = msg.messages[0];
    if (!m.message) return;

    const sender = m.key.remoteJid;
    const text = m.message.conversation || "";

    console.log("User:", sender, "said:", text);

    // SIMPLE BOT RESPONSES
    if (text.toLowerCase() === "hi") {
      await sock.sendMessage(sender, { text: "Hi! How can Nexon Tutoring help today?" });
    }

    if (text.toLowerCase() === "menu") {
      await sock.sendMessage(sender, {
        text: "📚 *Nexon Tutoring Menu*\n1) Book Lesson\n2) Pricing\n3) Subjects\n4) Help",
      });
    }
  });
}

startBot();
