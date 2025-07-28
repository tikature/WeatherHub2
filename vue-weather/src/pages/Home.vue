<template>
  <div class="home">
    <!-- Current Weather Section -->
    <div class="weather-section current-weather">
      <div class="section-header">
        <h2 class="section-title">
          <span class="weather-emoji">🌤️</span>
          Cuaca Saat Ini
        </h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Memuat data cuaca...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <p>{{ error }}</p>
      </div>

      <!-- Main Weather Display -->
      <div v-else-if="weather" class="weather-content">
        <!-- Location and Time -->
        <div class="location-time">
          <h3 class="location-name">
          <span class="location-icon">📍</span>
          {{ cityName }}, {{ weather.location.country }}
        </h3>
          <p class="local-time">{{ formatDateTime(weather.location.localtime) }}</p>
        </div>

        <!-- Main Weather Card -->
        <div class="main-weather-card">
          <div class="weather-visual">
            <div class="weather-icon-container">
              <img :src="weather.current.condition.icon" :alt="weather.current.condition.text" class="weather-icon" />
              <div class="weather-animation" :class="getWeatherAnimation(weather.current.condition.text)"></div>
            </div>
          </div>
          
          <div class="weather-info">
            <div class="temperature-display">
              <span class="current-temp">{{ Math.round(weather.current.temp_c) }}°</span>
              <div class="temp-unit-toggle">
                <button @click="toggleUnit" class="unit-btn" :class="{ active: tempUnit === 'C' }">°C</button>
                <button @click="toggleUnit" class="unit-btn" :class="{ active: tempUnit === 'F' }">°F</button>
              </div>
            </div>
            <p class="weather-description">{{ weather.current.condition.text }}</p>
            <div class="min-max-temp" v-if="weather.forecast && weather.forecast.forecastday[0]">
              <span class="max-temp">↗ {{ Math.round(getCurrentTemp(weather.forecast.forecastday[0].day.maxtemp_c, weather.forecast.forecastday[0].day.maxtemp_f)) }}°</span>
              <span class="min-temp">↘ {{ Math.round(getCurrentTemp(weather.forecast.forecastday[0].day.mintemp_c, weather.forecast.forecastday[0].day.mintemp_f)) }}°</span>
            </div>
          </div>
        </div>

        <!-- Weather Details Grid -->
        <div class="weather-details-grid">
          <div class="detail-card">
            <div class="detail-icon">💧</div>
            <div class="detail-content">
              <span class="detail-label">Kelembapan</span>
              <span class="detail-value">{{ weather.current.humidity }}%</span>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-icon">🌡️</div>
            <div class="detail-content">
              <span class="detail-label">Terasa Seperti</span>
              <span class="detail-value">{{ Math.round(getCurrentTemp(weather.current.feelslike_c, weather.current.feelslike_f)) }}°</span>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-icon">📊</div>
            <div class="detail-content">
              <span class="detail-label">Tekanan</span>
              <span class="detail-value">{{ weather.current.pressure_mb }} mb</span>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-icon">💨</div>
            <div class="detail-content">
              <span class="detail-label">Angin</span>
              <span class="detail-value">{{ weather.current.wind_kph }} km/h</span>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-icon">🌪️</div>
            <div class="detail-content">
              <span class="detail-label">Hembusan</span>
              <span class="detail-value">{{ weather.current.gust_kph }} km/h</span>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-icon">🔆</div>
            <div class="detail-content">
              <span class="detail-label">UV Index</span>
              <span class="detail-value">{{ weather.current.uv }}</span>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-icon">👁️</div>
            <div class="detail-content">
              <span class="detail-label">Jarak Pandang</span>
              <span class="detail-value">{{ weather.current.vis_km }} km</span>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-icon">☁️</div>
            <div class="detail-content">
              <span class="detail-label">Tingkat Awan</span>
              <span class="detail-value">{{ weather.current.cloud }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Map Section -->
    <div class="weather-section map-section" v-if="latitude && longitude">
      <div class="section-header">
        <h2 class="section-title">
          <span class="weather-emoji">🗺️</span>
          Peta Lokasi
        </h2>
      </div>
      <div id="map" class="map-container"></div>
    </div>

    <!-- Hourly Forecast Section -->
    <div class="weather-section hourly-forecast" v-if="weather && weather.forecast">
      <div class="section-header">
        <h2 class="section-title">
          <span class="weather-emoji">🕐</span>
          Cuaca Per Jam
        </h2>
      </div>
      
      <div class="hourly-scroll-container">
        <div class="hourly-items">
          <div 
            v-for="(hour, index) in getNext24Hours()" 
            :key="index"
            class="hourly-item"
            :class="{ current: isCurrentHour(hour.time) }"
          >
            <div class="hourly-time">{{ formatHour(hour.time) }}</div>
            <img :src="hour.condition.icon" :alt="hour.condition.text" class="hourly-icon" />
            <div class="hourly-temp">{{ Math.round(getCurrentTemp(hour.temp_c, hour.temp_f)) }}°</div>
            <div class="hourly-condition">{{ hour.condition.text.split(' ')[0] }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 7-Day Forecast Section -->
    <div class="weather-section weekly-forecast" v-if="weather && weather.forecast">
      <div class="section-header">
        <h2 class="section-title">
          <span class="weather-emoji">📅</span>
          Prakiraan 7 Hari
        </h2>
      </div>
      
      <div class="weekly-items">
        <div 
          v-for="(day, index) in weather.forecast.forecastday" 
          :key="index"
          class="weekly-item"
          :class="{ today: index === 0 }"
        >
          <div class="weekly-day">
            <span class="day-name">{{ index === 0 ? 'Hari Ini' : formatDayName(day.date) }}</span>
            <span class="day-date">{{ formatDate(day.date) }}</span>
          </div>
          
          <div class="weekly-weather">
            <img :src="day.day.condition.icon" :alt="day.day.condition.text" class="weekly-icon" />
            <span class="weekly-condition">{{ day.day.condition.text }}</span>
          </div>
          
          <div class="weekly-temps">
            <span class="weekly-max">{{ Math.round(getCurrentTemp(day.day.maxtemp_c, day.day.maxtemp_f)) }}°</span>
            <span class="weekly-min">{{ Math.round(getCurrentTemp(day.day.mintemp_c, day.day.mintemp_f)) }}°</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      weather: null,
      loading: true,
      error: null,
      latitude: null,
      longitude: null,
      cityName: '',
      tempUnit: 'C' // C for Celsius, F for Fahrenheit
      
    }
  },
  mounted() {
    this.getCurrentLocation();
  },
  methods: {
    getCurrentLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
            this.fetchWeatherData();
          },
          (error) => {
            this.error = "Tidak dapat mengakses lokasi. Pastikan GPS aktif.";
            this.loading = false;
          }
        );
      } else {
        this.error = "Geolocation tidak didukung browser ini.";
        this.loading = false;
      }
    },

    async fetchWeatherData() {
      try {
        const API_KEY = '';
        const response = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${this.latitude},${this.longitude}&days=7&aqi=yes&alerts=yes&lang=id`
        );

        if (!response.ok) {
          throw new Error('Gagal mengambil data cuaca');
        }
        
        this.weather = await response.json();
        this.cityName = await this.getCityFromLocationIQ(this.latitude, this.longitude);
        this.loading = false;
        
        // Initialize map after weather data is loaded
        this.$nextTick(() => {
          this.initMap();
        });
      } catch (err) {
        this.error = err.message;
        this.loading = false;
      }
    },
    async getCityFromLocationIQ(lat, lon) {
      try {
        const response = await fetch(`https://us1.locationiq.com/v1/reverse?key=()&lat=${lat}&lon=${lon}&format=json`);
        if (!response.ok) throw new Error("Gagal memuat data lokasi");
        
        const data = await response.json();
        const address = data.address;

        return address.city || address.town || address.village || address.county || address.state || "Lokasi tidak diketahui";
      } catch (err) {
        console.error("LocationIQ Error:", err);
        return "Lokasi tidak diketahui";
      }
    },
    initMap() {
      if (!window.L) {
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCSS);

        const leafletJS = document.createElement('script');
        leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        leafletJS.onload = () => {
          this.createMap();
        };
        document.head.appendChild(leafletJS);
      } else {
        this.createMap();
      }
    },

    createMap() {
      // Remove existing map if any
      const mapContainer = document.getElementById('map');
      if (mapContainer) {
        mapContainer.innerHTML = '';
      }

      // Create map
      const map = L.map('map').setView([this.latitude, this.longitude], 13);

      // Add tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 18
      }).addTo(map);

      // Create custom blue marker icon
      const blueIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background-color: #4a90e2;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            animation: pulse-marker 2s infinite;
          "></div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      // Add marker with popup
      const marker = L.marker([this.latitude, this.longitude], { icon: blueIcon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center; font-family: 'Segoe UI', sans-serif;">
            <strong>📍 Lokasi Anda</strong><br>
            <span style="color: #666;">${this.cityName}, ${this.weather.location.country}</span><br>
            <small>${this.latitude.toFixed(4)}, ${this.longitude.toFixed(4)}</small>
          </div>

        `)
        .openPopup();

      // Add pulse animation CSS
      if (!document.getElementById('marker-styles')) {
        const style = document.createElement('style');
        style.id = 'marker-styles';
        style.textContent = `
          @keyframes pulse-marker {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          .leaflet-popup-content-wrapper {
            border-radius: 8px;
          }
          .leaflet-popup-tip {
            background: white;
          }
        `;
        document.head.appendChild(style);
      }
    },

    toggleUnit() {
      this.tempUnit = this.tempUnit === 'C' ? 'F' : 'C';
    },

    getCurrentTemp(celsius, fahrenheit) {
      return this.tempUnit === 'C' ? celsius : fahrenheit;
    },

    formatDateTime(dateTimeStr) {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    formatHour(dateTimeStr) {
      const date = new Date(dateTimeStr);
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    formatDayName(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', { weekday: 'long' });
    },

    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short'
      });
    },

    isCurrentHour(dateTimeStr) {
      const hourTime = new Date(dateTimeStr);
      const now = new Date();
      return hourTime.getHours() === now.getHours() && 
             hourTime.getDate() === now.getDate();
    },

    getNext24Hours() {
      if (!this.weather || !this.weather.forecast) return [];
      
      const hours = [];
      const today = this.weather.forecast.forecastday[0];
      const tomorrow = this.weather.forecast.forecastday[1];
      
      if (today && today.hour) {
        hours.push(...today.hour);
      }
      if (tomorrow && tomorrow.hour) {
        hours.push(...tomorrow.hour.slice(0, 8)); // Add first 8 hours of tomorrow
      }
      
      return hours.slice(0, 24); // Ensure we only get 24 hours
    },

    getWeatherAnimation(condition) {
      const conditionLower = condition.toLowerCase();
      if (conditionLower.includes('rain') || conditionLower.includes('hujan')) {
        return 'rain-animation';
      } else if (conditionLower.includes('snow') || conditionLower.includes('salju')) {
        return 'snow-animation';
      } else if (conditionLower.includes('cloud') || conditionLower.includes('awan')) {
        return 'cloud-animation';
      } else if (conditionLower.includes('sun') || conditionLower.includes('cerah')) {
        return 'sun-animation';
      }
      return '';
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Weather Sections */
.weather-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: full;
}


.weather-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.weather-emoji {
  font-size: 2rem;
  animation: gentle-bounce 2s ease-in-out infinite;
}

@keyframes gentle-bounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

/* Loading and Error States */
.loading-state, .error-state {
  text-align: center;
  padding: 3rem 0;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e3e3e3;
  border-top: 4px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state .error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Current Weather */
.location-time {
  text-align: center;
  margin-bottom: 2rem;
}

.location-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.location-icon {
  font-size: 1.2rem;
}

.local-time {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0;
}

.main-weather-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.weather-visual {
  position: relative;
}

.weather-icon-container {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.weather-icon {
  width: 100px;
  height: 100px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.weather-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.temperature-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.current-temp {
  font-size: 4rem;
  font-weight: 300;
  color: #2c3e50;
  line-height: 1;
}

.temp-unit-toggle {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.unit-btn {
  background: rgba(74, 144, 226, 0.1);
  border: 1px solid rgba(74, 144, 226, 0.3);
  color: #4a90e2;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.unit-btn.active {
  background: #4a90e2;
  color: white;
}

.weather-description {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.min-max-temp {
  display: flex;
  gap: 1rem;
  font-size: 1rem;
}

.max-temp {
  color: #e74c3c;
  font-weight: 600;
}

.min-temp {
  color: #3498db;
  font-weight: 600;
}

/* Weather Details Grid */
.weather-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.detail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.detail-icon {
  font-size: 2rem;
  filter: grayscale(0);
  animation: pulse-gentle 3s ease-in-out infinite;
}

@keyframes pulse-gentle {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.detail-content {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

/* Hourly Forecast */
.hourly-scroll-container {
  overflow-x: auto;
  padding-bottom: 1rem;
}

.hourly-items {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  min-width: max-content;
}

.hourly-item {
  background: linear-gradient(135deg, #f1f3f4 0%, #e8eaed 100%);
  border-radius: 16px;
  padding: 1.5rem 1rem;
  text-align: center;
  min-width: 100px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.hourly-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.hourly-item.current {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.hourly-time {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.hourly-icon {
  width: 40px;
  height: 40px;
  margin: 0.5rem 0;
}

.hourly-temp {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.hourly-condition {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* Weekly Forecast */
.weekly-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.weekly-item {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.weekly-item:hover {
  transform: translateX(4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.weekly-item.today {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
}

.weekly-day {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.day-name {
  font-weight: 600;
  font-size: 1rem;
}

.day-date {
  font-size: 0.9rem;
  opacity: 0.7;
}

.weekly-weather {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  justify-content: center;
}

.weekly-icon {
  width: 50px;
  height: 50px;
}

.weekly-condition {
  font-size: 1rem;
}

.weekly-temps {
  display: flex;
  gap: 1rem;
  min-width: 100px;
  justify-content: flex-end;
}

.weekly-max {
  font-weight: 700;
  font-size: 1.1rem;
}

.weekly-min {
  opacity: 0.7;
  font-size: 1rem;
}

/* Map Section */
.map-container {
  width: 100%;
  height: 300px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .home {
    padding: 0 0.5rem;
  }

  .weather-section {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .main-weather-card {
    flex-direction: column;
    gap: 2rem;
    text-align: center;
  }

  .current-temp {
    font-size: 3rem;
  }

  .weather-details-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
  }

  .detail-card {
    padding: 1rem;
  }

  .weekly-item {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .weekly-day,
  .weekly-temps {
    min-width: auto;
  }

  .hourly-item {
    min-width: 80px;
    padding: 1rem 0.75rem;
  }
}

@media (max-width: 480px) {
  .weather-section {
    padding: 1rem;
    border-radius: 16px;
  }

  .section-title {
    font-size: 1.3rem;
  }

  .weather-details-grid {
    grid-template-columns: 1fr;
  }

  .current-temp {
    font-size: 2.5rem;
  }

  .hourly-items {
    gap: 0.5rem;
  }

  .hourly-item {
    min-width: 70px;
    padding: 0.75rem 0.5rem;
  }
}

/* Scroll bar styling */
.hourly-scroll-container::-webkit-scrollbar {
  height: 6px;
}

.hourly-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.hourly-scroll-container::-webkit-scrollbar-thumb {
  background: #4a90e2;
  border-radius: 10px;
}

.hourly-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #357abd;
}
</style>