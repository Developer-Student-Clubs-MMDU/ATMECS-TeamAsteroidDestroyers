const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");
require("dotenv").config(); // For loading environment variables from a .env file

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: "http://localhost:5173", // Allow your frontend origin
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Allow credentials
};
// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors(corsOptions));
// Initialize the Google Generative AI with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY);

// Configure multer for handling form-data (including file uploads)
const upload = multer();

// Converts file information to a GoogleGenerativeAI.Part object
function fileToGenerativePart(file) {
  return {
    inlineData: {
      data: file.buffer.toString("base64"),
      mimeType: file.mimetype,
    },
  };
}
// POST endpoint to read a file (image or PDF)
app.post("/read-file", upload.single("file"), async (req, res) => {
  try {
    const { question } = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "File is required" });
    }

    let prompt = `You are an expert business consultant. Analyze the provided business data and answer the user's question with actionable insights. User's Question: ${question} Provide a detailed answer, citing the relevant data points from the context if applicable.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const filePart = fileToGenerativePart(file);
    const result = await model.generateContent([prompt, filePart]);

    const response = await result.response;
    const text = await response.text();

    res.json({ generatedText: text });
  } catch (error) {
    console.error("Error generating content:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating content" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
