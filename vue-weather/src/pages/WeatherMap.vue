<template>
  <div class="weather-map-page">
    <!-- Header Section -->
    <div class="header-section">
      <h1 class="page-title">
        <span class="title-emoji">🌍</span>
        <span class="title-text">Peta Cuaca Interaktif</span>
      </h1>
      <p class="page-subtitle">Klik pada peta untuk melihat informasi cuaca real-time</p>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Memuat data cuaca...</p>
    </div>

    <!-- Map Container -->
    <div class="map-container">
      <div id="map" class="leaflet-map"></div>
      
      <!-- Map Controls -->
      <div class="map-controls">
        <button @click="resetView" class="control-btn" title="Reset View">
          <span>🎯</span>
        </button>
        <button @click="toggleSatellite" class="control-btn" title="Toggle Satellite">
          <span>🛰️</span>
        </button>
      </div>
    </div>

    <!-- Weather Card -->
    <transition name="slide-up">
      <div v-if="weather && !loading" class="weather-card-wrapper">
        <div class="weather-card">
          <!-- Close Button -->
          <button @click="clearWeather" class="close-btn">
            <span>✕</span>
          </button>

          <!-- Location Header -->
          <div class="location-header">
            <div class="location-info">
              <h3 class="location-name">
                {{ weather.location.name }}
                <span class="region">, {{ weather.location.region }}</span>
              </h3>
              <p class="coordinates">
                📍 {{ formatCoordinates(weather.location.lat, weather.location.lon) }}
              </p>
              <p class="timezone">
                🕐 {{ weather.location.tz_id }} | {{ formatLocalTime(weather.location.localtime) }}
              </p>
            </div>
          </div>

          <!-- Main Weather Display -->
          <div class="main-weather">
            <div class="weather-icon-container">
              <img 
                :src="weather.current.condition.icon" 
                :alt="weather.current.condition.text" 
                class="weather-icon"
                @error="handleIconError"
              />
              <div class="weather-overlay">
                <span class="day-night-indicator">
                  {{ weather.current.is_day ? '☀️' : '🌙' }}
                </span>
              </div>
            </div>
            
            <div class="temp-info">
              <div class="temperature">{{ Math.round(weather.current.temp_c) }}°</div>
              <div class="condition">{{ weather.current.condition.text }}</div>
              <div class="feels-like">Terasa seperti {{ Math.round(weather.current.feelslike_c) }}°C</div>
            </div>
          </div>

          <!-- Weather Details Grid -->
          <div class="weather-details">
            <div class="detail-section">
              <h4 class="section-title">📊 Detail Cuaca</h4>
              <div class="details-grid">
                <div class="detail-item" v-for="item in weatherDetails" :key="item.key">
                  <span class="detail-icon">{{ item.icon }}</span>
                  <div class="detail-content">
                    <span class="detail-label">{{ item.label }}</span>
                    <span class="detail-value">{{ item.value }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Wind Information -->
            <div class="wind-section">
              <h4 class="section-title">💨 Informasi Angin</h4>
              <div class="wind-info">
                <div class="wind-speed">
                  <span class="wind-value">{{ weather.current.wind_kph }}</span>
                  <span class="wind-unit">km/h</span>
                </div>
                <div class="wind-direction">
                  <div class="wind-compass" :style="{ transform: `rotate(${weather.current.wind_degree}deg)` }">
                    <span class="wind-arrow">↑</span>
                  </div>
                  <span class="wind-dir-text">{{ weather.current.wind_dir }}</span>
                </div>
                <div class="wind-gust" v-if="weather.current.gust_kph > 0">
                  <span>Hembusan: {{ weather.current.gust_kph }} km/h</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Suggestions Section -->
          <div class="activity-suggestions">
            <h4 class="section-title">🎯 Saran Kegiatan Berdasarkan Cuaca</h4>
            <div class="activities-grid">
              <div 
                v-for="activity in activitySuggestions" 
                :key="activity.title"
                class="activity-card"
                :class="{ 'highlighted': activity.highlighted }"
              >
                <div class="activity-icon">{{ activity.icon }}</div>
                <div class="activity-content">
                  <h5 class="activity-title">{{ activity.title }}</h5>
                  <p class="activity-description">{{ activity.description }}</p>
                  <div class="activity-conditions">
                    <span class="condition-indicator" :class="activity.suitability">
                      {{ activity.suitabilityText }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Weather-based Tips -->
            <div class="weather-tips">
              <h5 class="tips-title">💡 Tips Berdasarkan Cuaca Saat Ini</h5>
              <div class="tips-list">
                <div 
                  v-for="tip in weatherTips" 
                  :key="tip.text"
                  class="tip-item"
                  :class="tip.type"
                >
                  <span class="tip-icon">{{ tip.icon }}</span>
                  <span class="tip-text">{{ tip.text }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Last Updated -->
          <div class="update-info">
            <span class="update-text">
              🕒 Diperbarui: {{ formatLastUpdated(weather.current.last_updated) }}
            </span>
          </div>
        </div>
      </div>
    </transition>

    <!-- Error Message -->
    <transition name="fade">
      <div v-if="error" class="error-message">
        <span class="error-icon">⚠️</span>
        <span>{{ error }}</span>
        <button @click="clearError" class="error-close">✕</button>
      </div>
    </transition>
  </div>
</template>

<script>
import L from 'leaflet'
import axios from 'axios'

export default {
  name: 'WeatherMap',
  data() {
    return {
      map: null,
      weather: null,
      currentMarker: null,
      loading: false,
      error: null,
      satelliteLayer: null,
      isSatelliteView: false,
      initialView: [-2.5, 118, 5] // Indonesia center
    }
  },
  computed: {
    weatherDetails() {
      if (!this.weather) return []
      
      const current = this.weather.current
      return [
        {
          key: 'humidity',
          icon: '💧',
          label: 'Kelembaban',
          value: `${current.humidity}%`
        },
        {
          key: 'pressure',
          icon: '📏',
          label: 'Tekanan',
          value: `${current.pressure_mb} mb`
        },
        {
          key: 'visibility',
          icon: '👁️',
          label: 'Jarak Pandang',
          value: `${current.vis_km} km`
        },
        {
          key: 'cloud',
          icon: '☁️',
          label: 'Tingkat Awan',
          value: `${current.cloud}%`
        },
        {
          key: 'uv',
          icon: '🌞',
          label: 'UV Index',
          value: current.uv
        },
        {
          key: 'dewpoint',
          icon: '🌡️',
          label: 'Titik Embun',
          value: current.dewpoint_c ? `${Math.round(current.dewpoint_c)}°C` : 'N/A'
        }
      ]
    },

    activitySuggestions() {
      if (!this.weather) return []
      
      const current = this.weather.current
      const temp = current.temp_c
      const condition = current.condition.text.toLowerCase()
      const windSpeed = current.wind_kph
      const humidity = current.humidity
      const isDay = current.is_day
      const uvIndex = current.uv

      const activities = [
        {
          title: 'Jogging/Lari Pagi',
          icon: '🏃‍♂️',
          description: 'Olahraga ringan di udara terbuka',
          suitability: this.getActivitySuitability('running', temp, condition, windSpeed, humidity, isDay),
          highlighted: false
        },
        {
          title: 'Bersepeda',
          icon: '🚴‍♂️',
          description: 'Berkeliling dengan sepeda',
          suitability: this.getActivitySuitability('cycling', temp, condition, windSpeed, humidity, isDay),
          highlighted: false
        },
        {
          title: 'Piknik/BBQ',
          icon: '🧺',
          description: 'Makan bersama di taman atau pantai',
          suitability: this.getActivitySuitability('picnic', temp, condition, windSpeed, humidity, isDay),
          highlighted: false
        },
        {
          title: 'Fotografi Outdoor',
          icon: '📸',
          description: 'Mengambil foto pemandangan',
          suitability: this.getActivitySuitability('photography', temp, condition, windSpeed, humidity, isDay),
          highlighted: false
        },
        {
          title: 'Berenang',
          icon: '🏊‍♂️',
          description: 'Aktivitas air di kolam atau pantai',
          suitability: this.getActivitySuitability('swimming', temp, condition, windSpeed, humidity, isDay),
          highlighted: false
        },
        {
          title: 'Shopping Mall',
          icon: '🛍️',
          description: 'Berbelanja di tempat tertutup',
          suitability: this.getActivitySuitability('indoor', temp, condition, windSpeed, humidity, isDay),
          highlighted: false
        },
        {
          title: 'Hiking/Trekking',
          icon: '🥾',
          description: 'Mendaki gunung atau bukit',  
          suitability: this.getActivitySuitability('hiking', temp, condition, windSpeed, humidity, isDay),
          highlighted: false
        },
        {
          title: 'Kafe/Restaurant',
          icon: '☕',
          description: 'Bersantai di kafe atau restoran',
          suitability: this.getActivitySuitability('cafe', temp, condition, windSpeed, humidity, isDay),
          highlighted: false
        }
      ]

      // Highlight best activities
      const suitabilityScores = activities.map(activity => {
        if (activity.suitability === 'excellent') return 3
        if (activity.suitability === 'good') return 2
        if (activity.suitability === 'fair') return 1
        return 0
      })

      const maxScore = Math.max(...suitabilityScores)
      activities.forEach((activity, index) => {
        if (suitabilityScores[index] === maxScore && maxScore >= 2) {
          activity.highlighted = true
        }
        activity.suitabilityText = this.getSuitabilityText(activity.suitability)
      })

      return activities
    },

    weatherTips() {
      if (!this.weather) return []
      
      const current = this.weather.current
      const temp = current.temp_c
      const condition = current.condition.text.toLowerCase()
      const humidity = current.humidity
      const uvIndex = current.uv
      const windSpeed = current.wind_kph

      const tips = []

      // Temperature-based tips
      if (temp > 32) {
        tips.push({
          icon: '🌡️',
          text: 'Cuaca sangat panas! Perbanyak minum air dan hindari aktivitas berat siang hari.',
          type: 'warning'
        })
      } else if (temp > 28) {
        tips.push({
          icon: '☀️',
          text: 'Cuaca panas, gunakan topi dan kacamata hitam jika beraktivitas di luar.',
          type: 'caution'
        })
      } else if (temp < 20) {
        tips.push({
          icon: '🧥',
          text: 'Cuaca sejuk, bawa jaket atau sweater untuk kenyamanan.',
          type: 'info'
        })
      }

      // Rain-based tips
      if (condition.includes('rain') || condition.includes('drizzle')) {
        tips.push({
          icon: '☔',
          text: 'Jangan lupa bawa payung atau jas hujan!',
          type: 'warning'
        })
      }

      // UV-based tips
      if (uvIndex > 7) {
        tips.push({
          icon: '🧴',
          text: 'UV Index tinggi! Gunakan sunscreen SPF 30+ dan hindari sinar matahari langsung.',
          type: 'warning'
        })
      }

      // Humidity-based tips
      if (humidity > 80) {
        tips.push({
          icon: '💨',
          text: 'Kelembaban tinggi, pilih pakaian yang ringan dan menyerap keringat.',
          type: 'info'
        })
      }

      // Wind-based tips
      if (windSpeed > 25) {
        tips.push({
          icon: '💨',
          text: 'Angin kencang! Hati-hati saat berkendara dan hindari aktivitas outdoor ekstrem.',
          type: 'caution'
        })
      }

      // Clear weather tips
      if (condition.includes('clear') || condition.includes('sunny')) {
        tips.push({
          icon: '🌞',
          text: 'Cuaca cerah! Waktu yang tepat untuk aktivitas outdoor.',
          type: 'success'
        })
      }

      return tips
    }
  },
  
  mounted() {
    this.initMap()
  },
  
  beforeUnmount() {
    if (this.map) {
      this.map.remove()
    }
  },
  
  methods: {
    getActivitySuitability(activityType, temp, condition, windSpeed, humidity, isDay) {
      const isRainy = condition.includes('rain') || condition.includes('drizzle') || condition.includes('storm')
      const isCloudy = condition.includes('cloud') || condition.includes('overcast')
      const isClear = condition.includes('clear') || condition.includes('sunny')

      switch (activityType) {
        case 'running':
          if (isRainy) return 'poor'
          if (temp > 32 || temp < 15) return 'fair'
          if (temp >= 20 && temp <= 28 && !isRainy) return 'excellent'
          return 'good'

        case 'cycling':
          if (isRainy || windSpeed > 25) return 'poor'
          if (temp > 30 || temp < 18) return 'fair'
          if (temp >= 22 && temp <= 28 && windSpeed < 15) return 'excellent'
          return 'good'

        case 'picnic':
          if (isRainy || windSpeed > 20) return 'poor'
          if (isClear && temp >= 24 && temp <= 30) return 'excellent'
          if (temp >= 20 && temp <= 32 && !isRainy) return 'good'
          return 'fair'

        case 'photography':
          if (isRainy && windSpeed > 20) return 'poor'
          if (isCloudy && !isRainy) return 'excellent' // Soft light
          if (isClear && (temp < 35)) return 'good'
          return 'fair'

        case 'swimming':
          if (isRainy) return 'poor'
          if (temp > 26 && isClear) return 'excellent'
          if (temp > 24) return 'good'
          if (temp > 20) return 'fair'
          return 'poor'

        case 'indoor':
          if (isRainy || temp > 35 || temp < 15) return 'excellent'
          if (temp > 30 || humidity > 85) return 'good'
          return 'fair'

        case 'hiking':
          if (isRainy || windSpeed > 30) return 'poor'
          if (temp >= 18 && temp <= 25 && !isRainy) return 'excellent'
          if (temp >= 15 && temp <= 30) return 'good'
          return 'fair'

        case 'cafe':
          if (isRainy || temp > 35) return 'excellent'
          if (isClear && temp >= 22 && temp <= 28) return 'good'
          return 'fair'

        default:
          return 'fair'
      }
    },

    getSuitabilityText(suitability) {
      switch (suitability) {
        case 'excellent': return 'Sangat Cocok'
        case 'good': return 'Cocok'
        case 'fair': return 'Cukup'
        case 'poor': return 'Tidak Disarankan'
        default: return 'Cukup'
      }
    },

    initMap() {
      // Initialize map
      this.map = L.map('map', {
        zoomControl: false
      }).setView([this.initialView[0], this.initialView[1]], this.initialView[2])

      // Add custom zoom control
      L.control.zoom({
        position: 'bottomright'
      }).addTo(this.map)

      // Default tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(this.map)

      // Satellite layer (prepare but don't add)
      this.satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18
      })

      // Map click event
      this.map.on('click', this.handleMapClick)
    },

    async handleMapClick(e) {
      const lat = e.latlng.lat
      const lon = e.latlng.lng
      
      this.loading = true
      this.error = null
      
      try {
        await this.fetchWeather(lat, lon)
      } catch (error) {
        this.handleWeatherError(error)
      } finally {
        this.loading = false
      }
    },

    async fetchWeather(lat, lon) {
      const apiKey = ''
      const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`

      try {
        const response = await axios.get(url, { timeout: 10000 })
        this.weather = response.data

        this.updateMapMarker(lat, lon, response.data)
        
      } catch (error) {
        throw new Error('Gagal memuat data cuaca. Silakan coba lagi.')
      }
    },

    updateMapMarker(lat, lon, weatherData) {
      // Remove existing marker
      if (this.currentMarker) {
        this.map.removeLayer(this.currentMarker)
      }

      // Create custom icon
      const customIcon = L.divIcon({
        html: `
          <div class="custom-marker">
            <div class="marker-temp">${Math.round(weatherData.current.temp_c)}°</div>
            <div class="marker-icon">
              <img src="${weatherData.current.condition.icon}" alt="Weather" />
            </div>
          </div>
        `,
        className: 'weather-marker',
        iconSize: [60, 60],
        iconAnchor: [30, 60]
      })

      // Add new marker
      this.currentMarker = L.marker([lat, lon], { icon: customIcon })
        .addTo(this.map)

      // Center map on marker
      this.map.setView([lat, lon], Math.max(this.map.getZoom(), 10), {
        animate: true,
        duration: 0.5
      })
    },

    resetView() {
      this.map.setView([this.initialView[0], this.initialView[1]], this.initialView[2], {
        animate: true,
        duration: 1
      })
    },

    toggleSatellite() {
      if (this.isSatelliteView) {
        this.map.removeLayer(this.satelliteLayer)
        this.isSatelliteView = false
      } else {
        this.map.addLayer(this.satelliteLayer)
        this.isSatelliteView = true
      }
    },

    clearWeather() {
      this.weather = null
      if (this.currentMarker) {
        this.map.removeLayer(this.currentMarker)
        this.currentMarker = null
      }
    },

    clearError() {
      this.error = null
    },

    handleWeatherError(error) {
      console.error('Weather fetch error:', error)
      this.error = error.message || 'Terjadi kesalahan saat memuat data cuaca'
    },

    handleIconError(event) {
      event.target.src = 'https://via.placeholder.com/64x64?text=Weather'
    },

    formatCoordinates(lat, lon) {
      const latDir = lat >= 0 ? 'N' : 'S'
      const lonDir = lon >= 0 ? 'E' : 'W'
      return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`
    },

    formatLocalTime(localtime) {
      try {
        const date = new Date(localtime)
        return date.toLocaleString('id-ID', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return localtime
      }
    },

    formatLastUpdated(lastUpdated) {
      try {
        const date = new Date(lastUpdated)
        const now = new Date()
        const diffMinutes = Math.floor((now - date) / 60000)
        
        if (diffMinutes < 1) return 'Baru saja'
        if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`
        
        const diffHours = Math.floor(diffMinutes / 60)
        if (diffHours < 24) return `${diffHours} jam yang lalu`
        
        return date.toLocaleString('id-ID')
      } catch {
        return lastUpdated
      }
    }
  }
}
</script>

<style scoped>
/* Global Styles */
.weather-map-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(102, 138, 222, 1) 0%, #519be4ff 100%);
  font-family: 'Inter', 'Segoe UI', sans-serif;
  padding: 1rem;
  position: relative;
  border-radius:15px;
}

/* Header Section */
.header-section {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.title-emoji {
  font-size: 3rem;
  animation: bounce 2s infinite;
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  color: white;
  font-size: 1.1rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

/* Map Container */
.map-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto 2rem auto;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.leaflet-map {
  height: 500px;
  width: 100%;
}

.map-controls {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1000;
}

.control-btn {
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Weather Card */
.weather-card-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.weather-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 35px;
  height: 35px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 0, 0, 0.1);
  color: #ff4757;
  transform: scale(1.1);
}

/* Location Header */
.location-header {
  text-align: center;
  margin-bottom: 2rem;
}

.location-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.region {
  font-weight: 400;
  color: #7f8c8d;
}

.coordinates, .timezone {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0.25rem 0;
}

/* Main Weather Display */
.main-weather {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
}

.weather-icon-container {
  position: relative;
}

.weather-icon {
  width: 120px;
  height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.weather-overlay {
  position: absolute;
  top: -10px;
  right: -10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.temp-info {
  text-align: center;
}

.temperature {
  font-size: 4rem;
  font-weight: 700;
  color: #2980b9;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.condition {
  font-size: 1.3rem;
  font-weight: 500;
  color: #34495e;
  margin-bottom: 0.5rem;
}

.feels-like {
  font-size: 1rem;
  color: #7f8c8d;
}

/* Weather Details */
.weather-details {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.detail-section, .wind-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: 10px;
  transition: transform 0.2s ease;
}

.detail-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.detail-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.detail-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

/* Wind Section */
.wind-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.wind-speed {
  text-align: center;
}

.wind-value {
  font-size: 2rem;
  font-weight: 700;
  color: #3498db;
}

.wind-unit {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-left: 0.25rem;
}

.wind-direction {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.wind-compass {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.wind-dir-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
}

.wind-gust {
  font-size: 0.85rem;
  color: #7f8c8d;
}

/* Activity Suggestions */
.activity-suggestions {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.activity-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.activity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.activity-card.highlighted {
  border-color: #27ae60;
  background: linear-gradient(135deg, #d5f4e6 0%, #fefefe 100%);
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.2);
}

.activity-card.highlighted::before {
  content: '⭐';
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 1.2rem;
  animation: sparkle 2s infinite;
}

.activity-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.activity-description {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.activity-conditions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.condition-indicator {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.condition-indicator.excellent {
  background: #d5f4e6;
  color: #27ae60;
}

.condition-indicator.good {
  background: #dbeafe;
  color: #3b82f6;
}

.condition-indicator.fair {
  background: #fef3c7;
  color: #d97706;
}

.condition-indicator.poor {
  background: #fee2e2;
  color: #dc2626;
}

/* Weather Tips */
.weather-tips {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.tips-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid;
}

.tip-item.warning {
  background: #fef2f2;
  border-color: #dc2626;
}

.tip-item.caution {
  background: #fffbeb;
  border-color: #d97706;
}

.tip-item.info {
  background: #eff6ff;
  border-color: #3b82f6;
}

.tip-item.success {
  background: #f0fdf4;
  border-color: #16a34a;
}

.tip-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.tip-text {
  font-size: 0.9rem;
  line-height: 1.4;
  color: #374151;
}

/* Update Info */
.update-info {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
}

.update-text {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-style: italic;
}

/* Error Message */
.error-message {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: #ff4757;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 2000;
  max-width: 350px;
}

.error-icon {
  font-size: 1.2rem;
}

.error-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  margin-left: auto;
}

/* Custom Map Marker */
:global(.custom-marker) {
  background: white;
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  text-align: center;
  border: 2px solid #3498db;
}

:global(.marker-temp) {
  font-weight: 700;
  color: #2980b9;
  font-size: 0.9rem;
}

:global(.marker-icon img) {
  width: 32px;
  height: 32px;
}

/* Animations */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
}

/* Transitions */
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.5s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .weather-map-page {
    padding: 0.5rem;
  }

  .page-title {
    font-size: 2rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .title-emoji {
    font-size: 2.5rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .leaflet-map {
    height: 400px;
  }

  .weather-card {
    padding: 1.5rem;
    margin: 0.5rem;
  }

  .main-weather {
    flex-direction: column;
    gap: 1rem;
  }

  .weather-icon {
    width: 80px;
    height: 80px;
  }

  .temperature {
    font-size: 3rem;
  }

  .weather-details {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail-item {
    padding: 0.75rem;
  }

  .activities-grid {
    grid-template-columns: 1fr;
  }

  .activity-card {
    padding: 1rem;
  }

  .activity-icon {
    font-size: 2rem;
  }

  .error-message {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .weather-card {
    padding: 1rem;
  }

  .location-name {
    font-size: 1.4rem;
  }

  .temperature {
    font-size: 2.5rem;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .wind-value {
    font-size: 1.5rem;
  }

  .wind-compass {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .activity-suggestions {
    padding: 1.5rem;
  }

  .activity-card {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .activity-icon {
    font-size: 2.5rem;
  }
}
</style>