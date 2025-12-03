const { createApp } = Vue;

createApp({
    data() {
        return {
            apiKey: 'e09e7c240e2754d1f914c7640ef2ab87',
            currentView: 'home',
            searchQuery: '',
            displayCity: '',
            weatherList: [],
            loading: false,
            // 3D іконки (залишаємо для брендингу Hippo, але в новому контексті)
            images: {
                'Clear': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Sun.png',
                'Clouds': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Cloud.png',
                'Rain': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Cloud%20with%20Rain.png',
                'Drizzle': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Cloud%20with%20Rain.png',
                'Thunderstorm': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Cloud%20with%20Lightning%20and%20Rain.png',
                'Snow': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Cloud%20with%20Snow.png',
                'Mist': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Fog.png',
                'Fog': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Fog.png',
                'default': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Sun%20Behind%20Cloud.png'
            }
        }
    },
    methods: {
        quickSearch(city) {
            this.searchQuery = city;
            this.searchCity();
        },
        cityTranslation(city) {
            const map = { 'Kyiv': 'Київ', 'Lviv': 'Львів', 'Odessa': 'Одеса', 'Kharkiv': 'Харків' };
            return map[city] || city;
        },
        async searchCity() {
            if (!this.searchQuery) return;

            this.loading = true;
            this.currentView = 'forecast';
            // Зберігаємо назву для відображення, капіталізуємо
            this.displayCity = this.searchQuery.charAt(0).toUpperCase() + this.searchQuery.slice(1);

            try {
                // API запит
                const url = `https://api.openweathermap.org/data/2.5/forecast?q=${this.searchQuery}&units=metric&lang=ua&appid=${this.apiKey}`;
                const response = await fetch(url);
                
                if (!response.ok) throw new Error("Місто не знайдено");
                
                const data = await response.json();
                
                // Групування даних (як було, але оптимізовано)
                const dailyData = {};
                data.list.forEach(item => {
                    const date = item.dt_txt.split(' ')[0];
                    if (!dailyData[date]) {
                        dailyData[date] = {
                            dt: item.dt,
                            main: { temp_min: item.main.temp_min, temp_max: item.main.temp_max },
                            weather: [item.weather[0]]
                        };
                    } else {
                        // Оновлюємо мін/макс за день
                        dailyData[date].main.temp_min = Math.min(dailyData[date].main.temp_min, item.main.temp_min);
                        dailyData[date].main.temp_max = Math.max(dailyData[date].main.temp_max, item.main.temp_max);
                        
                        // Беремо іконку з середини дня (12:00 або 15:00) для точності
                        if (item.dt_txt.includes("12:00")) {
                            dailyData[date].weather[0] = item.weather[0];
                        }
                    }
                });

                // Беремо 5 днів
                this.weatherList = Object.values(dailyData).slice(0, 5);
                this.displayCity = data.city.name; // Беремо офіційну назву з API

            } catch (error) {
                alert("Місто не знайдено 😔");
                this.currentView = 'home';
            } finally {
                this.loading = false;
                this.searchQuery = '';
            }
        },
        getImagePath(condition) {
            return this.images[condition] || this.images['default'];
        },
        formatDay(timestamp) {
            const date = new Date(timestamp * 1000);
            const dayName = date.toLocaleDateString('uk-UA', { weekday: 'short' });
            return dayName.charAt(0).toUpperCase() + dayName.slice(1);
        },
        getTempBarClass(maxTemp) {
            // Проста логіка для кольору смужки
            return maxTemp > 20 ? 'warm' : 'cold';
        }
    },
    computed: {
        mainWeather() {
            if (this.weatherList.length > 0) {
                return this.weatherList[0].weather[0].main.toLowerCase();
            }
            return 'clear';
        },
        translatedCondition() {
            if (this.weatherList.length > 0) {
                const desc = this.weatherList[0].weather[0].description;
                return desc.charAt(0).toUpperCase() + desc.slice(1);
            }
            return '';
        },
        weatherClass() {
            if (this.mainWeather.includes('rain') || this.mainWeather.includes('drizzle')) return 'bg-rain';
            if (this.mainWeather.includes('cloud')) return 'bg-cloud';
            if (this.mainWeather.includes('fog') || this.mainWeather.includes('mist')) return 'bg-fog';
            return 'bg-sun';
        },
        isSunny() { return this.weatherClass === 'bg-sun'; },
        isRainy() { return this.weatherClass === 'bg-rain'; },
        isFoggy() { return this.weatherClass === 'bg-fog'; },
        isCloudy() { return this.weatherClass === 'bg-cloud'; }
    }
}).mount('#app');