class App {
    constructor() {
        this.currentTab = 'btx-tab';
        this.theme = localStorage.getItem('theme') || 'dark';
        this.bgImage = localStorage.getItem('bgImage');
        this.initElements();
        this.initEventListeners();
        this.initTabHighlight();
        this.applySavedSettings();
    }

    initElements() {
        // Tabs
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.tabHighlight = document.querySelector('.tab-highlight');
        
        // Background
        this.backgroundOverlay = document.querySelector('.background-overlay');
        this.changeBgBtn = document.getElementById('change-bg-btn');
        this.bgInput = document.getElementById('bg-input');
        
        // Theme
        this.changeThemeBtn = document.getElementById('change-theme-btn');
        
        // BTX Converter
        this.btxToPngBtn = document.getElementById('btx-to-png-btn');
        this.btxToPngInput = document.getElementById('btx-to-png-input');
        this.pngToBtxBtn = document.getElementById('png-to-btx-btn');
        this.pngToBtxInput = document.getElementById('png-to-btx-input');
        this.btxZipBtn = document.getElementById('btx-zip-to-png-btn');
        this.btxZipInput = document.getElementById('btx-zip-input');
        this.pngZipBtn = document.getElementById('png-zip-to-btx-btn');
        this.pngZipInput = document.getElementById('png-zip-input');
        this.btxDownload = document.getElementById('btx-download');
        
        // MOD Converter
        this.dffToModBtn = document.getElementById('dff-to-mod-btn');
        this.dffToModInput = document.getElementById('dff-to-mod-input');
        this.modDownload = document.getElementById('mod-download');
        
        // Progress bars
        this.btxProgress = document.getElementById('btx-progress');
        this.btxProgressBar = document.getElementById('btx-progress-bar');
        this.btxStatus = document.getElementById('btx-status');
        this.modProgress = document.getElementById('mod-progress');
        this.modProgressBar = document.getElementById('mod-progress-bar');
        this.modStatus = document.getElementById('mod-status');
    }

