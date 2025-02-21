let images = Array.from({ length: 16 }, (_, i) => i + 1);
let currentIndex = 0;

function shuffleImages() {
    for (let i = images.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [images[i], images[j]] = [images[j], images[i]];
    }
}

function changeBackgroundImage() {
    if (currentIndex >= images.length) {
        shuffleImages();
        currentIndex = 0;
    }

    const leftInfo = document.querySelector('.left-info');
    leftInfo.style.opacity = 0;

    setTimeout(() => {
        leftInfo.style.backgroundImage = `url('images/${images[currentIndex]}.png')`;
        leftInfo.style.backgroundSize = 'cover';
        leftInfo.style.backgroundPosition = 'center';
        leftInfo.style.opacity = 1;
        currentIndex++;
    }, 500);
}

document.addEventListener("DOMContentLoaded", () => {
    shuffleImages();
    document.querySelector('.left-info').style.transition = "opacity 0.5s ease-in-out";
});

setInterval(changeBackgroundImage, 10000);
changeBackgroundImage();




const apiKey = 'YOUR_API_KEY';
const locButton = document.querySelector('.loc-button');
const todayInfo = document.querySelector('.today-info');
const todayWeatherIcon = document.querySelector('.today-weather i');
const todayTemp = document.querySelector('.weather-temp');
const daysList = document.querySelector('.days-list');

const weatherIconMap = {
    '01d': 'sun',
    '01n': 'moon',
    '02d': 'sun',
    '02n': 'moon',
    '03d': 'cloud',
    '03n': 'cloud',
    '04d': 'cloud',
    '04n': 'cloud',
    '09d': 'cloud-rain',
    '09n': 'cloud-rain',
    '10d': 'cloud-rain',
    '10n': 'cloud-rain',
    '11d': 'cloud-lightning',
    '11n': 'cloud-lightning',
    '13d': 'cloud-snow',
    '13n': 'cloud-snow',
    '50d': 'water',
    '50n': 'water'
};

const translateWeatherDescription = (description) => {
    const translations = {
        'clear sky': 'céu limpo',
        'clear': 'céu limpo',
        'sunny': 'ensolarado',
        'few clouds': 'algumas nuvens',
        'scattered clouds': 'nuvens dispersas',
        'broken clouds': 'nuvens quebradas',
        'partly cloudy': 'parcialmente nublado',
        'cloudy': 'nublado',
        'overcast': 'encoberto',
        'shower rain': 'chuva rápida',
        'rain': 'chuva',
        'thunderstorm': 'tempestade',
        'snow': 'neve',
        'mist': 'neblina',
        'smoke': 'fumaça',
        'haze': 'névoa',
        'dust': 'poeira',
        'fog': 'nevoeiro',
        'sand': 'areia',
        'ash': 'cinza',
        'patchy rain possible': 'possível chuva irregular',
        'patchy snow possible': 'possível neve irregular',
        'patchy sleet possible': 'possível granizo irregular',
        'thundery outbreaks possible': 'possíveis pancadas de tempestade',
        'blowing snow': 'nevasca',
        'freezing fog': 'nevoeiro congelante',
        'light drizzle': 'chuvisco leve',
        'drizzle': 'chuva fraca',
        'heavy drizzle': 'chuva forte',
        'light rain': 'chuva leve',
        'moderate rain': 'chuva moderada',
        'heavy rain': 'chuva intensa',
        'light snow': 'neve leve',
        'moderate snow': 'neve moderada',
        'heavy snow': 'nevasca'
    };

    return translations[description] || description;
};

