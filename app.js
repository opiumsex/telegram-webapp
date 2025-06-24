document.addEventListener('DOMContentLoaded', function() {
    // Theme management
    const themeToggle = document.getElementById('change-theme');
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (currentTheme === 'light') {
        themeToggle.textContent = 'Light Theme';
    } else {
        themeToggle.textContent = 'Dark Theme';
    }
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'light' ? 'Светлая тема' : 'Тёмная тема';
    });
    
    // Background image change
    const changeBgBtn = document.getElementById('change-bg');
    const bgFileInput = document.getElementById('bg-file');
    
    changeBgBtn.addEventListener('click', function() {
        bgFileInput.click();
    });
    
    bgFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.body.style.backgroundImage = `url(${event.target.result})`;
                localStorage.setItem('backgroundImage', event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Load saved background image
    const savedBg = localStorage.getItem('backgroundImage');
    if (savedBg) {
        document.body.style.backgroundImage = `url(${savedBg})`;
    }
    
    // Tab navigation
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabIndicator = document.querySelector('.tab-indicator');
    
    function setActiveTab(tab) {
        // Update tab buttons
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update tab contents
        const tabId = tab.getAttribute('data-tab');
        tabContents.forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(tabId).style.display = 'flex';
        
        // Move indicator
        const tabRect = tab.getBoundingClientRect();
        const tabBarRect = tab.parentElement.getBoundingClientRect();
        const left = tabRect.left - tabBarRect.left;
        const width = tabRect.width;
        
        tabIndicator.style.left = `${left}px`;
        tabIndicator.style.width = `${width}px`;
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => setActiveTab(tab));
    });
    
    // Initialize first tab as active
    setActiveTab(document.querySelector('.tab-btn.active'));
    
    // Color picker functionality
    const colorWheel = document.getElementById('color-wheel');
    const colorSelector = document.getElementById('color-selector');
    const colorPreview = document.getElementById('color-preview');
    const opacitySlider = document.getElementById('opacity');
    const hexCode = document.getElementById('hex-code');
    const copyHexBtn = document.getElementById('copy-hex');
    
    let isDragging = false;
    
    function updateColor(x, y) {
        const rect = colorWheel.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const relX = x - rect.left - centerX;
        const relY = y - rect.top - centerY;
        const distance = Math.sqrt(relX * relX + relY * relY);
        const radius = rect.width / 2;
        
        if (distance > radius) {
            // If outside the circle, find the point on the edge
            const angle = Math.atan2(relY, relX);
            const edgeX = centerX + radius * Math.cos(angle);
            const edgeY = centerY + radius * Math.sin(angle);
            colorSelector.style.left = `${edgeX - 8}px`;
            colorSelector.style.top = `${edgeY - 8}px`;
        } else {
            colorSelector.style.left = `${x - rect.left - 8}px`;
            colorSelector.style.top = `${y - rect.top - 8}px`;
        }
        
        // Calculate hue based on position
        const angle = Math.atan2(relY, relX) * (180 / Math.PI);
        const hue = (angle + 360) % 360;
        
        // Calculate saturation based on distance from center
        const saturation = Math.min(100, Math.round((distance / radius) * 100));
        
        // Always full brightness for color wheel
        const brightness = 100;
        
        // Update preview and hex code
        const opacity = opacitySlider.value / 100;
        const hslaColor = `hsla(${hue}, ${saturation}%, ${brightness}%, ${opacity})`;
        colorPreview.style.backgroundColor = hslaColor;
        
        // Convert HSLA to HEX
        const hex = hslaToHex(hue, saturation, brightness, opacity);
        hexCode.value = hex;
    }
    
    function hslaToHex(h, s, l, a) {
        // Convert HSL to RGB first
        h /= 360;
        s /= 100;
        l /= 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        // Convert RGB to HEX
        const toHex = x => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        
        // Add alpha if not 1
        if (a < 1) {
            const alphaHex = Math.round(a * 255).toString(16);
            return hex + (alphaHex.length === 1 ? '0' + alphaHex : alphaHex);
        }
        
        return hex;
    }
    
    colorWheel.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateColor(e.clientX, e.clientY);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateColor(e.clientX, e.clientY);
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    opacitySlider.addEventListener('input', () => {
        const currentColor = colorPreview.style.backgroundColor;
        const opacity = opacitySlider.value / 100;
        const newColor = currentColor.replace(/[\d\.]+\)$/, opacity + ')');
        colorPreview.style.backgroundColor = newColor;
        
        // Update hex code with new alpha
        const hex = hexCode.value;
        if (hex.length === 9) { // If already has alpha
            const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
            hexCode.value = hex.substring(0, 7) + alphaHex;
        } else if (opacity < 1) {
            const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
            hexCode.value = hex + alphaHex;
        } else {
            hexCode.value = hex.substring(0, 7);
        }
    });
    
    copyHexBtn.addEventListener('click', () => {
        hexCode.select();
        document.execCommand('copy');
        
        // Show copied feedback
        const originalText = copyHexBtn.textContent;
        copyHexBtn.textContent = 'Скопировано!';
        setTimeout(() => {
            copyHexBtn.textContent = originalText;
        }, 2000);
    });
    
    // Initialize color picker with default values
    const wheelRect = colorWheel.getBoundingClientRect();
    const centerX = wheelRect.left + wheelRect.width / 2;
    const centerY = wheelRect.top + wheelRect.height / 2;
    updateColor(centerX, centerY);
    
    // File conversion functionality
    // BTX to PNG
    const btxToPngBtn = document.getElementById('btx-to-png');
    const btxFilesInput = document.getElementById('btx-files');
    
    btxToPngBtn.addEventListener('click', () => {
        btxFilesInput.click();
    });
    
    btxFilesInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        for (const file of files) {
            if (file.name.endsWith('.btx')) {
                try {
                    // In a real implementation, you would convert BTX to PNG here
                    // For demo purposes, we'll just create a dummy PNG
                    const pngBlob = await convertBtxToPng(file);
                    const pngUrl = URL.createObjectURL(pngBlob);
                    
                    // Create download link
                    const a = document.createElement('a');
                    a.href = pngUrl;
                    a.download = file.name.replace('.btx', '.png');
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    
                    // Revoke the URL after download
                    setTimeout(() => URL.revokeObjectURL(pngUrl), 100);
                } catch (error) {
                    console.error('Error converting BTX to PNG:', error);
                    alert(`Error converting ${file.name}: ${error.message}`);
                }
            }
        }
    });
    
    // PNG to BTX
    const pngToBtxBtn = document.getElementById('png-to-btx');
    const pngFilesInput = document.getElementById('png-files');
    
    pngToBtxBtn.addEventListener('click', () => {
        pngFilesInput.click();
    });
    
    pngFilesInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        for (const file of files) {
            if (file.name.endsWith('.png')) {
                try {
                    // In a real implementation, you would convert PNG to BTX here
                    // For demo purposes, we'll just create a dummy BTX file
                    const btxBlob = await convertPngToBtx(file);
                    const btxUrl = URL.createObjectURL(btxBlob);
                    
                    // Create download link
                    const a = document.createElement('a');
                    a.href = btxUrl;
                    a.download = file.name.replace('.png', '.btx');
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    
                    // Revoke the URL after download
                    setTimeout(() => URL.revokeObjectURL(btxUrl), 100);
                } catch (error) {
                    console.error('Error converting PNG to BTX:', error);
                    alert(`Error converting ${file.name}: ${error.message}`);
                }
            }
        }
    });
    
    // ZIP BTX to PNG
    const btxZipToPngBtn = document.getElementById('btx-zip-to-png');
    const btxZipInput = document.getElementById('btx-zip');
    
    btxZipToPngBtn.addEventListener('click', () => {
        btxZipInput.click();
    });
    
    btxZipInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file || !file.name.endsWith('.zip')) return;
        
        try {
            // In a real implementation, you would process the ZIP file here
            // Extract BTX files, convert them to PNG, and create a new ZIP
            const pngZipBlob = await convertBtxZipToPngZip(file);
            const pngZipUrl = URL.createObjectURL(pngZipBlob);
            
            // Create download link
            const a = document.createElement('a');
            a.href = pngZipUrl;
            a.download = file.name.replace('.zip', '_converted.zip');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Revoke the URL after download
            setTimeout(() => URL.revokeObjectURL(pngZipUrl), 100);
        } catch (error) {
            console.error('Error converting ZIP (BTX) to ZIP (PNG):', error);
            alert(`Error converting ZIP file: ${error.message}`);
        }
    });
    
    // ZIP PNG to BTX
    const pngZipToBtxBtn = document.getElementById('png-zip-to-btx');
    const pngZipInput = document.getElementById('png-zip');
    
    pngZipToBtxBtn.addEventListener('click', () => {
        pngZipInput.click();
    });
    
    pngZipInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file || !file.name.endsWith('.zip')) return;
        
        try {
            // In a real implementation, you would process the ZIP file here
            // Extract PNG files, convert them to BTX, and create a new ZIP
            const btxZipBlob = await convertPngZipToBtxZip(file);
            const btxZipUrl = URL.createObjectURL(btxZipBlob);
            
            // Create download link
            const a = document.createElement('a');
            a.href = btxZipUrl;
            a.download = file.name.replace('.zip', '_converted.zip');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Revoke the URL after download
            setTimeout(() => URL.revokeObjectURL(btxZipUrl), 100);
        } catch (error) {
            console.error('Error converting ZIP (PNG) to ZIP (BTX):', error);
            alert(`Error converting ZIP file: ${error.message}`);
        }
    });
    
    // DFF to MOD
    const dffToModBtn = document.getElementById('dff-to-mod');
    const dffFilesInput = document.getElementById('dff-files');
    
    dffToModBtn.addEventListener('click', () => {
        dffFilesInput.click();
    });
    
    dffFilesInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        for (const file of files) {
            if (file.name.endsWith('.dff')) {
                try {
                    // In a real implementation, you would convert DFF to MOD here
                    // For demo purposes, we'll just create a dummy MOD file
                    const modBlob = await convertDffToMod(file);
                    const modUrl = URL.createObjectURL(modBlob);
                    
                    // Create download link
                    const a = document.createElement('a');
                    a.href = modUrl;
                    a.download = file.name.replace('.dff', '.mod');
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    
                    // Revoke the URL after download
                    setTimeout(() => URL.revokeObjectURL(modUrl), 100);
                } catch (error) {
                    console.error('Error converting DFF to MOD:', error);
                    alert(`Error converting ${file.name}: ${error.message}`);
                }
            }
        }
    });
});

// Mock conversion functions - replace these with actual conversion logic
async function convertBtxToPng(btxFile) {
    // In a real implementation, this would convert BTX to PNG
    // For demo, we'll create a simple PNG with the same name
    return new Blob([], { type: 'image/png' });
}

async function convertPngToBtx(pngFile) {
    // In a real implementation, this would convert PNG to BTX
    // For demo, we'll create a simple BTX with the same name
    return new Blob([], { type: 'application/octet-stream' });
}

async function convertBtxZipToPngZip(zipFile) {
    // In a real implementation, this would extract BTX files, convert them, and re-zip as PNG
    // For demo, we'll create a simple ZIP with the same name
    return new Blob([], { type: 'application/zip' });
}

async function convertPngZipToBtxZip(zipFile) {
    // In a real implementation, this would extract PNG files, convert them, and re-zip as BTX
    // For demo, we'll create a simple ZIP with the same name
    return new Blob([], { type: 'application/zip' });
}

async function convertDffToMod(dffFile) {
    // In a real implementation, this would convert DFF to MOD
    // For demo, we'll create a simple MOD with the same name
    return new Blob([], { type: 'application/octet-stream' });
}
