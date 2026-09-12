/**
 * JC PATH LAB - VISOR 3D WEBGL DE PIEZA QUIRÚRGICA CON MAPEO HISTOLÓGICO
 * Soporte dual: Three.js GPU PBR Shading + Mapeo de Pins 3D Raycasting + Fallback 360° HD
 */

export class SurgicalViewer3D {
    constructor(container, options = {}) {
        if (!container) throw new Error("SurgicalViewer3D requiere un contenedor DOM.");
        this.container = container;
        this.options = Object.assign({
            specimenTextureUrl: 'macro360_clean/frame_00.webp',
            framesCount: 36,
            framesDir: 'macro360_clean',
            defaultMicroscopeImg: 'morfologia_he_original.jpg',
            autoRotate: true,
            autoRotateSpeed: 1.0,
            pins: [
                {
                    id: 'M-1',
                    nombre: 'Margen Quirúrgico Tinta China (Ápex)',
                    pos: { x: 0.85, y: -0.45, z: 0.90 },
                    tipo: 'libre',
                    color: 0x10b981,
                    casete: 'Casete B-02',
                    diagnostico: 'Margen apical y capsular libre de neoplasia (R0). Distancia mínima de seguridad: 3.2 mm.',
                    distancia: '3.2 mm',
                    microImg: 'morfologia_he_original.jpg'
                },
                {
                    id: 'M-2',
                    nombre: 'Nódulo Dominante (Zona Periférica)',
                    pos: { x: -0.90, y: 0.15, z: 0.75 },
                    tipo: 'comprometido',
                    color: 0xef4444,
                    casete: 'Casete A-04',
                    diagnostico: 'Adenocarcinoma acinar invasor Gleason 4+4=8 (ISUP Grade Group 4). Fusión glandular y patrón cribiforme extenso.',
                    distancia: 'En parénquima',
                    microImg: 'morfologia_ia_pleomorfismo.jpg'
                },
                {
                    id: 'M-3',
                    nombre: 'Cuello Vesical / Margen Superior',
                    pos: { x: 0.10, y: 1.15, z: 0.45 },
                    tipo: 'libre',
                    color: 0x38bdf8,
                    casete: 'Casete C-01',
                    diagnostico: 'Urotelio de transición maduro sobre haces musculares del detrusor indemnes (R0). Sin atipia citológica.',
                    distancia: '4.8 mm',
                    microImg: 'morfologia_he_original.jpg'
                },
                {
                    id: 'M-4',
                    nombre: 'Fascículo Neurovascular / Grasa Periprostática',
                    pos: { x: -0.45, y: -0.65, z: -0.90 },
                    tipo: 'referencia',
                    color: 0xa855f7,
                    casete: 'Casete D-03',
                    diagnostico: 'Grasa periprostática madura con filetes nerviosos mielinizados intactos. Cápsula respetada, PNI negativo.',
                    distancia: 'Indemne',
                    microImg: 'morfologia_he_original.jpg'
                }
            ]
        }, options);

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.specimenGroup = null;
        this.pinMeshes = [];
        this.screenLabels = [];
        this.raycaster = null;
        this.mouse = null;
        this.clock = null;
        this.isDestroyed = false;

        // Estado del bucle condicional rAF (Dormir en reposo para 0% CPU y batería en móviles)
        this.rafId = null;
        this.isVisible = true;
        this.isInteracting = false;
        this._settleFrames = 0;
        this._cachedWidth = 800;
        this._cachedHeight = 520;

        this._setupDOM();
        this._loadDependencies().then(() => {
            this._initThree();
            this._buildSpecimenMesh();
            this._buildPins();
            this._setupRaycaster();
            this._setupModal();
            this.requestRender();
        }).catch(err => {
            console.warn("[SurgicalViewer3D] Fallback a motor 360 interactivo por:", err);
            this._setup360Fallback();
        });
    }

