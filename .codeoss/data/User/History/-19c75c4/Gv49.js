// Muat variabel lingkungan dari file .env untuk pengujian lokal
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');

const app = express();
// Gunakan PORT dari .env atau default ke 8080
const PORT = process.env.PORT || 8080;

// Ambil Client ID dari environment variable
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Endpoint Verifikasi Login Google
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Token tidak ditemukan.' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    return res.status(200).json({
      message: 'Otentikasi berhasil',
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      }
    });
  } catch (error) {
    console.error('Verifikasi token gagal:', error.message);
    return res.status(401).json({ error: 'Token Google tidak valid.' });
  }
});

// Jalankan Server
app.listen(PORT, () => {
  console.log(`Server lokal berjalan di: http://localhost:${PORT}`);
});