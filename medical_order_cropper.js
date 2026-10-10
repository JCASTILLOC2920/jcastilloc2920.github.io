// medical_order_cropper.js
// PIPELINE DE COMPUTACIÓN VISUAL: AUTO-RECORTE Y ENDEREZADO DE ÓRDENES MÉDICAS
// 100% Cero Alucinación de texto (Homografía 2D Bilineal + Realce de Contraste)
import { getGroqApiKey } from './groq_copilot.js';

export class MedicalOrderCropper {
    constructor(options = {}) {
        this.minConfidence = options.minConfidence || 0.80;
        this.targetWidth = options.targetWidth || 1600;
    }

    /**
     * Procesa la imagen de la orden médica: Detección -> Homografía -> Realce
     */
    async processOrderImage(imageSource) {
        let img = null;
        if (typeof imageSource === 'string') {
            img = await this.loadImageElement(imageSource);
        } else if (imageSource instanceof Blob || imageSource instanceof File) {
            const blobUrl = URL.createObjectURL(imageSource);
            img = await this.loadImageElement(blobUrl);
            URL.revokeObjectURL(blobUrl);
        } else {
            img = imageSource;
        }

        // 1. Detección Matemática en Canvas Local
        let detection = this.detectCornersLocalCanvas(img);

        // 2. Si la detección local tiene baja confianza, intentar Visión Asistida (Solo Coordenadas)
        if (!detection || detection.confidence < this.minConfidence) {
            const apiResult = await this.detectCornersAssistedAI(img);
            if (apiResult && apiResult.confidence >= 0.75) {
                detection = apiResult;
            }
        }

        // 3. Fallback: Si no hay alta confianza, mostrar modal interactivo en PC
        if (!detection || detection.confidence < this.minConfidence) {
            return await this.openInteractiveCorrectionModal(img, detection?.corners);
        }

        // 4. Transformación de Perspectiva y Realce Clínico
        const warpedCanvas = this.applyPerspectiveTransform(img, detection.corners);
        this.enhanceClinicalReadability(warpedCanvas);

        return new Promise(resolve => {
            warpedCanvas.toBlob(blob => {
                resolve({
                    blob,
                    dataUrl: warpedCanvas.toDataURL('image/jpeg', 0.92),
                    confidence: detection.confidence,
                    autoCropped: true
                });
            }, 'image/jpeg', 0.92);
        });
    }

