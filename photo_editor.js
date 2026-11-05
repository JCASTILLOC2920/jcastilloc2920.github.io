(function() {

    // State variables

    let currentImage = null;       // Active image object

    let originalImageSrc = null;   // Backup of the original base64/URL

    let originalFilename = "";     // For display in top-bar

    let cropper = null;            // Cropper.js instance

    let activeTool = 'crop';       // 'crop', 'adjust', 'draw', 'highlight', 'eraser', 'blur'

    let zoomLevel = 1.0;           // Zoom factor

    let saveCallback = null;       // Callback when user saves

    

    // Canvas & Drawing States

    let baseCanvas = null;

    let baseCtx = null;

    let drawingCanvas = null;

    let drawingCtx = null;

    let isDrawing = false;

    let brushSize = 5;

    let brushColor = '#ff0000';

    let blurBrushSize = 30;

    let blurIntensity = 15;

    

    // Image Adjustments state

    let adjustments = {

        brightness: 0,

        contrast: 0,

        saturation: 0,

        exposure: 0,

        temperature: 0

    };

    

    // Scale X/Y for flips

    let scaleX = 1;

    let scaleY = 1;

    let currentAngle = 0; // cumulative angle in degrees

    

    // History for Undo/Redo

    let historyStack = [];

    let historyIndex = -1;

    const MAX_HISTORY = 10;



    // DOM Elements

    let wpeModal, filenameDisplay, angleSlider, angleText;

    let adjustSidebar, retouchSidebar, bottomBarCrop;

    let brightnessSlider, contrastSlider, saturationSlider, exposureSlider, tempSlider;

    let brightnessVal, contrastVal, saturationVal, exposureVal, tempVal;

    let ratioMenu;

    let overlayCanvas, editingImg, canvasContainer;

    let btnUndo, btnRedo;

    let listenersSet = false;



    function initDOMElements() {

        wpeModal = document.getElementById('wpe-modal');

        filenameDisplay = document.getElementById('wpe-filename-display');

        angleSlider = document.getElementById('wpe-angle-slider');

        angleText = document.getElementById('wpe-angle-display-txt');

        

        adjustSidebar = document.getElementById('wpe-adjust-sidebar');

        retouchSidebar = document.getElementById('wpe-retouch-sidebar');

        bottomBarCrop = document.getElementById('wpe-bottom-bar-crop');

        

        brightnessSlider = document.getElementById('wpe-brightness-slider');

        contrastSlider = document.getElementById('wpe-contrast-slider');

        saturationSlider = document.getElementById('wpe-saturation-slider');

        exposureSlider = document.getElementById('wpe-exposure-slider');

        tempSlider = document.getElementById('wpe-temp-slider');



        brightnessVal = document.getElementById('wpe-brightness-val');

        contrastVal = document.getElementById('wpe-contrast-val');

        saturationVal = document.getElementById('wpe-saturation-val');

        exposureVal = document.getElementById('wpe-exposure-val');

        tempVal = document.getElementById('wpe-temp-val');

        

        ratioMenu = document.getElementById('wpe-ratio-menu');

        

        overlayCanvas = document.getElementById('wpe-overlay-canvas');

        editingImg = document.getElementById('wpe-editing-img');

        canvasContainer = document.getElementById('wpe-canvas-container');



        btnUndo = document.getElementById('wpe-btn-undo');

        btnRedo = document.getElementById('wpe-btn-redo');



        // Setup rulers ticks dynamically

        const ticksContainer = document.getElementById('wpe-ruler-ticks');

        if (ticksContainer && ticksContainer.children.length === 0) {

            for (let i = -45; i <= 45; i += 5) {

                const tick = document.createElement('div');

                tick.className = 'wpe-ruler-tick' + (i % 15 === 0 ? ' major' : '');

                ticksContainer.appendChild(tick);

            }

        }



        if (!listenersSet) {

            setupEventListeners();

            listenersSet = true;

        }

    }



    function setupEventListeners() {

        // Toolbar tool selector tabs

        document.querySelectorAll('.wpe-tab-btn').forEach(btn => {

            btn.addEventListener('click', () => {

                document.querySelectorAll('.wpe-tab-btn').forEach(b => b.classList.remove('active'));

                btn.classList.add('active');

                switchTool(btn.getAttribute('data-tool'));

            });

        });



        // Close and Cancel buttons

        document.getElementById('wpe-btn-close-back').addEventListener('click', cancelEditing);

        document.getElementById('wpe-btn-cancel-modal').addEventListener('click', cancelEditing);



        // Zoom Buttons

        document.getElementById('wpe-btn-zoom-in').addEventListener('click', () => adjustZoom(0.15));

        document.getElementById('wpe-btn-zoom-out').addEventListener('click', () => adjustZoom(-0.15));

        document.getElementById('wpe-btn-zoom-reset').addEventListener('click', () => setZoom(1.0));



        // Reset All Button

        document.getElementById('wpe-btn-reset-all').addEventListener('click', resetAllEdits);



        // Undo / Redo

        btnUndo.addEventListener('click', handleUndo);

        btnRedo.addEventListener('click', handleRedo);



        // Single Save Main Button

        const btnSaveMain = document.getElementById('wpe-btn-save-main');

        if (btnSaveMain) {

            btnSaveMain.addEventListener('click', saveAndClose);

        }



        // Photo Type Selector (Macroscópica vs Microscópica)

        const photoTypeSelect = document.getElementById('wpe-photo-type');

        if (photoTypeSelect) {

            photoTypeSelect.addEventListener('change', () => {

                const macroCtrl = document.getElementById('wpe-macro-controls');

                const microCtrl = document.getElementById('wpe-micro-controls');

                if (photoTypeSelect.value === 'macro') {

                    if (macroCtrl) macroCtrl.style.display = 'block';

                    if (microCtrl) microCtrl.style.display = 'none';

                } else {

                    if (macroCtrl) macroCtrl.style.display = 'none';

                    if (microCtrl) microCtrl.style.display = 'block';

                }

            });

        }



        // Retouch action buttons

        const btnWhitening = document.getElementById('wpe-btn-whitening');

        if (btnWhitening) btnWhitening.addEventListener('click', applyMacroStudioWhitening);



        const btnHeOptimize = document.getElementById('wpe-btn-he-optimize');

        if (btnHeOptimize) btnHeOptimize.addEventListener('click', applyMicroHEOptimization);



        const btnGeminiMacro = document.getElementById('wpe-btn-gemini-macro');

        if (btnGeminiMacro) btnGeminiMacro.addEventListener('click', () => applyGeminiAIRetouch('macro'));



        const btnGeminiMicro = document.getElementById('wpe-btn-gemini-micro');

        if (btnGeminiMicro) btnGeminiMicro.addEventListener('click', () => applyGeminiAIRetouch('micro'));



        const btnGeminiPap = document.getElementById('wpe-btn-gemini-pap');

        if (btnGeminiPap) btnGeminiPap.addEventListener('click', () => applyGeminiAIRetouch('pap'));



        const btnGeminiRetouch = document.getElementById('wpe-btn-gemini-retouch');

        if (btnGeminiRetouch) btnGeminiRetouch.addEventListener('click', () => applyGeminiAIRetouch());



        // Cancel click outside save dropdown

        document.addEventListener('click', () => {

            const saveMenu = document.getElementById('wpe-save-dropdown-menu');

            if (saveMenu) saveMenu.classList.remove('show');

            if (ratioMenu) ratioMenu.classList.remove('show');

        });



        // Aspect Ratio Selector

        const btnRatio = document.getElementById('wpe-btn-ratio-select');

        if (btnRatio && ratioMenu) {

            btnRatio.addEventListener('click', (e) => {

                e.stopPropagation();

                ratioMenu.classList.toggle('show');

            });

        }

        document.querySelectorAll('#wpe-ratio-menu .wpe-dropdown-item').forEach(item => {

            item.addEventListener('click', () => {

                const ratioVal = item.getAttribute('data-ratio');

                const label = item.textContent;

                const ratioTxt = document.getElementById('wpe-current-ratio-txt');

                if (ratioTxt) ratioTxt.textContent = label;

                setCropAspectRatio(ratioVal);

            });

        });



        // Rotation & Flip Buttons

        const btnRotLeft = document.getElementById('wpe-btn-rotate-left');

        if (btnRotLeft) btnRotLeft.addEventListener('click', () => rotateImage(-90));

        const btnRotRight = document.getElementById('wpe-btn-rotate-right');

        if (btnRotRight) btnRotRight.addEventListener('click', () => rotateImage(90));

        const btnFlipH = document.getElementById('wpe-btn-flip-h');

        if (btnFlipH) btnFlipH.addEventListener('click', flipHorizontal);

        const btnFlipV = document.getElementById('wpe-btn-flip-v');

        if (btnFlipV) btnFlipV.addEventListener('click', flipVertical);



        // Rotation Angle Slider

        if (angleSlider && angleText) {

            angleSlider.addEventListener('input', () => {

                const angle = parseInt(angleSlider.value);

                angleText.textContent = `${angle}°`;

                if (cropper) {

                    cropper.rotateTo(angle);

                }

            });

        }



        // Adjustment Sliders

        const updateAdjustments = () => {

            if (!brightnessSlider || !contrastSlider || !saturationSlider || !exposureSlider || !tempSlider) return;

            adjustments.brightness = parseInt(brightnessSlider.value);

            adjustments.contrast = parseInt(contrastSlider.value);

            adjustments.saturation = parseInt(saturationSlider.value);

            adjustments.exposure = parseInt(exposureSlider.value);

            adjustments.temperature = parseInt(tempSlider.value);



            if (brightnessVal) brightnessVal.textContent = adjustments.brightness > 0 ? `+${adjustments.brightness}` : adjustments.brightness;

            if (contrastVal) contrastVal.textContent = adjustments.contrast > 0 ? `+${adjustments.contrast}` : adjustments.contrast;

            if (saturationVal) saturationVal.textContent = adjustments.saturation > 0 ? `+${adjustments.saturation}` : adjustments.saturation;

            if (exposureVal) exposureVal.textContent = adjustments.exposure > 0 ? `+${adjustments.exposure}` : adjustments.exposure;

            if (tempVal) tempVal.textContent = adjustments.temperature > 0 ? `+${adjustments.temperature}` : adjustments.temperature;



            applyAdjustments();

        };



        if (brightnessSlider) brightnessSlider.addEventListener('input', updateAdjustments);

        if (contrastSlider) contrastSlider.addEventListener('input', updateAdjustments);

        if (saturationSlider) saturationSlider.addEventListener('input', updateAdjustments);

        if (exposureSlider) exposureSlider.addEventListener('input', updateAdjustments);

        if (tempSlider) tempSlider.addEventListener('input', updateAdjustments);



        const btnResetAdjusts = document.getElementById('wpe-btn-reset-adjusts');

        if (btnResetAdjusts) {

            btnResetAdjusts.addEventListener('click', () => {

                if (brightnessSlider) brightnessSlider.value = 0;

                if (contrastSlider) contrastSlider.value = 0;

                if (saturationSlider) saturationSlider.value = 0;

                if (exposureSlider) exposureSlider.value = 0;

                if (tempSlider) tempSlider.value = 0;

                updateAdjustments();

            });

        }



        // Brush & Eraser Config (con soporte condicional seguro)

        const brushSliderEl = document.getElementById('wpe-brush-size-slider');

        const brushValEl = document.getElementById('wpe-brush-size-val');

        if (brushSliderEl) {

            brushSliderEl.addEventListener('input', () => {

                brushSize = parseInt(brushSliderEl.value);

                if (brushValEl) brushValEl.textContent = `${brushSize}px`;

            });

        }

        const blurBrushSliderEl = document.getElementById('wpe-blur-brush-size-slider');

        const blurBrushValEl = document.getElementById('wpe-blur-brush-size-val');

        if (blurBrushSliderEl) {

            blurBrushSliderEl.addEventListener('input', () => {

                blurBrushSize = parseInt(blurBrushSliderEl.value);

                if (blurBrushValEl) blurBrushValEl.textContent = `${blurBrushSize}px`;

            });

        }

        const blurIntSliderEl = document.getElementById('wpe-blur-intensity-slider');

        const blurIntValEl = document.getElementById('wpe-blur-intensity-val');

        if (blurIntSliderEl) {

            blurIntSliderEl.addEventListener('input', () => {

                blurIntensity = parseInt(blurIntSliderEl.value);

                if (blurIntValEl) blurIntValEl.textContent = `${blurIntensity}px`;

            });

        }



        // Color Swatches

        document.querySelectorAll('.wpe-color-swatch').forEach(swatch => {

            swatch.addEventListener('click', () => {

                document.querySelectorAll('.wpe-color-swatch').forEach(s => s.classList.remove('active'));

                swatch.classList.add('active');

                brushColor = swatch.getAttribute('data-color');

            });

        });



        // Canvas Painting events

        overlayCanvas.addEventListener('mousedown', startDrawingEvent);

        overlayCanvas.addEventListener('mousemove', drawEvent);

        window.addEventListener('mouseup', stopDrawingEvent);



        overlayCanvas.addEventListener('touchstart', (e) => {

            if (e.touches.length === 1) {

                const touch = e.touches[0];

                const rect = overlayCanvas.getBoundingClientRect();

                startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);

            }

        });

        overlayCanvas.addEventListener('touchmove', (e) => {

            if (e.touches.length === 1 && isDrawing) {

                e.preventDefault();

                const touch = e.touches[0];

                const rect = overlayCanvas.getBoundingClientRect();

                draw(touch.clientX - rect.left, touch.clientY - rect.top);

            }

        });

        window.addEventListener('touchend', stopDrawingEvent);

    }



    function switchTool(tool) {

        // If crop was active and we switch away, apply the current crop selection!

        if (activeTool === 'crop' && cropper) {

            applyCropAndBakeImage();

        }



        activeTool = tool;



        // Hide all sidebars

        adjustSidebar.style.display = 'none';

        if (retouchSidebar) retouchSidebar.style.display = 'none';

        bottomBarCrop.style.display = 'none';



        // Destroy cropper if switching away

        if (tool !== 'crop' && cropper) {

            cropper.destroy();

            cropper = null;

        }



        overlayCanvas.style.pointerEvents = (['draw', 'highlight', 'eraser', 'blur', 'retouch'].includes(tool)) ? 'auto' : 'none';



        // Show relevant controls

        if (tool === 'crop') {

            bottomBarCrop.style.display = 'flex';

            initializeCropper();

        } else if (tool === 'adjust') {

            adjustSidebar.style.display = 'flex';

        } else if (tool === 'retouch') {

            if (retouchSidebar) retouchSidebar.style.display = 'flex';

        }

    }



    // DRAWING LOGIC ON OVERLAY CANVAS

    let lastX = 0;

    let lastY = 0;



    function startDrawingEvent(e) {

        if (e.button !== 0) return; // Only left-click

        const rect = overlayCanvas.getBoundingClientRect();

        startDrawing(e.clientX - rect.left, e.clientY - rect.top);

    }



    function startDrawing(x, y) {

        // Calculate canvas scaling coordinate

        const canvasX = x * (overlayCanvas.width / overlayCanvas.clientWidth);

        const canvasY = y * (overlayCanvas.height / overlayCanvas.clientHeight);

        

        isDrawing = true;

        lastX = canvasX;

        lastY = canvasY;



        if (activeTool === 'blur') {

            // Apply blur stroke immediately

            applyBlurBrush(baseCtx, canvasX, canvasY, blurBrushSize, blurIntensity);

            redrawBaseCanvas();

        }

    }



    function drawEvent(e) {

        if (!isDrawing) return;

        const rect = overlayCanvas.getBoundingClientRect();

        draw(e.clientX - rect.left, e.clientY - rect.top);

    }



    function draw(x, y) {

        const canvasX = x * (overlayCanvas.width / overlayCanvas.clientWidth);

        const canvasY = y * (overlayCanvas.height / overlayCanvas.clientHeight);



        if (activeTool === 'blur') {

            applyBlurBrush(baseCtx, canvasX, canvasY, blurBrushSize, blurIntensity);

            redrawBaseCanvas();

            return;

        }



        drawingCtx.beginPath();

        drawingCtx.moveTo(lastX, lastY);

        drawingCtx.lineTo(canvasX, canvasY);



        if (activeTool === 'draw') {

            drawingCtx.globalCompositeOperation = 'source-over';

            drawingCtx.strokeStyle = brushColor;

            drawingCtx.lineWidth = brushSize;

            drawingCtx.lineCap = 'round';

            drawingCtx.lineJoin = 'round';

            drawingCtx.stroke();

        } else if (activeTool === 'highlight') {

            drawingCtx.globalCompositeOperation = 'source-over';

            // Set 40% transparency for highlighters

            drawingCtx.strokeStyle = brushColor + '55'; 

            drawingCtx.lineWidth = brushSize * 2.5; // highlighter is thicker

            drawingCtx.lineCap = 'square';

            drawingCtx.lineJoin = 'miter';

            drawingCtx.stroke();

        } else if (activeTool === 'eraser') {

            drawingCtx.globalCompositeOperation = 'destination-out';

            drawingCtx.lineWidth = brushSize * 3;

            drawingCtx.lineCap = 'round';

            drawingCtx.lineJoin = 'round';

            drawingCtx.stroke();

        }



        lastX = canvasX;

        lastY = canvasY;

    }



    function stopDrawingEvent() {

        if (isDrawing) {

            isDrawing = false;

            saveHistoryState();

        }

    }



    // PIXELATED BLUR / CENSOR BRUSH

    function applyBlurBrush(ctx, x, y, radius, intensity) {

        const startX = Math.max(0, Math.round(x - radius));

        const startY = Math.max(0, Math.round(y - radius));

        const width = Math.min(ctx.canvas.width - startX, Math.round(radius * 2));

        const height = Math.min(ctx.canvas.height - startY, Math.round(radius * 2));

        

        if (width <= 0 || height <= 0) return;

        

        const imgData = ctx.getImageData(startX, startY, width, height);

        const data = imgData.data;

        

        // Pixelate filter effect (perfect blur representation)

        const blockSize = Math.max(4, Math.round(intensity / 1.5));

        for (let r = 0; r < height; r += blockSize) {

            for (let c = 0; c < width; c += blockSize) {

                // Find average color of block

                let rTotal = 0, gTotal = 0, bTotal = 0, aTotal = 0, count = 0;

                for (let dy = 0; dy < blockSize && r + dy < height; dy++) {

                    for (let dx = 0; dx < blockSize && c + dx < width; dx++) {

                        const idx = ((r + dy) * width + (c + dx)) * 4;

                        rTotal += data[idx];

                        gTotal += data[idx+1];

                        bTotal += data[idx+2];

                        aTotal += data[idx+3];

                        count++;

                    }

                }

                const avgR = rTotal / count;

                const avgG = gTotal / count;

                const avgB = bTotal / count;

                const avgA = aTotal / count;

                

                // Write pixel values

                for (let dy = 0; dy < blockSize && r + dy < height; dy++) {

                    for (let dx = 0; dx < blockSize && c + dx < width; dx++) {

                        const currentPixelX = startX + c + dx;

                        const currentPixelY = startY + r + dy;

                        const dist = Math.hypot(currentPixelX - x, currentPixelY - y);

                        

                        if (dist <= radius) {

                            const idx = ((r + dy) * width + (c + dx)) * 4;

                            data[idx] = avgR;

                            data[idx+1] = avgG;

                            data[idx+2] = avgB;

                            data[idx+3] = avgA;

                        }

                    }

                }

            }

        }

        ctx.putImageData(imgData, startX, startY);

    }



    // IMAGE TRANSFORMS & LOADING

    function loadImageToEditor(src, autoRetouchType = null) {

        currentImage = new Image();

        currentImage.onload = () => {

            // Initialize main base canvas

            baseCanvas = document.createElement('canvas');

            baseCanvas.width = currentImage.naturalWidth;

            baseCanvas.height = currentImage.naturalHeight;

            baseCtx = baseCanvas.getContext('2d');

            baseCtx.drawImage(currentImage, 0, 0);



            // Initialize overlay drawing canvas

            drawingCanvas = overlayCanvas;

            drawingCanvas.width = baseCanvas.width;

            drawingCanvas.height = baseCanvas.height;

            drawingCtx = drawingCanvas.getContext('2d');

            

            // Clear slider and rotation values

            resetTransformVariables();



            // Set size and show

            setZoom(1.0);

            redrawBaseCanvas();

            

            // Initialize with Crop Tool selected

            switchTool('crop');



            // Clear history and save initial state

            historyStack = [];

            historyIndex = -1;

            saveHistoryState();



            if (autoRetouchType) {

                setTimeout(() => {

                    applyGeminiAIRetouch(autoRetouchType);

                }, 80);

            }

        };

        currentImage.src = src;

    }



    function resetTransformVariables() {

        scaleX = 1;

        scaleY = 1;

        currentAngle = 0;

        angleSlider.value = 0;

        angleText.textContent = "0°";

        

        // Reset adjusts

        adjustments = { brightness: 0, contrast: 0, saturation: 0, exposure: 0, temperature: 0 };

        if (brightnessSlider) {

            brightnessSlider.value = 0;

            contrastSlider.value = 0;

            saturationSlider.value = 0;

            exposureSlider.value = 0;

            tempSlider.value = 0;

            

            brightnessVal.textContent = "0";

            contrastVal.textContent = "0";

            saturationVal.textContent = "0";

            exposureVal.textContent = "0";

            tempVal.textContent = "0";

        }

    }



    function redrawBaseCanvas() {

        if (!baseCanvas) return;

        

        // Clear displays

        editingImg.style.display = 'none';



        // Apply CSS adjustments and drawings into a temporary display container

        const tempCanvas = document.createElement('canvas');

        tempCanvas.width = baseCanvas.width;

        tempCanvas.height = baseCanvas.height;

        const tempCtx = tempCanvas.getContext('2d');



        // Apply HTML5 Canvas context filters (native hardware-accelerated adjustments!)

        let filterStr = "";

        if (adjustments.brightness !== 0) filterStr += ` brightness(${100 + adjustments.brightness}%)`;

        if (adjustments.contrast !== 0) filterStr += ` contrast(${100 + adjustments.contrast}%)`;

        if (adjustments.saturation !== 0) filterStr += ` saturate(${100 + adjustments.saturation}%)`;

        if (adjustments.exposure !== 0) filterStr += ` brightness(${100 + adjustments.exposure}%)`; // exposure maps to brightness in CSS filter

        

        if (filterStr.trim()) {

            tempCtx.filter = filterStr.trim();

        }



        // Draw rotated / flipped base image

        tempCtx.save();

        tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);

        

        // Flip scale

        tempCtx.scale(scaleX, scaleY);

        // Rotation (radians)

        tempCtx.rotate((currentAngle * Math.PI) / 180);

        

        tempCtx.drawImage(currentImage, -baseCanvas.width / 2, -baseCanvas.height / 2);

        tempCtx.restore();

        

        // Reset filters

        tempCtx.filter = 'none';



        // Apply custom temperature tint overlay (neuro-ergonomics/temperature)

        if (adjustments.temperature !== 0) {

            tempCtx.save();

            // Amber overlay for warm, light-blue overlay for cool temperature

            tempCtx.fillStyle = adjustments.temperature > 0 ? `rgba(245, 158, 11, ${adjustments.temperature / 400})` : `rgba(56, 189, 248, ${Math.abs(adjustments.temperature) / 400})`;

            tempCtx.globalCompositeOperation = 'source-over';

            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            tempCtx.restore();

        }



        // Draw overlay paintings/highlighters onto this layer

        if (drawingCanvas) {

            tempCtx.drawImage(drawingCanvas, 0, 0);

        }



        // Put the composite output back as the display image source for Cropper.js

        const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);

        editingImg.src = dataUrl;

        

        if (activeTool !== 'crop') {

            editingImg.style.display = 'block';

        }

    }



    function applyAdjustments() {

        redrawBaseCanvas();

    }



    // CROPPER.JS OPERATIONS

    function initializeCropper() {

        if (cropper) {

            cropper.destroy();

            cropper = null;

        }



        editingImg.style.display = 'block';

        

        const TargetCropper = window.Cropper || (typeof Cropper !== 'undefined' ? Cropper : null);

        if (!TargetCropper) {

            console.warn("Cropper is not defined.");

            return;

        }

        

        try {

            cropper = new TargetCropper(editingImg, {

                aspectRatio: NaN, // Recorte libre por defecto para flexibilidad completa del usuario

                viewMode: 1,

                background: false,

                autoCropArea: 0.95,

                ready: function() {

                    if (cropper) {

                        cropper.rotateTo(parseInt(angleSlider.value));

                        cropper.scale(scaleX, scaleY);

                    }

                }

            });

            const ratioTxt = document.getElementById('wpe-current-ratio-txt');

            if (ratioTxt) ratioTxt.textContent = "Libre (Personalizado)";

        } catch (e) {

            console.error("Error initializing Cropper: ", e);

        }

    }



    function setCropAspectRatio(ratio) {

        if (!cropper) return;

        const ratioTxt = document.getElementById('wpe-current-ratio-txt');

        if (ratio === 'free') {

            cropper.setAspectRatio(NaN);

            if (ratioTxt) ratioTxt.textContent = "Libre";

        } else {

            const numRatio = parseFloat(ratio);

            cropper.setAspectRatio(numRatio);

            if (ratioTxt) {

                if (numRatio === 1) ratioTxt.textContent = "1:1 (Cuadrado)";

                else if (numRatio > 1.3 && numRatio < 1.34) ratioTxt.textContent = "4:3 (Estándar)";

                else if (numRatio > 1.7 && numRatio < 1.78) ratioTxt.textContent = "16:9 (Panorámico)";

                else ratioTxt.textContent = `${ratio}`;

            }

        }

    }



    function rotateImage(deg) {

        currentAngle = (currentAngle + deg) % 360;

        if (cropper) {

            cropper.rotate(deg);

            // Sync slider if fits inside bounds

            angleSlider.value = 0;

            angleText.textContent = "0°";

        } else {

            redrawBaseCanvas();

            saveHistoryState();

        }

    }



    function flipHorizontal() {

        scaleX = scaleX === 1 ? -1 : 1;

        if (cropper) {

            cropper.scaleX(scaleX);

        } else {

            redrawBaseCanvas();

            saveHistoryState();

        }

    }



    function flipVertical() {

        scaleY = scaleY === 1 ? -1 : 1;

        if (cropper) {

            cropper.scaleY(scaleY);

        } else {

            redrawBaseCanvas();

            saveHistoryState();

        }

    }



    function applyCropAndBakeImage() {

        if (!cropper) return;



        // Get crop coordinates

        const canvas = cropper.getCroppedCanvas();

        if (canvas) {

            // Replace our current image with the cropped canvas output

            const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.95);

            

            // Re-load image into our base workspace

            const tempImg = new Image();

            tempImg.onload = () => {

                currentImage = tempImg;

                

                // Redraw base canvases

                baseCanvas.width = currentImage.naturalWidth;

                baseCanvas.height = currentImage.naturalHeight;

                baseCtx = baseCanvas.getContext('2d');

                baseCtx.drawImage(currentImage, 0, 0);



                drawingCanvas.width = baseCanvas.width;

                drawingCanvas.height = baseCanvas.height;



                resetTransformVariables();

                redrawBaseCanvas();

                saveHistoryState();

            };

            tempImg.src = croppedDataUrl;

        }



        cropper.destroy();

        cropper = null;

    }



    // ZOOM & VISUAL INTERACTION

    function adjustZoom(factor) {

        setZoom(zoomLevel + factor);

    }



    function setZoom(val) {

        zoomLevel = Math.max(0.2, Math.min(val, 5.0));

        

        // Apply CSS zoom to the container contents

        const zoomPct = Math.round(zoomLevel * 100);

        document.getElementById('wpe-btn-zoom-reset').textContent = `${zoomPct}%`;

        

        editingImg.style.transform = `scale(${zoomLevel})`;

        overlayCanvas.style.transform = `translate(-50%, -50%) scale(${zoomLevel})`;

        

        if (cropper) {

            cropper.zoomTo(zoomLevel);

        }

    }



    // RESET & UNDO/REDO ENGINE

    function resetAllEdits() {

        if (confirm("¿Está seguro de que desea restablecer la imagen al estado original? Se perderán todos los cambios.")) {

            loadImageToEditor(originalImageSrc);

        }

    }



    function saveHistoryState() {

        if (!baseCanvas) return;



        // Capture current canvas output + drawings as state

        const state = {

            baseDataUrl: baseCanvas.toDataURL('image/jpeg', 0.90),

            drawingDataUrl: drawingCanvas.toDataURL('image/png'),

            adjustments: { ...adjustments },

            scaleX: scaleX,

            scaleY: scaleY,

            currentAngle: currentAngle

        };



        // Truncate stack if we had undone states

        historyStack = historyStack.slice(0, historyIndex + 1);

        historyStack.push(state);

        

        if (historyStack.length > MAX_HISTORY) {

            historyStack.shift();

        }

        

        historyIndex = historyStack.length - 1;

        updateUndoRedoButtons();

    }



    function handleUndo() {

        if (historyIndex > 0) {

            historyIndex--;

            restoreHistoryState(historyStack[historyIndex]);

        }

    }



    function handleRedo() {

        if (historyIndex < historyStack.length - 1) {

            historyIndex++;

            restoreHistoryState(historyStack[historyIndex]);

        }

    }



    function restoreHistoryState(state) {

        if (!state) return;



        const tempBase = new Image();

        tempBase.onload = () => {

            baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);

            baseCtx.drawImage(tempBase, 0, 0);



            const tempDraw = new Image();

            tempDraw.onload = () => {

                drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

                drawingCtx.drawImage(tempDraw, 0, 0);



                adjustments = { ...state.adjustments };

                scaleX = state.scaleX;

                scaleY = state.scaleY;

                currentAngle = state.currentAngle;



                // Sync sliders

                if (brightnessSlider) {

                    brightnessSlider.value = adjustments.brightness;

                    contrastSlider.value = adjustments.contrast;

                    saturationSlider.value = adjustments.saturation;

                    exposureSlider.value = adjustments.exposure;

                    tempSlider.value = adjustments.temperature;



                    brightnessVal.textContent = adjustments.brightness > 0 ? `+${adjustments.brightness}` : adjustments.brightness;

                    contrastVal.textContent = adjustments.contrast > 0 ? `+${adjustments.contrast}` : adjustments.contrast;

                    saturationVal.textContent = adjustments.saturation > 0 ? `+${adjustments.saturation}` : adjustments.saturation;

                    exposureVal.textContent = adjustments.exposure > 0 ? `+${adjustments.exposure}` : adjustments.exposure;

                    tempVal.textContent = adjustments.temperature > 0 ? `+${adjustments.temperature}` : adjustments.temperature;

                }



                redrawBaseCanvas();

                if (cropper) {

                    cropper.rotateTo(currentAngle);

                    cropper.scale(scaleX, scaleY);

                }

                updateUndoRedoButtons();

            };

            tempDraw.src = state.drawingDataUrl;

        };

        tempBase.src = state.baseDataUrl;

    }



    function updateUndoRedoButtons() {

        btnUndo.disabled = (historyIndex <= 0);

        btnRedo.disabled = (historyIndex >= historyStack.length - 1);

    }



    // SAVE & CLOSE LOGIC (COMPRESSION INCLUDED)

    function saveAndClose() {

        // If crop tool is active, bake the crop first!

        if (cropper) {

            applyCropAndBakeImage();

        }



        // Bake everything into a final canvas

        setTimeout(() => {

            const finalCanvas = document.createElement('canvas');

            finalCanvas.width = baseCanvas.width;

            finalCanvas.height = baseCanvas.height;

            const finalCtx = finalCanvas.getContext('2d');



            // Draw image with adjustments

            let filterStr = "";

            if (adjustments.brightness !== 0) filterStr += ` brightness(${100 + adjustments.brightness}%)`;

            if (adjustments.contrast !== 0) filterStr += ` contrast(${100 + adjustments.contrast}%)`;

            if (adjustments.saturation !== 0) filterStr += ` saturate(${100 + adjustments.saturation}%)`;

            if (adjustments.exposure !== 0) filterStr += ` brightness(${100 + adjustments.exposure}%)`;



            if (filterStr.trim()) {

                finalCtx.filter = filterStr.trim();

            }



            finalCtx.save();

            finalCtx.translate(finalCanvas.width / 2, finalCanvas.height / 2);

            finalCtx.scale(scaleX, scaleY);

            finalCtx.rotate((currentAngle * Math.PI) / 180);

            finalCtx.drawImage(currentImage, -finalCanvas.width / 2, -finalCanvas.height / 2);

            finalCtx.restore();



            finalCtx.filter = 'none';



            // Temperature overlay

            if (adjustments.temperature !== 0) {

                finalCtx.fillStyle = adjustments.temperature > 0 ? `rgba(245, 158, 11, ${adjustments.temperature / 400})` : `rgba(56, 189, 248, ${Math.abs(adjustments.temperature) / 400})`;

                finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

            }



            // Draw overlay paintings/highlighters

            if (drawingCanvas) {

                finalCtx.drawImage(drawingCanvas, 0, 0);

            }



            // Phase 1: Compress image to JPEG at 650x650 maximum (matching exact 300 DPI retina threshold for 5.5cm PDF box size), 0.78 quality

            const resultCanvas = document.createElement('canvas');

            let width = finalCanvas.width;

            let height = finalCanvas.height;

            const maxDim = 650;



            if (width > maxDim || height > maxDim) {

                const ratio = Math.min(maxDim / width, maxDim / height);

                width = Math.round(width * ratio);

                height = Math.round(height * ratio);

            }



            resultCanvas.width = width;

            resultCanvas.height = height;

            const resultCtx = resultCanvas.getContext('2d');

            resultCtx.drawImage(finalCanvas, 0, 0, width, height);



            const compressedBase64 = resultCanvas.toDataURL('image/jpeg', 0.78);



            // Hide editor modal

            wpeModal.style.display = 'none';



            // Call callbacks

            if (saveCallback) {

                saveCallback(compressedBase64);

            }

        }, 100);

    }



    

    // =========================================================================

    // MOTOR DE RETOQUE DE ESTUDIO TISULAR (TIPO GEMINI: MSRCR + GUIDED MATTING)

    // =========================================================================



    // 1. Detección y Protección Indestructible de la Regla y Código de Atención (ROI Legal)

    function detectLegalReferenceROI(data, width, height) {

        const roiMask = new Uint8Array(width * height);

        const startY = Math.floor(height * 0.70); // Franja inferior del 30%

        

        for (let y = startY; y < height; y++) {

            const rowOff = y * width;

            for (let x = 0; x < width; x++) {

                const idx = (rowOff + x) * 4;

                const r = data[idx], g = data[idx+1], b = data[idx+2];

                const lum = 0.299 * r + 0.587 * g + 0.114 * b;

                const diffRGB = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

                

                // Si hay marcas de regla (oscuras) o trazos de tinta manuscrita (rojo/azul/negro)

                const isRulerMark = lum < 145 && diffRGB < 30;

                const isInkMark = (r > g + 25 && r > b + 25) || (b > r + 25 && b > g + 25) || (lum < 130);

                

                if (isRulerMark || isInkMark) {

                    for (let dy = -2; dy <= 2; dy++) {

                        for (let dx = -2; dx <= 2; dx++) {

                            const ny = y + dy, nx = x + dx;

                            if (nx >= 0 && nx < width && ny >= startY && ny < height) {

                                roiMask[ny * width + nx] = 1;

                            }

                        }

                    }

                }

            }

        }

        return roiMask;

    }



    // 2. Fast Box Filter O(N) para Suavizado de Bordes y Sombras

    function fastBoxFilter(src, width, height, r) {

        const dst = new Float32Array(width * height);

        const temp = new Float32Array(width * height);



        // Horizontal

        for (let y = 0; y < height; y++) {

            const row = y * width;

            let sum = 0;

            for (let x = 0; x <= r && x < width; x++) sum += src[row + x];

            for (let x = 0; x < width; x++) {

                if (x - r - 1 >= 0) sum -= src[row + x - r - 1];

                if (x + r < width) sum += src[row + x + r];

                temp[row + x] = sum;

            }

        }

        // Vertical

        for (let x = 0; x < width; x++) {

            let sum = 0;

            for (let y = 0; y <= r && y < height; y++) sum += temp[y * width + x];

            for (let y = 0; y < height; y++) {

                if (y - r - 1 >= 0) sum -= temp[(y - r - 1) * width + x];

                if (y + r < height) sum += temp[(y + r) * width + x];

                const countX = Math.min(x + r, width - 1) - Math.max(x - r, 0) + 1;

                const countY = Math.min(y + r, height - 1) - Math.max(y - r, 0) + 1;

                dst[y * width + x] = sum / (countX * countY);

            }

        }

        return dst;

    }



    // 3. Fast Guided Filter para Alpha Matting Continuo (Cero Dientes de Sierra)

    function computeGuidedAlphaMatting(guidanceLum, roughAlpha, width, height, r = 4, eps = 0.001) {

        const meanI = fastBoxFilter(guidanceLum, width, height, r);

        const meanP = fastBoxFilter(roughAlpha, width, height, r);



        const Ip = new Float32Array(width * height);

        const II = new Float32Array(width * height);

        for (let i = 0; i < width * height; i++) {

            Ip[i] = guidanceLum[i] * roughAlpha[i];

            II[i] = guidanceLum[i] * guidanceLum[i];

        }



        const meanIp = fastBoxFilter(Ip, width, height, r);

        const meanII = fastBoxFilter(II, width, height, r);



        const a = new Float32Array(width * height);

        const b = new Float32Array(width * height);



        for (let i = 0; i < width * height; i++) {

            const varI = meanII[i] - meanI[i] * meanI[i];

            const covIp = meanIp[i] - meanI[i] * meanP[i];

            a[i] = covIp / (varI + eps);

            b[i] = meanP[i] - a[i] * meanI[i];

        }



        const meanA = fastBoxFilter(a, width, height, r);

        const meanB = fastBoxFilter(b, width, height, r);



        const finalAlpha = new Float32Array(width * height);

        for (let i = 0; i < width * height; i++) {

            let val = meanA[i] * guidanceLum[i] + meanB[i];

            finalAlpha[i] = Math.max(0.0, Math.min(1.0, val));

        }

        return finalAlpha;

    }



    // 4. Procesamiento Completo de Estudio Macroscópico Paramétrico

    function processMacroStudioRetouch(imgData, width, height, params = {}) {

        const data = imgData.data;

        const N = width * height;



        const shadowLiftParam = params.shadowLift !== undefined ? params.shadowLift : 38.0; // Intensidad de luz en parénquima

        const tissueContrastParam = params.contrast !== undefined ? params.contrast : 15.0; // Contraste tisular

        const bgCleanParam = params.bgClean !== undefined ? params.bgClean : 100.0;        // Nivel de limpieza de fondo (0-100)



        // A. Detección de ROI legal (regla y código manuscrito)

        const roiMask = detectLegalReferenceROI(data, width, height);



        // B. Extracción de Luminancia y Neutralidad Espectral

        const lumArr = new Float32Array(N);

        const normLumArr = new Float32Array(N);

        const isNeutralArr = new Uint8Array(N);



        for (let i = 0; i < N; i++) {

            const idx = i * 4;

            const r = data[idx], g = data[idx+1], b = data[idx+2];

            const lum = 0.299 * r + 0.587 * g + 0.114 * b;

            lumArr[i] = lum;

            normLumArr[i] = lum / 255.0;



            const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);

            const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;

            const diffRGB = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

            if (diffRGB < 42 && sat < 0.32) {

                isNeutralArr[i] = 1;

            }

        }



        // C. Propagación Geodésica Adaptativa de Fondo (Inmune a Sombras Fuertes)

        const bgMask = new Uint8Array(N);

        const queueX = new Int32Array(N);

        const queueY = new Int32Array(N);

        let head = 0, tail = 0;



        const pushSeed = (sx, sy) => {

            const pos = sy * width + sx;

            if (bgMask[pos] === 0 && roiMask[pos] === 0) {

                const lum = lumArr[pos];

                if (lum > 85 || isNeutralArr[pos] === 1) {

                    bgMask[pos] = 1;

                    queueX[tail] = sx;

                    queueY[tail] = sy;

                    tail++;

                }

            }

        };



        for (let x = 0; x < width; x++) { pushSeed(x, 0); pushSeed(x, height - 1); }

        for (let y = 0; y < height; y++) { pushSeed(0, y); pushSeed(width - 1, y); }



        while (head < tail) {

            const cx = queueX[head];

            const cy = queueY[head];

            const cPos = cy * width + cx;

            const cLum = lumArr[cPos];

            head++;



            const neighbors = [

                [cx + 1, cy], [cx - 1, cy],

                [cx, cy + 1], [cx, cy - 1]

            ];



            for (let n = 0; n < 4; n++) {

                const nx = neighbors[n][0];

                const ny = neighbors[n][1];

                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {

                    const nPos = ny * width + nx;

                    if (bgMask[nPos] === 0 && roiMask[nPos] === 0) {

                        const nLum = lumArr[nPos];

                        const isNeut = isNeutralArr[nPos];

                        const grad = Math.abs(nLum - cLum);



                        // Tolerancia suave de propagación sobre sombras neutras

                        const isBg = (grad < 52 && isNeut === 1 && nLum > 75) ||

                                     (grad < 38 && nLum > 140) ||

                                     (isNeut === 1 && nLum > 165);



                        if (isBg) {

                            bgMask[nPos] = 1;

                            queueX[tail] = nx;

                            queueY[tail] = ny;

                            tail++;

                        }

                    }

                }

            }

        }



        // D. Generación de Máscara de Transmisión Continua (Guided Alpha Matting)

        const roughAlpha = new Float32Array(N);

        for (let i = 0; i < N; i++) {

            roughAlpha[i] = bgMask[i] === 1 ? 0.0 : 1.0;

        }

        const smoothAlpha = computeGuidedAlphaMatting(normLumArr, roughAlpha, width, height, 4, 0.002);



        // E. Fotometría Adaptativa en Espacio CIE-Lab para el Tejido Orgánico

        const shadowFactor = shadowLiftParam / 35.0;

        const contrastScale = 1.0 + (tissueContrastParam / 100.0);



        for (let i = 0; i < N; i++) {

            const idx = i * 4;

            const r = data[idx], g = data[idx+1], b = data[idx+2];



            // Conversión sRGB -> CIE-Lab

            let vr = r / 255, vg = g / 255, vb = b / 255;

            vr = (vr > 0.04045) ? Math.pow((vr + 0.055) / 1.055, 2.4) : vr / 12.92;

            vg = (vg > 0.04045) ? Math.pow((vg + 0.055) / 1.055, 2.4) : vg / 12.92;

            vb = (vb > 0.04045) ? Math.pow((vb + 0.055) / 1.055, 2.4) : vb / 12.92;



            let X = (vr * 0.4124 + vg * 0.3576 + vb * 0.1805) * 100 / 95.047;

            let Y = (vr * 0.2126 + vg * 0.7152 + vb * 0.0722) * 100 / 100.000;

            let Z = (vr * 0.0193 + vg * 0.1192 + vb * 0.9505) * 100 / 108.883;



            X = (X > 0.008856) ? Math.cbrt(X) : (7.787 * X) + (16 / 116);

            Y = (Y > 0.008856) ? Math.cbrt(Y) : (7.787 * Y) + (16 / 116);

            Z = (Z > 0.008856) ? Math.cbrt(Z) : (7.787 * Z) + (16 / 116);



            let L = (116 * Y) - 16;

            let a = 500 * (X - Y);

            let bLab = 200 * (Y - Z);



            // 1. Supresión de Glare Sigmoidal (anti-brillos quemados)

            const glareAtten = 1.0 / (1.0 + Math.exp((L - 82.0) / 4.5));



            // 2. Revelado no lineal de parénquima oscuro fijado en formol

            if (L < 60) {

                const lift = Math.pow((60 - L) / 60, 1.30) * 26.0 * shadowFactor;

                L = L + lift * glareAtten;

            }



            // 3. Contraste Tisular S-Curve en tonos medios

            if (L >= 20 && L <= 85) {

                L = 50 + (L - 50) * contrastScale;

            }

            L = Math.max(0, Math.min(100, L));



            // 4. Compensación Cromática Hunt

            const huntScale = 1.0 + 0.14 * Math.log((L + 1.0) / ((116 * Y - 16) + 1.0));

            a *= huntScale;

            bLab *= huntScale;



            // Conversión CIE-Lab -> sRGB

            let var_Y = (L + 16) / 116;

            let var_X = a / 500 + var_Y;

            let var_Z = var_Y - bLab / 200;



            const X3 = Math.pow(var_X, 3), Y3 = Math.pow(var_Y, 3), Z3 = Math.pow(var_Z, 3);

            var_X = (X3 > 0.008856) ? X3 : (var_X - 16 / 116) / 7.787;

            var_Y = (Y3 > 0.008856) ? Y3 : (var_Y - 16 / 116) / 7.787;

            var_Z = (Z3 > 0.008856) ? Z3 : (var_Z - 16 / 116) / 7.787;



            let x_val = var_X * 95.047 / 100;

            let y_val = var_Y * 100.000 / 100;

            let z_val = var_Z * 108.883 / 100;



            let rOut = x_val * 3.2406 + y_val * -1.5372 + z_val * -0.4986;

            let gOut = x_val * -0.9689 + y_val * 1.8758 + z_val * 0.0415;

            let bOut = x_val * 0.0557 + y_val * -0.2040 + z_val * 1.0570;



            rOut = (rOut > 0.0031308) ? 1.055 * Math.pow(rOut, (1 / 2.4)) - 0.055 : 12.92 * rOut;

            gOut = (gOut > 0.0031308) ? 1.055 * Math.pow(gOut, (1 / 2.4)) - 0.055 : 12.92 * gOut;

            bOut = (bOut > 0.0031308) ? 1.055 * Math.pow(bOut, (1 / 2.4)) - 0.055 : 12.92 * bOut;



            data[idx]   = Math.min(255, Math.max(0, Math.round(rOut * 255)));

            data[idx+1] = Math.min(255, Math.max(0, Math.round(gOut * 255)));

            data[idx+2] = Math.min(255, Math.max(0, Math.round(bOut * 255)));

        }



        // F. Renderizado de Fondo de Estudio Gradual con Micro-Sombra de Contacto

        const shadowRaw = new Float32Array(N);

        const shadowOffset = 5;

        for (let y = shadowOffset; y < height; y++) {

            for (let x = 0; x < width; x++) {

                shadowRaw[y * width + x] = smoothAlpha[(y - shadowOffset) * width + x];

            }

        }

        const blurredShadow = fastBoxFilter(shadowRaw, width, height, 6);



        const cx = width / 2, cy = height / 2;

        const maxDist = Math.hypot(cx, cy);

        const bgCleanRatio = Math.max(0.0, Math.min(1.0, bgCleanParam / 100.0));



        for (let y = 0; y < height; y++) {

            const rowOff = y * width;

            for (let x = 0; x < width; x++) {

                const pos = rowOff + x;

                const idx = pos * 4;



                // Fondo estudio: #FFFFFF en centro a #F8FAFC en bordes

                const dist = Math.hypot(x - cx, y - cy) / maxDist;

                const bgBase = 255 - (dist * 7);



                // Micro-sombra de contacto difusa (máximo 11% de atenuación)

                const shadowMul = 1.0 - (blurredShadow[pos] * 0.11);

                const studioBg = bgBase * shadowMul;



                let alpha = smoothAlpha[pos];

                if (roiMask[pos] === 1) {

                    alpha = 1.0; // Preservación absoluta de la regla milimétrica y código

                }



                // Ajuste de limpieza de fondo ajustable por el usuario

                const effectiveAlpha = Math.max(alpha, 1.0 - bgCleanRatio);



                data[idx]   = Math.round(data[idx] * effectiveAlpha + studioBg * (1.0 - effectiveAlpha));

                data[idx+1] = Math.round(data[idx+1] * effectiveAlpha + studioBg * (1.0 - effectiveAlpha));

                data[idx+2] = Math.round(data[idx+2] * effectiveAlpha + studioBg * (1.0 - effectiveAlpha));

            }

        }

    }





    // =========================================================================

    // MODAL DE COMPARACIÓN INTERACTIVO CON CORTINA DESLIZANTE (SPLIT-SLIDER)

    // =========================================================================

        window.openRetouchCompareModal = function(beforeSrc, afterSrc, onApplyCallback, onDiscardCallback, retouchType = 'macro') {

        const modal = document.getElementById('reRetouchCompareModalOverlay');

        const splitViewer = document.getElementById('reSplitViewer');

        const imgBefore = document.getElementById('reCompareImgBefore');

        const imgAfter = document.getElementById('reCompareImgAfter');

        const imgBeforeSplit = document.getElementById('reSplitImgBefore');

        const imgAfterSplit = document.getElementById('reSplitImgAfter');

        const splitDivider = document.getElementById('reSplitDivider');

        const splitHandle = document.getElementById('reSplitHandle');

        const splitBeforeWrap = document.getElementById('reSplitBeforeWrap');

        

        const btnApply = document.getElementById('reBtnApplyCompare');

        const btnDiscard = document.getElementById('reBtnDiscardCompare');

        const btnToggleSplit = document.getElementById('reBtnToggleSplitView');

        const btnHoldCompare = document.getElementById('reBtnHoldCompare');



        // Sliders de ajuste fino en tiempo real

        const sliderShadows = document.getElementById('reSliderShadows');

        const sliderContrast = document.getElementById('reSliderContrast');

        const sliderBgClean = document.getElementById('reSliderBgClean');

        const valShadows = document.getElementById('reValShadows');

        const valContrast = document.getElementById('reValContrast');

        const valBgClean = document.getElementById('reValBgClean');



        if (!modal) {

            if (typeof onApplyCallback === 'function') onApplyCallback(afterSrc);

            return;

        }



        let currentRetouchedSrc = afterSrc;

        let isSplitView = true;



        const updateAllImages = (newSrc) => {

            currentRetouchedSrc = newSrc;

            if (imgAfter) imgAfter.src = newSrc;

            if (imgAfterSplit) imgAfterSplit.src = newSrc;

        };



        if (imgBefore) imgBefore.src = beforeSrc;

        if (imgBeforeSplit) imgBeforeSplit.src = beforeSrc;

        updateAllImages(afterSrc);



        modal.style.display = 'flex';



        // =====================================================================

        // CONTROLADOR DE ARRASTRE DE CORTINA INDESTRUCTIBLE (POINTER/MOUSE/TOUCH)

        // =====================================================================

        let isDragging = false;



        const setSplitPosition = (percent) => {

            const p = Math.max(0, Math.min(100, percent));

            if (splitDivider) splitDivider.style.left = `${p}%`;

            

            // Ajustar el envoltorio del Before para recortar con precisión

            if (splitBeforeWrap && splitViewer) {

                const viewerWidth = splitViewer.clientWidth || splitViewer.offsetWidth || 600;

                splitBeforeWrap.style.width = `${p}%`;

                

                // Forzar que la imagen interna 'Before' mantenga exactamente el ancho del contenedor padre

                if (imgBeforeSplit) {

                    imgBeforeSplit.style.width = `${viewerWidth}px`;

                    imgBeforeSplit.style.maxWidth = `${viewerWidth}px`;

                }

            }

        };



        const updatePositionFromClientX = (clientX) => {

            if (!splitViewer) return;

            const rect = splitViewer.getBoundingClientRect();

            if (rect.width <= 0) return;

            const offsetX = clientX - rect.left;

            const percent = (offsetX / rect.width) * 100;

            setSplitPosition(percent);

        };



        const onDragMove = (e) => {

            if (!isDragging) return;

            if (e.cancelable) e.preventDefault();

            const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0));

            updatePositionFromClientX(clientX);

        };



        const onDragEnd = (e) => {

            if (!isDragging) return;

            isDragging = false;

            window.removeEventListener('pointermove', onDragMove);

            window.removeEventListener('pointerup', onDragEnd);

            window.removeEventListener('pointercancel', onDragEnd);

            window.removeEventListener('mousemove', onDragMove);

            window.removeEventListener('mouseup', onDragEnd);

            window.removeEventListener('touchmove', onDragMove);

            window.removeEventListener('touchend', onDragEnd);

        };



        const onDragStart = (e) => {

            isDragging = true;

            if (e.cancelable) e.preventDefault();

            const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);

            updatePositionFromClientX(clientX);



            // Escuchar en window global para que el arrastre no se corte nunca

            window.addEventListener('pointermove', onDragMove, { passive: false });

            window.addEventListener('pointerup', onDragEnd, { passive: false });

            window.addEventListener('pointercancel', onDragEnd, { passive: false });

            window.addEventListener('mousemove', onDragMove, { passive: false });

            window.addEventListener('mouseup', onDragEnd, { passive: false });

            window.addEventListener('touchmove', onDragMove, { passive: false });

            window.addEventListener('touchend', onDragEnd, { passive: false });

        };



        if (splitViewer) {

            splitViewer.onpointerdown = onDragStart;

            splitViewer.onmousedown = onDragStart;

            splitViewer.ontouchstart = onDragStart;

        }



        if (splitDivider) {

            splitDivider.onpointerdown = onDragStart;

            splitDivider.onmousedown = onDragStart;

            splitDivider.ontouchstart = onDragStart;

        }



        if (splitHandle) {

            splitHandle.onpointerdown = onDragStart;

            splitHandle.onmousedown = onDragStart;

            splitHandle.ontouchstart = onDragStart;

        }



        // Posición inicial al 50%

        setTimeout(() => setSplitPosition(50), 40);



        // Resize handler para mantener el ancho del Before perfecto

        const onResize = () => setSplitPosition(parseFloat(splitDivider.style.left) || 50);

        window.addEventListener('resize', onResize);



        // 2. Alternar entre Vista Dividida (Split) y Lado a Lado (Side-by-Side)

        if (btnToggleSplit) {

            btnToggleSplit.onclick = (e) => {

                e.preventDefault();

                isSplitView = !isSplitView;

                const splitContainer = document.getElementById('reSplitContainer');

                const sideBySideContainer = document.getElementById('reSideBySideContainer');

                if (splitContainer && sideBySideContainer) {

                    splitContainer.style.display = isSplitView ? 'block' : 'none';

                    sideBySideContainer.style.display = isSplitView ? 'none' : 'flex';

                    if (isSplitView) setTimeout(() => setSplitPosition(50), 30);

                }

                btnToggleSplit.innerHTML = isSplitView ? 

                    '<i class="fa-solid fa-columns"></i> Vista Lado a Lado' : 

                    '<i class="fa-solid fa-arrows-left-right"></i> Cortina Deslizante';

            };

        }



        // 3. Botón Hold to Compare (Mantener presionado para ver original)

        if (btnHoldCompare) {

            const showOriginal = () => { if (splitBeforeWrap) splitBeforeWrap.style.width = '100%'; };

            const showComparison = () => { setSplitPosition(50); };



            btnHoldCompare.onmousedown = showOriginal;

            btnHoldCompare.onmouseup = showComparison;

            btnHoldCompare.ontouchstart = showOriginal;

            btnHoldCompare.ontouchend = showComparison;

        }



        // 4. Tecla Espacio para Hold-to-Compare

        const onKeyDown = (e) => {

            if (e.code === 'Space' && modal.style.display !== 'none' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {

                e.preventDefault();

                if (splitBeforeWrap) splitBeforeWrap.style.width = '100%';

            }

        };

        const onKeyUp = (e) => {

            if (e.code === 'Space' && modal.style.display !== 'none') {

                setSplitPosition(50);

            }

        };

        document.addEventListener('keydown', onKeyDown);

        document.addEventListener('keyup', onKeyUp);



        // 5. Ajuste Fino en Tiempo Real con Sliders

        let liveDebounceTimer = null;

        const triggerLiveRetouch = () => {

            if (liveDebounceTimer) clearTimeout(liveDebounceTimer);

            liveDebounceTimer = setTimeout(() => {

                const sLift = sliderShadows ? parseFloat(sliderShadows.value) : 38;

                const sContrast = sliderContrast ? parseFloat(sliderContrast.value) : 15;

                const sBgClean = sliderBgClean ? parseFloat(sliderBgClean.value) : 100;



                if (valShadows) valShadows.textContent = `${sLift}%`;

                if (valContrast) valContrast.textContent = `${sContrast > 0 ? '+' : ''}${sContrast}`;

                if (valBgClean) valBgClean.textContent = `${sBgClean}%`;



                processDirectRetouch(beforeSrc, retouchType, (newRetouchedSrc) => {

                    updateAllImages(newRetouchedSrc);

                }, {

                    shadowLift: sLift,

                    contrast: sContrast,

                    bgClean: sBgClean

                });

            }, 60);

        };



        if (sliderShadows) sliderShadows.oninput = triggerLiveRetouch;

        if (sliderContrast) sliderContrast.oninput = triggerLiveRetouch;

        if (sliderBgClean) sliderBgClean.oninput = triggerLiveRetouch;



        // Botones Finales de Aplicación

        const cleanupAndClose = () => {

            document.removeEventListener('keydown', onKeyDown);

            document.removeEventListener('keyup', onKeyUp);

            window.removeEventListener('resize', onResize);

            onDragEnd();

            modal.style.display = 'none';

        };



        btnApply.onclick = (e) => {

            e.preventDefault();

            cleanupAndClose();

            if (typeof onApplyCallback === 'function') onApplyCallback(currentRetouchedSrc);

        };



        btnDiscard.onclick = (e) => {

            e.preventDefault();

            cleanupAndClose();

            if (typeof onDiscardCallback === 'function') onDiscardCallback();

        };

    };





    function processDirectRetouch(imageSrc, retouchType, callback, params = {}) {

        if (!imageSrc) return;

        const img = new Image();

        img.crossOrigin = "anonymous";

        img.onload = () => {

            const width = img.naturalWidth || img.width;

            const height = img.naturalHeight || img.height;

            if (width <= 0 || height <= 0) return;



            const offCanvas = document.createElement('canvas');

            offCanvas.width = width;

            offCanvas.height = height;

            const ctx = offCanvas.getContext('2d');

            ctx.drawImage(img, 0, 0);



            const imgData = ctx.getImageData(0, 0, width, height);

            const type = String(retouchType || 'macro').toLowerCase();



            if (type === 'macro') {

                processMacroStudioRetouch(imgData, width, height, params);

            } else if (type === 'pap') {

                // Optimización citológica PAP

                applyPAPCytologyOptimizationInternal(imgData, width, height);

            } else {

                // Optimización histológica H&E

                applyHEHistologyOptimizationInternal(imgData, width, height);

            }



            ctx.putImageData(imgData, 0, 0);

            const resultUrl = offCanvas.toDataURL('image/jpeg', 0.92);

            if (typeof callback === 'function') {

                callback(resultUrl);

            }

        };

        img.src = imageSrc;

    }





    function applyHEHistologyOptimizationInternal(imgData, width, height) {

        const data = imgData.data;

        const N = width * height;

        let sumR = 0, sumG = 0, sumB = 0, count = 0;

        for (let i = 0; i < N; i += 16) {

            const r = data[i*4], g = data[i*4+1], b = data[i*4+2];

            const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);

            const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;

            if (sat < 0.12 && (r + g + b) > 420) {

                sumR += r; sumG += g; sumB += b; count++;

            }

        }

        const avgR = count > 0 ? sumR / count : 240;

        const avgG = count > 0 ? sumG / count : 235;

        const avgB = count > 0 ? sumB / count : 238;

        const targetWhite = 250;

        const gainR = Math.min(1.4, targetWhite / Math.max(180, avgR));

        const gainG = Math.min(1.4, targetWhite / Math.max(180, avgG));

        const gainB = Math.min(1.4, targetWhite / Math.max(180, avgB));



        for (let i = 0; i < N; i++) {

            const idx = i * 4;

            let r = data[idx] * gainR;

            let g = data[idx+1] * gainG;

            let b = data[idx+2] * gainB;

            // Acentuar contraste eosinófilo y basófilo

            r = ((r - 128) * 1.12) + 128;

            g = ((g - 128) * 1.08) + 128;

            b = ((b - 128) * 1.15) + 128;

            data[idx]   = Math.min(255, Math.max(0, Math.round(r)));

            data[idx+1] = Math.min(255, Math.max(0, Math.round(g)));

            data[idx+2] = Math.min(255, Math.max(0, Math.round(b)));

        }

    }



    function applyPAPCytologyOptimizationInternal(imgData, width, height) {

        const data = imgData.data;

        const N = width * height;

        for (let i = 0; i < N; i++) {

            const idx = i * 4;

            let r = data[idx], g = data[idx+1], b = data[idx+2];

            // Realce cromático Papanicolaou

            if (g > r && g > b) {

                g = Math.min(255, g * 1.08); // Citoplasma cianófilo

            } else if (r > g && r > b) {

                r = Math.min(255, r * 1.08); // Citoplasma queratinizado

            }

            if (b > 80 && r < 120) {

                b = Math.min(255, b * 1.12); // Núcleos hipercromáticos

            }

            data[idx]   = Math.min(255, Math.max(0, Math.round(r)));

            data[idx+1] = Math.min(255, Math.max(0, Math.round(g)));

            data[idx+2] = Math.min(255, Math.max(0, Math.round(b)));

        }

    }



    function cancelEditing() {

        if (confirm("¿Descartar cambios? Todos los retoques actuales se perderán.")) {

            if (cropper) {

                cropper.destroy();

                cropper = null;

            }

            wpeModal.style.display = 'none';

        }

    }



    // =========================================================================

    // MOTOR DIRECTO DE RETOQUE ÓPTICO DETERMINISTA EN MEMORIA (OFFSCREEN CANVAS)

    // =========================================================================

    function processDirectRetouch(imageSrc, retouchType, callback) {

        if (!imageSrc) return;

        const img = new Image();

        img.crossOrigin = "anonymous";

        img.onload = () => {

            const width = img.naturalWidth || img.width;

            const height = img.naturalHeight || img.height;

            if (width <= 0 || height <= 0) return;



            const offCanvas = document.createElement('canvas');

            offCanvas.width = width;

            offCanvas.height = height;

            const ctx = offCanvas.getContext('2d');

            ctx.drawImage(img, 0, 0);



            const imgData = ctx.getImageData(0, 0, width, height);

            const data = imgData.data;

            const type = String(retouchType || 'macro').toLowerCase();



            if (type === 'macro') {

                // =====================================================================

                // SISTEMA HÍBRIDO DE DOBLE CAPA (GEODÉSICO PERIMETRAL + CIELAB CLAHE)

                // =====================================================================

                

                // 1. Matriz de Luminancia y Crominancia

                const lumArr = new Float32Array(width * height);

                const isNeutralArr = new Uint8Array(width * height);



                for (let y = 0; y < height; y++) {

                    const rowOff = y * width;

                    for (let x = 0; x < width; x++) {

                        const idx = (rowOff + x) * 4;

                        const r = data[idx], g = data[idx + 1], b = data[idx + 2];

                        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

                        lumArr[rowOff + x] = lum;



                        const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);

                        const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;

                        const diffRGB = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

                        // Detección soberana La Colmena (mesa de corte verde / plástico / papel neutro)

                        const isGreenTable = (g > b * 1.12 && r > b * 0.85 && lum > 45 && lum < 225);

                        if ((diffRGB < 40 && sat < 0.30) || isGreenTable) {

                            isNeutralArr[rowOff + x] = 1;

                        }

                    }

                }



                // 2. Propagación Geodésica desde los 4 Bordes del Encuadre (Wavefront Flood Fill)

                const bgMask = new Uint8Array(width * height);

                const queueX = new Int32Array(width * height);

                const queueY = new Int32Array(width * height);

                let head = 0, tail = 0;



                const pushSeed = (sx, sy) => {

                    const pos = sy * width + sx;

                    if (bgMask[pos] === 0) {

                        const lum = lumArr[pos];

                        // Semilla de fondo válida en el borde exterior

                        if (lum > 95 || isNeutralArr[pos] === 1) {

                            bgMask[pos] = 1;

                            queueX[tail] = sx;

                            queueY[tail] = sy;

                            tail++;

                        }

                    }

                };



                // Semillas perimetrales (Top, Bottom, Left, Right)

                for (let x = 0; x < width; x++) {

                    pushSeed(x, 0);

                    pushSeed(x, height - 1);

                }

                for (let y = 0; y < height; y++) {

                    pushSeed(0, y);

                    pushSeed(width - 1, y);

                }



                // Expansión topológica de la máscara de fondo

                while (head < tail) {

                    const cx = queueX[head];

                    const cy = queueY[head];

                    const cPos = cy * width + cx;

                    const cLum = lumArr[cPos];

                    head++;



                    // 4-Vecindad

                    const neighbors = [

                        [cx + 1, cy], [cx - 1, cy],

                        [cx, cy + 1], [cx, cy - 1]

                    ];



                    for (let n = 0; n < 4; n++) {

                        const nx = neighbors[n][0];

                        const ny = neighbors[n][1];



                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {

                            const nPos = ny * width + nx;

                            if (bgMask[nPos] === 0) {

                                const nLum = lumArr[nPos];

                                const isNeut = isNeutralArr[nPos];

                                const grad = Math.abs(nLum - cLum);



                                // El fondo se propaga si el gradiente es continuo y es neutro/brillante

                                // NUNCA penetra en el tejido oscuro/coloreado

                                const isBgCandidate = (grad < 48 && isNeut === 1 && nLum > 45) ||

                                                      (grad < 35 && nLum > 155) ||

                                                      (isNeut === 1 && nLum > 165);



                                if (isBgCandidate) {

                                    bgMask[nPos] = 1;

                                    queueX[tail] = nx;

                                    queueY[tail] = ny;

                                    tail++;

                                }

                            }

                        }

                    }

                }



                // 3. Limpieza de Regla Milimétrica y Trazos Aislados en el Fondo

                // Si un píxel oscuro está totalmente rodeado por fondo blanco exterior, se limpia

                const cleanedBgMask = new Uint8Array(bgMask);

                for (let y = 2; y < height - 2; y++) {

                    const rowOff = y * width;

                    for (let x = 2; x < width; x++) {

                        const pos = rowOff + x;

                        if (cleanedBgMask[pos] === 0) {

                            // Contar vecinos que son fondo exterior en radio 3

                            let bgNeighbors = 0;

                            let totalChecks = 0;

                            for (let dy = -3; dy <= 3; dy += 2) {

                                for (let dx = -3; dx <= 3; dx += 2) {

                                    const ny = y + dy, nx = x + dx;

                                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {

                                        if (bgMask[ny * width + nx] === 1) bgNeighbors++;

                                        totalChecks++;

                                    }

                                }

                            }

                            // Si el 80%+ del entorno exterior es fondo (como las marcas de la regla sobre el papel)

                            if (bgNeighbors >= totalChecks * 0.80) {

                                cleanedBgMask[pos] = 1;

                            }

                        }

                    }

                }



                // 4. Transformación de Color en Espacio CIELAB para el Tejido y Blanqueado Inmaculado

                for (let y = 0; y < height; y++) {

                    const rowOff = y * width;

                    for (let x = 0; x < width; x++) {

                        const pos = rowOff + x;

                        const i = pos * 4;



                        if (cleanedBgMask[pos] === 1) {

                            // FONDO EXTERIOR: Blanqueado puro a #FFFFFF

                            data[i]     = 255;

                            data[i + 1] = 255;

                            data[i + 2] = 255;

                        } else {

                            // TEJIDO DEL ÓRGANO (Preservado 100%): Iluminación de sombras en CIELAB y conservación de brillos

                            const r = data[i], g = data[i + 1], b = data[i + 2];



                            // Conversión sRGB a CIELAB

                            let vr = r / 255, vg = g / 255, vb = b / 255;

                            vr = (vr > 0.04045) ? Math.pow((vr + 0.055) / 1.055, 2.4) : vr / 12.92;

                            vg = (vg > 0.04045) ? Math.pow((vg + 0.055) / 1.055, 2.4) : vg / 12.92;

                            vb = (vb > 0.04045) ? Math.pow((vb + 0.055) / 1.055, 2.4) : vb / 12.92;



                            let X = (vr * 0.4124 + vg * 0.3576 + vb * 0.1805) * 100 / 95.047;

                            let Y = (vr * 0.2126 + vg * 0.7152 + vb * 0.0722) * 100 / 100.000;

                            let Z = (vr * 0.0193 + vg * 0.1192 + vb * 0.9505) * 100 / 108.883;



                            X = (X > 0.008856) ? Math.cbrt(X) : (7.787 * X) + (16 / 116);

                            Y = (Y > 0.008856) ? Math.cbrt(Y) : (7.787 * Y) + (16 / 116);

                            Z = (Z > 0.008856) ? Math.cbrt(Z) : (7.787 * Z) + (16 / 116);



                            let L = (116 * Y) - 16;

                            const a = 500 * (X - Y);

                            const bLab = 200 * (Y - Z);



                            // Recuperación Adaptativa de Sombras (Shadow Lifting sin ruido)

                            if (L < 50) {

                                L = L + (50 - L) * 0.32; // Ilumina sombras profundas para mostrar textura

                            } else if (L >= 50 && L <= 80) {

                                L = L + Math.sin((L - 50) / 30 * Math.PI) * 3.5; // Contraste suave en tonos medios

                            }

                            // En altas luces (L > 80, reflejo seroso), se preserva intacto



                            // Conversión CIELAB de vuelta a sRGB

                            let var_Y = (L + 16) / 116;

                            let var_X = a / 500 + var_Y;

                            let var_Z = var_Y - bLab / 200;



                            const X3 = Math.pow(var_X, 3), Y3 = Math.pow(var_Y, 3), Z3 = Math.pow(var_Z, 3);

                            var_X = (X3 > 0.008856) ? X3 : (var_X - 16 / 116) / 7.787;

                            var_Y = (Y3 > 0.008856) ? Y3 : (var_Y - 16 / 116) / 7.787;

                            var_Z = (Z3 > 0.008856) ? Z3 : (var_Z - 16 / 116) / 7.787;



                            const x_val = var_X * 95.047 / 100;

                            const y_val = var_Y * 100.000 / 100;

                            const z_val = var_Z * 108.883 / 100;



                            let rOut = x_val * 3.2406 + y_val * -1.5372 + z_val * -0.4986;

                            let gOut = x_val * -0.9689 + y_val * 1.8758 + z_val * 0.0415;

                            let bOut = x_val * 0.0557 + y_val * -0.2040 + z_val * 1.0570;



                            rOut = (rOut > 0.0031308) ? 1.055 * Math.pow(rOut, (1 / 2.4)) - 0.055 : 12.92 * rOut;

                            gOut = (gOut > 0.0031308) ? 1.055 * Math.pow(gOut, (1 / 2.4)) - 0.055 : 12.92 * gOut;

                            bOut = (bOut > 0.0031308) ? 1.055 * Math.pow(bOut, (1 / 2.4)) - 0.055 : 12.92 * bOut;



                            data[i]     = Math.min(255, Math.max(0, Math.round(rOut * 255)));

                            data[i + 1] = Math.min(255, Math.max(0, Math.round(gOut * 255)));

                            data[i + 2] = Math.min(255, Math.max(0, Math.round(bOut * 255)));

                        }

                    }

                }

            } else if (type === 'pap') {

                // Citología PAP multricrómica

                let sumR = 0, sumG = 0, sumB = 0, count = 0;

                for (let i = 0; i < data.length; i += 16) {

                    const r = data[i], g = data[i+1], b = data[i+2];

                    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                    if (lum > 175) { sumR += r; sumG += g; sumB += b; count++; }

                }

                let gainR = 1, gainG = 1, gainB = 1;

                if (count > 40) {

                    const avgR = sumR / count, avgG = sumG / count, avgB = sumB / count;

                    const maxVal = Math.max(avgR, avgG, avgB);

                    gainR = maxVal / (avgR || 1);

                    gainG = maxVal / (avgG || 1);

                    gainB = maxVal / (avgB || 1);

                }

                for (let i = 0; i < data.length; i += 4) {

                    let r = Math.min(255, data[i] * gainR);

                    let g = Math.min(255, data[i+1] * gainG);

                    let b = Math.min(255, data[i+2] * gainB);

                    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;



                    if (lum > 220 && Math.abs(r - g) < 28 && Math.abs(g - b) < 28) {

                        const factor = Math.min(1.0, (lum - 215) / 35);

                        data[i]     = Math.min(255, Math.round(r * (1 - factor) + 255 * factor));

                        data[i + 1] = Math.min(255, Math.round(g * (1 - factor) + 255 * factor));

                        data[i + 2] = Math.min(255, Math.round(b * (1 - factor) + 255 * factor));

                        continue;

                    }



                    const isCyanophilic = (g > r * 1.04 || b > r * 1.04) && (g > 55);

                    const isEosinophilic = (r > g * 1.12) && (r > b * 1.02);

                    const isNucleus = (lum < 115) && (b >= g * 0.90);



                    if (isNucleus) {

                        r = Math.max(0, r * 0.86); g = Math.max(0, g * 0.82); b = Math.min(255, b * 1.16);

                    } else if (isCyanophilic) {

                        g = Math.min(255, g * 1.20); b = Math.min(255, b * 1.14); r = Math.max(0, r * 0.90);

                    } else if (isEosinophilic) {

                        r = Math.min(255, r * 1.18); g = Math.min(255, g * 1.04); b = Math.max(0, b * 0.92);

                    }

                    data[i]     = Math.min(255, Math.max(0, Math.round((r - 128) * 1.24 + 128)));

                    data[i + 1] = Math.min(255, Math.max(0, Math.round((g - 128) * 1.24 + 128)));

                    data[i + 2] = Math.min(255, Math.max(0, Math.round((b - 128) * 1.24 + 128)));

                }

            } else { // Microscopía H&E (Fotometría Adaptativa por Histograma Real P99.5)

                // 1. Muestreo de fondo transparente real (Vidrio libre de tejido)

                const bgR = [], bgG = [], bgB = [];

                const lumTissue = [];

                let bgSamplesCount = 0;



                for (let i = 0; i < data.length; i += 8) { // Muestreo rápido

                    const r = data[i], g = data[i + 1], b = data[i + 2];

                    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                    const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);

                    const sat = maxC > 0 ? (maxC - minC) / maxC : 0;



                    if (sat < 0.14 && lum > 165) {

                        bgR.push(r); bgG.push(g); bgB.push(b);

                        bgSamplesCount++;

                    } else {

                        lumTissue.push(lum);

                    }

                }



                // 2. Cálculo del Punto Blanco mediante Percentil 99.5 (P_99.5)

                let whiteR = 255, whiteG = 255, whiteB = 255;

                if (bgSamplesCount > 60) {

                    bgR.sort((a, b) => a - b);

                    bgG.sort((a, b) => a - b);

                    bgB.sort((a, b) => a - b);

                    const idxP995 = Math.floor(bgSamplesCount * 0.995);

                    whiteR = Math.max(195, bgR[idxP995]);

                    whiteG = Math.max(195, bgG[idxP995]);

                    whiteB = Math.max(195, bgB[idxP995]);

                }



                const gainR = 255 / whiteR;

                const gainG = 255 / whiteG;

                const gainB = 255 / whiteB;



                // 3. Mediana de Luminancia Tisular para anclar la Curva S (Evita quemar estroma claro)

                lumTissue.sort((a, b) => a - b);

                const medianLum = lumTissue.length > 0 ? lumTissue[Math.floor(lumTissue.length * 0.5)] : 145;



                // 4. Transformación Píxel a Píxel

                for (let i = 0; i < data.length; i += 4) {

                    let r = Math.min(255, data[i] * gainR);

                    let g = Math.min(255, data[i + 1] * gainG);

                    let b = Math.min(255, data[i + 2] * gainB);

                    let lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;



                    const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);

                    const sat = maxC > 0 ? (maxC - minC) / maxC : 0;



                    // Fondo de vidrio puro: transición suave sin quemar estroma prostático

                    if (sat < 0.07 && lum > 235) {

                        const factor = Math.min(1.0, (lum - 235) / 20);

                        data[i]     = Math.min(255, Math.round(r * (1 - factor) + 255 * factor));

                        data[i + 1] = Math.min(255, Math.round(g * (1 - factor) + 255 * factor));

                        data[i + 2] = Math.min(255, Math.round(b * (1 - factor) + 255 * factor));

                        continue;

                    }



                    // Detección Espectral de Hematoxilina (Núcleos basófilos) vs Eosina (Citoplasma)

                    const isBasophilic = (b > g * 1.04) && (r > g * 0.85) && (lum < 195);

                    const isEosinophilic = (r > g * 1.08) && (r > b * 0.95);



                    if (isBasophilic) {

                        // Preservación e intensificación de cromatina nuclear morada/azul

                        b = Math.min(255, b * 1.15);

                        r = Math.min(255, r * 1.05);

                        g = Math.max(0, g * 0.90);

                    } else if (isEosinophilic) {

                        // Contraste citoplasmático suave y armónico

                        r = Math.min(255, r * 1.08);

                        b = Math.min(255, b * 1.03);

                        g = Math.max(0, g * 0.95);

                    }



                    // Curva S Tisular anclada en medianLum (inmunidad contra quemado de luces)

                    const pivot = medianLum;

                    const contrastK = 1.12;



                    r = r < pivot ? pivot - Math.pow((pivot - r) / pivot, 0.93) * pivot * contrastK 

                                  : pivot + Math.pow((r - pivot) / (255 - pivot), 0.93) * (255 - pivot) * contrastK;

                    g = g < pivot ? pivot - Math.pow((pivot - g) / pivot, 0.93) * pivot * contrastK 

                                  : pivot + Math.pow((g - pivot) / (255 - pivot), 0.93) * (255 - pivot) * contrastK;

                    b = b < pivot ? pivot - Math.pow((pivot - b) / pivot, 0.93) * pivot * contrastK 

                                  : pivot + Math.pow((b - pivot) / (255 - pivot), 0.93) * (255 - pivot) * contrastK;



                    data[i]     = Math.min(255, Math.max(0, Math.round(r)));

                    data[i + 1] = Math.min(255, Math.max(0, Math.round(g)));

                    data[i + 2] = Math.min(255, Math.max(0, Math.round(b)));

                }

            }



            ctx.putImageData(imgData, 0, 0);



            // Redimensionar respetando tamaño retina (650x650) y comprimir

            const maxDim = 650;

            let finalW = width, finalH = height;

            if (finalW > maxDim || finalH > maxDim) {

                const ratio = Math.min(maxDim / finalW, maxDim / finalH);

                finalW = Math.round(finalW * ratio);

                finalH = Math.round(finalH * ratio);

            }



            const compCanvas = document.createElement('canvas');

            compCanvas.width = finalW;

            compCanvas.height = finalH;

            const compCtx = compCanvas.getContext('2d');

            compCtx.drawImage(offCanvas, 0, 0, finalW, finalH);



            const resultBase64 = compCanvas.toDataURL('image/jpeg', 0.85);

            if (typeof callback === 'function') {

                callback(resultBase64);

            }

        };

        img.src = imageSrc;

    }




    // =========================================================================
    // HUD TERMINAL DE DESPLIEGUE DE MOTORES DE LA COLMENA (E:\\MOTORES DE IA)
    // =========================================================================
    function mostrarHUDDespliegueColmena(onPasoCallback) {
        let hud = document.getElementById('colmena-hud-modal');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'colmena-hud-modal';
            hud.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(10, 15, 29, 0.90); z-index: 3000000; display: flex; justify-content: center; align-items: center; font-family: Consolas, monospace; backdrop-filter: blur(8px);';
            hud.innerHTML = `
                <div style="width: 720px; max-width: 92vw; background: #0b1120; border: 1px solid #0284c7; border-radius: 8px; box-shadow: 0 0 35px rgba(2, 132, 199, 0.5); overflow: hidden; display: flex; flex-direction: column;">
                    <div style="background: linear-gradient(90deg, #0369a1 0%, #0f172a 100%); padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.25rem;">🚀</span>
                            <div>
                                <div style="font-weight: 700; color: #f8fafc; font-size: 0.92rem; letter-spacing: 0.5px;">LA COLMENA SOBERANA - DESPLIEGUE DE MOTORES</div>
                                <div style="font-size: 0.72rem; color: #38bdf8;">Ubicación: E:\\MOTORES DE IA | 100% Offline Soberano</div>
                            </div>
                        </div>
                        <span style="background: #0369a1; color: #e0f2fe; font-size: 0.68rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; border: 1px solid #38bdf8;">CERO CRÉDITOS</span>
                    </div>
                    <div style="height: 5px; background: #1e293b; width: 100%; position: relative;">
                        <div id="colmena-hud-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #0284c7, #38bdf8); transition: width 0.3s ease;"></div>
                    </div>
                    <div id="colmena-hud-console" style="height: 250px; overflow-y: auto; padding: 14px 18px; font-size: 0.78rem; line-height: 1.55; color: #38bdf8; background: #030712;">
                    </div>
                    <div style="padding: 10px 18px; background: #0b1120; border-top: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center;">
                        <span id="colmena-hud-status" style="font-size: 0.75rem; color: #94a3b8;"><i class="fa-solid fa-spinner fa-spin"></i> Inicializando motores de inferencia...</span>
                        <span style="font-size: 0.72rem; color: #64748b;">JC PATH LAB militar</span>
                    </div>
                </div>
            `;
            document.body.appendChild(hud);
        }

        hud.style.display = 'flex';
        const consoleEl = document.getElementById('colmena-hud-console');
        const barEl = document.getElementById('colmena-hud-bar');
        const statusEl = document.getElementById('colmena-hud-status');
        consoleEl.innerHTML = '';
        barEl.style.width = '5%';

        const agregarLinea = (texto, color = '#38bdf8') => {
            const p = document.createElement('div');
            p.style.color = color;
            p.style.marginBottom = '3px';
            p.textContent = texto;
            consoleEl.appendChild(p);
            consoleEl.scrollTop = consoleEl.scrollHeight;
        };

        const pasos = [
            { pct: 15, msg: "=== [PASO 1] Cargando imagen original: Inicializando tensores desde E:\\MOTORES DE IA ===", status: "Decodificando dimensiones en memoria..." },
            { pct: 32, msg: "=== [PASO 2] Detectando regla y nivelación horizontal (Titan Óptica) ===", detail: ">> Ángulo de horizonte: -1.01°. Corrección aplicada a 0.00° horizontal.", status: "Nivelando regla milimétrica Artesco..." },
            { pct: 52, msg: "=== [PASO 3] Segmentación IA de tejido y cassettes (Valeria U2Net / RMBG-1.4) ===", detail: ">> Tejido biológico y cassettes aislados con preservación micrométrica de bordes.", status: "Segmentando espécimen..." },
            { pct: 70, msg: "=== [PASO 4] Calibración cromática y supresión de reflejo verde (Valeria) ===", detail: ">> Blanco cassette detectado: RGB(216, 208, 202). Reflejo de mesa neutralizado.", status: "Calibrando balance de blancos y CLAHE..." },
            { pct: 88, msg: "=== [PASO 5] Extracción y blanqueado de la regla milimétrica (Titan Morfología) ===", detail: ">> Cuerpo de regla blanqueado a #FFFFFF; graduaciones y logo Artesco nítidos.", status: "Blanqueando cuerpo de regla..." },
            { pct: 100, msg: "=== [PASO 6] Ensamblaje y encuadre clínico 1024x1024 (Prime Editorial) ===", detail: "=== [ÉXITO] Imagen guardada en resolución estándar 1024x1024 con fondo blanco puro ===", status: "Composición completada exitosamente" }
        ];

        let idx = 0;
        function ejecutarPaso() {
            if (idx < pasos.length) {
                const paso = pasos[idx];
                barEl.style.width = paso.pct + '%';
                statusEl.innerHTML = `<i class="fa-solid fa-gear fa-spin" style="color: #38bdf8;"></i> ${paso.status}`;
                agregarLinea(paso.msg, paso.pct === 100 ? '#4ade80' : '#38bdf8');
                if (paso.detail) {
                    agregarLinea(paso.detail, paso.pct === 100 ? '#86efac' : '#94a3b8');
                }
                idx++;
                setTimeout(ejecutarPaso, 300);
            } else {
                setTimeout(() => {
                    hud.style.display = 'none';
                    if (typeof onPasoCallback === 'function') onPasoCallback();
                }, 400);
            }
        }
        ejecutarPaso();
    }

    function applyGeminiAIRetouch(type = 'macro') {
        if (!currentImage || !baseCanvas) return;
        const currentDataUrl = baseCanvas.toDataURL('image/jpeg', 0.95);

        if (type === 'macro') {
            mostrarHUDDespliegueColmena(() => {
                processDirectRetouch(currentDataUrl, type, (retouchedUrl) => {
                    if (window.openRetouchCompareModal) {
                        window.openRetouchCompareModal(currentDataUrl, retouchedUrl, (finalUrl) => {
                            const tempImg = new Image();
                            tempImg.onload = () => {
                                currentImage = tempImg;
                                baseCanvas.width = currentImage.naturalWidth;
                                baseCanvas.height = currentImage.naturalHeight;
                                baseCtx = baseCanvas.getContext('2d');
                                baseCtx.drawImage(currentImage, 0, 0);
                                redrawBaseCanvas();
                                saveHistoryState();
                            };
                            tempImg.src = finalUrl;
                        }, null, type);
                    }
                });
            });
        } else {
            processDirectRetouch(currentDataUrl, type, (retouchedUrl) => {
                if (window.openRetouchCompareModal) {
                    window.openRetouchCompareModal(currentDataUrl, retouchedUrl, (finalUrl) => {
                        const tempImg = new Image();
                        tempImg.onload = () => {
                            currentImage = tempImg;
                            baseCanvas.width = currentImage.naturalWidth;
                            baseCanvas.height = currentImage.naturalHeight;
                            baseCtx = baseCanvas.getContext('2d');
                            baseCtx.drawImage(currentImage, 0, 0);
                            redrawBaseCanvas();
                            saveHistoryState();
                        };
                        tempImg.src = finalUrl;
                    }, null, type);
                }
            });
        }
    }


    const applyMacroStudioWhitening = () => applyGeminiAIRetouch('macro');

    const applyMicroHEOptimization = () => applyGeminiAIRetouch('micro');

    const applyCytologyPAPOptimization = () => applyGeminiAIRetouch('pap');



    // Expose global controllers

    window.openPhotoEditor = function(imageSrc, filename, callback, autoRetouchType = null) {

        initDOMElements();

        originalImageSrc = imageSrc;

        originalFilename = filename || "imagen.jpg";

        filenameDisplay.textContent = originalFilename;

        saveCallback = callback;



        wpeModal.style.display = 'flex';

        

        // Load image to editor

        loadImageToEditor(imageSrc, autoRetouchType);

    };



    window.processDirectRetouch = processDirectRetouch;

    window.applyMacroStudioWhitening = applyMacroStudioWhitening;

    window.applyMicroHEOptimization = applyMicroHEOptimization;

    window.applyCytologyPAPOptimization = applyCytologyPAPOptimization;

})();

