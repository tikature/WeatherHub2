import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import SearchCity from '../pages/SearchCity.vue'
import WeatherMap from '../pages/WeatherMap.vue'

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/search', name: 'SearchCity', component: SearchCity },
    { path: '/map', name: 'WeatherMap', component: WeatherMap }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
