/* ==========================================
   STARDW WEATHER ENGINE - THE COMPLETE HUB
   ========================================== */

const weatherCodes = {
    0: "☀️ Clear Skies", 1: "🌤️ Mainly Clear", 2: "⛅ Partly Cloudy", 3: "☁️ Overcast",
    45: "🌫️ Foggy", 48: "🌫️ Rime Fog", 51: "🌦️ Drizzle", 61: "🌧️ Rain",
    71: "🌨️ Light Snow", 73: "❄️ Snowing", 75: "❄️ Heavy Snow", 77: "❄️ Snow Grains",
    80: "🌦️ Rain Showers", 85: "🌨️ Snow Showers", 95: "⛈️ Thunderstorm"
};

// --- HELPERS ---
function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const formatTime = (iso) => !iso ? "--:--" : new Date(iso).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

// --- MAIN ENGINE ---
async function startDashboard() {
    try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=41.97&longitude=-87.66&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,sunrise,sunset,weather_code&temperature_unit=fahrenheit&timezone=auto");
        const data = await res.json();
        
        const current = data.current;
        const feels = Math.round(current.apparent_temperature);
        const wind = current.wind_speed_10m;
        const cond = weatherCodes[current.weather_code] || "☀️ Clear";

        // 1. Weather Header
        const weatherDiv = document.getElementById('weather-display');
        if (weatherDiv) {
            weatherDiv.innerHTML = `
                <div style="font-size: 2.2rem; color: var(--header-color); font-weight: bold;">${cond}</div>
                <div class="stat-line">🌡️ NOW: ${Math.round(current.temperature_2m)}°F (FEELS: ${feels}°F)</div>
                <div class="stat-line">🌬️ WIND: ${wind} MPH</div>
                <div class="stat-line">☀️ SUN: ${formatTime(data.daily.sunrise[0])} / ${formatTime(data.daily.sunset[0])}</div>
            `;
        }

        // 2. Gear Recommendations (RESTORED FULL LIST)
        const walk = document.getElementById('walking-gear');
        const bike = document.getElementById('biking-gear');
        if (walk && bike) {
            if (feels < 20) {
                walk.innerHTML = "<li>Heavy Parka</li><li>Thermal Base Layer</li><li>Balaclava + Beanie</li><li>Heated Mittens</li>";
                bike.innerHTML = "<li>Extreme Wind Shell</li><li>Puffer Mid-Layer</li><li>Full Face Mask</li><li>Lobster Mitts / Bar Mitts</li>";
            } else if (feels < 35) {
                walk.innerHTML = "<li>Winter Coat</li><li>Fleece Mid-layer</li><li>Wool Scarf</li><li>Thick Mittens</li>";
                bike.innerHTML = "<li>Windbreaker Shell</li><li>Light Puffer</li><li>Thermal Headband</li><li>Insulated Gloves</li>";
            } else if (feels < 50) {
                walk.innerHTML = "<li>Light Jacket</li><li>Sweater/Hoodie</li><li>Beanie</li>";
                bike.innerHTML = "<li>Wind Vest</li><li>Long Sleeve Jersey</li><li>Light Gloves</li>";
            } else {
                walk.innerHTML = "<li>Long Sleeve Shirt</li><li>Comfortable Pants</li>";
                bike.innerHTML = "<li>Cycling Jersey</li><li>Sun Protection</li>";
            }
        }

        // 3. Daily Quest
        const questDiv = document.getElementById('today-quest');
        if (questDiv) {
            if (current.weather_code > 3 || wind > 18 || feels < 25) {
                questDiv.innerHTML = `⚒️ <b>Today's Quest:</b> Harsh conditions in the valley. Focus on indoor tasks like tool maintenance or organizing your inventory.`;
            } else {
                questDiv.innerHTML = `⚒️ <b>Today's Quest:</b> The spirits are calm! A perfect day for a long bike ride or tending to outdoor projects.`;
            }
        }

        // 4. Outlook (RESTORED FULL DETAIL)
        const outlookDiv = document.getElementById('outlook');
        if (outlookDiv) {
            let outHtml = "";
            for (let i = 0; i < 3; i++) {
                const high = Math.round(data.daily.temperature_2m_max[i]);
                const low = Math.round(data.daily.temperature_2m_min[i]);
                const feelsHigh = Math.round(data.daily.apparent_temperature_max[i]);
                const dayCond = weatherCodes[data.daily.weather_code[i]] || "☀️ Clear";
                
                const dateObj = new Date(data.daily.sunrise[i]);
                const shortMonth = dateObj.toLocaleString('en-US', { month: 'short' });
                const dateString = `${shortMonth} ${getOrdinal(dateObj.getDate())}`;
                
                let dayLabel = (i === 0) ? "Today" : (i === 1) ? "Tomorrow" : dateObj.toLocaleString('en-US', { weekday: 'long' });

                const isGolden = (high > 50 && data.daily.weather_code[i] <= 2);

                outHtml += `
                    <div class="outlook-item" style="margin-bottom: 12px; border-left: 4px solid var(--header-color); padding-left: 10px;">
                        <b style="font-size: 1.4rem;">${dayLabel} (${dateString})</b><br>
                        <span style="color: var(--header-color); font-weight: bold;">${dayCond}</span><br>
                        🌡️ ${high}°F / ${low}°F <small>(Feels ${feelsHigh}°F)</small>
                        ${isGolden ? '<span class="golden-day"> ☀️ GOLDEN DAY!</span>' : ''}
                    </div>`;
            }
            outlookDiv.innerHTML = outHtml;
        }

        fetchHoroscope();
    } catch (err) {
        console.error("Dashboard Error:", err);
    }
}

async function fetchHoroscope() {
    const luckBox = document.getElementById('luck');
    if (!luckBox) return;

    const todayStr = new Date().toDateString();
    let seed = 0;
    for (let i = 0; i < todayStr.length; i++) seed += todayStr.charCodeAt(i);
    const moods = ["very happy!", "in good humor.", "neutral.", "somewhat annoyed."];
    const dailySpirit = moods[seed % 4];

    try {
        const hApi = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=taurus&day=today`;
        const proxy = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(hApi)}`);
        const pData = await proxy.json();
        const hData = JSON.parse(pData.contents);
        const rawHoro = hData.data.horoscope_data;

        const sentences = rawHoro.match(/[^.!?]+[.!?]+/g) || [rawHoro];
        const cleanHoro = sentences.length > 1 ? `${sentences[0].trim()}<br><br>${sentences[sentences.length-1].trim()}` : rawHoro;

        luckBox.innerHTML = `
            <div style="margin-bottom: 10px;">
                🔮 <b>SPIRIT LUCK:</b> ${cleanHoro}
            </div>
           
        `;
    } catch (e) {
        luckBox.innerHTML = `
            <div style="margin-bottom: 10px;">
                🔮 <b>SPIRIT LUCK:</b> The stars are obscured by clouds today. Check the notice board tomorrow!
            </div>
        `;
    }
}

startDashboard();
