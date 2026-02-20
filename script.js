/* ==========================================
   STARDW WEATHER ENGINE - UNIVERSAL FIX
   ========================================== */

const weatherCodes = {
    0: "☀️ Clear Skies", 1: "🌤️ Mainly Clear", 2: "⛅ Partly Cloudy", 3: "☁️ Overcast",
    45: "🌫️ Foggy", 48: "🌫️ Rime Fog", 51: "🌦️ Drizzle", 61: "🌧️ Rain",
    71: "🌨️ Light Snow", 73: "❄️ Snowing", 75: "❄️ Heavy Snow", 77: "❄️ Snow Grains",
    80: "🌦️ Rain Showers", 85: "🌨️ Snow Showers", 95: "⛈️ Thunderstorm"
};

async function startDashboard() {
    // 1. Immediately update the UI to show we are working
    const weatherDiv = document.getElementById('weather-display');
    weatherDiv.innerText = "⚡ Connecting to Open-Meteo...";

    try {
        // Fetch Weather
        const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=41.97&longitude=-87.66&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weather_code&temperature_unit=fahrenheit&timezone=auto");
        const data = await response.json();
        
        const current = data.current;
        const daily = data.daily;
        const feels = Math.round(current.apparent_temperature);
        const cond = weatherCodes[current.weather_code] || "☀️ Clear";

        // Update Weather Header
        weatherDiv.innerHTML = `
            <div style="font-size: 2.2rem; color: var(--header-color); font-weight: bold;">${cond}</div>
            <div class="stat-line">🌡️ NOW: ${Math.round(current.temperature_2m)}°F (FEELS: ${feels}°F)</div>
            <div class="stat-line">🌬️ WIND: ${current.wind_speed_10m} MPH</div>
        `;

        // Update Gear
        const walk = document.getElementById('walking-gear');
        const bike = document.getElementById('biking-gear');
        if (feels < 30) {
            walk.innerHTML = "<li>Heavy Parka</li><li>Thermal Layer</li>";
            bike.innerHTML = "<li>Wind Shell</li><li>Lobster Mitts</li>";
        } else {
            walk.innerHTML = "<li>Light Jacket</li>";
            bike.innerHTML = "<li>Cycling Jersey</li>";
        }

        // Update Outlook
        let outHtml = "";
        for(let i=0; i<3; i++) {
            outHtml += `<div><b>Day ${i+1}:</b> ${Math.round(daily.temperature_2m_max[i])}°F / ${weatherCodes[daily.weather_code[i]]}</div>`;
        }
        document.getElementById('outlook').innerHTML = outHtml;

        // Fetch Horoscope (Last)
        fetchHoroscope();

    } catch (err) {
        weatherDiv.innerText = "❌ Connection Failed. Check your internet!";
        console.error(err);
    }
}

async function fetchHoroscope() {
    const luckBox = document.getElementById('luck');
    try {
        const hApi = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=taurus&day=today`;
        const proxy = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(hApi)}`);
        const pData = await proxy.json();
        const hData = JSON.parse(pData.contents);
        const rawHoro = hData.data.horoscope_data;
        
        luckBox.innerHTML = `🔮 <b>TAURUS:</b><br>${rawHoro.split('.')[0]}.`;
    } catch (e) {
        luckBox.innerHTML = `🔮 <b>Daily Luck:</b> The spirits are neutral.`;
    }
}

// Start the engine
startDashboard();
