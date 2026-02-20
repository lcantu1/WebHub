/* ==========================================
   WEATHER LOGIC & GEAR DATABASE
   ========================================== */

const weatherCodes = {
    0: "Clear Skies", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Foggy", 48: "Rime Fog", 51: "Drizzle", 61: "Rain",
    71: "Light Snow", 73: "Snowing", 75: "Heavy Snow", 77: "Snow Grains",
    80: "Rain Showers", 85: "Snow Showers", 95: "Thunderstorm"
};

function formatTime(iso) {
    if(!iso) return "--:--";
    return new Date(iso).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDateLabel(iso) {
    const d = new Date(iso);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function setSeason(season) {
    document.getElementById('season-body').className = season;
    document.getElementById('season-title').innerText = `📺 ${season.toUpperCase()} REPORT`;
}

function autoSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) setSeason("spring");
    else if (month >= 5 && month <= 7) setSeason("summer");
    else if (month >= 8 && month <= 10) setSeason("fall");
    else setSeason("winter");
}

async function fetchHoroscope() {
    const luckBox = document.getElementById('luck');
    const sign = "taurus";
    const url = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${sign}&day=today`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const fullHoroscope = data.data.horoscope_data;

        const sentences = fullHoroscope.split('. ');
        let displayHoroscope = (sentences.length > 1) 
            ? `${sentences[0]}.<br><br>${sentences[sentences.length - 1]}` 
            : fullHoroscope;

        const spirits = ["very happy", "in good humor", "neutral", "somewhat annoyed"];
        const dailySpirit = spirits[Math.floor(Math.random() * spirits.length)];

        luckBox.innerHTML = `
            <div style="margin-bottom: 10px;">
                🔮 <b>SPIRIT LUCK:</b> The spirits are ${dailySpirit} today.
            </div>
            <div style="border-top: 2px dashed var(--header-color); padding-top: 10px; font-size: 1.3rem; line-height: 1.2;">
                🐂 <b>TAURUS:</b><br>${displayHoroscope}
            </div>
        `;
    } catch (e) {
        luckBox.innerHTML = `🔮 <b>Daily Luck:</b> The spirits are neutral today.`;
    }
}

async function startDashboard() {
    const lat = 41.97;
    const lon = -87.66;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,wind_speed_10m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weather_code&temperature_unit=fahrenheit&timezone=auto`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        const currentTemp = Math.round(data.current.temperature_2m);
        const feels = Math.round(data.current.apparent_temperature);
        const wind = data.current.wind_speed_10m;
        const condition = weatherCodes[data.current.weather_code] || "Clear";
        
        autoSeason();
        fetchHoroscope();

        document.getElementById('weather-display').innerHTML = `
            <div style="font-size: 2.2rem; color: var(--header-color); font-weight: bold;">${condition}</div>
            <div class="stat-line">🌡️ NOW: ${currentTemp}°F (FEELS: ${feels}°F)</div>
            <div class="stat-line">🌬️ WIND: ${wind} MPH</div>
            <div class="stat-line">☀️ SUN: ${formatTime(data.daily.sunrise[0])} / ${formatTime(data.daily.sunset[0])}</div>
        `;

        const walk = document.getElementById('walking-gear');
        const bike = document.getElementById('biking-gear');

        // GEAR LOGIC
        if (feels < 15) {
            walk.innerHTML = "<li>Heavy Parka</li><li>Thermal Underwear</li><li>Balaclava + Beanie</li><li>Heated Mittens</li>";
            bike.innerHTML = "<li>Extreme Wind Shell</li><li>Down Mid-Layer</li><li>Full Balaclava</li><li>Bar Mitts/Pogies</li>";
        } else if (feels < 32) {
            walk.innerHTML = "<li>Winter Coat</li><li>Fleece Mid-layer</li><li>Wool Scarf</li><li>Thick Mittens</li>";
            bike.innerHTML = "<li>Windbreaker Shell</li><li>Light Puffer</li><li>Thermal Face Mask</li><li>Lobster Mitts</li>";
        } else if (feels < 50) {
            walk.innerHTML = "<li>Light Jacket</li><li>Sweater</li><li>Beanie</li>";
            bike.innerHTML = "<li>Wind Vest</li><li>Light Fleece</li><li>Long Finger Gloves</li>";
        } else {
            walk.innerHTML = "<li>Long Sleeve Shirt</li><li>Comfortable Pants</li>";
            bike.innerHTML = "<li>Cycling Jersey</li><li>Sun Protection</li>";
        }

        // DAILY QUESTS
        const todayQuest = document.getElementById('today-quest');
        if (wind > 15 || feels < 25) {
            todayQuest.innerHTML = `⚒️ <b>Today:</b> Harsh conditions. Focus on indoor tasks like organizing tools or starting a new cooking project.`;
        } else {
            todayQuest.innerHTML = `⚒️ <b>Today:</b> The valley is peaceful! A great day for a long bike ride or tending to outdoor projects.`;
        }

        // OUTLOOK
        let outHtml = "";
        const labels = ["Today", "Tomorrow", "Sunday"];
        for(let i=0; i<3; i++) {
            const high = Math.round(data.daily.temperature_2m_max[i]);
            const low = Math.round(data.daily.temperature_2m_min[i]);
            const cond = weatherCodes[data.daily.weather_code[i]] || "Clear";
            const dateStr = formatDateLabel(data.daily.sunrise[i]);
            const isGolden = high > 50 && data.daily.weather_code[i] < 3;

            outHtml += `<div class="outlook-item">
                <b>${labels[i]} (${dateStr}):</b> High ${high}°F / Low ${low}°F. ${cond}. 
                ${isGolden ? '<span class="golden-day">☀️ GOLDEN DAY!</span>' : ''}
            </div>`;
        }
        document.getElementById('outlook').innerHTML = outHtml;

    } catch (e) {
        document.getElementById('weather-display').innerText = "Spirits are blocked!";
    }
}

startDashboard();
