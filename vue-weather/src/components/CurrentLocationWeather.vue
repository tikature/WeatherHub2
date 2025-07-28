<template>
  <div v-if="weather">
    <h2>{{ weather.location.name }}, {{ weather.location.country }}</h2>
    <p>{{ weather.current.temp_c }}°C - {{ weather.current.condition.text }}</p>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      weather: null
    }
  },
  async mounted() {
    try {
      // Ambil lokasi pengguna
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude

        const res = await axios.get('http://localhost:3001/forecast', {
          params: { lat, lon }
        })

        this.weather = res.data
        this.$emit('forecast-loaded', res.data)
      }, (error) => {
        console.error('Gagal mendapatkan lokasi:', error.message)
      })
    } catch (err) {
      console.error('Gagal ambil data cuaca:', err)
    }
  }
}
</script>