    _setupDOM() {
        this.container.classList.add('surgical3d-wrapper');
        this.container.innerHTML = `
            <div class="surgical3d-hud-header">
                <div class="surgical3d-badge-pill">
                    <i class="fa-solid fa-cube"></i>
                    <span>PIEZA QUIRÚRGICA 3D &bull; JC PATH LAB</span>
                </div>
                <div class="surgical3d-btn-group">
                    <button type="button" class="surgical3d-btn-tool active" id="btn3dSpin" title="Pausar/Reanudar Giro Automático">
                        <i class="fa-solid fa-arrows-rotate"></i>
                    </button>
                    <button type="button" class="surgical3d-btn-tool" id="btn3dReset" title="Restablecer Posición">
                        <i class="fa-solid fa-crosshairs"></i>
                    </button>
                </div>
            </div>

            <div class="surgical3d-hint">
                <i class="fa-solid fa-hand-pointer" style="color: #38bdf8;"></i> Arrastre para rotar 360° &bull; Clic en pines para ver lámina H&E
            </div>

            <div class="surgical3d-labels-layer" style="position:absolute; inset:0; pointer-events:none; z-index:15; overflow:hidden;"></div>

            <div class="surgical3d-legend-bar">
                <div class="surgical3d-legend-item" data-pin="M-1">
                    <span class="surgical3d-dot dot-green"></span> Ápex / Margen Tinta (R0)
                </div>
                <div class="surgical3d-legend-item" data-pin="M-2">
                    <span class="surgical3d-dot dot-red"></span> Tumor Gleason 8 (ISUP 4)
                </div>
                <div class="surgical3d-legend-item" data-pin="M-3">
                    <span class="surgical3d-dot dot-cyan"></span> Cuello Vesical (R0)
                </div>
                <div class="surgical3d-legend-item" data-pin="M-4">
                    <span class="surgical3d-dot dot-purple"></span> Fascículo Neurovascular
                </div>
            </div>
        `;
        this.labelsContainer = this.container.querySelector('.surgical3d-labels-layer');
    }