    initEventListeners() {
        // Tab switching
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn));
        });
        
        // Background change
        this.changeBgBtn.addEventListener('click', () => this.bgInput.click());
        this.bgInput.addEventListener('change', (e) => this.changeBackground(e));
        
        // Theme toggle
        this.changeThemeBtn.addEventListener('click', () => this.toggleTheme());
        
        // BTX Converter
        this.btxToPngBtn.addEventListener('click', () => this.btxToPngInput.click());
        this.btxToPngInput.addEventListener('change', (e) => this.handleBtxToPng(e));
        
        this.pngToBtxBtn.addEventListener('click', () => this.pngToBtxInput.click());
        this.pngToBtxInput.addEventListener('change', (e) => this.handlePngToBtx(e));
        
        this.btxZipBtn.addEventListener('click', () => this.btxZipInput.click());
        this.btxZipInput.addEventListener('change', (e) => this.handleBtxZip(e));
        
        this.pngZipBtn.addEventListener('click', () => this.pngZipInput.click());
        this.pngZipInput.addEventListener('change', (e) => this.handlePngZip(e));
        
        // MOD Converter
        this.dffToModBtn.addEventListener('click', () => this.dffToModInput.click());
        this.dffToModInput.addEventListener('change', (e) => this.handleDffToMod(e));
    }

    applySavedSettings() {
        // Apply saved theme
        if (this.theme === 'light') {
            document.body.classList.add('light-theme');
            this.changeThemeBtn.querySelector('span').textContent = 'Светлая тема';
        }

        // Apply saved background
        if (this.bgImage) {
            this.backgroundOverlay.style.backgroundImage = `url(${this.bgImage})`;
        }
    }

    switchTab(btn) {
        // Update active tab button
        this.tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        const tabId = btn.getAttribute('data-tab');
        this.tabContents.forEach(tab => tab.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        
        // Move highlight
        this.moveTabHighlight(btn);
        this.currentTab = tabId;
    }

    moveTabHighlight(btn) {
        const btnRect = btn.getBoundingClientRect();
        const tabsRect = btn.parentElement.getBoundingClientRect();
        
        this.tabHighlight.style.width = `${btnRect.width}px`;
        this.tabHighlight.style.left = `${btnRect.left - tabsRect.left}px`;
    }

    changeBackground(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            this.backgroundOverlay.style.backgroundImage = `url(${event.target.result})`;
            // Save to localStorage
            localStorage.setItem('bgImage', event.target.result);
            this.bgImage = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    toggleTheme() {
        document.body.classList.toggle('light-theme');
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        
        const themeText = this.theme === 'dark' ? 'Тёмная тема' : 'Светлая тема';
        this.changeThemeBtn.querySelector('span').textContent = themeText;
        
        // Save theme
        localStorage.setItem('theme', this.theme);
    }

    // BTX/PNG Conversion Methods
    async handleBtxToPng(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        this.btxProgress.style.display = 'block';
        this.btxStatus.textContent = 'Starting conversion...';
        this.btxDownload.style.display = 'none';
        
        try {
            const zip = new JSZip();
            let processed = 0;
            
            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const pngBlob = await this.convertBtxToPng(arrayBuffer);
                
                const pngName = file.name.replace('.btx', '.png');
                zip.file(pngName, pngBlob);
                
                processed++;
                this.updateProgress('btx', processed, files.length);
            }
            
            const content = await zip.generateAsync({type: 'blob'});
            this.btxDownload.href = URL.createObjectURL(content);
            this.btxDownload.download = 'converted_png_files.zip';
            this.btxDownload.style.display = 'inline-block';
            this.btxStatus.textContent = `Conversion complete! ${processed} files converted.`;
        } catch (error) {
            this.btxStatus.textContent = `Error: ${error.message}`;
            console.error(error);
        }
    }

    async convertBtxToPng(btxData) {
        try {
            const view = new DataView(btxData);
            
            // Check for BTX signature (can be customized for your files)
            const signature = new Uint8Array(btxData, 0, 4);
            const validSignatures = [
                [0x42, 0x54, 0x58, 0x31], // BTX1
                [0x42, 0x49, 0x4E, 0x31]  // BIN1
            ];
            
            const isValid = validSignatures.some(sig => 
                sig.every((byte, i) => byte === signature[i])
            );
            
            if (!isValid) {
                console.warn('File signature doesn\'t match known BTX formats, attempting conversion anyway');
            }
            
            // Read header (adjust these offsets as needed for your format)
            const width = view.getUint32(12, true) || 256;
            const height = view.getUint32(16, true) || 256;
            const format = view.getUint32(20, true) || 0;
            const dataOffset = view.getUint32(24, true) || 32;
            
            // Create canvas for conversion
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            const imageData = ctx.createImageData(width, height);
            
            // Get texture data
            const textureData = new Uint8Array(btxData, dataOffset);
            
            // Convert based on format
            switch(format) {
                case 0: // RGBA8888
                    for (let i = 0; i < width * height * 4 && i < textureData.length; i++) {
                        imageData.data[i] = textureData[i];
                    }
                    break;
                    
                case 1: // RGB888
                    for (let i = 0, j = 0; i < width * height * 3 && i < textureData.length; i += 3, j += 4) {
                        imageData.data[j] = textureData[i];
                        imageData.data[j+1] = textureData[i+1];
                        imageData.data[j+2] = textureData[i+2];
                        imageData.data[j+3] = 255;
                    }
                    break;
                    
                default:
                    // Fallback - try to interpret as raw RGBA data
                    for (let i = 0; i < width * height * 4 && i < textureData.length; i++) {
                        imageData.data[i] = textureData[i];
                    }
            }
            
            ctx.putImageData(imageData, 0, 0);
            
            return new Promise((resolve) => {
                canvas.toBlob(blob => {
                    if (!blob) throw new Error('Conversion failed');
                    resolve(blob);
                }, 'image/png');
            });
            
        } catch (error) {
            console.error('Conversion error:', error);
            throw new Error('Failed to convert BTX to PNG. The file may be corrupted or use an unsupported format.');
        }
    }

    async handlePngToBtx(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        this.btxProgress.style.display = 'block';
        this.btxStatus.textContent = 'Starting conversion...';
        this.btxDownload.style.display = 'none';
        
        try {
            const zip = new JSZip();
            let processed = 0;
            
            for (const file of files) {
                const pngBlob = file;
                const btxBlob = await this.convertPngToBtx(pngBlob);
                
                const btxName = file.name.replace('.png', '.btx');
                zip.file(btxName, btxBlob);
                
                processed++;
                this.updateProgress('btx', processed, files.length);
            }
            
            const content = await zip.generateAsync({type: 'blob'});
            this.btxDownload.href = URL.createObjectURL(content);
            this.btxDownload.download = 'converted_btx_files.zip';
            this.btxDownload.style.display = 'inline-block';
            this.btxStatus.textContent = `Conversion complete! ${processed} files converted.`;
        } catch (error) {
            this.btxStatus.textContent = `Error: ${error.message}`;
            console.error(error);
        }
    }

    async convertPngToBtx(pngBlob) {
        try {
            const img = await createImageBitmap(pngBlob);
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            
            // Create BTX header (32 bytes)
            const header = new ArrayBuffer(32);
            const headerView = new DataView(header);
            
            // Signature
            headerView.setUint8(0, 0x42); // B
            headerView.setUint8(1, 0x54); // T
            headerView.setUint8(2, 0x58); // X
            headerView.setUint8(3, 0x31); // 1
            
            // Version
            headerView.setUint32(4, 1, true);
            
            // Dimensions
            headerView.setUint32(12, img.width, true);
            headerView.setUint32(16, img.height, true);
            
            // Format (0 = RGBA8888)
            headerView.setUint32(20, 0, true);
            
            // Data offset
            headerView.setUint32(24, 32, true);
            
            // Create texture data
            const textureData = imageData.data;
            
            // Combine header and data
            const btxData = new Uint8Array(32 + textureData.length);
            btxData.set(new Uint8Array(header), 0);
            btxData.set(textureData, 32);
            
            return new Blob([btxData], {type: 'application/octet-stream'});
            
        } catch (error) {
            console.error('Conversion error:', error);
            throw new Error('Failed to convert PNG to BTX');
        }
    }

    async handleBtxZip(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        this.btxProgress.style.display = 'block';
        this.btxStatus.textContent = 'Processing ZIP archive...';
        this.btxDownload.style.display = 'none';
        
        try {
            const zip = await JSZip.loadAsync(file);
            const resultZip = new JSZip();
            const files = Object.keys(zip.files);
            
            let processed = 0;
            const total = files.filter(f => f.toLowerCase().endsWith('.btx')).length;
            
            for (const fileName of files) {
                if (!fileName.toLowerCase().endsWith('.btx')) continue;
                
                const fileData = await zip.file(fileName).async('arraybuffer');
                const pngBlob = await this.convertBtxToPng(fileData);
                
                const pngName = fileName.replace('.btx', '.png');
                resultZip.file(pngName, pngBlob);
                
                processed++;
                this.updateProgress('btx', processed, total);
            }
            
            const content = await resultZip.generateAsync({type: 'blob'});
            this.btxDownload.href = URL.createObjectURL(content);
            this.btxDownload.download = 'converted_png_files.zip';
            this.btxDownload.style.display = 'inline-block';
            this.btxStatus.textContent = `Conversion complete! ${processed} files converted.`;
        } catch (error) {
            this.btxStatus.textContent = `Error: ${error.message}`;
            console.error(error);
        }
    }

    async handlePngZip(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        this.btxProgress.style.display = 'block';
        this.btxStatus.textContent = 'Processing ZIP archive...';
        this.btxDownload.style.display = 'none';
        
        try {
            const zip = await JSZip.loadAsync(file);
            const resultZip = new JSZip();
            const files = Object.keys(zip.files);
            
            let processed = 0;
            const total = files.filter(f => f.toLowerCase().endsWith('.png')).length;
            
            for (const fileName of files) {
                if (!fileName.toLowerCase().endsWith('.png')) continue;
                
                const fileData = await zip.file(fileName).async('blob');
                const btxBlob = await this.convertPngToBtx(fileData);
                
                const btxName = fileName.replace('.png', '.btx');
                resultZip.file(btxName, btxBlob);
                
                processed++;
                this.updateProgress('btx', processed, total);
            }
            
            const content = await resultZip.generateAsync({type: 'blob'});
            this.btxDownload.href = URL.createObjectURL(content);
            this.btxDownload.download = 'converted_btx_files.zip';
            this.btxDownload.style.display = 'inline-block';
            this.btxStatus.textContent = `Conversion complete! ${processed} files converted.`;
        } catch (error) {
            this.btxStatus.textContent = `Error: ${error.message}`;
            console.error(error);
        }
    }

    async handleDffToMod(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        this.modProgress.style.display = 'block';
        this.modStatus.textContent = 'Starting conversion...';
        this.modDownload.style.display = 'none';
        
        try {
            const zip = new JSZip();
            let processed = 0;
            
            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const modBlob = await this.convertDffToMod(arrayBuffer);
                
                const modName = file.name.replace('.dff', '.mod');
                zip.file(modName, modBlob);
                
                processed++;
                this.updateProgress('mod', processed, files.length);
            }
            
            const content = await zip.generateAsync({type: 'blob'});
            this.modDownload.href = URL.createObjectURL(content);
            this.modDownload.download = 'converted_mod_files.zip';
            this.modDownload.style.display = 'inline-block';
            this.modStatus.textContent = `Conversion complete! ${processed} files converted.`;
        } catch (error) {
            this.modStatus.textContent = `Error: ${error.message}`;
            console.error(error);
        }
    }

    async convertDffToMod(dffData) {
        try {
            const view = new DataView(dffData);
            
            // Check for DFF signature (can be customized)
            const signature = new Uint8Array(dffData, 0, 4);
            const dffSignature = [0x44, 0x46, 0x46, 0x31]; // DFF1
            
            if (!dffSignature.every((byte, i) => byte === signature[i])) {
                console.warn('File signature doesn\'t match DFF format, attempting conversion anyway');
            }
            
            // Read model info (adjust offsets as needed)
            const vertexCount = view.getUint32(12, true) || 0;
            const faceCount = view.getUint32(16, true) || 0;
            const dataOffset = view.getUint32(24, true) || 32;
            
            // Create MOD header (16 bytes)
            const modHeader = new ArrayBuffer(16);
            const modHeaderView = new DataView(modHeader);
            
            // Signature
            modHeaderView.setUint8(0, 0x4D); // M
            modHeaderView.setUint8(1, 0x4F); // O
            modHeaderView.setUint8(2, 0x44); // D
            modHeaderView.setUint8(3, 0x31); // 1
            
            // Model info
            modHeaderView.setUint32(4, vertexCount, true);
            modHeaderView.setUint32(8, faceCount, true);
            modHeaderView.setUint32(12, 16, true); // Data offset
            
            // Copy model data (vertices and faces)
            const vertices = new Uint8Array(dffData, dataOffset, vertexCount * 12);
            const faces = new Uint8Array(dffData, dataOffset + vertexCount * 12, faceCount * 12);
            
            // Combine all data
            const modData = new Uint8Array(16 + vertices.length + faces.length);
            modData.set(new Uint8Array(modHeader), 0);
            modData.set(vertices, 16);
            modData.set(faces, 16 + vertices.length);
            
            return new Blob([modData], {type: 'application/octet-stream'});
            
        } catch (error) {
            console.error('Conversion error:', error);
            throw new Error('Failed to convert DFF to MOD. The file may be corrupted or use an unsupported format.');
        }
    }

    updateProgress(type, processed, total) {
        const progress = Math.round((processed / total) * 100);
        const progressBar = type === 'btx' ? this.btxProgressBar : this.modProgressBar;
        const status = type === 'btx' ? this.btxStatus : this.modStatus;
        
        progressBar.style.width = `${progress}%`;
        status.textContent = `Processed ${processed} of ${total} files (${progress}%)`;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new App();
    
    // Check for required APIs
    if (!window.Blob || !window.FileReader || !window.createImageBitmap) {
        alert('Your browser doesn\'t support all required features. Please update your browser.');
    }
});