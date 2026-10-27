const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const LETTER_PASSWORD = process.env.LETTER_PASSWORD || "change-this-password";
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const LETTER_FILE = path.join(DATA_DIR, "letter.json");
const EXPERIENCE_FILE = path.join(DATA_DIR, "experience.json");
app.use(express.json({ limit: "25mb" }));
app.use(express.static(path.join(__dirname, "public")));
const validTokens = new Set();
function readJson(file, fallback) { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; } }
function writeJson(file, data) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8"); }
function readLetter() { return readJson(LETTER_FILE, { text: "My love,\n\nWrite something here and it will appear for everyone who unlocks this letter. ♡", updatedAt: new Date().toISOString() }); }
function readExperience() { return readJson(EXPERIENCE_FILE, { memories: [], reasons: ["You make ordinary days feel special. ♡", "Your smile can change my whole day.", "I can be myself with you.", "You make the little things matter.", "You are one of my favorite parts of life."], songUrl: "", countdownDate: "", letters: { me: "", you: "" }, messages: [], updatedAt: new Date().toISOString() }); }
function safeEqual(a, b) { const aa = Buffer.from(String(a)); const bb = Buffer.from(String(b)); return aa.length === bb.length && crypto.timingSafeEqual(aa, bb); }
function requireUnlocked(req, res, next) { const token = req.get("x-letter-token") || ""; if (!token || !validTokens.has(token)) return res.status(401).json({ error: "Please unlock the website first." }); next(); }
app.post("/api/unlock", (req, res) => {
  const password = req.body && req.body.password;
  if (!safeEqual(password || "", LETTER_PASSWORD)) return res.status(401).json({ error: "That password isn't quite right. Try again, my love. ♡" });
  const token = crypto.randomBytes(32).toString("hex"); validTokens.add(token);
  if (validTokens.size > 5000) validTokens.clear();
  res.json({ token });
});
app.get("/api/letter", requireUnlocked, (req, res) => { res.set("Cache-Control", "no-store"); res.json(readLetter()); });
app.put("/api/letter", requireUnlocked, (req, res) => {
  const text = String((req.body && req.body.text) || "");
  if (text.length > 12000) return res.status(413).json({ error: "Please keep each letter under 12,000 characters." });
  const data = { text, updatedAt: new Date().toISOString() };
  try { writeJson(LETTER_FILE, data); res.json({ ok: true, ...data }); }
  catch (err) { console.error(err); res.status(500).json({ error: "The letter could not be saved. Check server storage." }); }
});
app.get("/api/experience", requireUnlocked, (req, res) => { res.set("Cache-Control", "no-store"); res.json(readExperience()); });
app.put("/api/experience", requireUnlocked, (req, res) => {
  const incoming = req.body || {};
  let data = { ...readExperience(), updatedAt: new Date().toISOString() };
  if (Array.isArray(incoming.memories)) {
    if (incoming.memories.length > 30) return res.status(413).json({ error: "Keep up to 30 memories in the gallery." });
    const rawMemories = incoming.memories.filter(x => x && typeof x.caption === "string" && typeof x.image === "string");
    if (rawMemories.some(x => !x.image.startsWith("data:image/"))) return res.status(400).json({ error: "Gallery entries must be image files." });
    if (rawMemories.some(x => x.image.length > 700_000)) return res.status(413).json({ error: "One of the gallery photos is too large after compression. Please try a smaller image." });
    const memories = rawMemories.map(x => ({ caption: x.caption.slice(0,160), image: x.image }));
    data.memories = memories;
  }
  if (typeof incoming.songUrl === "string") { const url = incoming.songUrl.trim(); if (url && !/^https:\/\//i.test(url)) return res.status(400).json({ error: "Please use a secure https:// song URL." }); data.songUrl = url.slice(0,1000); }
  if (typeof incoming.countdownDate === "string") data.countdownDate = /^\d{4}-\d{2}-\d{2}$/.test(incoming.countdownDate) ? incoming.countdownDate : "";
  if (incoming.letters && typeof incoming.letters === "object") {
    data.letters = { me: String(incoming.letters.me || "").slice(0,12000), you: String(incoming.letters.you || "").slice(0,12000) };
  }
  if (Array.isArray(incoming.messages)) {
    data.messages = incoming.messages.slice(-100).filter(m => m && typeof m.text === "string").map(m => ({ id: String(m.id || crypto.randomUUID()).slice(0,80), author: m.author === "you" ? "you" : "me", text: m.text.slice(0,1000), createdAt: String(m.createdAt || new Date().toISOString()).slice(0,50) }));
  }
  try { writeJson(EXPERIENCE_FILE, data); res.json({ ok: true, ...data }); }
  catch (err) { console.error(err); res.status(500).json({ error: "Could not save your shared memories. Check server storage." }); }
});
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`Love letter website running on port ${PORT}`));