    async _loadDependencies() {
        if (window.THREE && window.THREE.OrbitControls) return;

        // Cargar Three.js r128
        if (!window.THREE) {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });
        }

        // Cargar OrbitControls
        if (!window.THREE.OrbitControls) {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });
        }
    }

    _initThree() {
        const w = this.container.clientWidth || 800;
        const h = this.container.clientHeight || 520;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 50);
        this.camera.position.set(0, 1.0, 4.4);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        if (THREE.sRGBEncoding) this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.30;
        this.renderer.domElement.classList.add('surgical3d-canvas');
        this.container.appendChild(this.renderer.domElement);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = this.options.autoRotate;
        this.controls.autoRotateSpeed = this.options.autoRotateSpeed;
        this.controls.minDistance = 2.0;
        this.controls.maxDistance = 7.0;

        // Desacoplamiento no bloqueante de OrbitControls: solo renderizar cuando haya cambio
        this.controls.addEventListener('change', () => this.requestRender());
        this.controls.addEventListener('start', () => {
            this.isInteracting = true;
            this.requestRender();
        });
        this.controls.addEventListener('end', () => {
            this.isInteracting = false;
            this._settleFrames = 25; // amortiguamiento inercial suave
            this.requestRender();
        });

        // Iluminación Quirúrgica PBR
        const amb = new THREE.AmbientLight(0xffffff, 0.9);
        this.scene.add(amb);

        const key = new THREE.DirectionalLight(0xffffff, 1.4);
        key.position.set(5, 7, 4);
        this.scene.add(key);

        const rim = new THREE.DirectionalLight(0x38bdf8, 0.6);
        rim.position.set(-5, -2, -4);
        this.scene.add(rim);

        this.specimenGroup = new THREE.Group();
        this.scene.add(this.specimenGroup);

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(-999, -999);
        this.clock = new THREE.Clock();

        this._resizeObserver = new ResizeObserver(() => this._onResize());
        this._resizeObserver.observe(this.container);

        // Suspensión condicional con IntersectionObserver (0% CPU cuando el visor está fuera de pantalla)
        if (typeof IntersectionObserver !== 'undefined') {
            this._intersectionObserver = new IntersectionObserver((entries) => {
                const entry = entries[0];
                this.isVisible = Boolean(entry && entry.isIntersecting);
                if (this.isVisible) {
                    this.requestRender();
                } else if (this.rafId) {
                    cancelAnimationFrame(this.rafId);
                    this.rafId = null;
                }
            }, { threshold: 0.05 });
            this._intersectionObserver.observe(this.container);
        }

        // Suspensión cuando la pestaña del navegador está oculta
        this._visibilityHandler = () => {
            if (document.hidden) {
                if (this.rafId) {
                    cancelAnimationFrame(this.rafId);
                    this.rafId = null;
                }
            } else if (this.isVisible) {
                this.requestRender();
            }
        };
        document.addEventListener('visibilitychange', this._visibilityHandler);

        // Control de botones
        const btnSpin = this.container.querySelector('#btn3dSpin');
        btnSpin.addEventListener('click', () => {
            this.controls.autoRotate = !this.controls.autoRotate;
            btnSpin.classList.toggle('active', this.controls.autoRotate);
            if (this.controls.autoRotate) {
                this.requestRender();
            }
        });

        const btnReset = this.container.querySelector('#btn3dReset');
        btnReset.addEventListener('click', () => {
            this.camera.position.set(0, 1.0, 4.4);
            this.controls.target.set(0, 0, 0);
            this.controls.update();
            this._settleFrames = 15;
            this.requestRender();
        });
    }

    _buildSpecimenMesh() {
        // Malla orgánica paramétrica multi-lóbulo
        const geom = new THREE.SphereGeometry(1.4, 96, 64);
        const pos = geom.attributes.position;
        const v = new THREE.Vector3();

        for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i);
            const len = v.length();
            const theta = Math.atan2(v.z, v.x);
            const phi = Math.asin(v.y / len);

            // Relieve lobular prostático
            let r = 0.18 * Math.sin(2.0 * theta) * Math.cos(phi) +
                    0.12 * Math.sin(3.0 * phi) +
                    0.08 * Math.cos(4.0 * theta) * Math.sin(2.0 * phi);

            // Aplanamiento de corte de disección
            if (v.z < -0.3 && v.y < 0.2) {
                r -= 0.22;
            }

            v.multiplyScalar(1.0 + r);
            pos.setXYZ(i, v.x, v.y, v.z);
        }
        geom.computeVertexNormals();

        // Material PBR simulando tejido fijado en formol húmedo
        const mat = new THREE.MeshPhysicalMaterial({
            roughness: 0.32,
            metalness: 0.04,
            clearcoat: 0.90,
            clearcoatRoughness: 0.10,
            reflectivity: 0.60
        });

        // Textura real del espécimen decodificada fuera del hilo principal (createImageBitmap / ImageBitmapLoader)
        if (typeof window !== 'undefined' && window.createImageBitmap && window.THREE && window.THREE.ImageBitmapLoader) {
            const ibLoader = new THREE.ImageBitmapLoader();
            ibLoader.setOptions({ imageOrientation: 'flipY', premultiplyAlpha: 'none' });
            ibLoader.load(this.options.specimenTextureUrl, (imageBitmap) => {
                const tex = new THREE.CanvasTexture(imageBitmap);
                if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
                mat.map = tex;
                mat.needsUpdate = true;
                this.requestRender();
            }, undefined, () => {
                const texLoader = new THREE.TextureLoader();
                mat.map = texLoader.load(this.options.specimenTextureUrl, () => this.requestRender());
                mat.needsUpdate = true;
            });
        } else {
            const texLoader = new THREE.TextureLoader();
            mat.map = texLoader.load(this.options.specimenTextureUrl, () => this.requestRender());
            if (THREE.sRGBEncoding && mat.map) mat.map.encoding = THREE.sRGBEncoding;
        }

        const mesh = new THREE.Mesh(geom, mat);
        this.specimenGroup.add(mesh);
    }

    _buildPins() {
        this.options.pins.forEach(pinData => {
            const pGroup = new THREE.Group();
            pGroup.position.set(pinData.pos.x, pinData.pos.y, pinData.pos.z);
            pGroup.userData = pinData;

            // Esfera luminiscente del pin
            const cGeom = new THREE.SphereGeometry(0.08, 16, 16);
            const cMat = new THREE.MeshStandardMaterial({
                color: pinData.color,
                emissive: pinData.color,
                emissiveIntensity: 2.2,
                roughness: 0.2
            });
            const core = new THREE.Mesh(cGeom, cMat);
            core.userData = pinData;
            pGroup.add(core);

            // Anillo radar de pulso
            const rGeom = new THREE.RingGeometry(0.09, 0.15, 24);
            const rMat = new THREE.MeshBasicMaterial({
                color: pinData.color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8,
                depthWrite: false
            });
            const ring = new THREE.Mesh(rGeom, rMat);
            ring.lookAt(this.camera.position);
            pGroup.add(ring);

            // Tallo de anclaje
            const sGeom = new THREE.CylinderGeometry(0.014, 0.014, 0.26, 8);
            const sMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
            const stem = new THREE.Mesh(sGeom, sMat);
            stem.position.y = -0.13;
            pGroup.add(stem);

            this.specimenGroup.add(pGroup);
            this.pinMeshes.push({ pGroup, core, ring, pinData });

            // Etiqueta Screen-space 2D
            const label = document.createElement('div');
            label.className = 'surgical3d-label';
            label.innerHTML = `<i class="fa-solid fa-microscope" style="color:#38bdf8;"></i> ${pinData.id}: ${pinData.nombre}`;
            label.addEventListener('click', () => this.openHistologyModal(pinData));
            this.labelsContainer.appendChild(label);

            this.screenLabels.push({ label, pGroup });
        });

        // Eventos en los ítems de la leyenda
        this.container.querySelectorAll('.surgical3d-legend-item').forEach(item => {
            item.addEventListener('click', () => {
                const pinId = item.dataset.pin;
                const match = this.options.pins.find(p => p.id === pinId);
                if (match) this.openHistologyModal(match);
            });
        });
    }

    _setupRaycaster() {
        const dom = this.renderer.domElement;
        let lastRaycast = 0;

        const getCoords = (e) => {
            const r = dom.getBoundingClientRect();
            this.mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
            this.mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        };

        dom.addEventListener('pointermove', (e) => {
            const now = performance.now();
            if (now - lastRaycast < 30) return; // Limitar raycasting a ~30fps para proteger INP < 42 ms
            lastRaycast = now;
            getCoords(e);
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const hits = this.raycaster.intersectObjects(this.pinMeshes.map(p => p.core));
            dom.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
        }, { passive: true });

        dom.addEventListener('click', (e) => {
            getCoords(e);
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const hits = this.raycaster.intersectObjects(this.pinMeshes.map(p => p.core));
            if (hits.length > 0) {
                this.openHistologyModal(hits[0].object.userData);
            }
        });
    }

    _setupModal() {
        let modal = document.getElementById('surgical3dHistologyModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'surgical3d-modal-overlay';
            modal.id = 'surgical3dHistologyModal';
            modal.innerHTML = `
                <div class="surgical3d-modal-card">
                    <header class="surgical3d-modal-header">
                        <div class="surgical3d-modal-title">
                            <i class="fa-solid fa-microscope" style="color: #38bdf8;"></i>
                            <span id="s3dModalTitle">Lámina Histológica WSI (H&E)</span>
                        </div>
                        <button type="button" class="surgical3d-modal-close" id="btn3dCloseModal">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </header>
                    <div class="surgical3d-modal-body">
                        <div class="surgical3d-microscope-view" id="s3dStage">
                            <img src="" id="s3dMicroImg" class="surgical3d-microscope-img" alt="Microscopía H&E">
                            
                            <div class="surgical3d-zoom-bar">
                                <button type="button" class="surgical3d-zoom-btn" data-z="1.2">2x</button>
                                <button type="button" class="surgical3d-zoom-btn" data-z="2.2">4x</button>
                                <button type="button" class="surgical3d-zoom-btn active" data-z="3.5">10x</button>
                                <button type="button" class="surgical3d-zoom-btn" data-z="5.5">20x</button>
                                <button type="button" class="surgical3d-zoom-btn" data-z="8.0">40x</button>
                            </div>

                            <div class="surgical3d-scale-box">
                                <span class="surgical3d-scale-bar-line"></span>
                                <span id="s3dScaleVal">200 &micro;m</span>
                            </div>
                        </div>

                        <div class="surgical3d-meta-panel">
                            <span class="surgical3d-chip chip-green" id="s3dChip">R0 - Margen Libre</span>

                            <div class="surgical3d-meta-group">
                                <label>Referencia Anatómica</label>
                                <span id="s3dLoc" style="font-weight:700; color:#38bdf8;">Ápex prostático</span>
                            </div>

                            <div class="surgical3d-meta-group">
                                <label>Bloque / Casete de Inclusión</label>
                                <span id="s3dCasete">Casete B-02</span>
                            </div>

                            <div class="surgical3d-meta-group">
                                <label>Distancia Quirúrgica a la Tinta China</label>
                                <span id="s3dDist" style="color:#34d399; font-weight:800;">3.2 mm</span>
                            </div>

                            <div class="surgical3d-meta-group">
                                <label>Diagnóstico Microscópico Detallado</label>
                                <p id="s3dDiag">Margen libre de neoplasia.</p>
                            </div>

                            <div style="margin-top:auto; padding-top:12px;">
                                <button type="button" class="btn btn-primary" style="width:100%; padding:10px; font-weight:700;" onclick="document.getElementById('surgical3dHistologyModal').classList.remove('active')">
                                    <i class="fa-solid fa-check"></i> Cerrar Lámina
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            modal.querySelector('#btn3dCloseModal').addEventListener('click', () => modal.classList.remove('active'));
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('active');
            });

            // Controles de zoom microscópico
            let curZoom = 3.5;
            let px = 0, py = 0;
            let isDrag = false;
            let sx = 0, sy = 0;
            const img = modal.querySelector('#s3dMicroImg');
            const stage = modal.querySelector('#s3dStage');
            const scaleVal = modal.querySelector('#s3dScaleVal');

            const refreshImg = () => {
                img.style.transform = `translate(${px}px, ${py}px) scale(${curZoom})`;
                if (scaleVal) scaleVal.innerHTML = `${Math.round(500 / curZoom)} &micro;m`;
            };

            modal.querySelectorAll('.surgical3d-zoom-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    modal.querySelectorAll('.surgical3d-zoom-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    curZoom = parseFloat(btn.dataset.z);
                    px = 0;
                    py = 0;
                    refreshImg();
                });
            });

            stage.addEventListener('wheel', (e) => {
                e.preventDefault();
                curZoom = Math.max(1.0, Math.min(8.0, curZoom + (e.deltaY > 0 ? -0.3 : 0.3)));
                refreshImg();
            }, { passive: false });

            stage.addEventListener('mousedown', (e) => {
                isDrag = true;
                sx = e.clientX - px;
                sy = e.clientY - py;
                stage.style.cursor = 'grabbing';
            });
            window.addEventListener('mousemove', (e) => {
                if (!isDrag) return;
                px = e.clientX - sx;
                py = e.clientY - sy;
                refreshImg();
            });
            window.addEventListener('mouseup', () => {
                isDrag = false;
                stage.style.cursor = 'crosshair';
            });
        }
        this.modal = modal;
    }

    openHistologyModal(pinData) {
        if (!pinData) return;
        this.modal.querySelector('#s3dModalTitle').textContent = `${pinData.id}: ${pinData.nombre}`;
        this.modal.querySelector('#s3dLoc').textContent = pinData.nombre;
        this.modal.querySelector('#s3dCasete').textContent = pinData.casete || 'No consignado';
        this.modal.querySelector('#s3dDist').textContent = pinData.distancia || 'Revisar';
        this.modal.querySelector('#s3dDiag').textContent = pinData.diagnostico || '';

        const chip = this.modal.querySelector('#s3dChip');
        chip.className = 'surgical3d-chip';
        if (pinData.tipo === 'libre') {
            chip.classList.add('chip-green');
            chip.textContent = 'R0 • Margen Libre';
        } else if (pinData.tipo === 'comprometido') {
            chip.classList.add('chip-red');
            chip.textContent = 'Compromiso Neoplásico';
        } else if (pinData.tipo === 'referencia') {
            chip.classList.add('chip-purple');
            chip.textContent = 'Referencia Anatómica';
        } else {
            chip.classList.add('chip-cyan');
            chip.textContent = 'Margen Estrecho';
        }

        const img = this.modal.querySelector('#s3dMicroImg');
        img.src = pinData.microImg || this.options.defaultMicroscopeImg;
        img.style.transform = 'translate(0px, 0px) scale(3.5)';

        this.modal.classList.add('active');
    }

    requestRender() {
        if (this.isDestroyed || !this.isVisible) return;
        if (this.rafId !== null) return;
        this.rafId = requestAnimationFrame(() => this._animate());
    }

    _animate() {
        this.rafId = null;
        if (this.isDestroyed || !this.isVisible) return;

        const t = this.clock.getElapsedTime();
        const controlsActive = Boolean(this.controls && this.controls.update());

        // Pulsos luminosos de pines
        this.pinMeshes.forEach(item => {
            const s = 1.0 + 0.35 * Math.sin(t * 4.0);
            item.ring.scale.set(s, s, s);
            item.ring.material.opacity = 0.8 - 0.35 * Math.sin(t * 4.0);
            item.ring.lookAt(this.camera.position);
        });

        // Proyección 2D Screen-space de etiquetas (medidas cacheadas fuera del bucle para evitar layout thrashing)
        const w = this._cachedWidth || this.container.clientWidth || 800;
        const h = this._cachedHeight || this.container.clientHeight || 520;
        const tempV = new THREE.Vector3();
        const camDir = this.camera.getWorldDirection(new THREE.Vector3());

        this.screenLabels.forEach(item => {
            item.pGroup.getWorldPosition(tempV);
            const dot = tempV.clone().sub(this.specimenGroup.position).normalize().dot(camDir);
            const isOccluded = dot > 0.15;

            tempV.project(this.camera);
            const x = (tempV.x * 0.5 + 0.5) * w;
            const y = (-tempV.y * 0.5 + 0.5) * h;

            item.label.style.left = `${Math.round(x)}px`;
            item.label.style.top = `${Math.round(y)}px`;
            item.label.classList.toggle('occluded', isOccluded);
        });

        this.renderer.render(this.scene, this.camera);

        // Bucle condicional: solo renderiza si hay rotación activa, interacción o inercia/amortiguamiento
        if (this.controls && this.controls.autoRotate) {
            this.rafId = requestAnimationFrame(() => this._animate());
        } else if (this.isInteracting || controlsActive) {
            this.rafId = requestAnimationFrame(() => this._animate());
        } else if (this._settleFrames > 0) {
            this._settleFrames--;
            this.rafId = requestAnimationFrame(() => this._animate());
        } else {
            // Dormir en reposo (0% CPU y cero consumo de batería en móviles)
            this.rafId = null;
        }
    }

    _onResize() {
        if (!this.container || this.isDestroyed) return;
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        if (w === 0 || h === 0) return;
        this._cachedWidth = w;
        this._cachedHeight = h;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
        this.requestRender();
    }

    async _setup360Fallback() {
        // Fallback interactivo 360° no bloqueante si Three.js o WebGL fallan
        if (typeof window !== 'undefined' && window.Macro360Viewer) {
            const viewer = new window.Macro360Viewer(this.container, {
                frameCount: this.options.framesCount || 36
            });
            await viewer.loadCleanFrames36(this.options.framesDir || 'macro360_clean', this.options.framesCount || 36);
            return;
        }

        // Fallback nativo canvas con decodificación createImageBitmap fuera del hilo principal
        const canvas = document.createElement('canvas');
        canvas.className = 'surgical3d-canvas';
        this.container.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        const count = this.options.framesCount || 36;
        const baseDir = this.options.framesDir || 'macro360_clean';

        let currentIdx = 0;
        let isSpinning = this.options.autoRotate;
        let isDragging = false;
        let startX = 0;
        let loadedFrames = [];
        let rafFallback = null;

        const renderFrame = () => {
            if (!loadedFrames[currentIdx]) return;
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);
            const img = loadedFrames[currentIdx];
            const imgW = img.naturalWidth || img.width || 800;
            const imgH = img.naturalHeight || img.height || 800;
            const s = Math.min((w * 0.95) / imgW, (h * 0.95) / imgH);
            const dw = imgW * s;
            const dh = imgH * s;
            ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
        };

        const onResize = () => {
            canvas.width = this.container.clientWidth || 600;
            canvas.height = this.container.clientHeight || 500;
            renderFrame();
        };
        onResize();

        // Precarga no bloqueante de los 36 frames con createImageBitmap
        const loadPromises = [];
        for (let i = 0; i < count; i++) {
            const pad = String(i).padStart(2, '0');
            const url = `${baseDir}/frame_${pad}.webp`;
            if (typeof window.createImageBitmap === 'function') {
                loadPromises.push(
                    fetch(url)
                        .then(r => r.blob())
                        .then(b => createImageBitmap(b))
                        .catch(() => new Promise(res => {
                            const img = new Image();
                            img.crossOrigin = 'anonymous';
                            img.onload = () => res(img);
                            img.onerror = () => res(null);
                            img.src = url;
                        }))
                );
            } else {
                loadPromises.push(new Promise(res => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => res(img);
                    img.onerror = () => res(null);
                    img.src = url;
                }));
            }
        }

        loadedFrames = await Promise.all(loadPromises);
        renderFrame();

        // Bucle condicional rAF para el fallback
        const loop = () => {
            if (isSpinning && !isDragging) {
                currentIdx = (currentIdx + 1) % count;
                renderFrame();
            }
            if (isSpinning || isDragging) {
                rafFallback = requestAnimationFrame(loop);
            } else {
                rafFallback = null;
            }
        };
        if (isSpinning) rafFallback = requestAnimationFrame(loop);

        canvas.addEventListener('pointerdown', (e) => {
            isDragging = true;
            startX = e.clientX;
            if (!rafFallback) rafFallback = requestAnimationFrame(loop);
        });
        window.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            if (Math.abs(dx) > 12) {
                currentIdx = (((currentIdx - Math.sign(dx)) % count) + count) % count;
                startX = e.clientX;
                renderFrame();
            }
        }, { passive: true });
        window.addEventListener('pointerup', () => {
            isDragging = false;
        });
    }

    destroy() {
        this.isDestroyed = true;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        if (this._resizeObserver) this._resizeObserver.disconnect();
        if (this._intersectionObserver) this._intersectionObserver.disconnect();
        if (this._visibilityHandler) {
            document.removeEventListener('visibilitychange', this._visibilityHandler);
        }
        if (this.renderer && this.renderer.domElement) this.renderer.domElement.remove();
        if (this.modal) this.modal.remove();
        this.container.innerHTML = '';
    }
}

if (typeof window !== 'undefined') {
    window.SurgicalViewer3D = SurgicalViewer3D;
}