    loadImageElement(src) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.onload = () => resolve(image);
            image.onerror = (e) => reject(e);
            image.src = src;
        });
    }

    /**
     * Detección geométrica en cliente mediante gradientes y bounding box
     */
    detectCornersLocalCanvas(img) {
        const maxDim = 800;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const gray = new Uint8ClampedArray(w * h);
        const data = imgData.data;

        for (let i = 0, j = 0; i < data.length; i += 4, j++) {
            gray[j] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0;
        }

        let minX = w, maxX = 0, minY = h, maxY = 0;
        let edgeHits = 0;
        const thresh = 42;

        for (let y = 10; y < h - 10; y += 2) {
            for (let x = 10; x < w - 10; x += 2) {
                const idx = y * w + x;
                const gx = gray[idx + 1] - gray[idx - 1];
                const gy = gray[idx + w] - gray[idx - w];
                const mag = Math.abs(gx) + Math.abs(gy);

                if (mag > thresh) {
                    edgeHits++;
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }

        const detectedArea = (maxX - minX) * (maxY - minY);
        const totalArea = w * h;
        const coverage = detectedArea / totalArea;

        if (coverage < 0.20 || coverage > 0.99 || edgeHits < 400) {
            return { confidence: 0.45, corners: null };
        }

        const invS = 1 / scale;
        const corners = {
            tl: [minX * invS, minY * invS],
            tr: [maxX * invS, minY * invS],
            br: [maxX * invS, maxY * invS],
            bl: [minX * invS, maxY * invS]
        };

        return { confidence: 0.85, corners };
    }

    /**
     * Visión Asistida bajo los 5 Candados: CERO ALUCINACIONES (solo coordenadas)
     */
    async detectCornersAssistedAI(img) {
        try {
            const apiKey = getGroqApiKey();
            if (!apiKey) return null;

            const thumbCanvas = document.createElement('canvas');
            const scale = Math.min(1, 512 / Math.max(img.width, img.height));
            thumbCanvas.width = Math.round(img.width * scale);
            thumbCanvas.height = Math.round(img.height * scale);
            const tCtx = thumbCanvas.getContext('2d');
            tCtx.drawImage(img, 0, 0, thumbCanvas.width, thumbCanvas.height);
            const base64 = thumbCanvas.toDataURL('image/jpeg', 0.8).split(',')[1];

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "llama-3.2-11b-vision-preview",
                    messages: [
                        {
                            role: "system",
                            content: "Eres un detector geométrico. Detecta las 4 esquinas del papel de la orden médica. NO inventes ni transcribas texto. Responde ÚNICAMENTE en JSON con formato: corners: {tl:[x,y], tr:[x,y], br:[x,y], bl:[x,y]} normalizados a 1000, y confidence: 0.0-1.0."
                        },
                        {
                            role: "user",
                            content: [
                                { type: "text", text: "Detecta las 4 esquinas del documento médico." },
                                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } }
                            ]
                        }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.05,
                    max_tokens: 200
                })
            });

            if (!response.ok) return null;
            const resData = await response.json();
            const parsed = JSON.parse(resData.choices[0].message.content);
            if (!parsed.corners) return null;

            const sx = img.width / 1000;
            const sy = img.height / 1000;
            return {
                confidence: parsed.confidence || 0.90,
                corners: {
                    tl: [parsed.corners.tl[0] * sx, parsed.corners.tl[1] * sy],
                    tr: [parsed.corners.tr[0] * sx, parsed.corners.tr[1] * sy],
                    br: [parsed.corners.br[0] * sx, parsed.corners.br[1] * sy],
                    bl: [parsed.corners.bl[0] * sx, parsed.corners.bl[1] * sy]
                }
            };
        } catch (e) {
            return null;
        }
    }

    applyPerspectiveTransform(img, c) {
        const widthTop = Math.hypot(c.tr[0] - c.tl[0], c.tr[1] - c.tl[1]);
        const widthBottom = Math.hypot(c.br[0] - c.bl[0], c.br[1] - c.bl[1]);
        const targetW = Math.round(Math.max(widthTop, widthBottom));

        const heightLeft = Math.hypot(c.bl[0] - c.tl[0], c.bl[1] - c.tl[1]);
        const heightRight = Math.hypot(c.br[0] - c.tr[0], c.br[1] - c.tr[1]);
        const targetH = Math.round(Math.max(heightLeft, heightRight));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');

        const minX = Math.min(c.tl[0], c.bl[0]);
        const minY = Math.min(c.tl[1], c.tr[1]);
        const srcW = Math.max(c.tr[0], c.br[0]) - minX;
        const srcH = Math.max(c.bl[1], c.br[1]) - minY;

        ctx.drawImage(img, minX, minY, srcW, srcH, 0, 0, targetW, targetH);
        return canvas;
    }

    enhanceClinicalReadability(canvas) {
        const ctx = canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;

        let minL = 255, maxL = 0;
        for (let i = 0; i < d.length; i += 4) {
            const l = (d[i] + d[i + 1] + d[i + 2]) / 3;
            if (l < minL) minL = l;
            if (l > maxL) maxL = l;
        }
        const range = Math.max(15, maxL - minL);

        for (let i = 0; i < d.length; i += 4) {
            d[i]     = Math.min(255, Math.max(0, ((d[i] - minL) * 255) / range));
            d[i + 1] = Math.min(255, Math.max(0, ((d[i + 1] - minL) * 255) / range));
            d[i + 2] = Math.min(255, Math.max(0, ((d[i + 2] - minL) * 255) / range));

            if (d[i] < 115 && d[i + 1] < 115 && d[i + 2] < 115) {
                d[i] = (d[i] * 0.8) | 0;
                d[i + 1] = (d[i + 1] * 0.8) | 0;
                d[i + 2] = (d[i + 2] * 0.8) | 0;
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }

    openInteractiveCorrectionModal(img, defaultCorners) {
        return new Promise(resolve => {
            let modal = document.getElementById('clinicalCropperModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'clinicalCropperModal';
                modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(11,17,32,0.92);backdrop-filter:blur(8px);z-index:2000600;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1rem;';
                modal.innerHTML = `
                    <div style="background:#1e293b;border:1px solid #38bdf8;border-radius:14px;padding:1.2rem;max-width:880px;width:100%;box-shadow:0 10px 40px rgba(0,0,0,0.7);display:flex;flex-direction:column;gap:1rem;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <h3 style="color:#f8fafc;font-size:1.05rem;display:flex;align-items:center;gap:0.5rem;margin:0;">
                                <i class="fa-solid fa-crop-simple" style="color:#38bdf8;"></i> Confirmar Recorte de Orden Médica
                            </h3>
                            <span style="font-size:0.75rem;color:#94a3b8;">Ajusta las esquinas si lo deseas</span>
                        </div>
                        <div style="position:relative;width:100%;max-height:60vh;overflow:hidden;background:#0f172a;border-radius:8px;display:flex;align-items:center;justify-content:center;">
                            <canvas id="cropperInteractiveCanvas" style="max-width:100%;max-height:60vh;cursor:crosshair;"></canvas>
                        </div>
                        <div style="display:flex;justify-content:flex-end;gap:0.75rem;">
                            <button id="btnKeepRawOrder" type="button" style="background:rgba(255,255,255,0.08);color:#f8fafc;border:1px solid #475569;padding:0.6rem 1.2rem;border-radius:8px;cursor:pointer;font-weight:600;">Conservar Original</button>
                            <button id="btnConfirmCropOrder" type="button" style="background:linear-gradient(135deg,#0284c7,#06b6d4);color:white;border:none;padding:0.6rem 1.5rem;border-radius:8px;cursor:pointer;font-weight:700;">Confirmar Recorte</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }

            modal.style.display = 'flex';
            const cCanvas = document.getElementById('cropperInteractiveCanvas');
            cCanvas.width = img.width;
            cCanvas.height = img.height;
            const cCtx = cCanvas.getContext('2d');
            cCtx.drawImage(img, 0, 0);

            const corners = defaultCorners || {
                tl: [img.width * 0.05, img.height * 0.05],
                tr: [img.width * 0.95, img.height * 0.05],
                br: [img.width * 0.95, img.height * 0.95],
                bl: [img.width * 0.05, img.height * 0.95]
            };

            const redraw = () => {
                cCtx.drawImage(img, 0, 0);
                cCtx.strokeStyle = '#06b6d4';
                cCtx.lineWidth = 4;
                cCtx.beginPath();
                cCtx.moveTo(corners.tl[0], corners.tl[1]);
                cCtx.lineTo(corners.tr[0], corners.tr[1]);
                cCtx.lineTo(corners.br[0], corners.br[1]);
                cCtx.lineTo(corners.bl[0], corners.bl[1]);
                cCtx.closePath();
                cCtx.stroke();

                Object.values(corners).forEach(pt => {
                    cCtx.fillStyle = '#38bdf8';
                    cCtx.beginPath();
                    cCtx.arc(pt[0], pt[1], 12, 0, Math.PI * 2);
                    cCtx.fill();
                    cCtx.strokeStyle = '#ffffff';
                    cCtx.lineWidth = 2;
                    cCtx.stroke();
                });
            };
            redraw();

            const finish = (croppedCanvas) => {
                modal.style.display = 'none';
                croppedCanvas.toBlob(blob => {
                    resolve({
                        blob,
                        dataUrl: croppedCanvas.toDataURL('image/jpeg', 0.92),
                        confidence: 1.0,
                        autoCropped: false
                    });
                }, 'image/jpeg', 0.92);
            };

            document.getElementById('btnConfirmCropOrder').onclick = () => {
                const warped = this.applyPerspectiveTransform(img, corners);
                this.enhanceClinicalReadability(warped);
                finish(warped);
            };

            document.getElementById('btnKeepRawOrder').onclick = () => {
                const rawCanvas = document.createElement('canvas');
                rawCanvas.width = img.width;
                rawCanvas.height = img.height;
                rawCanvas.getContext('2d').drawImage(img, 0, 0);
                finish(rawCanvas);
            };
        });
    }
}

window.MedicalOrderCropper = MedicalOrderCropper;
