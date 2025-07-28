<template>
  <div class="weather-map-page">
    <h2 class="page-title">🌍 Klik pada peta untuk melihat cuaca</h2>

    <div id="map" class="leaflet-map"></div>

    <transition name="fade">
      <div v-if="weather" class="weather-card-wrapper">
        <div class="weather-card">
          <div class="location">
            <h3>{{ weather.location.name }}, {{ weather.location.region }}</h3>
            <p class="coordinates">📍 Lat: {{ weather.location.lat }}, Lon: {{ weather.location.lon }}</p>
          </div>

          <div class="current-temp-condition">
            <img :src="weather.current.condition.icon" :alt="weather.current.condition.text" class="weather-icon" />
            <div>
              <h4 class="temperature">{{ weather.current.temp_c }}°C</h4>
              <p class="condition">{{ weather.current.condition.text }}</p>
            </div>
          </div>

          <div class="weather-info-grid">
            <div class="weather-item">
              <span>💧</span>
              <p><strong>Kelembaban</strong><br>{{ weather.current.humidity }}%</p>
            </div>
            <div class="weather-item">
              <span>🌡️</span>
              <p><strong>Terasa Seperti</strong><br>{{ weather.current.feelslike_c }}°C</p>
            </div>
            <div class="weather-item">
              <span>📏</span>
              <p><strong>Tekanan</strong><br>{{ weather.current.pressure_mb }} mb</p>
            </div>
            <div class="weather-item">
              <span>💨</span>
              <p><strong>Angin</strong><br>{{ weather.current.wind_kph }} km/h</p>
            </div>
            <div class="weather-item">
              <span>🌬️</span>
              <p><strong>Hembusan</strong><br>{{ weather.current.gust_kph }} km/h</p>
            </div>
            <div class="weather-item">
              <span>🌞</span>
              <p><strong>UV Index</strong><br>{{ weather.current.uv }}</p>
            </div>
            <div class="weather-item">
              <span>👁️</span>
              <p><strong>Jarak Pandang</strong><br>{{ weather.current.vis_km }} km</p>
            </div>
            <div class="weather-item">
              <span>☁️</span>
              <p><strong>Tingkat Awan</strong><br>{{ weather.current.cloud }}%</p>
            </div>
          </div>

          <p class="last-updated">🕒 Updated: {{ weather.current.last_updated }}</p>
          <p class="day-status">
            {{ weather.current.is_day ? '🌤️ Daytime' : '🌙 Nighttime' }}
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import L from 'leaflet'
import axios from 'axios'

export default {
  name: 'WeatherByMap',
  data() {
    return {
      map: null,
      weather: null,
      currentMarker: null
    }
  },
  mounted() {
    this.initMap()
  },
  methods: {
    initMap() {
      this.map = L.map('map').setView([-2.5, 118], 5)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map)

      this.map.on('click', this.fetchWeather)
    },
    async fetchWeather(e) {
      const lat = e.latlng.lat
      const lon = e.latlng.lng
      const apiKey = ''
      const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`

      try {
        const res = await axios.get(url)
        this.weather = res.data

        if (this.currentMarker) {
          this.map.removeLayer(this.currentMarker)
        }

        this.currentMarker = L.marker([lat, lon])
          .addTo(this.map)
          .bindPopup(`${res.data.location.name}: ${res.data.current.temp_c}°C, ${res.data.current.condition.text}`)
          .openPopup()

        this.map.panTo([lat, lon])
      } catch (error) {
        console.error('Gagal memuat cuaca:', error)
      }
    }
  }
}
</script>

<style scoped>
.weather-map-page {
  padding: 2rem;
  background: #f9f9f9;
  font-family: 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 15px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
}

.leaflet-map {
  height: 500px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  margin-bottom: 2rem;
  max-width: 1000px;
}

.weather-card-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.weather-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  max-width: 700px;
  width: 100%;
  animation: fadeIn 0.4s ease;
}

.location h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: bold;
  color: #34495e;
  text-align: center;
}

.coordinates {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 1rem;
  text-align: center;
}

.current-temp-condition {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
}

.weather-icon {
  width: 90px;
  height: 90px;
  object-fit: contain;
}

.temperature {
  font-size: 2.2rem;
  font-weight: bold;
  color: #2980b9;
  margin-bottom: 0.3rem;
}

.condition {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.weather-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.weather-item {
  background-color: #f4f6f8;
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  font-size: 0.95rem;
  transition: transform 0.2s ease;
}

.weather-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.weather-item span {
  font-size: 1.8rem;
  display: block;
  margin-bottom: 0.3rem;
}

.last-updated {
  margin-top: 1rem;
  font-style: italic;
  color: #888;
  text-align: center;
}

.day-status {
  margin-top: 0.3rem;
  font-weight: bold;
  color: #444;
  text-align: center;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* 🔄 RESPONSIF UNTUK MOBILE */
@media (max-width: 600px) {
  .weather-map-page {
    padding: 1rem;
  }

  .weather-card {
    padding: 1rem;
  }

  .current-temp-condition {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .temperature {
    font-size: 1.8rem;
  }

  .weather-info-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .weather-item {
    font-size: 0.9rem;
    padding: 0.75rem;
  }

  .weather-item p {
    overflow-wrap: break-word;
    word-break: break-word;
  }
}
</style>
