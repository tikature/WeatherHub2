const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());

// Endpoint cuaca
app.get('/api/weather', async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;

    console.log("API Key:", apiKey);
    console.log("Lokasi:", lat, lon);

    try {
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7&aqi=yes&alerts=yes&lang=id`;
        console.log("URL Request:", url);

        const response = await fetch(url);
        const data = await response.json();

        console.log("Response:", data);

        res.json(data);
    } catch (err) {
        console.error("Fetch gagal:", err);
        res.status(500).json({ error: 'Gagal mengambil data cuaca' });
    }
});


// Endpoint lokasi
app.get('/api/reverse-geocode', async (req, res) => {
    const { lat, lon } = req.query;
    const key = process.env.LOCATIONIQ_KEY;

    try {
        const url = `https://us1.locationiq.com/v1/reverse?key=${key}&lat=${lat}&lon=${lon}&format=json`;
        const response = await fetch(url);
        const data = await response.json();

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengambil data lokasi' });
    }
});
app.get('/weather', async (req, res) => {
    const city = req.query.city;
    const apiKey = process.env.WEATHER_API_KEY;

    if (!city) {
        return res.status(400).json({ error: "Nama kota tidak ditemukan." });
    }

    try {
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=7&aqi=yes&alerts=yes&lang=id`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        res.json(data);
    } catch (err) {
        console.error("Error WeatherAPI:", err);
        res.status(500).json({ error: "Gagal mengambil data cuaca dari API." });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
