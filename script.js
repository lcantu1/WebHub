/* ==========================================
   STARDW WEATHER ENGINE - THE COMPLETE VERSION
   ========================================== */

const weatherCodes = {
    0: "☀️ Clear Skies", 1: "🌤️ Mainly Clear", 2: "⛅ Partly Cloudy", 3: "☁️ Overcast",
    45: "🌫️ Foggy", 48: "🌫️ Rime Fog", 51: "🌦️ Drizzle", 61: "🌧️ Rain",
    71: "🌨️ Light Snow", 73: "❄️ Snowing", 75: "❄️ Heavy Snow", 77: "❄️ Snow Grains",
    80: "🌦️ Rain Showers", 85: "🌨️ Snow Showers", 95: "⛈️ Thunderstorm"
};

const formatTime = (iso) => !iso ? "--:--" : new Date(iso).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

async function startDashboard() {
    try {
        // 1. FETCH WEATHER
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=41.97&longitude=-87.66&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weather_code&temperature_unit=fahrenheit&timezone=auto");
        const data = await res.json();
        
        const current = data.current;
        const feels = Math.round(current.apparent_temperature);
        const wind = current.wind_speed_10m;
        const cond = weatherCodes[current.weather_code] || "☀️ Clear";

        // 2. UPDATE WEATHER HEADER
        document.getElementById('weather-display').innerHTML = `
            <div style="font-size: 2.2rem; color: var(--header-color); font-weight: bold;">${cond}</div>
            <div class="stat-line">🌡️ NOW: ${Math.round(current.temperature_2m)}°F (FEELS: ${feels}°F)</div>
            <div class="stat-line">🌬️ WIND: ${wind} MPH</div>
            <div class="stat-line">☀️ SUN: ${formatTime(data.daily.sunrise[0])} / ${formatTime(data.daily.sunset[0])}</div>
        `;

        // 3. UPDATE GEAR RECOMMENDATIONS
        const walk = document.getElementById('walking-gear');
        const bike = document.getElementById('biking-gear');
        
        if (feels < 20) {
            walk.innerHTML = "<li>Heavy Parka</li><li>Thermal Base Layer</li><li>Balaclava + Beanie</li><li>Heated Mittens</li>";
            bike.innerHTML = "<li>Extreme Wind Shell</li><li>Down Mid-Layer</li><li>Full Face Mask</li><li>Lobster Mitts / Bar Mitts</li>";
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

        // 4. UPDATE DAILY QUESTS
        const todayQuest = document.getElementById('today-quest');
        if (current.weather_code > 3 || wind > 18 || feels < 25) {
            todayQuest.innerHTML = `⚒️ <b>Today's Quest:</b> Harsh conditions in the valley. Focus on indoor tasks like tool maintenance or organizing your inventory.`;
        } else {
            todayQuest.innerHTML = `⚒️ <b>Today's Quest:</b> The spirits are calm! A perfect day for a long bike ride or tending to outdoor projects.`;
        }

// 5. UPDATE OUTLOOK (Restoring High/Low and Golden Day detection)
        let outHtml = "";
        const labels = ["Today", "Tomorrow", "Sunday"];
        for(let i=0; i<3; i++) {
            const high = Math.round(data.daily.temperature_2m_max[i]);
            const low = Math.round(data.daily.temperature_2m_min[i]);
            const dayCode = data.daily.weather_code[i];
            const dayCond = weatherCodes[dayCode] || "☀️ Clear";
            
            // Golden Day Logic: High > 50 and clear skies (code 0, 1, or 2)
            const isGolden = (high > 50 && dayCode <= 2);

            outHtml += `
                <div class="outlook-item">
                    <b>${labels[i]}:</b> ${high}°F / ${low}°F — ${dayCond}
                    ${isGolden ? '<span class="golden-day" style="color: #d4af37; font-weight: bold; margin-left: 10px;">☀️ GOLDEN DAY!</span>' : ''}
                </div>`;
        }
        document.getElementById('outlook').innerHTML = outHtml;

        // 6. FETCH HOROSCOPE
        fetchHoroscope();

    } catch (err) {
        console.error("Dashboard Error:", err);
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

        // Seeded Mood Logic (same across devices)
        const todayStr = new Date().toDateString();
        let seed = 0;
        for (let i = 0; i < todayStr.length; i++) seed += todayStr.charCodeAt(i);
        
        // Match spirit tone to horoscope content
        const lower = rawHoro.toLowerCase();
        let moodIdx = seed % 4;
        if (lower.includes("luck") || lower.includes("happy") || lower.includes("success")) moodIdx = 0;
        if (lower.includes("hard") || lower.includes("stress") || lower.includes("caution")) moodIdx = 3;

        const moods = ["very happy!", "in good humor.", "neutral.", "somewhat annoyed."];
        const spiritMood = moods[moodIdx];

        // Slice first and last sentences
        const sentences = rawHoro.match(/[^.!?]+[.!?]+/g) || [rawHoro];
        const cleanHoro = sentences.length > 1 ? `${sentences[0].trim()}<br><br>${sentences[sentences.length-1].trim()}` : rawHoro;

        // Display: Spirit Luck first, then Horoscope
        luckBox.innerHTML = `
            <div style="margin-bottom: 10px;">
                🔮 <b>SPIRIT LUCK:</b> The spirits are ${spiritMood}
            </div>
            <div style="border-top: 2px dashed var(--header-color); padding-top: 10px; font-size: 1.3rem; line-height: 1.2;">
                🐂 <b>TAURUS:</b><br>${cleanHoro}
            </div>
        `;
    } catch (e) {
        luckBox.innerHTML = `🔮 <b>SPIRIT LUCK:</b> The spirits feel neutral today.`;
    }
}

startDashboard();
