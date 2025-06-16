// 🔹 Select elements from the DOM
const urlInput = document.getElementById('youtube-url');
const qualitySelect = document.getElementById('quality-select');
const videoPreview = document.getElementById('video-preview');
const thumbnail = document.getElementById('thumbnail');
const videoTitle = document.getElementById('video-title');
const videoChannel = document.getElementById('video-channel');
const videoDuration = document.getElementById('video-duration');
const downloadBtn = document.getElementById('download-btn');

const historySection = document.getElementById('history-section');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');

const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');

// 🔹 Load History from Local Storage
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('downloadHistory')) || [];
    historyList.innerHTML = "";

    history.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('p-3', 'bg-white/20', 'rounded-lg', 'text-white', 'flex', 'justify-between', 'items-center', 'cursor-pointer');

        listItem.innerHTML = `
            <span onclick="reconvert('${item.url}', '${item.quality}')">${item.title} (${item.quality}kbps)</span>
            <button class="text-red-500 font-bold" onclick="deleteHistory(${index})">✖</button>
        `;

        historyList.appendChild(listItem);
    });
}

// 🔹 Save History to Local Storage
function saveHistory(url, title, quality) {
    const history = JSON.parse(localStorage.getItem('downloadHistory')) || [];
    history.push({ url, title, quality });
    localStorage.setItem('downloadHistory', JSON.stringify(history));
    loadHistory();
}

// 🔹 Delete Single History Item
function deleteHistory(index) {
    const history = JSON.parse(localStorage.getItem('downloadHistory')) || [];
    history.splice(index, 1);
    localStorage.setItem('downloadHistory', JSON.stringify(history));
    loadHistory();
}

// 🔹 Clear All History
clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem('downloadHistory');
    loadHistory();
});

// 🔹 Reconvert a Past Download
function reconvert(url, quality) {
    urlInput.value = url;
    qualitySelect.value = quality;
    videoPreview.classList.remove('hidden');
}

// 🔹 Handle URL Input
urlInput.addEventListener('input', async () => {
    const url = urlInput.value.trim();
    if (!url) {
        videoPreview.classList.add('hidden');
        qualitySelect.classList.add('hidden');
        downloadBtn.classList.add('hidden');
        return;
    }

    try {
        const videoId = new URL(url).searchParams.get('v') || url.split('/').pop();
        if (!videoId) return;

        thumbnail.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        videoTitle.textContent = "Video Title Here";
        videoChannel.textContent = "Channel Name";
        videoDuration.textContent = "Duration: 3:45";

        videoPreview.classList.remove('hidden');
        qualitySelect.classList.remove('hidden');
        downloadBtn.classList.remove('hidden');
    } catch (error) {
        videoPreview.classList.add('hidden');
    }
});

// 🔹 Handle Download Button Click
downloadBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    const selectedQuality = qualitySelect.value;

    if (!url) {
        alert('Enter a valid YouTube URL');
        return;
    }

    try {
        // 🔹 Show progress bar when download starts
        progressContainer.classList.remove('hidden');
        progressBar.style.width = "10%";

        const response = await fetch("https://youtube-to-mp337.p.rapidapi.com/api/converttomp3", {
            method: "POST",
            headers: {
                "x-rapidapi-key": "af04bdf1d7mshc9dda69ae5365f2p146731jsn2458b96f620c",
                "x-rapidapi-host": "youtube-to-mp337.p.rapidapi.com",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url, quality: selectedQuality })
        });

        let progress = 10;
        const progressInterval = setInterval(() => {
            progress += 15; 
            if (progress >= 85) clearInterval(progressInterval);
            progressBar.style.width = `${progress}%`;
        }, 500);

        const result = await response.json();
        console.log("API Response:", result);

        if (result.status === "ok" && result.url) {
            progressBar.style.width = "100%";

            const videoTitleFormatted = result.title.replace(/\s+/g, "_");
            const filename = `${videoTitleFormatted}_${selectedQuality}.mp3`;

            const a = document.createElement('a');
            a.href = result.url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            console.log("Download triggered:", result.url, "Filename:", filename);

            saveHistory(url, result.title, selectedQuality);

            setTimeout(() => {
                progressContainer.classList.add('hidden');
                progressBar.style.width = "0%";
            }, 800);
        } else {
            alert("Conversion failed. Try again.");
        }
    } catch (error) {
        alert("Error processing request.");
        console.error(error);
    }
});

// 🔹 Load history when page loads
document.addEventListener('DOMContentLoaded', loadHistory);