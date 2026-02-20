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

async function startDashboard() {
    const lat = 41.97; // Chicago 60640
    const lon = -87.66;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,wind_speed_10m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weather_code&temperature_unit=fahrenheit&timezone=auto`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        const currentTemp = Math.round(data.current.temperature_2m);
        const feels = Math.round(data.current.apparent_temperature);
        const wind = data.current.wind_speed_10m;
        const condition = weatherCodes[data.current.weather_code] || "Clear";
        const rain = data.current.precipitation;
        
        autoSeason();

        // 1. Weather Header
        document.getElementById('weather-display').innerHTML = `
            <div style="font-size: 2.2rem; color: var(--header-color); font-weight: bold;">${condition}</div>
            <div class="stat-line">🌡️ NOW: ${currentTemp}°F (FEELS: ${feels}°F)</div>
            <div class="stat-line">🌬️ WIND: ${wind} MPH</div>
            <div class="stat-line">☀️ SUN: ${formatTime(data.daily.sunrise[0])} / ${formatTime(data.daily.sunset[0])}</div>
        `;

        // 2. Luck Box
        const luckMsgs = ["The spirits are very happy today!", "The spirits are in good humor.", "The spirits feel neutral.", "The spirits are somewhat annoyed."];
        document.getElementById('luck').innerHTML = `🔮 <b>Daily Luck:</b> ${luckMsgs[Math.floor(Math.random()*luckMsgs.length)]}`;

        // 3. Gear Logic
        const walk = document.getElementById('walking-gear');
        const bike = document.getElementById('biking-gear');

        if (feels < 15) {
            walk.innerHTML = "<li>Heavy Parka</li><li>Thermal Underwear</li><li>Balaclava + Beanie</li><li>Heated Mittens</li>";
            bike.innerHTML = "<li>Extreme Wind Shell</li><li>Down Mid-Layer</li><li>Full Balaclava</li><li>Bar Mitts/Pogies</li>";
        } else if (feels < 32) {
            walk.innerHTML = "<li>Winter Coat</li><li>Fleece Mid-layer</li><li>Wool Scarf</li><li>Thick Mittens</li>";
            bike.innerHTML = "<li>Windbreaker Shell</li><li>Light Puffer</li><li>Thermal Face Mask</li><li>Lobster Mitts</li>";
        } else if (feels < 50) {
            walk.innerHTML = "<li>Light Jacket</li><li>Sweater</li><li>Beanie</li>";
            bike.innerHTML = "<li>Wind Vest</li><li>Light Fleece</li><li>Long Finger Gloves</li>";
        } else if (feels < 75) {
            walk.innerHTML = "<li>Long Sleeve Shirt</li><li>Comfortable Pants</li>";
            bike.innerHTML = "<li>Cycling Jersey</li><li>Arm Warmers</li>";
        } else {
            walk.innerHTML = "<li>Linen Shirt</li><li>Shorts & Sun Hat</li>";
            bike.innerHTML = "<li>Breathable Jersey</li><li>Extra Water Bottle</li>";
        }

        // 4. Quests
        const todayQuest = document.getElementById('today-quest');
        if (wind > 15 || rain > 0 || feels < 25) {
            todayQuest.innerHTML = `⚒️ <b>Today:</b> Harsh conditions. Focus on indoor tasks like organizing tools or trying a new cooking recipe.`;
        } else {
            todayQuest.innerHTML = `⚒️ <b>Today:</b> The valley is peaceful! A great day for a long bike ride or tending to outdoor projects.`;
        }

        let futureQuestHtml = "🌟 <b>Future:</b> Keep working; the spirits haven't revealed the next Golden Day yet.";
        for(let i=1; i<7; i++) {
            if (data.daily.temperature_2m_max[i] > 50 && data.daily.weather_code[i] < 3) {
                const dateLabel = formatDateLabel(data.daily.sunrise[i]);
                futureQuestHtml = `🌟 <b>Future:</b> Check the forecast for <b>${dateLabel}</b>. Plan a long afternoon walk on that GOLDEN DAY!`;
                break;
            }
        }
        document.getElementById('future-quest').innerHTML = futureQuestHtml;

        // 5. Outlook
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
        document.getElementById('weather-display').innerText = "Spirits are blocked! Connection error.";
    }
}

startDashboard();
