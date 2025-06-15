const urlInput = document.getElementById('youtube-url');
const qualitySelect = document.getElementById('quality-select'); // 🔹 Quality Selection Dropdown
const videoPreview = document.getElementById('video-preview');
const thumbnail = document.getElementById('thumbnail');
const videoTitle = document.getElementById('video-title');
const videoChannel = document.getElementById('video-channel');
const videoDuration = document.getElementById('video-duration');
const downloadBtn = document.getElementById('download-btn');

urlInput.addEventListener('input', async () => {
    const url = urlInput.value.trim();
    if (!url) {
        videoPreview.classList.add('hidden');
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
    } catch (error) {
        videoPreview.classList.add('hidden');
    }
});

downloadBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    const selectedQuality = qualitySelect.value; // 🔹 Get selected quality

    if (!url) {
        alert('Enter a valid YouTube URL');
        return;
    }

    try {
        const response = await fetch("https://youtube-to-mp337.p.rapidapi.com/api/converttomp3", {
            method: "POST",
            headers: {
                "x-rapidapi-key": "af04bdf1d7mshc9dda69ae5365f2p146731jsn2458b96f620c",
                "x-rapidapi-host": "youtube-to-mp337.p.rapidapi.com",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url, quality: selectedQuality }) // 🔹 Include selected quality in request
        });

        const result = await response.json();
        console.log("API Response:", result);

        if (result.status === "ok" && result.url) {
            // Create a temporary anchor element for direct download
            const a = document.createElement('a');
            a.href = result.url;
            a.download = `converted_${selectedQuality}.mp3`; // 🔹 Update filename based on quality
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            console.log("Download triggered:", result.url);
        } else {
            alert("Conversion failed. Try again.");
        }
    } catch (error) {
        alert("Error processing request.");
        console.error(error);
    }
});