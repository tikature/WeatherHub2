<template>
  <div class="hourly">
    <h3>🕒 Prakiraan Per Jam</h3>
    <div class="hour-list">
      <div v-for="(h, index) in forecast" :key="index" class="hour-box">
        <p>{{ h.time.split(' ')[1] }}</p>
        <img :src="h.condition.icon" />
        <p>{{ h.temp_c }}°C</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['forecast']
}
</script>

<style scoped>
.hour-list {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  padding: 1rem;
}
.hour-box {
  min-width: 80px;
  text-align: center;
  border: 1px solid #ddd;
  padding: 0.5rem;
  border-radius: 8px;
}
</style>
