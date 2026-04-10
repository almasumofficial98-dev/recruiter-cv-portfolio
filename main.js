/* ============================================================
   AL MASUM GAZI — PORTFOLIO ENGINE v4.0
   Premium Interactive Experience with Three.js, Sound Design,
   Dark/Light Mode, Testimonials, Metrics, and Easter Eggs
   ============================================================ */

(function () {
    'use strict';

    // ============================================================
    // 1. LOADING SCREEN
    // ============================================================
    const loader = document.getElementById('loader');
    const loaderBar = document.getElementById('loader-bar');
    const loaderCounter = document.getElementById('loader-counter');
    const loaderText = document.getElementById('loader-text');

    // Split loader text into characters with staggered animation
    function splitLoaderText() {
        const text = loaderText.textContent;
        loaderText.innerHTML = '';
        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.animationDelay = `${i * 0.05}s`;
            loaderText.appendChild(span);
        });
    }
    splitLoaderText();

    // Simulate loading with exponential progress
    let loadProgress = 0;
    const loadInterval = setInterval(() => {
        loadProgress += Math.random() * 12 + 3;
        if (loadProgress > 100) loadProgress = 100;
        loaderBar.style.width = loadProgress + '%';
        loaderCounter.textContent = Math.floor(loadProgress);
        if (loadProgress >= 100) {
            clearInterval(loadInterval);
            setTimeout(() => {
                loader.classList.add('hidden');
                initHeroReveal();
            }, 600);
        }
    }, 100);

    // ============================================================
    // 2. CINEMATIC NOISE / GRAIN OVERLAY
    // ============================================================
    const noiseCanvas = document.getElementById('noise-canvas');
    const noiseCtx = noiseCanvas.getContext('2d');

    function resizeNoiseCanvas() {
        noiseCanvas.width = Math.floor(window.innerWidth / 2);
        noiseCanvas.height = Math.floor(window.innerHeight / 2);
    }
    resizeNoiseCanvas();
    window.addEventListener('resize', resizeNoiseCanvas);

    let noiseFrame = 0;
    function generateNoise() {
        noiseFrame++;
        // Run at ~20fps for performance
        if (noiseFrame % 3 === 0) {
            const imageData = noiseCtx.createImageData(noiseCanvas.width, noiseCanvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const v = Math.random() * 255;
                data[i] = v;
                data[i + 1] = v;
                data[i + 2] = v;
                data[i + 3] = 255;
            }
            noiseCtx.putImageData(imageData, 0, 0);
        }
        requestAnimationFrame(generateNoise);
    }
    generateNoise();

    // ============================================================
    // 3. THREE.JS INTERACTIVE PARTICLE HERO
    // ============================================================
    let threeScene, threeCamera, threeRenderer, particleSystem, linesMesh;
    let particleMouseX = 0, particleMouseY = 0;
    let particlePositions; // Store original positions for restoration

    function initThreeJS() {
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded — skipping particle hero');
            return;
        }

        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;

        threeScene = new THREE.Scene();
        threeCamera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 1000
        );
        threeCamera.position.z = 45;

        threeRenderer = new THREE.WebGLRenderer({
            canvas, alpha: true, antialias: true,
        });
        threeRenderer.setSize(window.innerWidth, window.innerHeight);
        threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // --- PREMIUM CONSTELLATION NETWORK ---
        // Layer 1: Large glowing nodes (fewer, brighter)
        const nodeCount = 120;
        const nodeGeo = new THREE.BufferGeometry();
        const nodePos = new Float32Array(nodeCount * 3);
        const nodeColors = new Float32Array(nodeCount * 3);
        particlePositions = new Float32Array(nodeCount * 3);

        for (let i = 0; i < nodeCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 15 + Math.random() * 30;
            nodePos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            nodePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            nodePos[i * 3 + 2] = r * Math.cos(phi);
            particlePositions[i * 3] = nodePos[i * 3];
            particlePositions[i * 3 + 1] = nodePos[i * 3 + 1];
            particlePositions[i * 3 + 2] = nodePos[i * 3 + 2];

            const brightness = 0.5 + Math.random() * 0.5;
            nodeColors[i * 3] = brightness;
            nodeColors[i * 3 + 1] = brightness * 0.3;
            nodeColors[i * 3 + 2] = brightness * 0.05;
        }

        nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3));
        nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

        const nodeMat = new THREE.PointsMaterial({
            size: 2.5, vertexColors: true, transparent: true, opacity: 0.85,
            blending: THREE.AdditiveBlending, sizeAttenuation: true,
        });
        particleSystem = new THREE.Points(nodeGeo, nodeMat);
        threeScene.add(particleSystem);

        // Layer 2: Fine dust particles (many, subtle)
        const dustCount = 800;
        const dustGeo = new THREE.BufferGeometry();
        const dustPos = new Float32Array(dustCount * 3);
        const dustColors = new Float32Array(dustCount * 3);
        for (let i = 0; i < dustCount; i++) {
            dustPos[i * 3] = (Math.random() - 0.5) * 100;
            dustPos[i * 3 + 1] = (Math.random() - 0.5) * 80;
            dustPos[i * 3 + 2] = (Math.random() - 0.5) * 60;
            dustColors[i * 3] = 0.6; dustColors[i * 3 + 1] = 0.15; dustColors[i * 3 + 2] = 0.0;
        }
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
        dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
        const dustMat = new THREE.PointsMaterial({
            size: 0.4, vertexColors: true, transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, sizeAttenuation: true,
        });
        const dustSystem = new THREE.Points(dustGeo, dustMat);
        threeScene.add(dustSystem);

        // Layer 3: Connection lines between nearby nodes
        const lineGeo = new THREE.BufferGeometry();
        const maxLines = nodeCount * 3;
        const linePositions = new Float32Array(maxLines * 6);
        lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        lineGeo.setDrawRange(0, 0);
        const lineMat = new THREE.LineBasicMaterial({
            color: 0xFF3D00, transparent: true, opacity: 0.08,
            blending: THREE.AdditiveBlending,
        });
        linesMesh = new THREE.LineSegments(lineGeo, lineMat);
        threeScene.add(linesMesh);

        // Mouse tracking
        document.addEventListener('mousemove', (e) => {
            particleMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            particleMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
        });

        window.addEventListener('resize', () => {
            threeCamera.aspect = window.innerWidth / window.innerHeight;
            threeCamera.updateProjectionMatrix();
            threeRenderer.setSize(window.innerWidth, window.innerHeight);
        });

        animateThreeJS();
    }

    function animateThreeJS() {
        requestAnimationFrame(animateThreeJS);
        if (!particleSystem || !threeRenderer) return;

        const time = Date.now() * 0.0003;
        const nodePositions = particleSystem.geometry.attributes.position.array;
        const nodeCount = nodePositions.length / 3;

        // Gentle orbit + mouse reaction
        particleSystem.rotation.y = time * 0.15 + particleMouseX * 0.2;
        particleSystem.rotation.x = Math.sin(time * 0.3) * 0.1 + particleMouseY * 0.1;

        // Breathe effect: nodes gently drift from original position
        for (let i = 0; i < nodeCount; i++) {
            const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
            nodePositions[ix] = particlePositions[ix] + Math.sin(time + i * 0.5) * 0.8;
            nodePositions[iy] = particlePositions[iy] + Math.cos(time * 0.7 + i * 0.3) * 0.6;
            nodePositions[iz] = particlePositions[iz] + Math.sin(time * 0.5 + i * 0.8) * 0.4;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;

        // Update connection lines (connect nodes within threshold distance)
        if (linesMesh) {
            const linePos = linesMesh.geometry.attributes.position.array;
            let lineIdx = 0;
            const threshold = 18;

            for (let i = 0; i < nodeCount && lineIdx < linePos.length - 6; i++) {
                for (let j = i + 1; j < nodeCount && lineIdx < linePos.length - 6; j++) {
                    const dx = nodePositions[i * 3] - nodePositions[j * 3];
                    const dy = nodePositions[i * 3 + 1] - nodePositions[j * 3 + 1];
                    const dz = nodePositions[i * 3 + 2] - nodePositions[j * 3 + 2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < threshold) {
                        linePos[lineIdx++] = nodePositions[i * 3];
                        linePos[lineIdx++] = nodePositions[i * 3 + 1];
                        linePos[lineIdx++] = nodePositions[i * 3 + 2];
                        linePos[lineIdx++] = nodePositions[j * 3];
                        linePos[lineIdx++] = nodePositions[j * 3 + 1];
                        linePos[lineIdx++] = nodePositions[j * 3 + 2];
                    }
                }
            }
            linesMesh.geometry.attributes.position.needsUpdate = true;
            linesMesh.geometry.setDrawRange(0, lineIdx / 3);
        }

        // Fade on scroll
        const scrollFade = Math.max(0.02, 1 - scrollCurrent / (window.innerWidth * 3));
        particleSystem.material.opacity = scrollFade * 0.85;
        if (linesMesh) linesMesh.material.opacity = scrollFade * 0.08;

        threeRenderer.render(threeScene, threeCamera);
    }

    setTimeout(initThreeJS, 100);

    // ============================================================
    // 4. CUSTOM CURSOR WITH SMOOTH TRAIL
    // ============================================================
    const cursor = document.getElementById('cursor');
    const trails = [
        document.getElementById('trail-1'),
        document.getElementById('trail-2'),
        document.getElementById('trail-3'),
    ];

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    const trailPositions = trails.map(() => ({ x: mouseX, y: mouseY }));

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
    document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

    function updateCursor() {
        // Main cursor with fast interpolation
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        // Trailing elements with cascading delay
        trailPositions.forEach((pos, i) => {
            const target = i === 0
                ? { x: cursorX, y: cursorY }
                : trailPositions[i - 1];
            const speed = 0.08 - i * 0.015;
            pos.x += (target.x - pos.x) * speed;
            pos.y += (target.y - pos.y) * speed;
            trails[i].style.left = pos.x + 'px';
            trails[i].style.top = pos.y + 'px';
            trails[i].style.opacity = 0.3 - i * 0.08;
            trails[i].style.width = (6 - i * 1.5) + 'px';
            trails[i].style.height = (6 - i * 1.5) + 'px';
        });

        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Enlarge cursor on interactive elements
    function setupCursorHover() {
        const targets = document.querySelectorAll(
            'a, button, .exp-card, .edu-card, .cert-tag, .skill-row, ' +
            '.exp-skill-tag, [data-magnetic], .t-dot, .float-btn, ' +
            '.whatsapp-widget, .blog-card, .case-metric-card, .orbit-item'
        );
        targets.forEach((el) => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
    }

    // ============================================================
    // 5. SMOOTH HORIZONTAL SCROLL ENGINE
    // ============================================================
    const scrollContainer = document.getElementById('scroll-container');
    const panels = document.querySelectorAll('.panel');
    const progressFill = document.getElementById('progress-fill');
    const panelCounterCurrent = document.querySelector('.panel-counter .current');
    const totalPanelsEl = document.getElementById('total-panels');

    if (totalPanelsEl) {
        totalPanelsEl.textContent = String(panels.length).padStart(2, '0');
    }

    let scrollTarget = 0;
    let scrollCurrent = 0;
    let scrollVelocity = 0;
    const scrollEase = 0.06;
    let maxScroll = 0;

    function calculateMaxScroll() {
        maxScroll = scrollContainer.scrollWidth - window.innerWidth;
    }
    calculateMaxScroll();
    window.addEventListener('resize', () => {
        calculateMaxScroll();
        scrollTarget = Math.min(scrollTarget, maxScroll);
    });

    // Mouse wheel → horizontal scroll
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        scrollTarget += e.deltaY * 1.5;
        scrollTarget = Math.max(0, Math.min(scrollTarget, maxScroll));
    }, { passive: false });

    // Touch support for mobile
    let touchStartX = 0;
    let touchStartY = 0;

    window.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        const dx = touchStartX - e.touches[0].clientX;
        const dy = touchStartY - e.touches[0].clientY;
        if (Math.abs(dx) > Math.abs(dy)) {
            scrollTarget += dx * 2;
            scrollTarget = Math.max(0, Math.min(scrollTarget, maxScroll));
        }
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            scrollTarget = Math.min(scrollTarget + window.innerWidth, maxScroll);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            scrollTarget = Math.max(scrollTarget - window.innerWidth, 0);
        }
    });

    // ============================================================
    // 6. HERO TEXT CHARACTER REVEAL
    // ============================================================
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');

    function splitTextIntoChars(element) {
        const lines = element.querySelectorAll('.line');
        lines.forEach((line) => {
            const text = line.textContent;
            line.innerHTML = '';
            text.split('').forEach((char, i) => {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.transitionDelay = `${0.3 + i * 0.04}s`;
                line.appendChild(span);
            });
        });
    }
    splitTextIntoChars(heroTitle);

    function initHeroReveal() {
        heroTitle.querySelectorAll('.char').forEach((c) => c.classList.add('revealed'));
        setTimeout(() => heroSubtitle.classList.add('revealed'), 800);
    }

    // ============================================================
    // 7. SCROLL-BASED REVEAL SYSTEM
    // ============================================================
    const revealElements = document.querySelectorAll(
        '.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .exp-side-stat'
    );

    function checkReveals() {
        const threshold = window.innerWidth * 0.15;
        revealElements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.left < window.innerWidth - threshold && rect.right > threshold) {
                el.classList.add('revealed');
            }
        });
    }

    // ============================================================
    // 8. ANIMATED COUNTERS
    // ============================================================
    const counters = document.querySelectorAll('.counter');
    const counteredSet = new Set();

    function animateCounters() {
        counters.forEach((counter) => {
            if (counteredSet.has(counter)) return;
            const rect = counter.getBoundingClientRect();
            if (rect.left < window.innerWidth && rect.right > 0) {
                counteredSet.add(counter);
                const target = parseInt(counter.dataset.target);
                const duration = 2000;
                const start = performance.now();
                function tick(now) {
                    const elapsed = now - start;
                    const t = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - t, 4); // ease-out quart
                    counter.textContent = Math.floor(eased * target);
                    if (t < 1) requestAnimationFrame(tick);
                    else counter.textContent = target;
                }
                requestAnimationFrame(tick);
            }
        });
    }

    // ============================================================
    // 9. SKILL BAR ANIMATION
    // ============================================================
    const skillBars = document.querySelectorAll('.skill-bar');
    const skillBarSet = new Set();

    function animateSkillBars() {
        skillBars.forEach((bar) => {
            if (skillBarSet.has(bar)) return;
            const rect = bar.getBoundingClientRect();
            if (rect.left < window.innerWidth && rect.right > 0) {
                skillBarSet.add(bar);
                setTimeout(() => {
                    bar.style.width = bar.dataset.width + '%';
                }, 200);
            }
        });
    }

    // ============================================================
    // 10. FUNNEL & METRIC BAR ANIMATIONS
    // ============================================================
    const funnelSteps = document.querySelectorAll('.funnel-step');
    const metricBars = document.querySelectorAll('.m-bar-fill');
    const funnelSet = new Set();
    const metricBarSet = new Set();

    function animateFunnelAndMetrics() {
        funnelSteps.forEach((step) => {
            if (funnelSet.has(step)) return;
            const rect = step.getBoundingClientRect();
            if (rect.left < window.innerWidth && rect.right > 0) {
                funnelSet.add(step);
                setTimeout(() => {
                    step.style.width = step.dataset.width + '%';
                }, 300);
            }
        });
        metricBars.forEach((bar) => {
            if (metricBarSet.has(bar)) return;
            const rect = bar.getBoundingClientRect();
            if (rect.left < window.innerWidth && rect.right > 0) {
                metricBarSet.add(bar);
                setTimeout(() => {
                    bar.style.width = bar.dataset.width + '%';
                }, 300);
            }
        });
    }

    // ============================================================
    // 11. 3D CARD TILT ON HOVER
    // ============================================================
    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            card.style.transform =
                `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform =
                'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        });
    });

    // ============================================================
    // 12. MAGNETIC BUTTON EFFECT
    // ============================================================
    const magneticBtns = document.querySelectorAll('[data-magnetic]');

    magneticBtns.forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
            btn.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        });

        btn.addEventListener('mouseenter', () => {
            btn.style.transition = 'none';
        });
    });

    // ============================================================
    // 13. FULLSCREEN MENU OVERLAY
    // ============================================================
    const menuToggle = document.getElementById('menu-toggle');
    const fullscreenMenu = document.getElementById('fullscreen-menu');
    const menuLinks = document.querySelectorAll('.menu-link');
    let menuOpen = false;

    menuToggle.addEventListener('click', () => {
        menuOpen = !menuOpen;
        menuToggle.classList.toggle('active', menuOpen);
        fullscreenMenu.classList.toggle('active', menuOpen);
        if (!menuOpen) {
            menuLinks.forEach((link) => {
                link.style.opacity = '0';
                link.style.transform = 'translateY(60px)';
            });
        }
    });

    menuLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionIndex = parseInt(link.dataset.section);
            scrollTarget = sectionIndex * window.innerWidth;
            scrollTarget = Math.max(0, Math.min(scrollTarget, maxScroll));
            menuOpen = false;
            menuToggle.classList.remove('active');
            fullscreenMenu.classList.remove('active');
        });
    });

    // ============================================================
    // 14. WORD-BY-WORD REVEAL FOR HEADLINES
    // ============================================================
    function setupWordReveal() {
        const headlines = document.querySelectorAll(
            '.stats-headline, .contact-headline'
        );
        headlines.forEach((el) => {
            const text = el.innerHTML;
            const words = text.split(/(\s+|<br\s*\/?>)/);
            el.innerHTML = '';
            words.forEach((word, i) => {
                if (word.match(/<br\s*\/?>/)) {
                    el.innerHTML += '<br>';
                    return;
                }
                if (word.trim() === '') {
                    el.innerHTML += ' ';
                    return;
                }
                const wrapper = document.createElement('span');
                wrapper.className = 'word';
                const inner = document.createElement('span');
                inner.className = 'word-inner';
                inner.textContent = word;
                inner.style.transitionDelay = `${i * 0.06}s`;
                wrapper.appendChild(inner);
                el.appendChild(wrapper);
                el.appendChild(document.createTextNode(' '));
            });
        });
    }
    setupWordReveal();

    function checkWordReveals() {
        document.querySelectorAll('.word-inner').forEach((inner) => {
            const rect = inner.getBoundingClientRect();
            if (rect.left < window.innerWidth * 0.85 && rect.right > 0) {
                inner.classList.add('revealed');
            }
        });
    }

    // ============================================================
    // 15. MOUSE PARALLAX EFFECTS
    // ============================================================
    let parallaxTargetX = 0, parallaxTargetY = 0;
    let parallaxCurrentX = 0, parallaxCurrentY = 0;

    document.addEventListener('mousemove', (e) => {
        parallaxTargetX = (e.clientX / window.innerWidth - 0.5) * 2;
        parallaxTargetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function updateParallax() {
        parallaxCurrentX += (parallaxTargetX - parallaxCurrentX) * 0.05;
        parallaxCurrentY += (parallaxTargetY - parallaxCurrentY) * 0.05;

        document.querySelectorAll('.dot-grid').forEach((grid) => {
            grid.style.transform =
                `translate(${parallaxCurrentX * -10}px, ${parallaxCurrentY * -10}px)`;
        });

        requestAnimationFrame(updateParallax);
    }
    updateParallax();

    // ============================================================
    // 16. PANEL VISIBILITY & SCALE EFFECTS
    // ============================================================
    function updatePanelEffects() {
        panels.forEach((panel) => {
            const rect = panel.getBoundingClientRect();
            const visibility = Math.max(
                0,
                Math.min(1, 1 - Math.abs(rect.left) / window.innerWidth)
            );
            const inner = panel.querySelector('.panel-inner');
            if (inner) {
                inner.style.transform = `scale(${0.95 + visibility * 0.05})`;
                inner.style.opacity = 0.3 + visibility * 0.7;
            }
        });
    }

    // ============================================================
    // 17. TESTIMONIAL CAROUSEL
    // ============================================================
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const testimonialDots = document.querySelectorAll('.t-dot');
    let currentTestimonial = 0;
    let testimonialTimer = null;

    function showTestimonial(index) {
        testimonialCards.forEach((c) => c.classList.remove('active'));
        testimonialDots.forEach((d) => d.classList.remove('active'));
        if (testimonialCards[index]) testimonialCards[index].classList.add('active');
        if (testimonialDots[index]) testimonialDots[index].classList.add('active');
        currentTestimonial = index;
    }

    testimonialDots.forEach((dot) => {
        dot.addEventListener('click', () => {
            showTestimonial(parseInt(dot.dataset.index));
            clearInterval(testimonialTimer);
            startTestimonialAuto();
            if (soundEnabled) playSound(500, 0.03, 0.1);
        });
    });

    function startTestimonialAuto() {
        testimonialTimer = setInterval(() => {
            const next = (currentTestimonial + 1) % testimonialCards.length;
            showTestimonial(next);
        }, 5000);
    }
    startTestimonialAuto();

    // ============================================================
    // 18. DARK / LIGHT THEME TOGGLE
    // ============================================================
    const themeToggle = document.getElementById('theme-toggle');
    let isDark = true;

    if (themeToggle) {
        const iconSun = themeToggle.querySelector('.icon-sun');
        const iconMoon = themeToggle.querySelector('.icon-moon');

        themeToggle.addEventListener('click', () => {
            isDark = !isDark;
            document.body.classList.add('transitioning');
            document.body.classList.toggle('light', !isDark);

            if (iconSun) iconSun.style.display = isDark ? 'block' : 'none';
            if (iconMoon) iconMoon.style.display = isDark ? 'none' : 'block';

            // Adjust Three.js particle colors for the theme
            if (particleSystem) {
                const colors = particleSystem.geometry.attributes.color.array;
                for (let i = 0; i < colors.length; i += 3) {
                    if (!isDark) {
                        colors[i] *= 0.4;
                        colors[i + 1] *= 0.4;
                    } else {
                        const intensity = 0.3 + Math.random() * 0.7;
                        colors[i] = intensity;
                        colors[i + 1] = intensity * 0.24;
                    }
                }
                particleSystem.geometry.attributes.color.needsUpdate = true;
            }

            if (soundEnabled) playSound(isDark ? 300 : 600, 0.04, 0.15);
            setTimeout(() => document.body.classList.remove('transitioning'), 800);
        });
    }

    // ============================================================
    // 19. SOUND DESIGN (Web Audio API)
    // ============================================================
    let soundEnabled = false;
    let audioCtx = null;
    const soundToggle = document.getElementById('sound-toggle');

    if (soundToggle) {
        const iconSoundOn = soundToggle.querySelector('.icon-sound-on');
        const iconSoundOff = soundToggle.querySelector('.icon-sound-off');

        soundToggle.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            if (iconSoundOn) iconSoundOn.style.display = soundEnabled ? 'block' : 'none';
            if (iconSoundOff) iconSoundOff.style.display = soundEnabled ? 'none' : 'block';

            // Initialize AudioContext on first enable (Chrome policy)
            if (soundEnabled && !audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            // Resume suspended context (Chrome autoplay policy)
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            if (soundEnabled) {
                // Short delay to let context resume
                setTimeout(() => playSound(600, 0.1, 0.2), 50);
            }
        });
    }

    function playSound(freq, vol, duration) {
        if (!soundEnabled || !audioCtx) return;
        // Always try to resume if suspended
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(vol, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(
                0.001,
                audioCtx.currentTime + duration
            );
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.log('Audio error:', e.message);
        }
    }

    // Hover sounds on interactive elements
    document.querySelectorAll(
        'a, button, .exp-card, .edu-card, .blog-card, .case-metric-card'
    ).forEach((el) => {
        el.addEventListener('mouseenter', () => {
            playSound(800 + Math.random() * 400, 0.02, 0.06);
        });
    });

    // Sound on panel change
    let lastSoundPanel = -1;
    function checkScrollSound() {
        const currentPanel = Math.round(scrollCurrent / window.innerWidth);
        if (currentPanel !== lastSoundPanel) {
            lastSoundPanel = currentPanel;
            playSound(300 + currentPanel * 40, 0.03, 0.2);
        }
    }

    // ============================================================
    // 20. PDF DOWNLOAD (Print to PDF)
    // ============================================================
    const pdfBtn = document.getElementById('pdf-download');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (soundEnabled) playSound(500, 0.04, 0.12);
            window.print();
        });
    }

    // ============================================================
    // 21. CALENDLY / BOOKING MODAL
    // ============================================================
    const calendlyBtn = document.getElementById('calendly-btn');
    const calendlyModal = document.getElementById('calendly-modal');
    const modalClose = document.getElementById('modal-close');

    if (calendlyBtn && calendlyModal) {
        calendlyBtn.addEventListener('click', () => {
            calendlyModal.classList.add('active');
            if (soundEnabled) playSound(450, 0.04, 0.1);
        });
    }

    if (modalClose && calendlyModal) {
        modalClose.addEventListener('click', () => {
            calendlyModal.classList.remove('active');
        });
        calendlyModal.addEventListener('click', (e) => {
            if (e.target === calendlyModal) {
                calendlyModal.classList.remove('active');
            }
        });
    }

    // ============================================================
    // 22. KONAMI CODE EASTER EGG (↑↑↓↓←→←→BA)
    // ============================================================
    const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    let konamiIndex = 0;
    const easterEgg = document.getElementById('easter-egg');
    const eeCloseBtn = document.getElementById('ee-close');

    document.addEventListener('keydown', (e) => {
        if (e.keyCode === konamiSequence[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiSequence.length) {
                // Easter egg activated!
                if (easterEgg) easterEgg.classList.add('active');
                if (soundEnabled) {
                    playSound(523, 0.08, 0.15);
                    setTimeout(() => playSound(659, 0.08, 0.15), 150);
                    setTimeout(() => playSound(784, 0.08, 0.3), 300);
                }
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    if (eeCloseBtn && easterEgg) {
        eeCloseBtn.addEventListener('click', () => {
            easterEgg.classList.remove('active');
        });
    }

    // ============================================================
    // 23. TEXT SCRAMBLE EFFECT ON HOVER
    // ============================================================
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.update = this.update.bind(this);
        }

        setText(newText) {
            const oldText = this.el.textContent;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => (this.resolve = resolve));
            this.queue = [];

            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }

            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }

        update() {
            let output = '';
            let complete = 0;

            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.chars[
                            Math.floor(Math.random() * this.chars.length)
                        ];
                        this.queue[i].char = char;
                    }
                    output += `<span style="color:var(--accent);opacity:0.6;">${char}</span>`;
                } else {
                    output += from;
                }
            }

            this.el.innerHTML = output;
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }
    }

    function setupTextScramble() {
        document.querySelectorAll('.exp-role').forEach((role) => {
            const originalText = role.textContent;
            const scrambler = new TextScramble(role);
            const card = role.closest('.exp-card');
            if (card) {
                card.addEventListener('mouseenter', () => {
                    scrambler.setText(originalText);
                });
            }
        });
    }

    // ============================================================
    // 24. RIPPLE CLICK EFFECT ON CARDS
    // ============================================================
    function setupRippleEffect() {
        const cards = document.querySelectorAll(
            '.exp-card, .edu-card, .blog-card'
        );

        cards.forEach((card) => {
            card.addEventListener('click', (e) => {
                const ripple = document.createElement('div');
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const size = Math.max(rect.width, rect.height) * 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x - size / 2}px;
                    top: ${y - size / 2}px;
                    background: radial-gradient(circle, var(--accent-subtle), transparent 70%);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: rippleExpand 0.8s ease-out forwards;
                    pointer-events: none;
                    z-index: 1;
                `;

                card.style.position = 'relative';
                card.style.overflow = 'hidden';
                card.appendChild(ripple);

                if (soundEnabled) playSound(200 + Math.random() * 300, 0.03, 0.12);
                setTimeout(() => ripple.remove(), 800);
            });
        });

        // Inject ripple keyframe
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rippleExpand {
                0% { transform: scale(0); opacity: 1; }
                100% { transform: scale(1); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================================
    // 25. DYNAMIC GRADIENT ORBS (AMBIENT BACKGROUND)
    // ============================================================
    function createGradientOrbs() {
        const container = document.createElement('div');
        container.style.cssText =
            'position:fixed;top:0;left:0;width:100%;height:100%;' +
            'pointer-events:none;z-index:-1;overflow:hidden;';
        document.body.prepend(container);

        const orbConfigs = [
            { color: 'rgba(255, 61, 0, 0.06)', size: 400 },
            { color: 'rgba(255, 100, 50, 0.04)', size: 600 },
            { color: 'rgba(200, 30, 0, 0.05)', size: 800 },
        ];

        orbConfigs.forEach((config, i) => {
            const orb = document.createElement('div');
            orb.style.cssText = `
                position: absolute;
                width: ${config.size}px;
                height: ${config.size}px;
                border-radius: 50%;
                background: radial-gradient(circle, ${config.color}, transparent 70%);
                filter: blur(60px);
                animation: orbFloat${i} ${15 + i * 5}s ease-in-out infinite alternate;
            `;

            const keyframes = `
                @keyframes orbFloat${i} {
                    0% { transform: translate(${20 + i * 30}vw, ${10 + i * 20}vh); }
                    33% { transform: translate(${50 - i * 15}vw, ${60 + i * 10}vh); }
                    66% { transform: translate(${70 + i * 10}vw, ${20 - i * 5}vh); }
                    100% { transform: translate(${30 + i * 20}vw, ${50 + i * 15}vh); }
                }
            `;
            const styleEl = document.createElement('style');
            styleEl.textContent = keyframes;
            document.head.appendChild(styleEl);
            container.appendChild(orb);
        });
    }
    createGradientOrbs();

    // ============================================================
    // 26. FLOATING PARTICLES
    // ============================================================
    function createFloatingParticles() {
        const container = document.createElement('div');
        container.style.cssText =
            'position:fixed;top:0;left:0;width:100%;height:100%;' +
            'pointer-events:none;z-index:-1;overflow:hidden;';
        document.body.prepend(container);

        for (let i = 0; i < 25; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 3 + 1;
            const duration = 20 + Math.random() * 30;
            const delay = Math.random() * -30;
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;

            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(255, 61, 0, ${0.1 + Math.random() * 0.2});
                border-radius: 50%;
                left: ${startX}%;
                top: ${startY}%;
                animation: pDrift${i} ${duration}s ${delay}s linear infinite;
            `;

            const driftX = (Math.random() - 0.5) * 400;
            const driftY = (Math.random() - 0.5) * 400;
            const peakOpacity = 0.2 + Math.random() * 0.3;
            const keyframes = `
                @keyframes pDrift${i} {
                    0% { transform: translate(0, 0) scale(1); opacity: 0; }
                    10% { opacity: ${peakOpacity}; }
                    50% { transform: translate(${driftX / 2}px, ${driftY / 2}px) scale(${0.5 + Math.random()}); }
                    90% { opacity: 0.1; }
                    100% { transform: translate(${driftX}px, ${driftY}px) scale(0.5); opacity: 0; }
                }
            `;
            const styleEl = document.createElement('style');
            styleEl.textContent = keyframes;
            document.head.appendChild(styleEl);
            container.appendChild(particle);
        }
    }
    createFloatingParticles();

    // ============================================================
    // 27. LOGO GLITCH EFFECT
    // ============================================================
    const siteLogo = document.querySelector('.site-logo');

    function scheduleGlitch() {
        const delay = 8000 + Math.random() * 7000;
        setTimeout(() => {
            if (siteLogo) {
                siteLogo.style.animation = 'glitch 0.3s ease';
                setTimeout(() => {
                    siteLogo.style.animation = '';
                }, 300);
            }
            scheduleGlitch();
        }, delay);
    }
    scheduleGlitch();

    // ============================================================
    // 28. SCROLL SNAP (Gentle snap to nearest panel)
    // ============================================================
    let snapTimeout = null;

    function scheduleSnap() {
        clearTimeout(snapTimeout);
        snapTimeout = setTimeout(() => {
            const nearestPanel = Math.round(scrollTarget / window.innerWidth);
            const snapTarget = nearestPanel * window.innerWidth;
            if (Math.abs(scrollTarget - snapTarget) < window.innerWidth * 0.25) {
                scrollTarget = Math.max(0, Math.min(snapTarget, maxScroll));
            }
        }, 150);
    }

    window.addEventListener('wheel', scheduleSnap);
    window.addEventListener('touchend', scheduleSnap);

    // ============================================================
    // 29. ACCENT HUE SHIFT ON SCROLL
    // ============================================================
    function updateAccentShift() {
        const progress = maxScroll > 0 ? scrollCurrent / maxScroll : 0;
        const hue = Math.floor(progress * 15);
        document.documentElement.style.setProperty(
            '--accent-glow',
            `hsla(${14 + hue}, 100%, 50%, 0.15)`
        );
    }

    // ============================================================
    // 30. VELOCITY-BASED TEXT SKEW
    // ============================================================
    function updateTextSkew() {
        const skew = scrollVelocity * 0.008;
        const clamped = Math.max(-3, Math.min(3, skew));
        panels.forEach((panel) => {
            const inner = panel.querySelector('.panel-inner');
            if (inner) {
                inner.style.transition = 'none';
                inner.style.transform = `skewX(${clamped}deg)`;
            }
        });
    }

    // ============================================================
    // 31. MAIN ANIMATION LOOP
    // ============================================================
    function mainLoop() {
        const diff = scrollTarget - scrollCurrent;
        scrollVelocity = diff * scrollEase;
        scrollCurrent += scrollVelocity;

        if (Math.abs(diff) < 0.5) {
            scrollCurrent = scrollTarget;
        }

        // Apply scroll transform
        scrollContainer.style.transform = `translateX(${-scrollCurrent}px)`;

        // Progress bar
        const progress = maxScroll > 0 ? (scrollCurrent / maxScroll) * 100 : 0;
        progressFill.style.width = Math.min(progress, 100) + '%';

        // Panel counter
        const currentPanelIndex = Math.round(scrollCurrent / window.innerWidth);
        panelCounterCurrent.textContent = String(
            Math.min(currentPanelIndex + 1, panels.length)
        ).padStart(2, '0');

        // Run all animation subsystems
        checkReveals();
        animateCounters();
        animateSkillBars();
        animateFunnelAndMetrics();
        checkWordReveals();
        updatePanelEffects();
        updateAccentShift();
        updateTextSkew();
        checkScrollSound();

        // Fade bg.png and smoke as user scrolls
        const heroBg = document.getElementById('hero-bg');
        const heroSmoke = document.querySelector('.hero-smoke');
        if (heroBg) {
            const fadeStart = window.innerWidth * 0.3;
            const fadeEnd = window.innerWidth * 3;
            const bgOpacity = Math.max(0, 1 - (scrollCurrent - fadeStart) / (fadeEnd - fadeStart));
            heroBg.style.opacity = Math.max(0, bgOpacity);
        }
        if (heroSmoke) {
            const smokeOpacity = Math.max(0, 1 - scrollCurrent / (window.innerWidth * 4));
            heroSmoke.style.opacity = smokeOpacity;
        }

        requestAnimationFrame(mainLoop);
    }

    // ============================================================
    // 32. INITIALIZATION
    // ============================================================
    function init() {
        setupCursorHover();
        setupTextScramble();
        setupRippleEffect();

        // Start the main animation loop
        mainLoop();

        // Console branding
        console.log(
            '%c AL MASUM GAZI — Portfolio Engine v4.0 ',
            'background: #FF3D00; color: #fff; padding: 6px 12px; ' +
            'font-family: monospace; font-size: 12px;'
        );
        console.log(
            '%c Try the Konami Code: ↑↑↓↓←→←→BA ',
            'color: #ff5722; font-family: monospace;'
        );
    }

    // Wait for fonts before initializing
    if (document.fonts) {
        document.fonts.ready.then(init);
    } else {
        window.addEventListener('load', init);
    }

})();
