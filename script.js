async function fetchTaurusLuck() {
    const luckBox = document.getElementById('luck');
    const sign = "taurus";
    const url = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${sign}&day=today`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const fullHoroscope = data.data.horoscope_data;

        // --- THE SENTENCE SLICER ---
        const sentences = fullHoroscope.split('. ');
        let displayHoroscope = "";

        if (sentences.length > 1) {
            const first = sentences[0];
            const last = sentences[sentences.length - 1];
            // No "..." mystery—just clean sentences separated by a line break
            displayHoroscope = `${first}.<br><br>${last}`;
        } else {
            displayHoroscope = fullHoroscope;
        }

        const spirits = ["very happy", "in good humor", "neutral", "somewhat annoyed"];
        const dailySpirit = spirits[Math.floor(Math.random() * spirits.length)];

        luckBox.innerHTML = `
            <div style="margin-bottom: 10px;">
                🔮 <b>SPIRIT LUCK:</b> The spirits are ${dailySpirit} today.
            </div>
            <div style="border-top: 2px dashed var(--header-color); padding-top: 10px; font-size: 1.3rem; line-height: 1.2;">
                🐂 <b>TAURUS FORECAST:</b><br>${displayHoroscope}
            </div>
            <div style="margin-top: 10px; font-size: 1.1rem; opacity: 0.8;">
                🍀 <i>Full reading at <a href="https://www.karmaandluck.com/pages/daily-horoscope" target="_blank" style="color: var(--text-color);">Karma & Luck</a></i>
            </div>
        `;
    } catch (e) {
        luckBox.innerHTML = `🔮 <b>Daily Luck:</b> The spirits are neutral today.`;
    }
}
