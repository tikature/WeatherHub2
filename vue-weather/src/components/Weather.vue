<template>
  <div class="weather-container">
    <div class="search-container">
      <div class="search-wrapper">
        <input 
          v-model="city" 
          @keyup.enter="getWeather" 
          placeholder="Masukkan nama kota..." 
          class="search-input"
          :disabled="loading"
        />
        <button 
          @click="getWeather" 
          class="search-button"
          :disabled="loading"
        >
          <span v-if="!loading">🔍</span>
          <span v-else class="loading-spinner">⭕</span>
        </button>
      </div>
    </div>

    <transition name="fade-up" mode="out-in">
      <div v-if="weatherData" class="weather-card" :key="weatherData.location.name">
        <div class="location-info">
          <h2 class="location-name">
            📍 {{ weatherData.location.name }}, {{ weatherData.location.country }}
          </h2>
          <p class="local-time">
            🕒 {{ formatLocalTime(weatherData.location.localtime) }}
          </p>
        </div>

        <div class="weather-main">
          <div class="weather-icon-container">
            <img 
              :src="weatherData.current.condition.icon" 
              :alt="weatherData.current.condition.text"
              class="weather-icon"
            />
          </div>
          <div class="temperature-info">
            <div class="temperature">{{ weatherData.current.temp_c }}°C</div>
            <div class="condition">{{ weatherData.current.condition.text }}</div>
          </div>
        </div>

        <div class="weather-details">
          <div class="detail-item" v-for="(item, i) in details" :key="i">
            <div class="detail-icon">{{ item.icon }}</div>
            <div class="detail-info">
              <div class="detail-label">{{ item.label }}</div>
              <div class="detail-value">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="showWelcome" class="welcome-message">
        <div class="welcome-icon">🌍</div>
        <h3>Selamat Datang!</h3>
        <p>Masukkan nama kota untuk melihat informasi cuaca terkini</p>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="error" class="error-message">
        <div class="error-icon">❌</div>
        <p>{{ error }}</p>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'WeatherApp',
  data() {
    return {
      city: '',
      weatherData: null,
      loading: false,
      error: '',
      showWelcome: true
    }
  },
  computed: {
    details() {
        if (!this.weatherData) return []
        return [
            { icon: '💧', label: 'Kelembaban', value: `${this.weatherData.current.humidity}%` },
            { icon: '🌬️', label: 'Angin', value: `${this.weatherData.current.wind_kph} km/h (${this.weatherData.current.wind_dir})` },
            { icon: '👁️', label: 'Jarak Pandang', value: `${this.weatherData.current.vis_km} km` },
            { icon: '🌡️', label: 'Terasa Seperti', value: `${this.weatherData.current.feelslike_c}°C` },
            { icon: '📈', label: 'Tekanan Udara', value: `${this.weatherData.current.pressure_mb} mb` },
            { icon: '🔆', label: 'UV Index', value: `${this.weatherData.current.uv}` },
            { icon: '☁️', label: 'Tingkat Awan', value: `${this.weatherData.current.cloud}%` },
            { icon: '💨', label: 'Hembusan Angin', value: `${this.weatherData.current.gust_kph} km/h` }
        ]

    }
  },
  methods: {
    async getWeather() {
      if (!this.city.trim()) {
        this.error = 'Nama kota wajib diisi.'
        return
      }

      this.loading = true
      this.error = ''
      this.weatherData = null
      this.showWelcome = false

      try {
        const response = await axios.get('http://localhost:3001/weather', {
          params: { city: this.city }
        })
        this.weatherData = response.data
      } catch (err) {
        this.error = 'Gagal mengambil data cuaca.'
      } finally {
        this.loading = false
      }
    },
    formatLocalTime(localtime) {
      const [date, time] = localtime.split(' ')
      const [year, month, day] = date.split('-')
      const bulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ]
      return `${day} ${bulan[+month - 1]} ${year}, ${time} WIB`
    }
  }
}
</script>


<style scoped>
.weather-container {
  padding: 2rem 1.5rem;
  z-index: 1;
  position: relative;
}

.search-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.search-wrapper {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  max-width: 500px;
}

.search-input {
  flex-grow: 1;
  padding: 0.8rem 1rem;
  border: 2px solid #4a90e2;
  border-radius: 10px;
  font-size: 1rem;
  outline: none;
}

.search-button {
  background-color: #76aceaff;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0 1rem;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.2s ease;
}

.search-button:hover {
  background-color: #357ab7;
}

.weather-card {
  background-color: white;
  border-radius: 1.5rem;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.location-info {
  text-align: center;
  margin-bottom: 1rem;
}

.location-name {
  margin: 0;
  font-size: 1.5rem;
}

.local-time {
  color: #777;
  font-size: 0.9rem;
}

.weather-main {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  gap: 2rem;
}

.weather-icon {
  width: 100px;
}

.temperature-info {
  font-size: 1.8rem;
  text-align: center;
}

.condition {
  font-size: 1rem;
  color: #555;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.detail-item {
  background-color: #f0f4fa;
  padding: 1rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.detail-icon {
  font-size: 1.5rem;
}

.detail-label {
  font-size: 0.85rem;
  color: #555;
}

.detail-value {
  font-weight: bold;
}

.welcome-message, .error-message {
  text-align: center;
  padding: 2rem;
  color: #333;
}

.welcome-icon {
  font-size: 3rem;
}

.error-message {
  background-color: #ffe0e0;
  border: 1px solid #ffb3b3;
  border-radius: 1rem;
  max-width: 500px;
  margin: 0 auto;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.4s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.loading-spinner {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .search-wrapper {
    flex-direction: column;
  }

  .search-button {
    width: 100%;
    padding: 0.8rem;
  }

  .weather-main {
    flex-direction: column;
    gap: 1rem;
  }

  .weather-icon {
    width: 80px;
  }

  .temperature-info {
    font-size: 1.5rem;
  }

  .weather-card {
    padding: 1.5rem 1rem;
  }

  .weather-details {
    grid-template-columns: 1fr;
  }

  .detail-item {
    justify-content: flex-start;
  }
}
</style>
