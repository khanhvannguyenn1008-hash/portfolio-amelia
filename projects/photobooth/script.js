let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let photo = document.getElementById('photo');
let startBtn = document.getElementById('startBtn');
let captureBtn = document.getElementById('captureBtn');
let captureBtnContainer = document.getElementById('captureBtnContainer');
let flipCameraBtn = document.getElementById('flipCameraBtn');
let retakeBtn = document.getElementById('retakeBtn');
let downloadBtn = document.getElementById('downloadBtn');
let newStripBtn = document.getElementById('newStripBtn');
let previewSection = document.getElementById('previewSection');
let galleryGrid = document.getElementById('galleryGrid');

let stream = null;
let currentFilter = 'none';
let photoStrips = []; // Array to hold multiple strips
let currentStrip = []; // Current strip being created
let photosPerStrip = 2; // Default to 2 photos per strip
let currentFacingMode = 'user'; // 'user' for front camera, 'environment' for back camera
let isMirrored = true; // Start with mirrored view (default for front camera)

// Strip option buttons
document.querySelectorAll('.strip-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (currentStrip.length > 0) {
            if (!confirm('Changing strip size will start a new strip. Continue?')) return;
        }
        
        document.querySelectorAll('.strip-option-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        photosPerStrip = parseInt(btn.dataset.count);
    });
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        applyFilter();
    });
});

function applyFilter() {
    video.className = '';
    photo.className = '';
    if (currentFilter !== 'none') {
        video.classList.add(`filter-${currentFilter}`);
        photo.classList.add(`filter-${currentFilter}`);
    }
}

// Start camera
startBtn.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: currentFacingMode, width: 1280, height: 720 }, 
            audio: false 
        });
        video.srcObject = stream;
        video.style.display = 'block';
        video.style.transform = isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
        startBtn.style.display = 'none';
        captureBtnContainer.style.display = 'flex';
        flipCameraBtn.style.display = 'inline-block';
        previewSection.style.display = 'none';
    } catch (err) {
        alert('Could not access camera: ' + err.message);
    }
});

// Flip camera (mirror horizontally)
flipCameraBtn.addEventListener('click', () => {
    isMirrored = !isMirrored;
    video.style.transform = isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
});

// Capture photo
captureBtn.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let ctx = canvas.getContext('2d');
    
    // Apply filter to canvas
    if (currentFilter !== 'none') {
        ctx.filter = getFilterCSS(currentFilter);
    }
    
    // If mirrored, flip the canvas
    if (isMirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0);
    let imageData = canvas.toDataURL('image/png');
    
    // Add to current strip
    currentStrip.push(imageData);
    
    // Check if strip is complete
    if (currentStrip.length >= photosPerStrip) {
        // Strip is complete
        photoStrips.push([...currentStrip]);
        currentStrip = [];
        
        // Show preview of last photo
        photo.src = imageData;
        photo.className = '';
        video.style.display = 'none';
        previewSection.style.display = 'block';
        captureBtnContainer.style.display = 'none';
        flipCameraBtn.style.display = 'none';
        retakeBtn.style.display = 'none';
        downloadBtn.style.display = 'none';
        newStripBtn.style.display = 'inline-block';
        
        renderGallery();
        
        alert(`Photostrip complete! ${photosPerStrip} photos captured 🎉`);
    } else {
        // Continue capturing for this strip
        alert(`Photo ${currentStrip.length} of ${photosPerStrip} captured! 📸`);
    }
    
    renderGallery();
});

function getFilterCSS(filter) {
    switch(filter) {
        case 'grayscale': return 'grayscale(100%)';
        case 'sepia': return 'sepia(80%)';
        case 'invert': return 'invert(100%)';
        case 'blur': return 'blur(2px) brightness(1.1)';
        case 'brightness': return 'brightness(1.3) contrast(1.1)';
        default: return 'none';
    }
}

// Retake
retakeBtn.addEventListener('click', () => {
    video.style.display = 'block';
    previewSection.style.display = 'none';
    captureBtnContainer.style.display = 'flex';
    flipCameraBtn.style.display = 'inline-block';
    retakeBtn.style.display = 'none';
    downloadBtn.style.display = 'none';
    newStripBtn.style.display = 'none';
});

