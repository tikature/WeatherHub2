<template>
  <div class="weekly">
    <h3>📅 Prakiraan Mingguan</h3>
    <div class="week-list">
      <div v-for="(day, index) in forecast" :key="index" class="day-box">
        <p>{{ day.date }}</p>
        <img :src="day.day.condition.icon" />
        <p>{{ day.day.avgtemp_c }}°C</p>
        <p>{{ day.day.condition.text }}</p>
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
.week-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  padding: 1rem;
}
.day-box {
  width: 120px;
  text-align: center;
  border: 1px solid #ccc;
  padding: 0.7rem;
  border-radius: 10px;
}
</style>
