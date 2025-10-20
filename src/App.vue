<template>
  <div class="app">
    <div class="background-pattern"></div>

    <!-- Header with Navbar -->
    <header class="app-header">
      <div class="header-content">
        
        <!-- Branding - Icon dan Title dalam satu baris -->
        <div class="branding">
          <div class="logo-icon">🌦️</div>
          <div class="brand-text">
            <h1 class="app-name">WeatherHub</h1>
            <p class="app-subtitle">Informasi Cuaca & Kelembaban Real-time</p>
          </div>
        </div>

        <!-- Tombol toggle nav untuk mobile -->
        <button class="nav-toggle" @click="toggleNav">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>

        <!-- Navigation -->
        <nav class="app-nav" :class="{ open: isNavOpen }">
          <router-link to="/" class="nav-link" @click="closeNav">
            <i class="fas fa-home"></i> 
            <span>Beranda</span>
          </router-link>
          <router-link to="/search" class="nav-link" @click="closeNav">
            <i class="fas fa-search-location"></i> 
            <span>Search City</span>
          </router-link>
          <router-link to="/map" class="nav-link" @click="closeNav">
            <i class="fas fa-map-marked-alt"></i> 
            <span>Weather Map</span>
          </router-link>
        </nav>
      </div>

      <!-- Improved Floating Elements -->
      <div class="header-decoration">
        <div class="floating-element cloud-1">☁️</div>
        <div class="floating-element cloud-2">⛅</div>
        <div class="floating-element cloud-3">🌤️</div>
        <div class="floating-element sun">☀️</div>
        <div class="floating-element rain">🌧️</div>
        <div class="floating-element snow">❄️</div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <router-view />
      </div>
    </main>

    <!-- Fixed Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-section">
          <div class="footer-brand">
            <span class="footer-logo">🌦️</span>
            <span class="footer-title">WeatherHub</span>
          </div>
          <p class="footer-description">
            Aplikasi cuaca terpercaya dengan informasi real-time
          </p>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-heading">Menu</h4>
          <div class="footer-links">
            <router-link to="/" class="footer-link">Beranda</router-link>
            <router-link to="/search" class="footer-link">Search City</router-link>
            <router-link to="/map" class="footer-link">Weather Map</router-link>
          </div>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-heading">Developer</h4>
          <p class="developer-info">
            <span class="developer-name">tikature</span>
            <span class="developer-role">Full Stack Developer</span>
          </p>
          <div class="social-links">
            <a href="https://github.com/tikature" class="social-link" title="GitHub">
              <i class="fab fa-github"></i>
            </a>
            <a href="https://linkedin.com/in/dewi-atika-muthi" class="social-link" title="LinkedIn">
              <i class="fab fa-linkedin"></i>
            </a>
            <a href="https://instagram.com/tikature" class="social-link" title="Instagram">
              <i class="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2024 WeatherHub. All rights reserved.</p>
        <p class="footer-tech">Built with Vue.js</p>
      </div>
    </footer>
  </div>
</template>

<script>
import Weather from './components/Weather.vue'

