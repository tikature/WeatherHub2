

export const API_KEY = '1e8cf00f9f4f4809b0e155132252007'
export const BASE_URL = 'https://api.weatherapi.com/v1'

export function fetchWeather(endpoint, query) {
    return fetch(`${BASE_URL}/${endpoint}?key=${API_KEY}&q=${query}`)
        .then(res => res.json())
}