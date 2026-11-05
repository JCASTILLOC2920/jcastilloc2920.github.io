// seguridad_engine.js
// MOTOR SOBERANO DE SEGURIDAD, MULTICANAL Y DETECCIÓN DE INTRUSIÓN
// JC PATH LAB — 100% OFFLINE, CERO NUBE, CERO COSTOS

(function() {
    'use strict';

    const CHANNELS_COUNT = 4;
    const activeStreams = {};
    const motionDetectors = {};
    let isNightGuardActive = false;
    let availableVideoDevices = [];
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Tonos de alarma local sin archivos externos
    function playIntruderAlarmSound() {
        if (!document.getElementById('chkAudioAlarm')?.checked) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
            osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        } catch(e) {}
    }

    // Inicializador
    window.addEventListener('DOMContentLoaded', async () => {
        initLayoutControls();
        initGuardControls();
        await scanAndPopulateCameras();
    });

    // Control de Grid (1x1, 1x2, 2x2, 3x2)
    function initLayoutControls() {
        const gridEl = document.getElementById('cctvGrid');
        document.querySelectorAll('.layout-btn[data-grid]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.layout-btn[data-grid]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const g = btn.getAttribute('data-grid');
                gridEl.className = `cctv-grid grid-${g}`;
            });
        });

        const fullBtn = document.getElementById('btnFullscreenGrid');
        if (fullBtn) {
            fullBtn.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen().catch(() => {});
                }
            });
        }
    }

    // Escanear dispositivos de video UVC y Webcams
    async function scanAndPopulateCameras() {
        try {
            // Solicitar permiso preliminar para desbloquear etiquetas (labels)
            const tmpStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }).catch(() => null);
            if (tmpStream) {
                tmpStream.getTracks().forEach(t => t.stop());
            }

            const devices = await navigator.mediaDevices.enumerateDevices();
            availableVideoDevices = devices.filter(d => d.kind === 'videoinput');

            console.log('[CCTV Engine] Dispositivos de video detectados:', availableVideoDevices.length);

            for (let i = 1; i <= CHANNELS_COUNT; i++) {
                const select = document.getElementById(`camSelect${i}`);
                if (!select) continue;
                select.innerHTML = '<option value="">-- Sin Señal --</option>';

                availableVideoDevices.forEach((dev, idx) => {
                    const opt = document.createElement('option');
                    opt.value = dev.deviceId;
                    opt.textContent = dev.label || `Cámara USB #${idx + 1}`;
                    select.appendChild(opt);
                });

                select.addEventListener('change', () => {
                    startChannelCamera(i, select.value);
                });
            }

            // Auto-arranque de las primeras cámaras disponibles
            if (availableVideoDevices.length > 0) {
                // Asignar primer dispositivo al Canal 1
                const s1 = document.getElementById('camSelect1');
                if (s1 && availableVideoDevices[0]) {
                    s1.value = availableVideoDevices[0].deviceId;
                    startChannelCamera(1, availableVideoDevices[0].deviceId);
                }
                // Si hay más de una (ej. Motic + Logitech), asignar al Canal 2
                if (availableVideoDevices.length > 1) {
                    const s2 = document.getElementById('camSelect2');
                    if (s2 && availableVideoDevices[1]) {
                        s2.value = availableVideoDevices[1].deviceId;
                        startChannelCamera(2, availableVideoDevices[1].deviceId);
                    }
                }
            }

        } catch(err) {
            console.error('[CCTV Engine] Error escaneando cámaras:', err);
        }
    }

    // Iniciar cámara en canal específico
    async function startChannelCamera(channelNum, deviceId) {
        const videoEl = document.getElementById(`video${channelNum}`);
        const infoEl = document.getElementById(`camInfo${channelNum}`);

        // Detener stream anterior si existía
        if (activeStreams[channelNum]) {
            activeStreams[channelNum].getTracks().forEach(t => t.stop());
            delete activeStreams[channelNum];
        }
        if (motionDetectors[channelNum]) {
            clearInterval(motionDetectors[channelNum]);
            delete motionDetectors[channelNum];
        }

        if (!deviceId) {
            if (videoEl) videoEl.srcObject = null;
            if (infoEl) infoEl.textContent = 'STANDBY';
            return;
        }

        try {
            const constraints = {
                video: {
                    deviceId: { exact: deviceId },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            activeStreams[channelNum] = stream;
            videoEl.srcObject = stream;

            videoEl.onloadedmetadata = () => {
                videoEl.play();
                if (infoEl) {
                    infoEl.textContent = `${videoEl.videoWidth}x${videoEl.videoHeight} · 30 FPS`;
                }
                startMotionDetectionOnChannel(channelNum, videoEl);
            };

        } catch (e) {
            console.error(`[CCTV Engine] Error iniciando Canal ${channelNum}:`, e);
            if (infoEl) infoEl.textContent = 'ERROR ACCESO';
        }
    }

    // Algoritmo de Detección de Movimiento por Diferencia de Fotogramas (Frame Differencing)
    function startMotionDetectionOnChannel(channelNum, videoEl) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const W = 64; // Escala reducida para 0% uso de CPU
        const H = 48;
        canvas.width = W;
        canvas.height = H;

        let prevData = null;
        let alarmCooldown = false;

        const intervalId = setInterval(() => {
            if (!videoEl || videoEl.paused || videoEl.ended || !videoEl.videoWidth) return;

            ctx.drawImage(videoEl, 0, 0, W, H);
            const currentImg = ctx.getImageData(0, 0, W, H);
            const currentData = currentImg.data;

            if (prevData) {
                let diffCount = 0;
                const sensitivity = parseInt(document.getElementById('motionSensitivity')?.value || '20', 10);
                const threshold = 30; // Diferencia de brillo RGB

                for (let i = 0; i < currentData.length; i += 4) {
                    const rD = Math.abs(currentData[i] - prevData[i]);
                    const gD = Math.abs(currentData[i + 1] - prevData[i + 1]);
                    const bD = Math.abs(currentData[i + 2] - prevData[i + 2]);
                    if ((rD + gD + bD) / 3 > threshold) {
                        diffCount++;
                    }
                }

                const diffPercent = (diffCount / (W * H)) * 100;
                const triggerThreshold = (55 - sensitivity); // A mayor slider, menor umbral requerido

                if (diffPercent > triggerThreshold && !alarmCooldown) {
                    triggerIntruderAlarm(channelNum, videoEl);
                    alarmCooldown = true;
                    setTimeout(() => { alarmCooldown = false; }, 3500); // Cooldown de 3.5 segundos
                }
            }

            prevData = currentData;
        }, 120); // 8 revisiones por segundo (0% consumo de CPU)

        motionDetectors[channelNum] = intervalId;
    }

    // Disparar Alarma de Intrusión
    function triggerIntruderAlarm(channelNum, videoEl) {
        const card = document.getElementById(`camCard${channelNum}`);
        const badge = document.getElementById(`alertBadge${channelNum}`);

        if (card) {
            card.classList.add('motion-alarm');
            setTimeout(() => { card.classList.remove('motion-alarm'); }, 3000);
        }
        if (badge) {
            badge.style.display = 'inline-flex';
            setTimeout(() => { badge.style.display = 'none'; }, 3000);
        }

        playIntruderAlarmSound();

        if (document.getElementById('chkAutoSnapshot')?.checked) {
            captureSnapshot(channelNum, videoEl, true);
        }
    }

    // Capturar Foto
    window.capturarFotoCanal = function(channelNum) {
        const videoEl = document.getElementById(`video${channelNum}`);
        if (!videoEl || !videoEl.videoWidth) {
            alert(`El Canal ${channelNum} no tiene señal activa.`);
            return;
        }
        captureSnapshot(channelNum, videoEl, false);
    };

    function captureSnapshot(channelNum, videoEl, isIncident = false) {
        const canvas = document.createElement('canvas');
        canvas.width = videoEl.videoWidth || 1280;
        canvas.height = videoEl.videoHeight || 720;
        const ctx = canvas.getContext('2d');

        // Dibujar imagen
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

        // Estampar marca de agua con fecha y hora oficial militar
        const now = new Date();
        const timeStr = now.toLocaleDateString('es-PE') + ' ' + now.toLocaleTimeString('es-PE');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

        ctx.fillStyle = '#00f2fe';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.fillText(`JC PATH LAB — CH${channelNum} · ${timeStr} · SEGURIDAD SOBERANA`, 20, canvas.height - 15);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

        // Registrar en el log de incidentes del sidebar
        addIncidentLogItem(channelNum, timeStr, dataUrl, isIncident);
    }

    // Agregar Item al Log del Sidebar
    function addIncidentLogItem(channelNum, timeStr, dataUrl, isIncident) {
        const list = document.getElementById('incidentList');
        const emptyMsg = document.getElementById('emptyLogMsg');
        if (emptyMsg) emptyMsg.remove();

        const item = document.createElement('div');
        item.className = 'incident-item';
        if (!isIncident) item.style.borderLeftColor = 'var(--accent-cyan)';

        item.innerHTML = `
            <div class="incident-meta">
                <span class="incident-cam">${isIncident ? '🚨 INTRUSIÓN DETECTADA' : '📸 FOTO MANUAL'} — CANAL ${channelNum}</span>
                <span class="incident-time">${timeStr}</span>
            </div>
            <img src="${dataUrl}" class="snapshot-thumb" onclick="window.mostrarSnapshotAmpliada('${dataUrl}')" title="Clic para ampliar">
        `;

        list.insertBefore(item, list.firstChild);
    }

    // Modal para ver foto ampliada
    window.mostrarSnapshotAmpliada = function(dataUrl) {
        const modal = document.getElementById('snapshotModal');
        const img = document.getElementById('snapshotModalImg');
        if (modal && img) {
            img.src = dataUrl;
            modal.classList.add('active');
        }
    };

    // Maximizar canal
    window.toggleFullscreenCanal = function(channelNum) {
        const card = document.getElementById(`camCard${channelNum}`);
        if (!card) return;
        if (!document.fullscreenElement) {
            card.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    // Controles de Guardia
    function initGuardControls() {
        const btnAlarm = document.getElementById('btnModoAlarmaNocturna');
        const statusText = document.getElementById('alarmStatusText');
        const btnScan = document.getElementById('btnEscanearCamaras');

        if (btnAlarm) {
            btnAlarm.addEventListener('click', () => {
                isNightGuardActive = !isNightGuardActive;
                if (isNightGuardActive) {
                    btnAlarm.classList.add('active');
                    if (statusText) {
                        statusText.textContent = 'ACTIVA 24/7 (ARMADA)';
                        statusText.style.color = '#ef4444';
                    }
                } else {
                    btnAlarm.classList.remove('active');
                    if (statusText) {
                        statusText.textContent = 'OFF';
                        statusText.style.color = '#10b981';
                    }
                }
            });
        }

        if (btnScan) {
            btnScan.addEventListener('click', () => {
                scanAndPopulateCameras();
            });
        }
    }

})();
