/* ==========================================
   STARDW WEATHER ENGINE - UNIFIED SPIRITS
   ========================================== */

const weatherCodes = {
    0: "☀️ Clear Skies", 1: "🌤️ Mainly Clear", 2: "⛅ Partly Cloudy", 3: "☁️ Overcast",
    45: "🌫️ Foggy", 48: "🌫️ Rime Fog", 51: "🌦️ Drizzle", 61: "🌧️ Rain",
    71: "🌨️ Light Snow", 73: "❄️ Snowing", 75: "❄️ Heavy Snow", 77: "❄️ Snow Grains",
    80: "🌦️ Rain Showers", 85: "🌨️ Snow Showers", 95: "⛈️ Thunderstorm"
};

// --- NEW: STABLE DAILY LUCK SEED ---
function getDailyMood(horoscopeText) {
    const today = new Date().toDateString();
    let seed = 0;
    for (let i = 0; i < today.length; i++) {
        seed += today.charCodeAt(i);
    }
    
    // Tone Detection: Adjust spirit based on horoscope keywords
    const lowerHoro = horoscopeText.toLowerCase();
    const badWords = ["difficult", "challenge", "stress", "caution", "avoid", "frustrating"];
    const goodWords = ["excellent", "joy", "success", "luck", "gain", "peace"];
    
    let moodIndex = seed % 4; // Default random-but-stable mood

    // If the horoscope is very positive or negative, nudge the spirits to match
    if (goodWords.some(word => lowerHoro.includes(word))) moodIndex = 0; // Very Happy
    if (badWords.some(word => lowerHoro.includes(word))) moodIndex = 3;  // Somewhat Annoyed

    const spirits = [
        "very happy! (Great luck today)", 
        "in good humor. (Feeling positive)", 
        "neutral. (A standard day)", 
        "somewhat annoyed. (Be careful out there)"
    ];
    
    return spirits[moodIndex];
}

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

        // Sentiment-matched spirit luck
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
        luckBox.innerHTML = `🔮 <b>Daily Luck:</b> The spirits are neutral today.`;
    }
}

// ... rest of startDashboard() and support functions remain the same as previous version
