// 🔹 Select elements from the DOM
const urlInput = document.getElementById('youtube-url');
const pasteBtn = document.getElementById('paste-btn');
const qualitySelect = document.getElementById('quality-select');
const qualityContainer = document.getElementById('quality-container');
const videoPreview = document.getElementById('video-preview');
const thumbnail = document.getElementById('thumbnail');
const videoTitle = document.getElementById('video-title');
const videoChannel = document.getElementById('video-channel');
const videoDuration = document.getElementById('video-duration');
const downloadBtn = document.getElementById('download-btn');

const historySection = document.getElementById('history-section');
const historyList = document.getElementById('history-list');
const historyCount = document.getElementById('history-count');
const emptyHistory = document.getElementById('empty-history');
const clearHistoryBtn = document.getElementById('clear-history');

const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressPercentage = document.getElementById('progress-percentage');
const downloadStatus = document.getElementById('download-status');
const toast = document.getElementById('toast');

// 🔹 Show Toast Notification
function showToast(message, type = 'info', duration = 3000) {
    // Set icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    // Set toast content and styling
    toast.innerHTML = `<i class="fas fa-${icon} mr-2"></i>${message}`;
    toast.className = 'fixed bottom-5 right-5 px-4 py-3 rounded-lg shadow-lg transition-all duration-300';
    
    // Apply type-specific styling
    if (type === 'success') toast.classList.add('bg-green-500/80', 'backdrop-blur-xl', 'text-white');
    else if (type === 'error') toast.classList.add('bg-red-500/80', 'backdrop-blur-xl', 'text-white');
    else if (type === 'warning') toast.classList.add('bg-yellow-500/80', 'backdrop-blur-xl', 'text-white');
    else toast.classList.add('bg-blue-500/80', 'backdrop-blur-xl', 'text-white');
    
    // Show toast
    toast.classList.add('show');
    toast.classList.remove('hidden', 'transform', 'translate-y-10', 'opacity-0');
    
    // Hide toast after duration
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('transform', 'translate-y-10', 'opacity-0');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, duration);
}

// 🔹 Paste URL from clipboard
pasteBtn.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        urlInput.value = text;
        // Trigger input event to process the URL
        urlInput.dispatchEvent(new Event('input'));
        showToast('URL pasted from clipboard', 'success');
    } catch (error) {
        showToast('Failed to paste from clipboard. Try copying the URL again.', 'error');
        console.error('Clipboard error:', error);
    }
});

