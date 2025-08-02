<template>
  <div class="search-city">
    <!-- Search Section -->
    <div class="search-section">
      <div class="search-container">
        <h2 class="search-title">
          <i class="fas fa-search-location"></i>
          Cari Kota
        </h2>
        <p class="search-subtitle">Temukan informasi cuaca untuk kota manapun di dunia</p>
        
        <div class="search-form">
          <div class="search-input-group">
            <input
              v-model="searchQuery"
              @keyup.enter="searchWeather"
              type="text"
              placeholder="Masukkan nama kota..."
              class="search-input"
              :class="{ 'loading': isLoading }"
            />
            <button 
              @click="searchWeather" 
              class="search-btn"
              :disabled="isLoading || !searchQuery.trim()"
            >
              <i class="fas fa-search" v-if="!isLoading"></i>
              <i class="fas fa-spinner fa-spin" v-else></i>
            </button>
          </div>
          
          <div class="quick-cities">
            <span class="quick-label">Kota Populer:</span>
            <button 
              v-for="city in popularCities" 
              :key="city"
              @click="quickSearch(city)"
              class="quick-city-btn"
            >
              {{ city }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      {{ errorMessage }}
    </div>

    <!-- Weather Result -->
    <div v-if="weatherData" class="weather-result">
      <!-- Main Weather Card -->
      <div class="main-weather-card">
        <div class="weather-header">
          <div class="location-info">
            <h3 class="city-name">
              <i class="fas fa-map-marker-alt"></i>
              {{ weatherData.location.name }}, {{ weatherData.location.country }}
            </h3>
            <p class="date-time">{{ formatDateTime() }}</p>
          </div>
        </div>

        <div class="weather-main">
          <div class="temperature-section">
            <div class="weather-icon">
              {{ getWeatherEmoji(weatherData.current.condition.text) }}
            </div>
            <div class="temperature-info">
              <div class="temp-display">
                <span class="temp-value">{{ Math.round(tempUnit === 'C' ? weatherData.current.temp_c : weatherData.current.temp_f) }}</span>
                <div class="temp-units">
                  <button 
                    @click="tempUnit = 'C'" 
                    :class="{ active: tempUnit === 'C' }"
                    class="unit-btn"
                  >°C</button>
                  <button 
                    @click="tempUnit = 'F'" 
                    :class="{ active: tempUnit === 'F' }"
                    class="unit-btn"
                  >°F</button>
                </div>
              </div>
              <p class="weather-description">{{ weatherData.current.condition.text }}</p>
              <div class="temp-range">
                <span class="temp-high">↗ {{ Math.round(tempUnit === 'C' ? weatherData.current.temp_c + 2 : weatherData.current.temp_f + 4) }}°</span>
                <span class="temp-low">↘ {{ Math.round(tempUnit === 'C' ? weatherData.current.temp_c - 3 : weatherData.current.temp_f - 5) }}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Weather Details Grid -->
      <div class="weather-details-grid">
        <div class="weather-card">
          <div class="card-icon">💧</div>
          <div class="card-content">
            <h4>Kelembaban</h4>
            <span class="card-value">{{ weatherData.current.humidity }}%</span>
          </div>
        </div>

        <div class="weather-card">
          <div class="card-icon">🌡️</div>
          <div class="card-content">
            <h4>Terasa Seperti</h4>
            <span class="card-value">{{ Math.round(tempUnit === 'C' ? weatherData.current.feelslike_c : weatherData.current.feelslike_f) }}°</span>
          </div>
        </div>

        <div class="weather-card">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <h4>Tekanan</h4>
            <span class="card-value">{{ weatherData.current.pressure_mb }} mb</span>
          </div>
        </div>

        <div class="weather-card">
          <div class="card-icon">💨</div>
          <div class="card-content">
            <h4>Angin</h4>
            <span class="card-value">{{ weatherData.current.wind_kph }} km/h</span>
          </div>
        </div>

        <div class="weather-card">
          <div class="card-icon">🌪️</div>
          <div class="card-content">
            <h4>Hembusan</h4>
            <span class="card-value">{{ weatherData.current.gust_kph || 'N/A' }} km/h</span>
          </div>
        </div>

        <div class="weather-card">
          <div class="card-icon">☀️</div>
          <div class="card-content">
            <h4>UV Index</h4>
            <span class="card-value">{{ weatherData.current.uv }}</span>
          </div>
        </div>

        <div class="weather-card">
          <div class="card-icon">👁️</div>
          <div class="card-content">
            <h4>Jarak Pandang</h4>
            <span class="card-value">{{ weatherData.current.vis_km }} km</span>
          </div>
        </div>

        <div class="weather-card">
          <div class="card-icon">☁️</div>
          <div class="card-content">
            <h4>Tingkat Awan</h4>
            <span class="card-value">{{ weatherData.current.cloud }}%</span>
          </div>
        </div>
      </div>

      <!-- Activity Recommendations -->
      <div class="activity-recommendations">
        <h3 class="recommendations-title">
          <i class="fas fa-lightbulb"></i>
          Rekomendasi Kegiatan
        </h3>
        <div class="activities-grid">
          <div 
            v-for="activity in getActivityRecommendations()" 
            :key="activity.title"
            class="activity-card"
            :class="activity.suitability"
          >
            <div class="activity-icon">{{ activity.icon }}</div>
            <div class="activity-content">
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.description }}</p>
              <span class="activity-rating">{{ activity.rating }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchCity',
  data() {
    return {
      searchQuery: '',
      weatherData: null,
      isLoading: false,
      errorMessage: '',
      tempUnit: 'C',
      uvIndex: 0,
      popularCities: ['Jakarta', 'Surabaya', 'Medan', 'Bandung', 'Makassar'],
      apiKey: '1e8cf00f9f4f4809b0e155132252007' 
    }
  },
  methods: {
    async searchWeather() {
      if (!this.searchQuery.trim()) return;
      
      this.isLoading = true;
      this.errorMessage = '';
      this.weatherData = null;
      
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${this.searchQuery}&lang=id&aqi=yes`
        );
        
        if (!response.ok) {
          throw new Error('Kota tidak ditemukan');
        }
        
        const data = await response.json();
        this.weatherData = data;
        
        // Convert temperature if needed
        if (this.tempUnit === 'F') {
          this.convertToFahrenheit();
        }
        
      } catch (error) {
        this.errorMessage = error.message || 'Terjadi kesalahan saat mengambil data cuaca';
      } finally {
        this.isLoading = false;
      }
    },
    
    quickSearch(city) {
      this.searchQuery = city;
      this.searchWeather();
    },
    
    formatDateTime() {
      const now = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return now.toLocaleDateString('id-ID', options);
    },
    
    getWeatherEmoji(condition) {
      const weatherEmojis = {
        'Sunny': '☀️',
        'Clear': '☀️',
        'Partly cloudy': '⛅',
        'Cloudy': '☁️',
        'Overcast': '☁️',
        'Mist': '🌫️',
        'Patchy rain possible': '🌦️',
        'Patchy snow possible': '🌨️',
        'Patchy sleet possible': '🌨️',
        'Patchy freezing drizzle possible': '🌨️',
        'Thundery outbreaks possible': '⛈️',
        'Blowing snow': '❄️',
        'Blizzard': '❄️',
        'Fog': '🌫️',
        'Freezing fog': '🌫️',
        'Patchy light drizzle': '🌦️',
        'Light drizzle': '🌦️',
        'Freezing drizzle': '🌨️',
        'Heavy freezing drizzle': '🌨️',
        'Patchy light rain': '🌦️',
        'Light rain': '🌧️',
        'Moderate rain at times': '🌧️',
        'Moderate rain': '🌧️',
        'Heavy rain at times': '🌧️',
        'Heavy rain': '🌧️',
        'Light freezing rain': '🌨️',
        'Moderate or heavy freezing rain': '🌨️',
        'Light sleet': '🌨️',
        'Moderate or heavy sleet': '🌨️',
        'Patchy light snow': '🌨️',
        'Light snow': '❄️',
        'Patchy moderate snow': '🌨️',
        'Moderate snow': '❄️',
        'Patchy heavy snow': '❄️',
        'Heavy snow': '❄️',
        'Ice pellets': '🌨️',
        'Light rain shower': '🌦️',
        'Moderate or heavy rain shower': '🌧️',
        'Torrential rain shower': '🌧️',
        'Light sleet showers': '🌨️',
        'Moderate or heavy sleet showers': '🌨️',
        'Light snow showers': '🌨️',
        'Moderate or heavy snow showers': '❄️',
        'Light showers of ice pellets': '🌨️',
        'Moderate or heavy showers of ice pellets': '🌨️',
        'Patchy light rain with thunder': '⛈️',
        'Moderate or heavy rain with thunder': '⛈️',
        'Patchy light snow with thunder': '⛈️',
        'Moderate or heavy snow with thunder': '⛈️'
      };
      
      const matchedCondition = Object.keys(weatherEmojis).find(key => 
        condition.toLowerCase().includes(key.toLowerCase())
      );
      
      return weatherEmojis[matchedCondition] || '🌤️';
    },
    
    getActivityRecommendations() {
      if (!this.weatherData) return [];
      
      const condition = this.weatherData.current.condition.text.toLowerCase();
      const temp = this.weatherData.current.temp_c;
      const humidity = this.weatherData.current.humidity;
      const windSpeed = this.weatherData.current.wind_kph;
      const uvIndex = this.weatherData.current.uv;
      
      let activities = [];
      
      // Weather-based recommendations
      if (condition.includes('sunny') || condition.includes('clear')) {
        if (temp >= 25 && temp <= 35) {
          activities.push(
            {
              icon: '🏖️',
              title: 'Pergi ke Pantai',
              description: 'Cuaca cerah sempurna untuk berenang dan berjemur',
              rating: '⭐⭐⭐⭐⭐',
              suitability: 'excellent'
            },
            {
              icon: '🚴‍♂️',
              title: 'Bersepeda',
              description: 'Kondisi ideal untuk bersepeda outdoor',
              rating: '⭐⭐⭐⭐⭐',
              suitability: 'excellent'
            },
            {
              icon: '🏃‍♂️',
              title: 'Jogging Pagi',
              description: 'Cuaca mendukung untuk olahraga lari',
              rating: '⭐⭐⭐⭐',
              suitability: 'good'
            }
          );
        }
      } else if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
        activities.push(
          {
            icon: '📚',
            title: 'Membaca di Cafe',
            description: 'Waktu yang tepat untuk bersantai dengan buku',
            rating: '⭐⭐⭐⭐⭐',
            suitability: 'excellent'
          },
          {
            icon: '🎬',
            title: 'Menonton Film',
            description: 'Cuaca hujan cocok untuk movie marathon',
            rating: '⭐⭐⭐⭐⭐',
            suitability: 'excellent'
          },
          {
            icon: '🛍️',
            title: 'Belanja di Mall',
            description: 'Hindari hujan dengan berbelanja indoor',
            rating: '⭐⭐⭐⭐',
            suitability: 'good'
          }
        );
      } else if (condition.includes('cloud') || condition.includes('overcast')) {
        if (temp >= 20 && temp <= 28) {
          activities.push(
            {
              icon: '🥾',
              title: 'Hiking',
              description: 'Cuaca berawan ideal untuk mendaki gunung',
              rating: '⭐⭐⭐⭐⭐',
              suitability: 'excellent'
            },
            {
              icon: '📸',
              title: 'Fotografi Outdoor',
              description: 'Pencahayaan lembut sempurna untuk foto',
              rating: '⭐⭐⭐⭐',
              suitability: 'good'
            },
            {
              icon: '🧺',
              title: 'Piknik di Taman',
              description: 'Cuaca sejuk cocok untuk piknik keluarga',
              rating: '⭐⭐⭐⭐',
              suitability: 'good'
            }
          );
        }
      }
      
      // Temperature-based recommendations
      if (temp > 35) {
        activities.push({
          icon: '🏊‍♂️',
          title: 'Berenang',
          description: 'Suhu panas, saatnya menyegarkan diri di kolam',
          rating: '⭐⭐⭐⭐⭐',
          suitability: 'excellent'
        });
      } else if (temp < 15) {
        activities.push({
          icon: '☕',
          title: 'Minum Kopi Hangat',
          description: 'Cuaca dingin, nikmati minuman hangat',
          rating: '⭐⭐⭐⭐⭐',
          suitability: 'excellent'
        });
      }
      
      // High humidity recommendations
      if (humidity > 80) {
        activities.push({
          icon: '❄️',
          title: 'Ke Tempat Ber-AC',
          description: 'Kelembaban tinggi, cari tempat sejuk',
          rating: '⭐⭐⭐⭐',
          suitability: 'good'
        });
      }
      
      // Windy conditions
      if (windSpeed > 15) {
        activities.push({
          icon: '🪁',
          title: 'Main Layang-layang',
          description: 'Angin kencang cocok untuk main layang-layang',
          rating: '⭐⭐⭐⭐',
          suitability: 'good'
        });
      }
      
      // High UV index warning
      if (uvIndex > 7) {
        activities.push({
          icon: '🧴',
          title: 'Pakai Sunscreen',
          description: 'UV tinggi, jangan lupa perlindungan kulit',
          rating: '⭐⭐⭐⭐⭐',
          suitability: 'excellent'
        });
      }
      
      return activities.slice(0, 6); // Limit to 6 activities
    },
    
    convertToFahrenheit() {
    }
  },
  
  watch: {
    tempUnit(newUnit) {
    }
  }
}
</script>

<style scoped>
.search-city {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Search Section */
.search-section {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  border-radius: 2rem;
  padding: 3rem 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.search-title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.search-subtitle {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.search-form {
  max-width: 600px;
  margin: 0 auto;
}

.search-input-group {
  display: flex;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 2rem;
  padding: 0.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: white;
  font-size: 1.1rem;
  padding: 1rem 1.5rem;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-btn {
  background: linear-gradient(135deg, #949becff 0%, #cbd3f7ff 100%);
  color: white;
  border: none;
  border-radius: 1.5rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  min-width: 60px;
}

.search-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quick-cities {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.quick-label {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-right: 0.5rem;
}

.quick-city-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.quick-city-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* Error Message */
.error-message {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Weather Result */
.weather-result {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Main Weather Card */
.main-weather-card {
  background: linear-gradient(135deg, #ffde3aff 0%, #fbfed6ff 100%);
  border-radius: 2rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.weather-header {
  margin-bottom: 2rem;
}

.city-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-time {
  color: #7f8c8d;
  font-size: 0.95rem;
  margin: 0;
}

.weather-main {
  display: flex;
  justify-content: center;
}

.temperature-section {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.weather-icon {
  font-size: 6rem;
  animation: gentle-bounce 3s ease-in-out infinite;
}

@keyframes gentle-bounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.temperature-info {
  text-align: center;
}

.temp-display {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.temp-value {
  font-size: 4rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.temp-units {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.unit-btn {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  color: #2c3e50;
}

.unit-btn.active {
  background: #3498db;
  color: white;
}

.weather-description {
  font-size: 1.2rem;
  color: #34495e;
  margin: 0 0 1rem 0;
  text-transform: capitalize;
}

.temp-range {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.temp-high, .temp-low {
  font-size: 1rem;
  font-weight: 600;
}

.temp-high {
  color: #e74c3c;
}

.temp-low {
  color: #3498db;
}

/* Weather Details Grid */
.weather-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.weather-card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.weather-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.card-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
}

.card-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
}

/* Activity Recommendations */
.activity-recommendations {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  border-radius: 2rem;
  padding: 2rem;
  margin-top: 2rem;
}

.recommendations-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.activity-card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-left: 4px solid #3498db;
}

.activity-card.excellent {
  border-left-color: #9727aeff;
  background: linear-gradient(135deg, #ffffff 0%, #f8fff8 100%);
}

.activity-card.good {
  border-left-color: #f39c12;
  background: linear-gradient(135deg, #ffffff 0%, #fffef8 100%);
}

.activity-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.activity-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.activity-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 600;
}

.activity-content p {
  margin: 0 0 0.5rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.activity-rating {
  font-size: 0.9rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .search-city {
    padding: 1rem;
  }
  
  .search-section {
    padding: 2rem 1rem;
  }
  
  .search-title {
    font-size: 2rem;
  }
  
  .temperature-section {
    flex-direction: column;
    gap: 1rem;
  }
  
  .weather-icon {
    font-size: 4rem;
  }
  
  .temp-value {
    font-size: 3rem;
  }
  
  .weather-details-grid {
    grid-template-columns: 1fr;
  }
  
  .activities-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-cities {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .search-input-group {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .search-input {
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.2);
  }
  
  .search-btn {
    border-radius: 1rem;
  }
  
  .main-weather-card {
    padding: 1.5rem;
  }
  
  .activity-recommendations {
    padding: 1.5rem;
  }
}
</style>