// New Strip button
newStripBtn.addEventListener('click', () => {
    video.style.display = 'block';
    previewSection.style.display = 'none';
    captureBtnContainer.style.display = 'flex';
    flipCameraBtn.style.display = 'inline-block';
    newStripBtn.style.display = 'none';
});

// Download
downloadBtn.addEventListener('click', () => {
    let link = document.createElement('a');
    link.download = `photobooth-${Date.now()}.png`;
    link.href = photo.src;
    link.click();
});

// Gallery
function renderGallery() {
    // Combine completed strips and current in-progress strip
    let allStrips = [...photoStrips];
    if (currentStrip.length > 0) {
        allStrips.push(currentStrip);
    }
    
    if (allStrips.length === 0) {
        galleryGrid.innerHTML = '<div class="gallery-empty">No photos yet! Start capturing moments</div>';
        return;
    }
    
    // Create photostrips
    galleryGrid.innerHTML = allStrips.map((strip, stripIndex) => {
        const isComplete = stripIndex < photoStrips.length;
        const stripSize = stripIndex < photoStrips.length ? photoStrips[stripIndex].length : photosPerStrip;
        
        return `
        <div class="gallery-item">
            <div class="photostrip">
                ${strip.map(photoSrc => `
                    <img src="${photoSrc}" alt="Photo" class="photostrip-photo">
                `).join('')}
                ${!isComplete ? `
                    ${Array(stripSize - strip.length).fill(0).map(() => `
                        <div class="photostrip-photo placeholder">
                            <span>📷</span>
                        </div>
                    `).join('')}
                ` : ''}
            </div>
            ${isComplete ? `
                <div class="strip-actions">
                    <button class="download-strip-btn" onclick="downloadPhotostrip(${stripIndex})">💾 Download</button>
                    <button class="delete-strip-btn" onclick="deletePhotostrip(${stripIndex})">🗑️ Delete</button>
                </div>
            ` : `<div class="in-progress">In Progress (${strip.length}/${stripSize})</div>`}
        </div>
    `;
    }).join('');
}

function downloadPhotostrip(stripIndex) {
    const strip = photoStrips[stripIndex];
    if (!strip || strip.length === 0) return;
    
    // Create a canvas to combine all photos
    const stripCanvas = document.createElement('canvas');
    const ctx = stripCanvas.getContext('2d');
    
    // Load first image to get dimensions
    const tempImg = new Image();
    tempImg.onload = () => {
        const photoWidth = 400; // Fixed width for consistency
        const photoHeight = 300; // Fixed height for consistency
        const borderSize = 20;
        const photoBorder = 15;
        
        // Set canvas size for vertical strip
        stripCanvas.width = photoWidth + (borderSize * 2);
        stripCanvas.height = (photoHeight * strip.length) + (photoBorder * (strip.length - 1)) + (borderSize * 2);
        
        // Fill background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);
        
        // Load and draw all photos
        let loadedCount = 0;
        strip.forEach((photoSrc, index) => {
            const img = new Image();
            img.onload = () => {
                const yPos = borderSize + (index * (photoHeight + photoBorder));
                ctx.drawImage(img, borderSize, yPos, photoWidth, photoHeight);
                
                loadedCount++;
                if (loadedCount === strip.length) {
                    // Download when all images are drawn
                    const link = document.createElement('a');
                    link.download = `photostrip-${stripIndex + 1}-${Date.now()}.png`;
                    link.href = stripCanvas.toDataURL('image/png');
                    link.click();
                }
            };
            img.src = photoSrc;
        });
    };
    tempImg.src = strip[0];
}

function deletePhotostrip(stripIndex) {
    if (confirm('Are you sure you want to delete this photostrip?')) {
        photoStrips.splice(stripIndex, 1);
        localStorage.setItem('photoStrips', JSON.stringify(photoStrips));
        renderGallery();
    }
}

function viewPhoto(index) {
    photo.src = photos[index];
    video.style.display = 'none';
    previewSection.style.display = 'block';
    captureBtnContainer.style.display = 'none';
    flipCameraBtn.style.display = 'none';
    retakeBtn.style.display = 'inline-block';
    downloadBtn.style.display = 'inline-block';
}

// Initialize gallery
renderGallery();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});
