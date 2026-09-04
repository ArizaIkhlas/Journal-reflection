const express = require('express');
const cors = require('cors');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const secretClient = new SecretManagerServiceClient();

// Retrieves the latest API Key version from Google Cloud Secret Manager
async function getGeminiApiKey() {
  const projectId = process.env.GCP_PROJECT;
  const name = `projects/${projectId}/secrets/GEMINI_API_KEY/versions/latest`;
  const [version] = await secretClient.accessSecretVersion({ name });
  return version.payload.data.toString('utf8');
}

// Endpoint to receive journal text and request Gemini AI reflection
app.post('/api/journal-ai', async (req, res) => {
  try {
    const { journalText } = req.body;
    if (!journalText) {
      return res.status(400).json({ error: 'Journal text cannot be empty.' });
    }

    const apiKey = await getGeminiApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Provide a concise, empathetic reflection and mood analysis for this journal entry:\n\n"${journalText}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.json({ aiReflection: response.text() });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to generate AI reflection.' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});