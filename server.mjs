import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.get("/api/random-word", async (req, res) => {
  try {
    const response = await fetch(
      "https://wordsapiv1.p.rapidapi.com/words/?random=true&letters=5&frequencyMin=3",
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host": "wordsapiv1.p.rapidapi.com",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.json({word: data.word});
  } catch (error) {
    console.error("Error fetching random word:", error);
    res.status(500).json({error: "Failed to fetch random word"});
  }
});

// Validate word endpoint
app.get("/api/validate-word/:word", async (req, res) => {
  try {
    const {word} = req.params;
    const response = await fetch(
      `https://wordsapiv1.p.rapidapi.com/words/${word.toLowerCase()}`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host": "wordsapiv1.p.rapidapi.com",
        },
      }
    );

    if (response.status === 404) {
      res.json({isValid: false});
    } else if (response.ok) {
      res.json({isValid: true});
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error validating word:", error);
    res.status(500).json({error: "Failed to validate word"});
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
