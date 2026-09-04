const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { GoogleGenAI } = require("@google/genai");

admin.initializeApp();

// Access Secret Manager API key without exposing it to client-side assets
const geminiApiKey = defineSecret("GEMINI_API_KEY");

exports.analyzeAndSaveJournal = onRequest(
  { secrets: [geminiApiKey], cors: true },
  async (req, res) => {
    try {
      // 1. Verify User Authentication Token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: Missing token" });
      }
      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      const { text, mood } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Journal text is required." });
      }

      // 2. Initialize Gemini API using Secret Manager payload
      const ai = new GoogleGenAI({ apiKey: geminiApiKey.value() });
      const prompt = `Analyze this personal journal entry. Provide:
1. Mood/Sentiment breakdown.
2. Concise actionable insight or reflection advice.

Entry: "${text}"`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const aiInsight = response.text;

      // 3. Persist securely to Cloud Firestore under User's isolated collection
      const docRef = await admin.firestore()
        .collection("users")
        .doc(uid)
        .collection("journal_entries")
        .add({
          content: text,
          userMood: mood || "Unspecified",
          aiInsight: aiInsight,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return res.status(200).json({
        id: docRef.id,
        insight: aiInsight,
      });
    } catch (err) {
      console.error("Function error:", err);
      return res.status(500).json({ error: err.message });
    }
  }
);