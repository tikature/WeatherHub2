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
            <button @click="toggleFavoriteLocation" class="favorite-btn" :class="{ active: isFavorite }">
              {{ isFavorite ? '❤️' : '🤍' }}
            </button>
            <button @click="shareWeather" class="share-btn">
              📤
            </button>
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

    <!-- Health & Comfort Index -->
    <div class="weather-section health-index" v-if="weather && getHealthIndex()">
      <div class="section-header">
        <h2 class="section-title">
          <span class="weather-emoji">🏥</span>
          Indeks Kesehatan & Kenyamanan
        </h2>
      </div>
      
      <div class="health-card">
        <div class="health-score">
          <div class="score-circle" :style="{ background: `conic-gradient(${getHealthIndex().color} ${getHealthIndex().score * 3.6}deg, #e9ecef 0deg)` }">
            <div class="score-inner">
              <span class="score-value">{{ getHealthIndex().score }}</span>
              <span class="score-label">/ 100</span>
            </div>
          </div>
          <div class="health-category" :style="{ color: getHealthIndex().color }">
            {{ getHealthIndex().category }}
          </div>
        </div>
        
        <div class="health-factors">
          <h4>Faktor yang Mempengaruhi:</h4>
          <ul>
            <li v-for="factor in getHealthIndex().factors" :key="factor">{{ factor }}</li>
          </ul>
          <p v-if="getHealthIndex().factors.length === 0" class="no-factors">
            Semua kondisi dalam keadaan baik! 👍
          </p>
        </div>
      </div>
    </div>

    <!-- Outfit Recommendation -->
    <div class="weather-section outfit-recommendation" v-if="weather && getOutfitRecommendation()">
      <div class="section-header">
        <h2 class="section-title">
          <span class="weather-emoji">👔</span>
          Rekomendasi Pakaian
        </h2>
        <p class="section-subtitle">Saran berpakaian sesuai cuaca hari ini</p>
      </div>
      
      <div class="outfit-grid">
        <div class="outfit-category">
          <h4 class="category-title">
            <span class="category-icon">👕</span>
            Pakaian
          </h4>
          <div class="outfit-items">
            <span v-for="item in getOutfitRecommendation().items" :key="item" class="outfit-item">
              {{ item }}
            </span>
          </div>
        </div>

        <div class="outfit-category">
          <h4 class="category-title">
            <span class="category-icon">🎨</span>
            Warna
          </h4>
          <div class="outfit-items">
            <span v-for="color in getOutfitRecommendation().colors" :key="color" class="outfit-item">
              {{ color }}
            </span>
          </div>
        </div>

        <div class="outfit-category">
          <h4 class="category-title">
            <span class="category-icon">🎒</span>
            Aksesoris
          </h4>
          <div class="outfit-items">
            <span v-for="accessory in getOutfitRecommendation().accessories" :key="accessory" class="outfit-item">
              {{ accessory }}
            </span>
          </div>
        </div>

        <div class="outfit-category tips-category">
          <h4 class="category-title">
            <span class="category-icon">💡</span>
            Tips
          </h4>
          <div class="outfit-tips">
            <p v-for="tip in getOutfitRecommendation().tips" :key="tip" class="outfit-tip">
              • {{ tip }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="weather-section activity-recommendations" v-if="weather">
      <div class="section-header">
        <h2 class="section-title">
          <span class="weather-emoji">🎯</span>
          Rekomendasi Kegiatan
        </h2>
        <p class="section-subtitle">Aktivitas yang cocok untuk cuaca hari ini</p>
      </div>
      
      <div class="recommendations-grid">
        <div 
          v-for="(activity, index) in getActivityRecommendations()" 
          :key="index"
          class="activity-card"
          :class="activity.priority"
        >
          <div class="activity-icon">{{ activity.icon }}</div>
          <div class="activity-content">
            <h4 class="activity-title">{{ activity.title }}</h4>
            <p class="activity-description">{{ activity.description }}</p>
            <div class="activity-tags">
              <span 
                v-for="tag in activity.tags" 
                :key="tag"
                class="activity-tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          <div class="activity-priority">
            <span class="priority-badge" :class="activity.priority">
              {{ getPriorityText(activity.priority) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Weather Alerts -->
      <div class="weather-alerts" v-if="getWeatherAlerts().length > 0">
        <h3 class="alerts-title">⚠️ Perhatian Khusus</h3>
        <div class="alerts-list">
          <div 
            v-for="(alert, index) in getWeatherAlerts()" 
            :key="index"
            class="alert-item"
            :class="alert.type"
          >
            <span class="alert-icon">{{ alert.icon }}</span>
            <span class="alert-text">{{ alert.message }}</span>
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
      tempUnit: 'C', // C for Celsius, F for Fahrenheit
      intervalId: null,
      localTime: null,
      isFavorite: false,
    }
  },
  mounted() {
    this.getCurrentLocation();

    setInterval(() => {
      if (this.weather && this.weather.location.localtime) {
        const now = new Date();
        const offsetMinutes = now.getTimezoneOffset();
        const targetTime = new Date(this.weather.location.localtime);
        targetTime.setMinutes(targetTime.getMinutes() + offsetMinutes);
        this.localTime = new Date(targetTime.getTime() + 1000);
      }
    }, 1000);

    // Perbarui data cuaca setiap 10 menit
    this.intervalId = setInterval(() => {
      this.fetchWeatherData();
    }, 10 * 60 * 1000);
  },

  beforeDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
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
          `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${this.latitude},${this.longitude}&days=7&aqi=yes&alerts=yes&lang=id`,
          {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Gagal mengambil data cuaca');
        }
        
        this.weather = await response.json();
        this.cityName = await this.getCityFromLocationIQ(this.latitude, this.longitude);
        this.loading = false;
        
        this.checkIfFavorite();
        
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
        const response = await fetch(`https://us1.locationiq.com/v1/reverse?key=''&lat=${lat}&lon=${lon}&format=json`);
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
        // Load Leaflet if not already loaded
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
    },

    getActivityRecommendations() {
      if (!this.weather) return [];

      const temp = this.weather.current.temp_c;
      const condition = this.weather.current.condition.text.toLowerCase();
      const humidity = this.weather.current.humidity;
      const uvIndex = this.weather.current.uv;
      const windSpeed = this.weather.current.wind_kph;
      const hour = new Date().getHours();

      let activities = [];

      // Sunny/Clear Weather
      if (condition.includes('sunny') || condition.includes('clear') || condition.includes('cerah')) {
        if (temp >= 25 && temp <= 35) {
          activities.push({
            icon: '🏊‍♂️',
            title: 'Berenang',
            description: 'Cuaca cerah sempurna untuk berenang dan bermain air',
            tags: ['Outdoor', 'Olahraga', 'Refreshing'],
            priority: 'high'
          });
          activities.push({
            icon: '🚴‍♂️',
            title: 'Bersepeda',
            description: 'Ideal untuk bersepeda santai di taman atau jalur khusus',
            tags: ['Outdoor', 'Olahraga', 'Sehat'],
            priority: 'high'
          });
        }
        if (uvIndex > 6) {
          activities.push({
            icon: '🧴',
            title: 'Gunakan Sunscreen',
            description: 'UV index tinggi, pastikan menggunakan tabir surya SPF 30+',
            tags: ['Kesehatan', 'Perlindungan'],
            priority: 'medium'
          });
        }
      }

      // Cloudy Weather
      if (condition.includes('cloud') || condition.includes('overcast') || condition.includes('awan')) {
        activities.push({
          icon: '🚶‍♂️',
          title: 'Jalan Kaki',
          description: 'Cuaca berawan nyaman untuk jalan-jalan santai',
          tags: ['Outdoor', 'Santai', 'Sehat'],
          priority: 'high'
        });
        activities.push({
          icon: '📸',
          title: 'Fotografi',
          description: 'Cahaya lembut dari awan bagus untuk fotografi outdoor',
          tags: ['Kreatif', 'Outdoor', 'Hobi'],
          priority: 'medium'
        });
      }

      // Rainy Weather
      if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('hujan')) {
        activities.push({
          icon: '📚',
          title: 'Membaca Buku',
          description: 'Waktu yang tepat untuk bersantai dengan buku favorit',
          tags: ['Indoor', 'Santai', 'Edukasi'],
          priority: 'high'
        });
        activities.push({
          icon: '🫖',
          title: 'Minum Teh Hangat',
          description: 'Nikmati minuman hangat sambil mendengar suara hujan',
          tags: ['Indoor', 'Santai', 'Hangat'],
          priority: 'high'
        });
        activities.push({
          icon: '🎬',
          title: 'Menonton Film',
          description: 'Cuaca hujan cocok untuk menonton film di rumah',
          tags: ['Indoor', 'Hiburan', 'Santai'],
          priority: 'medium'
        });
      }

      // Hot Weather
      if (temp > 35) {
        activities.push({
          icon: '🏠',
          title: 'Aktivitas Indoor',
          description: 'Cuaca terlalu panas, sebaiknya beraktivitas di dalam ruangan ber-AC',
          tags: ['Indoor', 'Dingin', 'Nyaman'],
          priority: 'high'
        });
        activities.push({
          icon: '🥤',
          title: 'Minum Banyak Air',
          description: 'Jaga hidrasi tubuh dengan minum air putih yang cukup',
          tags: ['Kesehatan', 'Hidrasi'],
          priority: 'high'
        });
      }

      // Cold Weather
      if (temp < 20) {
        activities.push({
          icon: '🍲',
          title: 'Masak Makanan Hangat',
          description: 'Cuaca dingin cocok untuk masak sup atau makanan berkuah',
          tags: ['Indoor', 'Masak', 'Hangat'],
          priority: 'high'
        });
        activities.push({
          icon: '🧥',
          title: 'Pakai Jaket',
          description: 'Jangan lupa pakai jaket atau pakaian hangat saat keluar',
          tags: ['Kesehatan', 'Perlindungan'],
          priority: 'medium'
        });
      }

      // Windy Weather
      if (windSpeed > 20) {
        activities.push({
          icon: '🪁',
          title: 'Main Layang-layang',
          description: 'Angin kencang sempurna untuk bermain layang-layang',
          tags: ['Outdoor', 'Bermain', 'Keluarga'],
          priority: 'medium'
        });
      }

      // High Humidity
      if (humidity > 80) {
        activities.push({
          icon: '💨',
          title: 'Gunakan AC/Kipas',
          description: 'Kelembapan tinggi, gunakan pendingin untuk kenyamanan',
          tags: ['Indoor', 'Kenyamanan'],
          priority: 'low'
        });
      }

      // Time-based recommendations
      if (hour >= 6 && hour <= 9) {
        activities.push({
          icon: '🏃‍♂️',
          title: 'Jogging Pagi',
          description: 'Pagi hari adalah waktu terbaik untuk olahraga lari',
          tags: ['Olahraga', 'Pagi', 'Sehat'],
          priority: temp < 30 ? 'high' : 'medium'
        });
      }

      if (hour >= 17 && hour <= 19) {
        activities.push({
          icon: '🌅',
          title: 'Menikmati Sunset',
          description: 'Waktu sore cocok untuk menikmati pemandangan matahari terbenam',
          tags: ['Outdoor', 'Santai', 'Pemandangan'],
          priority: !condition.includes('rain') ? 'high' : 'low'
        });
      }

      // General activities
      activities.push({
        icon: '🧘‍♀️',
        title: 'Meditasi',
        description: 'Luangkan waktu untuk meditasi dan relaksasi',
        tags: ['Indoor', 'Kesehatan Mental', 'Santai'],
        priority: 'low'
      });

      // Remove duplicates and limit to 6 activities
      const uniqueActivities = activities.filter((activity, index, self) => 
        index === self.findIndex(a => a.title === activity.title)
      );

      return uniqueActivities.slice(0, 6);
    },

    getWeatherAlerts() {
      if (!this.weather) return [];

      const alerts = [];
      const temp = this.weather.current.temp_c;
      const uvIndex = this.weather.current.uv;
      const windSpeed = this.weather.current.wind_kph;
      const humidity = this.weather.current.humidity;
      const condition = this.weather.current.condition.text.toLowerCase();

      // Temperature alerts
      if (temp > 38) {
        alerts.push({
          icon: '🔥',
          message: 'Suhu sangat panas! Hindari aktivitas outdoor berlebihan.',
          type: 'danger'
        });
      } else if (temp < 15) {
        alerts.push({
          icon: '🥶',
          message: 'Suhu dingin. Pakai pakaian hangat saat keluar rumah.',
          type: 'warning'
        });
      }

      // UV alerts
      if (uvIndex >= 8) {
        alerts.push({
          icon: '☀️',
          message: 'UV index sangat tinggi! Gunakan sunscreen dan hindari sinar matahari langsung.',
          type: 'danger'
        });
      } else if (uvIndex >= 6) {
        alerts.push({
          icon: '🌞',
          message: 'UV index tinggi. Disarankan menggunakan tabir surya.',
          type: 'warning'
        });
      }

      // Wind alerts
      if (windSpeed > 30) {
        alerts.push({
          icon: '💨',
          message: 'Angin kencang! Hati-hati saat berkendara atau beraktivitas outdoor.',
          type: 'warning'
        });
      }

      // Rain alerts
      if (condition.includes('rain') || condition.includes('storm')) {
        alerts.push({
          icon: '☔',
          message: 'Hujan diprediksi. Bawa payung atau jas hujan saat keluar.',
          type: 'info'
        });
      }

      // Humidity alerts
      if (humidity > 90) {
        alerts.push({
          icon: '💧',
          message: 'Kelembapan sangat tinggi. Gunakan AC atau dehhumidifier untuk kenyamanan.',
          type: 'info'
        });
      }

      return alerts;
    },

    getPriorityText(priority) {
      const priorityMap = {
        'high': 'Direkomendasikan',
        'medium': 'Cukup Baik',
        'low': 'Opsional'
      };
      return priorityMap[priority] || 'Opsional';
    },

    getHealthIndex() {
      if (!this.weather) return null;

      const temp = this.weather.current.temp_c;
      const humidity = this.weather.current.humidity;
      const uvIndex = this.weather.current.uv;
      const airQuality = this.weather.current.air_quality || {};

      let score = 100;
      let factors = [];

      // Temperature factor
      if (temp < 15 || temp > 35) {
        score -= 20;
        factors.push('Suhu tidak ideal');
      } else if (temp < 20 || temp > 30) {
        score -= 10;
        factors.push('Suhu kurang nyaman');
      }

      // Humidity factor
      if (humidity > 80) {
        score -= 15;
        factors.push('Kelembapan tinggi');
      } else if (humidity < 30) {
        score -= 10;
        factors.push('Udara kering');
      }

      // UV factor
      if (uvIndex > 8) {
        score -= 15;
        factors.push('UV sangat tinggi');
      } else if (uvIndex > 6) {
        score -= 10;
        factors.push('UV tinggi');
      }

      // Air quality factor (if available)
      if (airQuality.pm2_5 > 75) {
        score -= 25;
        factors.push('Kualitas udara buruk');
      } else if (airQuality.pm2_5 > 35) {
        score -= 15;
        factors.push('Kualitas udara sedang');
      }

      score = Math.max(0, Math.min(100, score));

      let category = 'Sangat Baik';
      let color = '#27ae60';
      if (score < 40) {
        category = 'Buruk';
        color = '#e74c3c';
      } else if (score < 60) {
        category = 'Kurang Baik';
        color = '#f39c12';
      } else if (score < 80) {
        category = 'Baik';
        color = '#3498db';
      }

      return {
        score: Math.round(score),
        category,
        color,
        factors
      };
    },

    getOutfitRecommendation() {
      if (!this.weather) return null;

      const temp = this.weather.current.temp_c;
      const condition = this.weather.current.condition.text.toLowerCase();
      const windSpeed = this.weather.current.wind_kph;
      const humidity = this.weather.current.humidity;

      let outfit = {
        items: [],
        colors: [],
        accessories: [],
        tips: []
      };

      // Temperature-based clothing
      if (temp < 15) {
        outfit.items.push('Jaket tebal', 'Celana panjang', 'Sepatu tertutup');
        outfit.colors.push('Warna gelap (menyerap panas)');
        outfit.accessories.push('Syal', 'Sarung tangan');
        outfit.tips.push('Pakai layer untuk mengatur suhu tubuh');
      } else if (temp < 25) {
        outfit.items.push('Jaket tipis', 'Kemeja lengan panjang', 'Jeans');
        outfit.colors.push('Warna netral');
        outfit.accessories.push('Cardigan ringan');
        outfit.tips.push('Siapkan jaket untuk malam hari');
      } else if (temp < 30) {
        outfit.items.push('Kaos katun', 'Celana chino', 'Sneakers');
        outfit.colors.push('Warna terang');
        outfit.accessories.push('Topi ringan');
        outfit.tips.push('Pilih bahan yang breathable');
      } else {
        outfit.items.push('Kaos tipis', 'Celana pendek', 'Sandal');
        outfit.colors.push('Warna putih/terang (memantulkan panas)');
        outfit.accessories.push('Topi lebar', 'Kacamata hitam');
        outfit.tips.push('Hindari bahan sintetis');
      }

      // Weather condition adjustments
      if (condition.includes('rain') || condition.includes('hujan')) {
        outfit.accessories.push('Payung', 'Jas hujan');
        outfit.items.push('Sepatu anti-air');
        outfit.tips.push('Bawa pakaian ganti');
      }

      if (condition.includes('sunny') || condition.includes('cerah')) {
        outfit.accessories.push('Sunscreen', 'Kacamata hitam');
        outfit.tips.push('Gunakan SPF 30+ jika beraktivitas outdoor');
      }

      if (windSpeed > 20) {
        outfit.tips.push('Hindari payung, gunakan jas hujan');
        outfit.accessories.push('Ikat rambut (untuk rambut panjang)');
      }

      if (humidity > 70) {
        outfit.tips.push('Pilih bahan katun yang menyerap keringat');
        outfit.accessories.push('Handuk kecil');
      }

      return outfit;
    },

    shareWeather() {
      if (!this.weather) return;

      const temp = Math.round(this.weather.current.temp_c);
      const condition = this.weather.current.condition.text;
      const location = `${this.cityName}, ${this.weather.location.country}`;
      
      const shareText = `🌤️ Cuaca di ${location}:\n${temp}°C - ${condition}\n\nCek cuaca lengkap di aplikasi cuaca saya!`;

      if (navigator.share) {
        navigator.share({
          title: 'Info Cuaca',
          text: shareText,
          url: window.location.href
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(shareText).then(() => {
          alert('Info cuaca berhasil disalin ke clipboard!');
        });
      }
    },

    toggleFavoriteLocation() {
      const locationKey = `${this.latitude}_${this.longitude}`;
      let favorites = JSON.parse(localStorage.getItem('favoriteLocations') || '[]');
      
      const existingIndex = favorites.findIndex(fav => fav.key === locationKey);
      
      if (existingIndex > -1) {
        favorites.splice(existingIndex, 1);
        this.isFavorite = false;
      } else {
        favorites.push({
          key: locationKey,
          name: this.cityName,
          latitude: this.latitude,
          longitude: this.longitude,
          country: this.weather.location.country
        });
        this.isFavorite = true;
      }
      
      localStorage.setItem('favoriteLocations', JSON.stringify(favorites));
    },

    checkIfFavorite() {
      const locationKey = `${this.latitude}_${this.longitude}`;
      const favorites = JSON.parse(localStorage.getItem('favoriteLocations') || '[]');
      this.isFavorite = favorites.some(fav => fav.key === locationKey);
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

.section-subtitle {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0.5rem 0 0 0;
  font-style: italic;
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
  flex-wrap: wrap;
}

.favorite-btn, .share-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
}

.favorite-btn:hover, .share-btn:hover {
  background: rgba(74, 144, 226, 0.1);
  transform: scale(1.1);
}

.favorite-btn.active {
  animation: heart-beat 1.5s ease-in-out infinite;
}

@keyframes heart-beat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
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

/* Health Index */
.health-card {
  display: flex;
  align-items: center;
  gap: 3rem;
  flex-wrap: wrap;
  justify-content: center;
}

.health-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 8px;
}

.score-inner {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.score-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.score-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.health-category {
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
}

.health-factors {
  flex: 1;
  min-width: 250px;
}

.health-factors h4 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.health-factors ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.health-factors li {
  background: rgba(231, 76, 60, 0.1);
  color: #c0392b;
  padding: 0.5rem 1rem;
  margin: 0.5rem 0;
  border-radius: 8px;
  border-left: 3px solid #e74c3c;
}

.no-factors {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #27ae60;
  margin: 0;
  font-weight: 500;
}

/* Outfit Recommendations */
.outfit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.outfit-category {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid #4a90e2;
}

.tips-category {
  grid-column: 1 / -1;
  border-left-color: #27ae60;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.category-icon {
  font-size: 1.3rem;
}

.outfit-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.outfit-item {
  background: rgba(74, 144, 226, 0.1);
  color: #4a90e2;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid rgba(74, 144, 226, 0.2);
}

.outfit-tips {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.outfit-tip {
  color: #555;
  line-height: 1.5;
  margin: 0;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.outfit-tip:last-child {
  border-bottom: none;
}
.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.activity-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.activity-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4a90e2, #357abd);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  border-color: rgba(74, 144, 226, 0.2);
}

.activity-card:hover::before {
  opacity: 1;
}

.activity-card.high {
  border-left: 4px solid #27ae60;
}

.activity-card.medium {
  border-left: 4px solid #f39c12;
}

.activity-card.low {
  border-left: 4px solid #95a5a6;
}

.activity-icon {
  font-size: 2.5rem;
  margin-top: 0.25rem;
  animation: gentle-wiggle 4s ease-in-out infinite;
}

@keyframes gentle-wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(2deg); }
  75% { transform: rotate(-2deg); }
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.activity-description {
  color: #7f8c8d;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.activity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.activity-tag {
  background: rgba(74, 144, 226, 0.1);
  color: #4a90e2;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.activity-priority {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.priority-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.priority-badge.high {
  background: #d4edda;
  color: #155724;
}

.priority-badge.medium {
  background: #fff3cd;
  color: #856404;
}

.priority-badge.low {
  background: #f8f9fa;
  color: #6c757d;
}

/* Weather Alerts */
.weather-alerts {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.alerts-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 500;
  animation: alert-pulse 2s ease-in-out infinite;
}

@keyframes alert-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.9; }
}

.alert-item.danger {
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.alert-item.warning {
  background: #fff3cd;
  color: #856404;
  border-left: 4px solid #ffc107;
}

.alert-item.info {
  background: #d1ecf1;
  color: #0c5460;
  border-left: 4px solid #17a2b8;
}

.alert-icon {
  font-size: 1.5rem;
}

.alert-text {
  flex: 1;
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

  .recommendations-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .activity-card {
    padding: 1.25rem;
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

  .activity-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .health-card {
    flex-direction: column;
    gap: 2rem;
  }

  .outfit-grid {
    grid-template-columns: 1fr;
  }

  .tips-category {
    grid-column: 1;
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