// 🔹 Load History from Local Storage
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('downloadHistory')) || [];
    historyList.innerHTML = "";
    
    // Update history count
    historyCount.textContent = history.length;
    
    // Show/hide empty history message
    if (history.length === 0) {
        emptyHistory.classList.remove('hidden');
    } else {
        emptyHistory.classList.add('hidden');
    }

    history.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('p-3', 'bg-white/20', 'rounded-lg', 'text-white', 'flex', 'justify-between', 'items-start', 'cursor-pointer', 'hover:bg-white/30', 'transition-all');

        // Format quality for display
        const qualityDisplay = `${item.quality} kbps`;
        
        // Sanitize URL for safety when creating onclick handlers
        const safeUrl = item.url.replace(/"/g, '&quot;');

        listItem.innerHTML = `
            <div class="flex-1 mr-2" onclick="reconvert('${safeUrl}', '${item.quality}')">
                <div class="font-medium line-clamp-1">${item.title}</div>
                <div class="text-xs text-gray-300 mt-1 flex items-center">
                    <i class="fas fa-music mr-1"></i> ${qualityDisplay}
                </div>
            </div>
            <button class="text-red-400 hover:text-red-300 p-1" onclick="deleteHistory(${index})">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;

        historyList.appendChild(listItem);
    });
}

// 🔹 Save History to Local Storage
function saveHistory(url, title, quality) {
    const history = JSON.parse(localStorage.getItem('downloadHistory')) || [];
    
    // Check if this URL already exists in history
    const existingIndex = history.findIndex(item => item.url === url && item.quality === quality);
    if (existingIndex !== -1) {
        // Remove the existing entry so we can add it to the top
        history.splice(existingIndex, 1);
    }
    
    // Add new entry at the beginning of the array
    history.unshift({ url, title, quality, timestamp: Date.now() });
    
    // Limit history to 20 items
    if (history.length > 20) {
        history.pop();
    }
    
    localStorage.setItem('downloadHistory', JSON.stringify(history));
    loadHistory();
    
    showToast('Added to download history', 'success');
}

// 🔹 Delete Single History Item
function deleteHistory(index) {
    const history = JSON.parse(localStorage.getItem('downloadHistory')) || [];
    history.splice(index, 1);
    localStorage.setItem('downloadHistory', JSON.stringify(history));
    loadHistory();
    
    showToast('Item removed from history', 'info');
}

// 🔹 Clear All History
clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all download history?')) {
        localStorage.removeItem('downloadHistory');
        loadHistory();
        showToast('Download history cleared', 'info');
    }
});

// 🔹 Reconvert a Past Download
function reconvert(url, quality) {
    urlInput.value = url;
    urlInput.dispatchEvent(new Event('input'));
    
    // Select the quality after the video preview is shown
    setTimeout(() => {
        qualitySelect.value = quality;
    }, 500);
    
    showToast('Loaded from history', 'info');
}

// 🔹 Format duration in human-readable format
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

// 🔹 Extract video ID from YouTube URL
function extractVideoId(url) {
    try {
        // Check for youtu.be format
        if (url.includes('youtu.be')) {
            return url.split('/').pop().split('?')[0];
        }
        
        // Check for youtube.com/watch format
        if (url.includes('youtube.com/watch')) {
            const urlObj = new URL(url);
            return urlObj.searchParams.get('v');
        }
        
        // Check for youtube.com/embed format
        if (url.includes('youtube.com/embed/')) {
            return url.split('embed/')[1].split('?')[0];
        }
        
        // Check for youtube.com/v/ format
        if (url.includes('youtube.com/v/')) {
            return url.split('v/')[1].split('?')[0];
        }
        
        return null;
    } catch (error) {
        console.error('Error extracting video ID:', error);
        return null;
    }
}

// 🔹 Handle URL Input with debounce for better performance
let debounceTimer;
urlInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(processVideoUrl, 300);
});

// Process video URL
function processVideoUrl() {
    const url = urlInput.value.trim();
    if (!url) {
        videoPreview.classList.add('hidden');
        qualityContainer.classList.add('hidden');
        return;
    }

    // YouTube URL validation regex
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url)) {
        if (url.length > 5) {
            showToast('Please enter a valid YouTube URL', 'warning');
        }
        return;
    }

    try {
        // Show loading state
        videoPreview.classList.remove('hidden');
        videoPreview.classList.add('animate-fadeIn');
        videoTitle.innerHTML = '<div class="h-6 w-3/4 shimmer rounded"></div>';
        videoChannel.innerHTML = '<div class="h-4 w-1/2 shimmer rounded"></div>';
        videoDuration.innerHTML = '<div class="h-4 w-1/4 shimmer rounded"></div>';
        thumbnail.classList.add('shimmer');
        
        // Extract video ID
        const videoId = extractVideoId(url);
        
        if (!videoId) {
            showToast('Could not extract video ID from URL', 'error');
            videoPreview.classList.add('hidden');
            return;
        }

        // Set thumbnail
        thumbnail.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        
        // Try to fetch video info from YouTube via RapidAPI
        fetch(`https://youtube-v31.p.rapidapi.com/videos?part=contentDetails,snippet,statistics&id=${videoId}`, {
            method: "GET",
            headers: {
                "x-rapidapi-key": "af04bdf1d7mshc9dda69ae5365f2p146731jsn2458b96f620c",
                "x-rapidapi-host": "youtube-v31.p.rapidapi.com"
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const videoInfo = data.items[0];
                const title = videoInfo.snippet.title;
                const channelTitle = videoInfo.snippet.channelTitle;
                
                // Parse ISO 8601 duration format
                let duration = "Unknown";
                if (videoInfo.contentDetails && videoInfo.contentDetails.duration) {
                    const isoDuration = videoInfo.contentDetails.duration;
                    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
                    
                    const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
                    const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
                    const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;
                    
                    duration = formatDuration(hours * 3600 + minutes * 60 + seconds);
                }
                
                // Update UI with video info
                videoTitle.textContent = title;
                videoChannel.textContent = channelTitle;
                videoDuration.textContent = duration;
            } else {
                // Fallback for when API doesn't return proper info
                videoTitle.textContent = "YouTube Video";
                videoChannel.textContent = "Unknown Channel";
                videoDuration.textContent = "Unknown Duration";
            }
            
            thumbnail.classList.remove('shimmer');
            
            // Show quality selection
            qualityContainer.classList.remove('hidden');
            downloadBtn.classList.remove('hidden');
        })
        .catch(error => {
            console.error("Error fetching video info:", error);
            
            // Fallback display if API fails
            videoTitle.textContent = "YouTube Video";
            videoChannel.textContent = "Unknown Channel";
            videoDuration.textContent = "Unknown Duration";
            thumbnail.classList.remove('shimmer');
            
            // Still show quality selection even if info fetch fails
            qualityContainer.classList.remove('hidden');
            downloadBtn.classList.remove('hidden');
        });
    } catch (error) {
        console.error('Error processing video URL:', error);
        showToast('Error processing video URL', 'error');
        videoPreview.classList.add('hidden');
    }
}

