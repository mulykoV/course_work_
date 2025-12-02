const { createApp } = Vue;

createApp({
    data() {
        return {
            apiKey: 'e09e7c240e2754d1f914c7640ef2ab87', // Твій ключ
            currentView: 'home',
            searchQuery: '',
            selectedCity: '',
            displayCity: '',
            weatherList: [],
            loading: false,
            images: {
                'Clear': 'sun.png',
                'Clouds': 'cloud.png',
                'Rain': 'rain.png',
                'Drizzle': 'rain.png',
                'Thunderstorm': 'storm.png',
                'Snow': 'wind.png',
                'default': 'banner.png'
            }
        }
    },
    methods: {
        async searchCity() {
            const city = this.searchQuery || this.selectedCity;
            
            if (!city) {
                alert("Будь ласка, введіть або оберіть місто!");
                return;
            }

            this.loading = true;
            this.currentView = 'forecast';
            this.displayCity = city;

            try {
                const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=ua&appid=${this.apiKey}`;
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`Помилка: ${response.status}`);
                }
                
                const data = await response.json();
                
                // --- ВИПРАВЛЕНА ЛОГІКА MIN/MAX ---
                const dailyData = {};

                data.list.forEach(item => {
                    const date = item.dt_txt.split(' ')[0];

                    if (!dailyData[date]) {
                        // Створюємо об'єкт ТОЧНО так, як чекає HTML
                        dailyData[date] = {
                            dt: item.dt,
                            main: {
                                temp_min: item.main.temp_min,
                                temp_max: item.main.temp_max
                            },
                            weather: [ 
                                { 
                                    main: item.weather[0].main, 
                                    description: item.weather[0].description 
                                } 
                            ]
                        };
                    } else {
                        // Оновлюємо Min/Max
                        if (item.main.temp_min < dailyData[date].main.temp_min) {
                            dailyData[date].main.temp_min = item.main.temp_min;
                        }
                        if (item.main.temp_max > dailyData[date].main.temp_max) {
                            dailyData[date].main.temp_max = item.main.temp_max;
                        }
                        
                        // Якщо це обід, оновлюємо картинку
                        if (item.dt_txt.includes("12:00:00")) {
                            dailyData[date].weather[0] = item.weather[0];
                            dailyData[date].dt = item.dt;
                        }
                    }
                });

                // Беремо перші 5 днів
                this.weatherList = Object.values(dailyData).slice(0, 5);
                
            } catch (error) {
                console.error(error);
                alert("Помилка завантаження або невірний ключ API. Спробуйте пізніше.");
                this.currentView = 'home'; 
            } finally {
                this.loading = false;
                this.searchQuery = '';
                this.selectedCity = '';
            }
        },

        getImagePath(condition) {
            return this.images[condition] || this.images['default'];
        },

        formatDay(timestamp) {
            const date = new Date(timestamp * 1000);
            const dayName = date.toLocaleDateString('uk-UA', { weekday: 'long' });
            return dayName.charAt(0).toUpperCase() + dayName.slice(1);
        }
    }
}).mount('#app');
