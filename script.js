// Helper: Convert ISO time string to AM/PM
function formatToAMPM(isoString) {
    if (!isoString) return "--:--";
    const timePart = isoString.split("T")[1];
    let [hours, minutes] = timePart.split(":");
    hours = parseInt(hours, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

async function fetchStardewWeather() {
    const lat = 41.97; // Chicago 60640
    const lon = -87.66;
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,wind_speed_10m&daily=temperature_2m_max,sunrise,sunset,weather_code&temperature_unit=fahrenheit&timezone=auto`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const feelsLike = Math.round(data.current.apparent_temperature);
        const currentMonth = new Date().getMonth();

        // 1. Determine Season
        let seasonClass = "spring"; 
        if (currentMonth >= 5 && currentMonth <= 7) seasonClass = "summer";
        else if (currentMonth >= 8 && currentMonth <= 10) seasonClass = "fall";
        else if (currentMonth === 11 || currentMonth <= 1) seasonClass = "winter";

        document.getElementById('season-body').className = seasonClass;
        document.getElementById('season-title').innerText = `📺 ${seasonClass.toUpperCase()} WEATHER`;

        // 2. Render Weather and AM/PM Sun Times
        document.getElementById('weather-data').innerHTML = `
            <div>🌡️ TEMP: ${Math.round(data.current.temperature_2m)}°F (FEELS: ${feelsLike}°F)</div>
            <div>🌬️ WIND: ${data.current.wind_speed_10m} MPH</div>
            <div>☀️ SUN: ${formatToAMPM(data.daily.sunrise[0])} / ${formatToAMPM(data.daily.sunset[0])}</div>
        `;
        
        // 3. Daily Luck
        const messages = ["Very Happy", "Good Humor", "Neutral", "Somewhat Annoyed"];
        document.getElementById('luck').innerHTML = `🔮 <b>Luck:</b> The spirits are ${messages[Math.floor(Math.random()*messages.length)]}!`;

        // 4. Gear Logic
        const walkList = document.getElementById('walking-list');
        const bikeList = document.getElementById('biking-list');

        if (feelsLike < 25) {
            walkList.innerHTML = "<li>Heavy Parka</li><li>Thermal Base</li><li>Balaclava</li><li>Mittens</li>";
            bikeList.innerHTML = "<li>Wind Shell</li><li>Puffer Mid</li><li>Full Mask</li><li>Lobster Mitts</li>";
        } else if (feelsLike < 45) {
            walkList.innerHTML = "<li>Standard Coat</li><li>Merino Base</li><li>Beanie</li><li>Gloves</li>";
            bikeList.innerHTML = "<li>Windbreaker</li><li>Light Fleece</li><li>Neck Gaiter</li><li>Insulated Gloves</li>";
        } else if (feelsLike > 80) {
            walkList.innerHTML = "<li>Light Tee</li><li>Shorts</li><li>Sun Hat</li>";
            bikeList.innerHTML = "<li>Jersey</li><li>Cycled Shorts</li><li>Extra Water!</li>";
        } else {
            walkList.innerHTML = "<li>Light Jacket</li><li>Breathable Top</li>";
            bikeList.innerHTML = "<li>Wind Vest</li><li>Long Sleeve Jersey</li>";
        }

        // 5. 3-Day Outlook
        let outlookContent = "";
        for(let i=1; i<=3; i++) {
            const highTemp = Math.round(data.daily.temperature_2m_max[i]);
            const isGolden = highTemp > 50 && data.daily.weather_code[i] < 3;
            outlookContent += `<div>Day ${i}: ${highTemp}°F ${isGolden ? '<span class="golden-day">☀️ GOLDEN DAY!</span>' : ''}</div>`;
        }
        document.getElementById('outlook').innerHTML = outlookContent;

    } catch (error) {
        document.getElementById('weather-data').innerText = "Spirit connection failed!";
    }
}

fetchStardewWeather();