export default {
  name: 'App',
  components: { Weather },
  data() {
    return {
      isNavOpen: false
    }
  },
  methods: {
    toggleNav() {
      this.isNavOpen = !this.isNavOpen;
      console.log('Nav toggled:', this.isNavOpen); // Debug
    },
    closeNav() {
      this.isNavOpen = false;
    },
    handleOutsideClick(e) {
      const header = this.$el?.querySelector('.app-header');
      if (header && !header.contains(e.target)) {
        this.isNavOpen = false;
      }
    }
  },
  mounted() {
    // Close nav when clicking outside
    document.addEventListener('click', this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
  }
}
</script>

<style scoped>
.app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  min-height: 100vh;
  background: linear-gradient(135deg, #c9d6ff 0%, #e2e2e2 100%);
  position: relative;
  overflow-x: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.background-pattern {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.03;
  background-image: url('https://www.transparenttextures.com/patterns/stardust.png');
  z-index: 0;
  pointer-events: none;
}

/* Header Styles */
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: full;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
  padding: 1rem 1.9rem;
  border-bottom-left-radius: 2rem;
  border-bottom-right-radius: 2rem;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}


.header-content {
  top: 0;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1001;
}

/* Branding - Icon dan Title dalam satu baris */
.branding {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.logo-icon {
  font-size: 3rem;
  animation: gentle-pulse 3s ease-in-out infinite;
  flex-shrink: 0;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.app-name {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  line-height: 1.2;
}

.app-subtitle {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 300;
  line-height: 1.2;
}

/* Navigation Toggle */
.nav-toggle {
  display: none;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.6rem;
  border-radius: 0.8rem;
  transition: all 0.3s ease;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;
  width: 2.8rem;
  height: 2.4rem;
  position: relative;
  z-index: 1005;
}

.hamburger-line {
  display: block;
  width: 1.2rem;
  height: 0.15rem;
  background: white;
  border-radius: 0.1rem;
  transition: all 0.3s ease;
}

.nav-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.nav-toggle:active {
  transform: scale(0.95);
}

/* Navigation */
.app-nav {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.6rem 1.2rem;
  border-radius: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nav-link i {
  font-size: 1rem;
}

.router-link-active {
  background: rgba(255, 255, 255, 0.3);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Main Content */
.main-content {
  flex: ;
  position: relative;
  z-index: 1;
  padding-top: 5rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  min-height: 60vh;
}


/* Footer Styles */
.app-footer {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  position: relative;
  z-index: 10;
  margin-top: auto;
 width: 100vw;
}


.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 2.5rem 1.5rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}


.footer-section {
  display: flex;
  flex-direction: column;
  gap: 0rem;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.footer-logo {
  font-size: 2rem;
}

.footer-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.footer-description {
  color: #bdc3c7;
  line-height: 1.6;
  margin: 0;
}

.footer-heading {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #ecf0f1;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-link {
  color: #bdc3c7;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 0.25rem 0;
}

.footer-link:hover {
  color: #3498db;
  transform: translateX(5px);
}

.developer-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
}

.developer-name {
  font-weight: 600;
  color: #ecf0f1;
}

.developer-role {
  color: #bdc3c7;
  font-size: 0.9rem;
}

.social-links {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.social-link {
  color: #bdc3c7;
  font-size: 1.25rem;
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.social-link:hover {
  color: #3498db;
  background: rgba(52, 152, 219, 0.2);
  transform: translateY(-2px);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  text-align: center;
  background: rgba(0, 0, 0, 0.1);
}

.footer-bottom p {
  margin: 0.25rem 0;
  color: #bdc3c7;
  font-size: 0.9rem;
}

.footer-tech {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* Animations */
@keyframes gentle-pulse {
  0%, 100% { 
    transform: scale(1); 
  }
  50% { 
    transform: scale(1.05); 
  }
}

/* Floating Elements */
.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.floating-element {
  position: absolute;
  font-size: 2rem;
  opacity: 0.6;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.cloud-1 {
  top: 20%;
  left: 10%;
  animation: float-horizontal 15s infinite;
  animation-delay: 0s;
}

.cloud-2 {
  top: 60%;
  right: 15%;
  animation: float-diagonal 20s infinite;
  animation-delay: -5s;
  font-size: 1.8rem;
}

.cloud-3 {
  top: 40%;
  left: 70%;
  animation: float-vertical 12s infinite;
  animation-delay: -8s;
  font-size: 1.5rem;
}

.sun {
  top: 15%;
  right: 25%;
  animation: rotate-and-float 25s infinite;
  animation-delay: -3s;
  font-size: 1.6rem;
  opacity: 0.4;
}

.rain {
  top: 70%;
  left: 30%;
  animation: float-rain 8s infinite;
  animation-delay: -2s;
  font-size: 1.4rem;
  opacity: 0.5;
}

.snow {
  top: 30%;
  right: 5%;
  animation: float-snow 18s infinite;
  animation-delay: -12s;
  font-size: 1.3rem;
  opacity: 0.3;
}

/* Floating Animations */
@keyframes float-horizontal {
  0% { transform: translateX(-20px) translateY(0px); opacity: 0.3; }
  25% { opacity: 0.6; }
  50% { transform: translateX(20px) translateY(-10px); opacity: 0.4; }
  75% { opacity: 0.7; }
  100% { transform: translateX(-20px) translateY(0px); opacity: 0.3; }
}

@keyframes float-diagonal {
  0% { transform: translateX(-15px) translateY(-15px); opacity: 0.4; }
  25% { transform: translateX(10px) translateY(-5px); opacity: 0.6; }
  50% { transform: translateX(15px) translateY(10px); opacity: 0.3; }
  75% { transform: translateX(-5px) translateY(15px); opacity: 0.5; }
  100% { transform: translateX(-15px) translateY(-15px); opacity: 0.4; }
}

@keyframes float-vertical {
  0% { transform: translateY(-10px); opacity: 0.5; }
  50% { transform: translateY(15px); opacity: 0.3; }
  100% { transform: translateY(-10px); opacity: 0.5; }
}

@keyframes rotate-and-float {
  0% { transform: rotate(0deg) translateY(0px); opacity: 0.3; }
  25% { transform: rotate(90deg) translateY(-8px); opacity: 0.5; }
  50% { transform: rotate(180deg) translateY(5px); opacity: 0.4; }
  75% { transform: rotate(270deg) translateY(-5px); opacity: 0.6; }
  100% { transform: rotate(360deg) translateY(0px); opacity: 0.3; }
}

@keyframes float-rain {
  0% { transform: translateY(-5px) scale(1); opacity: 0.4; }
  50% { transform: translateY(8px) scale(1.1); opacity: 0.6; }
  100% { transform: translateY(-5px) scale(1); opacity: 0.4; }
}

@keyframes float-snow {
  0% { transform: translateX(-8px) translateY(-8px) rotate(0deg); opacity: 0.2; }
  33% { transform: translateX(5px) translateY(5px) rotate(120deg); opacity: 0.4; }
  66% { transform: translateX(8px) translateY(-3px) rotate(240deg); opacity: 0.3; }
  100% { transform: translateX(-8px) translateY(-8px) rotate(360deg); opacity: 0.2; }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .nav-toggle {
    display: flex;
    z-index: 1005;
  }
  
  .app-nav {
    position: fixed;
    top: 5rem;
    left: 1rem;
    right: 1rem;
    background: rgba(74, 144, 226, 0.98);
    backdrop-filter: blur(15px);
    flex-direction: column;
    gap: 0.5rem;
    padding: 1.5rem;
    border-radius: 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 1004;
    max-height: 0;
    overflow: hidden;
  }
  
  .app-nav.open {
    transform: translateY(0) scale(1);
    opacity: 1;
    visibility: visible;
    max-height: 300px;
  }
  
  .nav-link {
    width: 100%;
    justify-content: flex-start;
    padding: 0.8rem 1rem;
  }
  
  .header-content {
    position: relative;
  }
  
  .app-name {
    font-size: 1.5rem;
  }
  
  .app-subtitle {
    font-size: 0.8rem;
  }
  
  .logo-icon {
    font-size: 2.5rem;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 2rem 1rem 1rem;
  }
  
  .footer-section {
    text-align: center;
  }
  
  .footer-brand {
    justify-content: center;
  }
  
  .social-links {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 1rem;
  }
  
  .branding {
    gap: 0.75rem;
  }
  
  .logo-icon {
    font-size: 2rem;
  }
  
  .app-name {
    font-size: 1.3rem;
  }
  
  .app-subtitle {
    font-size: 0.75rem;
  }
  
  .container {
    padding: 0;
  }
  
  .floating-element {
    font-size: 1.2rem;
  }
  
  .footer-content {
    padding: 1.5rem 1rem 1rem;
  }
}
</style>
