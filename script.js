/* ==========================================
   STARDW WEATHER ENGINE - FULL REPAIR
   ========================================== */

const weatherCodes = {
    0: "☀️ Clear Skies", 1: "🌤️ Mainly Clear", 2: "⛅ Partly Cloudy", 3: "☁️ Overcast",
    45: "🌫️ Foggy", 48: "🌫️ Rime Fog", 51: "🌦️ Drizzle", 61: "🌧️ Rain",
    71: "🌨️ Light Snow", 73: "❄️ Snowing", 75: "❄️ Heavy Snow", 77: "❄️ Snow Grains",
    80: "🌦️ Rain Showers", 85: "🌨️ Snow Showers", 95: "⛈️ Thunderstorm"
};

// --- HELPERS ---
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

// --- SPIRIT LOGIC (Seeded by Date) ---
function getDailyMood(horoscopeText) {
    const today = new Date().toDateString();
    let seed = 0;
    for (let i = 0; i < today.length; i++) {
        seed += today.charCodeAt(i);
    }
    
    const lowerHoro = (horoscopeText || "").toLowerCase();
    const badWords = ["difficult", "challenge", "stress", "caution", "avoid", "frustrating", "tension"];
    const goodWords = ["excellent", "joy", "success", "luck", "gain", "peace", "harmony", "reward"];
    
    let moodIndex = seed % 4; 

    if (goodWords.some(word => lowerHoro.includes(word))) moodIndex = 0; 
    if (badWords.some(word => lowerHoro.includes(word))) moodIndex = 3;  

    const spirits = [
        "very happy! (Great luck today)", 
        "in good humor. (Feeling positive)", 
        "neutral. (A standard day)", 
        "somewhat annoyed. (Be careful out there)"
    ];
    
    return spirits[moodIndex];
}

// --- DATA FETCHING ---
async function fetchHoroscope() {
    const luckBox = document.getElementById('luck');
    const sign = "taurus";
    const timestamp = new Date().getTime();
    const baseApi = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${sign}&day=today&cb=${timestamp}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(baseApi)}`;

    try {
        const response = await fetch(proxyUrl);
        const json = await response.json();
        const data = JSON.parse(json.contents);
        const fullHoroscope = data.data.horoscope_data;

        const spiritMood = getDailyMood(fullHoroscope);
        const sentences = fullHoroscope.match(/[^.!?]+[.!?]+/g) || [fullHoroscope];
        let displayHoroscope = (sentences.length > 1) 
            ? `${sentences[0].trim()}<br><br>${sentences[sentences.length - 1].trim()}` 
            : fullHoroscope;

        luckBox.innerHTML = `
            <div style="margin-bottom: 10px;">
                🔮 <b>SPIRIT LUCK:</b> The spirits are ${spiritMood}
            </div>
            <div style="border-top: 2px dashed var(--header-color); padding-top: 10px; font-size: 1.3rem; line-height: 1.2;">
                🐂 <b>TAURUS:</b><br>${displayHoroscope}
            </div>
        `;
    } catch (e) {
        console.error("Horoscope failed:", e);
        luckBox.innerHTML = `🔮 <b>Daily Luck:</b> The spirits feel neutral today.`;
    }
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
        const condition = weatherCodes[data.current.weather_code] || "☀️ Clear";
        
        autoSeason();
        fetchHoroscope();

        document.getElementById('weather-display').innerHTML = `
            <div style="font-size: 2.2rem; color: var(--header-color); font-weight: bold;">${condition}</div>
            <div class="stat-line">🌡️ NOW: ${currentTemp}°F (FEELS: ${feels}°F)</div>
            <div class="stat-line">🌬️ WIND: ${wind} MPH</div>
            <div class="stat-line">☀️ SUN: ${formatTime(data.daily.sunrise[0])} / ${formatTime(data.daily.sunset[0])}</div>
        `;

        // GEAR LOGIC
        const walk = document.getElementById('walking-gear');
        const bike = document.getElementById('biking-gear');
        if (feels < 25) {
            walk.innerHTML = "<li>Heavy Parka</li><li>Thermal Base</li><li>Balaclava</li>";
            bike.innerHTML = "<li>Wind Shell</li><li>Puffer Mid</li><li>Lobster Mitts</li>";
        } else if (feels < 45) {
            walk.innerHTML = "<li>Standard Coat</li><li>Fleece Mid</li><li>Beanie</li>";
            bike.innerHTML = "<li>Windbreaker</li><li>Light Fleece</li><li>Insulated Gloves</li>";
        } else {
            walk.innerHTML = "<li>Light Jacket</li><li>Breathable Top</li>";
            bike.innerHTML = "<li>Wind Vest</li><li>Cycling Jersey</li>";
        }

        // QUEST LOGIC
        const todayQuest = document.getElementById('today-quest');
        if (data.current.weather_code > 3 || feels < 25) {
            todayQuest.innerHTML = `⚒️ <b>Today:</b> Harsh conditions. Focus on indoor tasks.`;
        } else {
            todayQuest.innerHTML = `⚒️ <b>Today:</b> The valley is peaceful! Perfect for biking.`;
        }

        // OUTLOOK
        let outHtml = "";
        const labels = ["Today", "Tomorrow", "Sunday"];
        for(let i=0; i<3; i++) {
            const high = Math.round(data.daily.temperature_2m_max[i]);
            const low = Math.round(data.daily.temperature_2m_min[i]);
            const cond = weatherCodes[data.daily.weather_code[i]] || "☀️ Clear";
            const dateStr = formatDateLabel(data.daily.sunrise[i]);
            outHtml += `<div class="outlook-item"><b>${labels[i]} (${dateStr}):</b> ${high}°F / ${low}°F. ${cond}.</div>`;
        }
        document.getElementById('outlook').innerHTML = outHtml;

    } catch (e) {
        console.
