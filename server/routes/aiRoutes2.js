const express = require("express");
const router = express.Router();
const axios = require("axios");
const pdfParse = require("pdf-parse");
const multer = require("multer");
const { appendBezierCurve } = require("pdf-lib");
const Interaction = require("../models/Interaction");
const mongoose = require("mongoose");

const COHERE_API_URL = "https://api.cohere.ai/v1/generate";
const API_KEY = "7Dbjk8G3UCx4QSkXxuApvNpPH4AFKaW1aOy743z3"; // Store API key securely

router.post("/api/answer", async (req, res) => {
  try {
    const { context, question } = req.body;
    const prompt = `Given the following paragraph:\n"${context}"\nAnswer the question: "${question}"`;

    const response = await axios.post(
      COHERE_API_URL,
      {
        model: "command", // Use the best Cohere model
        prompt: prompt,
        max_tokens: 100,
        temperature: 0.5, // Controls randomness
      },
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );

    res.json({ answer: response.data.generations[0].text.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching answer from Cohere" });
  }
});

// POST /api/interactions
router.post("/api/interactions", async (req, res) => {
  const { userId, question, answer } = req.body;

  console.log(userId, question, answer);

  if (!userId || !question || !answer) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newInteraction = new Interaction({ userId, question, answer });
    await newInteraction.save();
    res.status(201).json({ message: "Interaction saved successfully" });
  } catch (error) {
    console.error("Error saving interaction:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all interactions by userId
router.get("/api/interactions/:userId", async (req, res) => {
  console.log(req.params.userId);
  const userId = req.params.userId;

  try {
    const interactions = await Interaction.find({ userId }).sort({
      timestamp: -1,
    });
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch interactions", error });
  }
});

router.get("/api/interactions", async (req, res) => {
  try {
    const interactions = await Interaction.find()
      .populate("userId", "username email")
      .sort({
        timestamp: -1,
      });
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch interactions", error });
  }
});

module.exports = router;