function fetchWeatherData(location) {
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=7&aqi=no&alerts=no`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const current = data.current;
            const todayForecast = data.forecast.forecastday[0].day;
            const todayWeatherText = current.condition.text.toLowerCase();
            const todayTemperature = `${Math.round(current.temp_c)}°C`;


            let iconKey = "01d";
            const isDay = current.is_day === 1;
            if (todayWeatherText.includes("clear")) {
                iconKey = isDay ? "01d" : "01n";
            } else if (todayWeatherText.includes("partly")) {
                iconKey = isDay ? "02d" : "02n";
            } else if (todayWeatherText.includes("cloud")) {
                iconKey = "03d";
            } else if (todayWeatherText.includes("overcast")) {
                iconKey = "04d";
            } else if (todayWeatherText.includes("rain")) {
                iconKey = "09d";
            } else if (todayWeatherText.includes("thunder")) {
                iconKey = "11d";
            } else if (todayWeatherText.includes("snow")) {
                iconKey = "13d";
            } else if (todayWeatherText.includes("mist") || todayWeatherText.includes("fog")) {
                iconKey = "50d";
            }

            todayInfo.querySelector('h2').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
            todayInfo.querySelector('span').textContent = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
            todayWeatherIcon.className = `bx bx-${weatherIconMap[iconKey]}`;
            todayTemp.textContent = todayTemperature;

            const locationElement = document.querySelector('.today-info > div > span');
            locationElement.textContent = `${data.location.name}, ${data.location.country}`;

            const weatherDescriptionElement = document.querySelector('.today-weather > h3');
            weatherDescriptionElement.textContent = translateWeatherDescription(current.condition.text.toLowerCase());

            const todayPrecipitation = `${todayForecast.daily_chance_of_rain}%`;
            const todayHumidity = `${current.humidity}%`;
            const todayWindSpeed = `${current.wind_kph} km/h`;

            const dayInfoContainer = document.querySelector('.day-info');
            dayInfoContainer.innerHTML = `
                <div>
                    <span class="title">PRECIPITAÇÃO</span>
                    <span class="value">${todayPrecipitation}</span>
                </div>
                <div>
                    <span class="title">UMIDADE</span>
                    <span class="value">${todayHumidity}</span>
                </div>
                <div>
                    <span class="title">VELOCIDADE DO VENTO</span>
                    <span class="value">${todayWindSpeed}</span>
                </div>
            `;

            updateWeatherForNextDays(data);
        })
        .catch(error => {
            alert(`Erro ao buscar dados climáticos: ${error} (Erro na API)`);
        });
}

function updateWeatherForNextDays(data) {
    const forecastDays = data.forecast.forecastday;
    

    forecastDays.sort((a, b) => {
        return new Date(a.date).getDay() - new Date(b.date).getDay();
    });
    

    const weekdayAbbr = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    
    daysList.innerHTML = '';
    
    forecastDays.forEach(dayData => {
        const dateObj = new Date(dayData.date);
        const dayIndex = dateObj.getDay(); 
        const dayAbbreviation = weekdayAbbr[dayIndex];
        const dayTemp = `${Math.round(dayData.day.avgtemp_c)}°C`;

        let iconKey = "01d";
        const condition = dayData.day.condition.text.toLowerCase();
        if (condition.includes("clear")) {
            iconKey = "01d";
        } else if (condition.includes("partly")) {
            iconKey = "02d";
        } else if (condition.includes("cloud")) {
            iconKey = "03d";
        } else if (condition.includes("overcast")) {
            iconKey = "04d";
        } else if (condition.includes("rain")) {
            iconKey = "09d";
        } else if (condition.includes("thunder")) {
            iconKey = "11d";
        } else if (condition.includes("snow")) {
            iconKey = "13d";
        } else if (condition.includes("mist") || condition.includes("fog")) {
            iconKey = "50d";
        }

        daysList.innerHTML += `
            <li>
                <i class='bx bx-${weatherIconMap[iconKey]}'></i>
                <span>${dayAbbreviation}</span>
                <span class="day-temp">${dayTemp}</span>
            </li>
        `;
    });
}

function fetchWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const geoApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7&aqi=no&alerts=no`;

            fetch(geoApiUrl)
                .then(response => response.json())
                .then(data => {
                    fetchWeatherData(data.location.name);
                })
                .catch(error => {
                    alert(`Erro ao buscar dados climáticos: ${error} (Erro de Geolocalização)`);
                });
        }, error => {
            alert('Acesso à geolocalização negado ou falhou');
        });
    } else {
        alert('A geolocalização não é suportada pelo seu navegador');
    }
}

document.addEventListener('DOMContentLoaded', fetchWeatherByLocation);
locButton.addEventListener('click', fetchWeatherByLocation);


