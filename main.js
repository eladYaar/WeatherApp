"use strict";

onPageLoad();

function onPageLoad() {
    const now = updateClock();
    const hour = now.getHours();
    setInterval(updateClock, 1000);
    document.getElementById("cityBox").value = "";
    connectDataDisplayWeather(true);
    setBackground(hour);

}
function setBackground(currentHour) {
    if (currentHour < 18 && currentHour > 6) {
        document.body.style.backgroundImage = 'url(assets/images/backgroundDay.jpg)';
    } else {
        document.body.style.backgroundImage = 'url(assets/images/backgroundNight.jpg)';
        document.body.style.color = "#EEEEEE";
    }
}

function updateClock() {
    const now = new Date();
    const container = document.getElementById("clock");
    const timeLocale = now.toLocaleTimeString("en-UK", {
        hour: '2-digit',
        minute: '2-digit',
    });
    container.innerHTML = timeLocale;
    return now;
}

function getCurrentPositionPromisified() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

// Control
async function connectDataDisplayWeather(useCurrentPosition = false) {
    try {
        displayWeather(await getWeatherData(useCurrentPosition), 2);            
    } catch (error) {
        if ((error instanceof GeolocationPositionError) && (error.code === 1)) {
            console.log(error.message);

        } else {
            alert("oops, something went wrong!");
            console.error(error.message);
        }
    }
}

// Data
async function getWeatherData(useCurrentPosition = false) {
    const cityBox = document.getElementById("cityBox");
    const city = cityBox.value;
    const apiKey = "700a80af8ec24276bcf173630251501";
    
    let location;
    if (useCurrentPosition) {
        const geolocation = await getCurrentPositionPromisified();
        const latitude = geolocation.coords.latitude;
        const longitude = geolocation.coords.longitude;
        location = `${latitude},${longitude}`;
    } else {
        location = city;
    }

    const url = `http://api.weatherapi.com/v1/forecast.json?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(location)}&days=3&aqi=no&alerts=no`;
    const response = await axios.get(url);

    return response.data;
}

// UI
function displayWeather(weather, numberOfDays) {
    const divContainer = document.getElementById("divContainer");
    document.getElementById("cityNameTitle").innerHTML = weather.location.name;
    document.getElementById("tempNowDiv").innerHTML = `
        <h2 id="tempNow">
            Now: ${weather.current.temp_c}° c
        </h2>`;


    let html = "";
    for (let i = 0; i <= numberOfDays; i++) {
        const forecastday = weather.forecast.forecastday[i];
        html += `
        <div class="card" style="width: 18rem;">
            <div class="card-body">
                <h4 class="card-title">${forecastday.date}</h4>
                <img src="${forecastday.day.condition.icon}">
            </div>
            <ul class="list-group list-group-flush">
                <li class="list-group-item">
                    <h5>
                    <div>
                        High:
                        ${forecastday.day.maxtemp_c}° c
                    </div>                   
                    <div>
                        Low:
                        ${forecastday.day.mintemp_c}° c
                    </div>
                     </h5>                    
                </li>
            </ul>
        </div>
    `;
    }
    divContainer.innerHTML = html;

    document.getElementById("cityBox").value = "";
}