// 🔹 Handle Download Button Click
downloadBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    const selectedQuality = qualitySelect.value;

    if (!url) {
        showToast('Please enter a YouTube URL', 'warning');
        return;
    }

    try {
        // Update UI for download process
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
        downloadStatus.textContent = '';
        downloadStatus.className = 'mt-3 text-center py-2 px-4 rounded-lg';
        downloadStatus.classList.add('hidden');
        
        // Show and reset progress bar
        progressContainer.classList.remove('hidden');
        progressBar.style.width = "10%";
        progressPercentage.textContent = "10%";
        progressPercentage.classList.remove('hidden');

        try {
            // Make the actual API call to convert YouTube to MP3
            const response = await fetch("https://youtube-to-mp337.p.rapidapi.com/api/converttomp3", {
                method: "POST",
                headers: {
                    "x-rapidapi-key": "af04bdf1d7mshc9dda69ae5365f2p146731jsn2458b96f620c",
                    "x-rapidapi-host": "youtube-to-mp337.p.rapidapi.com",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ url, quality: selectedQuality })
            });

            // Show progress during API processing
            let progress = 10;
            const progressInterval = setInterval(() => {
                progress += 15; 
                if (progress >= 85) clearInterval(progressInterval);
                progressBar.style.width = `${progress}%`;
                progressPercentage.textContent = `${Math.round(progress)}%`;
            }, 500);

            // Parse API response
            const result = await response.json();
            console.log("API Response:", result);

            // Process response
            if (result.status === "ok" && result.url) {
                // Complete progress bar
                progressBar.style.width = "100%";
                progressPercentage.textContent = "100%";
                
                // Show success message
                downloadStatus.innerHTML = `<i class="fas fa-check-circle mr-2"></i> Conversion successful! Starting download...`;
                downloadStatus.classList.remove('hidden');
                downloadStatus.classList.add('status-success');
                
                // Format filename
                const videoTitleFormatted = result.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
                const filename = `${videoTitleFormatted}_${selectedQuality}.mp3`;
                
                // Trigger download
                const a = document.createElement('a');
                a.href = result.url;
                a.download = filename;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                
                // Clean up
                setTimeout(() => {
                    document.body.removeChild(a);
                }, 100);
                
                // Add to history
                saveHistory(url, result.title, selectedQuality);
                
                // Reset UI after short delay
                setTimeout(() => {
                    downloadBtn.disabled = false;
                    downloadBtn.innerHTML = '<i class="fas fa-download mr-2"></i> Download MP3';
                    showToast('Download started successfully!', 'success');
                    
                    setTimeout(() => {
                        progressContainer.classList.add('hidden');
                        downloadStatus.classList.add('hidden');
                    }, 3000);
                }, 1500);
            } else {
                throw new Error(result.message || "Conversion failed");
            }
        } catch (apiError) {
            console.error('API error:', apiError);
            throw new Error(apiError.message || "Error processing request");
        }
    } catch (error) {
        console.error('Conversion/download error:', error);
        
        // Handle error
        progressBar.style.width = "100%";
        progressBar.classList.add('bg-red-500');
        
        downloadStatus.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i> ${error.message || "Error processing request"}`;
        downloadStatus.classList.remove('hidden');
        downloadStatus.classList.add('status-error');
        
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fas fa-download mr-2"></i> Try Again';
        
        showToast('Download failed. Please try again.', 'error');
        
        // Reset error state after delay
        setTimeout(() => {
            progressBar.classList.remove('bg-red-500');
        }, 3000);
    }
});

// 🔹 Preload common icons to improve performance
function preloadFontAwesomeIcons() {
    const iconsToPreload = [
        'fa-download', 'fa-history', 'fa-trash-alt', 'fa-link', 
        'fa-paste', 'fa-chevron-down', 'fa-play', 'fa-user-circle', 
        'fa-clock', 'fa-spinner', 'fa-check-circle', 'fa-exclamation-circle'
    ];
    
    // Create hidden elements with each icon to ensure they're loaded
    const preloadContainer = document.createElement('div');
    preloadContainer.style.display = 'none';
    
    iconsToPreload.forEach(iconClass => {
        const icon = document.createElement('i');
        icon.className = `fas ${iconClass}`;
        preloadContainer.appendChild(icon);
    });
    
    document.body.appendChild(preloadContainer);
    
    // Remove after a short delay
    setTimeout(() => {
        document.body.removeChild(preloadContainer);
    }, 1000);
}

// 🔹 Initialize the application
function initApp() {
    try {
        // Load download history
        loadHistory();
        
        // Set default quality
        qualitySelect.value = "320";
        
        // Add event listener for thumbnail load
        thumbnail.onload = () => {
            thumbnail.classList.remove('shimmer');
        };
        
        // Handle thumbnail load errors
        thumbnail.onerror = () => {
            thumbnail.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM2NjY2NjYiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlLCBzYW5zLXNlcmlmIiBmaWxsPSIjZmZmZmZmIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
            thumbnail.classList.remove('shimmer');
            console.log('Thumbnail load error, using placeholder');
        };
        
        // Welcome toast
        setTimeout(() => {
            showToast('Welcome to YouTube MP3 Converter! 🎵', 'info', 5000);
        }, 1000);
        
        // Preload icons
        preloadFontAwesomeIcons();
        
        // Add event listeners with passive option for better performance on scroll events
        const scrollableElement = document.querySelector('.custom-scrollbar');
        if (scrollableElement) {
            scrollableElement.addEventListener('scroll', () => {}, { passive: true });
        }
        
        // Prevent unnecessary network requests by handling all external URL errors
        window.addEventListener('error', function(event) {
            // Check if the error is for an image, script, or favicon
            if (event.target.tagName === 'IMG' || 
                event.target.tagName === 'SCRIPT' || 
                event.target.rel === 'icon' || 
                event.target.rel === 'shortcut icon') {
                // Prevent the browser from making the request
                event.preventDefault();
                console.log('Prevented error for resource:', event.target.src || event.target.href);
            }
        }, true);
    } catch (error) {
        console.error('Application initialization error:', error);
        // Show error in UI to notify user
        const errorMessage = document.createElement('div');
        errorMessage.className = 'fixed top-0 left-0 right-0 bg-red-500 text-white p-4 text-center';
        errorMessage.textContent = 'Application initialization error. Please refresh the page.';
        document.body.appendChild(errorMessage);
    }
}

// Load app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    try {
        initApp();
    } catch (error) {
        console.error('Fatal application error:', error);
    }
});