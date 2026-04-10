/* ============================================================
   AL MASUM GAZI — PREMIUM PORTFOLIO ENGINE
   Advanced Interactions / ~1000 Lines
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

    // Split loader text into individual characters
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

    // Simulate loading progress
    let loadProgress = 0;
    const loadInterval = setInterval(() => {
        loadProgress += Math.random() * 15;
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
    // 2. NOISE / GRAIN CANVAS
    // ============================================================
    const noiseCanvas = document.getElementById('noise-canvas');
    const noiseCtx = noiseCanvas.getContext('2d');

    function resizeNoiseCanvas() {
        noiseCanvas.width = window.innerWidth;
        noiseCanvas.height = window.innerHeight;
    }
    resizeNoiseCanvas();
    window.addEventListener('resize', resizeNoiseCanvas);

    function generateNoise() {
        const imageData = noiseCtx.createImageData(noiseCanvas.width, noiseCanvas.height);
        const data = imageData.data;
        const len = data.length;
        for (let i = 0; i < len; i += 4) {
            const value = Math.random() * 255;
            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
            data[i + 3] = 255;
        }
        noiseCtx.putImageData(imageData, 0, 0);
    }

    // Run noise at lower fps for performance
    let noiseFrame = 0;
    function animateNoise() {
        noiseFrame++;
        if (noiseFrame % 3 === 0) {
            generateNoise();
        }
        requestAnimationFrame(animateNoise);
    }
    animateNoise();

    // ============================================================
    // 3. CUSTOM CURSOR WITH TRAIL
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

    const trailPositions = trails.map(() => ({
        x: mouseX,
        y: mouseY,
    }));

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('mousedown', () => {
        cursor.classList.add('clicking');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('clicking');
    });

    // Smooth cursor follow with lerp
    function updateCursor() {
        // Main cursor with fast lerp
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        // Trail follows with increasing delay
        trailPositions.forEach((pos, i) => {
            const target = i === 0 ? { x: cursorX, y: cursorY } : trailPositions[i - 1];
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

    // Hover state for interactive elements
    function setupCursorHover() {
        const interactables = document.querySelectorAll(
            'a, button, .exp-card, .edu-card, .cert-tag, .skill-row, .exp-skill-tag, [data-magnetic]'
        );
        interactables.forEach((el) => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
    }

    // ============================================================
    // 4. SMOOTH HORIZONTAL SCROLL ENGINE
    // ============================================================
    const scrollContainer = document.getElementById('scroll-container');
    const panels = document.querySelectorAll('.panel');
    const progressFill = document.getElementById('progress-fill');
    const panelCounterCurrent = document.querySelector('.panel-counter .current');
    const totalPanelsEl = document.getElementById('total-panels');

    totalPanelsEl.textContent = String(panels.length).padStart(2, '0');

    let scrollTarget = 0;
    let scrollCurrent = 0;
    let scrollEase = 0.06; // Lower = smoother but slower
    let scrollVelocity = 0;
    let isScrolling = false;
    let maxScroll = 0;

    function calculateMaxScroll() {
        maxScroll = scrollContainer.scrollWidth - window.innerWidth;
    }
    calculateMaxScroll();
    window.addEventListener('resize', calculateMaxScroll);

    // Wheel event for horizontal scroll
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        scrollTarget += e.deltaY * 1.5;
        scrollTarget = Math.max(0, Math.min(scrollTarget, maxScroll));
    }, { passive: false });

    // Touch support
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouchDragging = false;

    window.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isTouchDragging = true;
    });

    window.addEventListener('touchmove', (e) => {
        if (!isTouchDragging) return;
        e.preventDefault();
        const deltaX = touchStartX - e.touches[0].clientX;
        const deltaY = touchStartY - e.touches[0].clientY;

        // Only horizontal scroll if horizontal delta is larger
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            scrollTarget += deltaX * 2;
            scrollTarget = Math.max(0, Math.min(scrollTarget, maxScroll));
        }
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: false });

    window.addEventListener('touchend', () => {
        isTouchDragging = false;
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            scrollTarget += window.innerWidth;
            scrollTarget = Math.min(scrollTarget, maxScroll);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            scrollTarget -= window.innerWidth;
            scrollTarget = Math.max(scrollTarget, 0);
        }
    });

    // Main scroll animation loop
    function smoothScroll() {
        const diff = scrollTarget - scrollCurrent;
        scrollVelocity = diff * scrollEase;
        scrollCurrent += scrollVelocity;

        // Apply transform (this is much smoother than scrollLeft)
        scrollContainer.style.transform = `translateX(${-scrollCurrent}px)`;

        // Update progress bar
        const progress = (scrollCurrent / maxScroll) * 100;
        progressFill.style.width = Math.min(progress, 100) + '%';

        // Update panel counter
        const currentPanelIndex = Math.round(scrollCurrent / window.innerWidth);
        panelCounterCurrent.textContent = String(
            Math.min(currentPanelIndex + 1, panels.length)
        ).padStart(2, '0');

        // Parallax for hero background
        const heroBg = document.getElementById('hero-bg');
        if (heroBg) {
            heroBg.style.transform = `translate(-50%, -50%) translateX(${scrollCurrent * 0.05}px)`;
        }

        // Trigger reveals
        checkReveals();

        requestAnimationFrame(smoothScroll);
    }

    // ============================================================
    // 5. HERO TEXT REVEAL (Char-by-Char)
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
        // Reveal hero chars
        const chars = heroTitle.querySelectorAll('.char');
        chars.forEach((char) => char.classList.add('revealed'));

        // Reveal subtitle
        setTimeout(() => {
            heroSubtitle.classList.add('revealed');
        }, 800);
    }

    // ============================================================
    // 6. INTERSECTION REVEAL SYSTEM
    // ============================================================
    const revealElements = document.querySelectorAll(
        '.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .exp-side-stat'
    );

    function checkReveals() {
        revealElements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const threshold = window.innerWidth * 0.15;
            if (
                rect.left < window.innerWidth - threshold &&
                rect.right > threshold
            ) {
                el.classList.add('revealed');
            }
        });
    }

    // ============================================================
    // 7. COUNTER ANIMATION
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
                const startTime = performance.now();

                function updateCounter(timestamp) {
                    const elapsed = timestamp - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out quart
                    const easedProgress = 1 - Math.pow(1 - progress, 4);
                    counter.textContent = Math.floor(easedProgress * target);
                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                }
                requestAnimationFrame(updateCounter);
            }
        });
    }

    // Hook counter animation into scroll loop
    const originalCheckReveals = checkReveals;
    // Override to also check counters
    const checkRevealsEnhanced = () => {
        revealElements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const threshold = window.innerWidth * 0.15;
            if (
                rect.left < window.innerWidth - threshold &&
                rect.right > threshold
            ) {
                el.classList.add('revealed');
            }
        });
        animateCounters();
        animateSkillBars();
    };
    // Replace
    window._checkReveals = checkRevealsEnhanced;
    // Patch the smoothScroll to use enhanced version
    // We'll call it inside the loop directly

    // ============================================================
    // 8. SKILL BAR ANIMATION
    // ============================================================
    const skillBars = document.querySelectorAll('.skill-bar');
    const skillBarSet = new Set();

    function animateSkillBars() {
        skillBars.forEach((bar) => {
            if (skillBarSet.has(bar)) return;
            const rect = bar.getBoundingClientRect();
            if (rect.left < window.innerWidth && rect.right > 0) {
                skillBarSet.add(bar);
                const targetWidth = bar.dataset.width;
                setTimeout(() => {
                    bar.style.width = targetWidth + '%';
                }, 200);
            }
        });
    }

    // ============================================================
    // 9. 3D CARD TILT EFFECT
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

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        });
    });

    // ============================================================
    // 10. MAGNETIC BUTTON EFFECT
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
    // 11. FULLSCREEN MENU
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
            // Reset link states
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

            // Close menu
            menuOpen = false;
            menuToggle.classList.remove('active');
            fullscreenMenu.classList.remove('active');
        });
    });

    // ============================================================
    // 12. WORD REVEAL FOR HEADLINES
    // ============================================================
    function setupWordReveal() {
        const headlines = document.querySelectorAll('.stats-headline, .contact-headline');
        headlines.forEach((el) => {
            const text = el.innerHTML;
            // Split by words but preserve HTML tags like <br>
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

    // Reveal word-inner elements
    function checkWordReveals() {
        const wordInners = document.querySelectorAll('.word-inner');
        wordInners.forEach((inner) => {
            const rect = inner.getBoundingClientRect();
            if (rect.left < window.innerWidth * 0.85 && rect.right > 0) {
                inner.classList.add('revealed');
            }
        });
    }

    // ============================================================
    // 13. PARALLAX ON MOUSE MOVE
    // ============================================================
    let parallaxTargetX = 0;
    let parallaxTargetY = 0;
    let parallaxCurrentX = 0;
    let parallaxCurrentY = 0;

    document.addEventListener('mousemove', (e) => {
        parallaxTargetX = (e.clientX / window.innerWidth - 0.5) * 2;
        parallaxTargetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function updateParallax() {
        parallaxCurrentX += (parallaxTargetX - parallaxCurrentX) * 0.05;
        parallaxCurrentY += (parallaxTargetY - parallaxCurrentY) * 0.05;

        // Move hero radial gradient
        const heroRadial = document.querySelector('.hero-radial');
        if (heroRadial) {
            heroRadial.style.transform = `translate(${parallaxCurrentX * 30}px, ${parallaxCurrentY * 30}px)`;
        }

        // Subtle movement on dot grids
        const dotGrids = document.querySelectorAll('.dot-grid');
        dotGrids.forEach((grid) => {
            grid.style.transform = `translate(${parallaxCurrentX * -10}px, ${parallaxCurrentY * -10}px)`;
        });

        requestAnimationFrame(updateParallax);
    }
    updateParallax();

    // ============================================================
    // 14. DYNAMIC PANEL BACKGROUND SHIFT
    // ============================================================
    function updatePanelEffects() {
        panels.forEach((panel, i) => {
            const rect = panel.getBoundingClientRect();
            const visibility = Math.max(
                0,
                Math.min(1, 1 - Math.abs(rect.left) / window.innerWidth)
            );
            // Scale content slightly based on visibility
            const inner = panel.querySelector('.panel-inner');
            if (inner) {
                const scale = 0.95 + visibility * 0.05;
                const opacity = 0.3 + visibility * 0.7;
                inner.style.transform = `scale(${scale})`;
                inner.style.opacity = opacity;
            }
        });
    }

    // ============================================================
    // 15. ENHANCED SMOOTH SCROLL LOOP (Main RAF)
    // ============================================================
    function mainLoop() {
        const diff = scrollTarget - scrollCurrent;
        scrollVelocity = diff * scrollEase;
        scrollCurrent += scrollVelocity;

        // Clamp to prevent floating point drift
        if (Math.abs(diff) < 0.1) {
            scrollCurrent = scrollTarget;
        }

        // Apply transform
        scrollContainer.style.transform = `translateX(${-scrollCurrent}px)`;

        // Progress bar
        const progress = maxScroll > 0 ? (scrollCurrent / maxScroll) * 100 : 0;
        progressFill.style.width = Math.min(progress, 100) + '%';

        // Panel counter
        const currentPanelIndex = Math.round(scrollCurrent / window.innerWidth);
        panelCounterCurrent.textContent = String(
            Math.min(currentPanelIndex + 1, panels.length)
        ).padStart(2, '0');

        // Parallax hero bg — moves opposite to scroll
        const heroBg = document.getElementById('hero-bg');
        if (heroBg) {
            const parallaxSpeed = 0.15;
            heroBg.style.transform = `translateX(${-scrollCurrent * parallaxSpeed}px)`;
            // Fade out background as user scrolls deeper
            const fadeStart = window.innerWidth * 0.5;
            const fadeEnd = window.innerWidth * 4;
            const bgOpacity = Math.max(0, 1 - (scrollCurrent - fadeStart) / (fadeEnd - fadeStart));
            heroBg.style.opacity = Math.max(0.05, bgOpacity);
        }

        // Run reveal checks
        revealElements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const threshold = window.innerWidth * 0.15;
            if (
                rect.left < window.innerWidth - threshold &&
                rect.right > threshold
            ) {
                el.classList.add('revealed');
            }
        });

        animateCounters();
        animateSkillBars();
        checkWordReveals();
        updatePanelEffects();

        requestAnimationFrame(mainLoop);
    }

    // ============================================================
    // 16. SCROLL SNAP (Optional — snap to nearest panel on rest)
    // ============================================================
    let snapTimeout = null;

    function scheduleSnap() {
        clearTimeout(snapTimeout);
        snapTimeout = setTimeout(() => {
            const nearestPanel = Math.round(scrollTarget / window.innerWidth);
            const snapTarget = nearestPanel * window.innerWidth;
            // Only snap if close enough
            if (Math.abs(scrollTarget - snapTarget) < window.innerWidth * 0.25) {
                scrollTarget = Math.max(0, Math.min(snapTarget, maxScroll));
            }
        }, 150);
    }

    window.addEventListener('wheel', scheduleSnap);
    window.addEventListener('touchend', scheduleSnap);

    // ============================================================
    // 17. DYNAMIC GRADIENT ORBS (BACKGROUND)
    // ============================================================
    function createGradientOrbs() {
        const orbContainer = document.createElement('div');
        orbContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            overflow: hidden;
        `;
        document.body.prepend(orbContainer);

        const orbColors = [
            'rgba(255, 61, 0, 0.06)',
            'rgba(255, 100, 50, 0.04)',
            'rgba(200, 30, 0, 0.05)',
        ];

        orbColors.forEach((color, i) => {
            const orb = document.createElement('div');
            const size = 400 + i * 200;
            orb.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: radial-gradient(circle, ${color}, transparent 70%);
                filter: blur(60px);
                animation: orbFloat${i} ${15 + i * 5}s ease-in-out infinite alternate;
            `;
            // Add keyframes dynamically
            const keyframes = `
                @keyframes orbFloat${i} {
                    0% { transform: translate(${20 + i * 30}vw, ${10 + i * 20}vh); }
                    33% { transform: translate(${50 - i * 15}vw, ${60 + i * 10}vh); }
                    66% { transform: translate(${70 + i * 10}vw, ${20 - i * 5}vh); }
                    100% { transform: translate(${30 + i * 20}vw, ${50 + i * 15}vh); }
                }
            `;
            const style = document.createElement('style');
            style.textContent = keyframes;
            document.head.appendChild(style);

            orbContainer.appendChild(orb);
        });
    }
    createGradientOrbs();

    // ============================================================
    // 18. TEXT SCRAMBLE EFFECT (for role titles on hover)
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
                        char = this.chars[Math.floor(Math.random() * this.chars.length)];
                        this.queue[i].char = char;
                    }
                    output += `<span style="color: var(--accent); opacity: 0.6;">${char}</span>`;
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

    // Apply scramble to exp-role elements on hover
    function setupTextScramble() {
        const roles = document.querySelectorAll('.exp-role');
        roles.forEach((role) => {
            const originalText = role.textContent;
            const scrambler = new TextScramble(role);

            role.parentElement.parentElement.parentElement.addEventListener('mouseenter', () => {
                scrambler.setText(originalText);
            });
        });
    }

    // ============================================================
    // 19. HOVER RIPPLE EFFECT ON CARDS
    // ============================================================
    function setupRippleEffect() {
        const cards = document.querySelectorAll('.exp-card, .edu-card');
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

                setTimeout(() => ripple.remove(), 800);
            });
        });

        // Add ripple keyframe
        const rippleStyle = document.createElement('style');
        rippleStyle.textContent = `
            @keyframes rippleExpand {
                0% { transform: scale(0); opacity: 1; }
                100% { transform: scale(1); opacity: 0; }
            }
        `;
        document.head.appendChild(rippleStyle);
    }

    // ============================================================
    // 20. TYPEWRITER EFFECT FOR SUBTITLE
    // ============================================================
    function typewriterEffect(element, text, speed = 30) {
        element.textContent = '';
        let i = 0;
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    // ============================================================
    // 21. PARTICLE SYSTEM (Floating dots)
    // ============================================================
    function createParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            overflow: hidden;
        `;
        document.body.prepend(particleContainer);

        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 3 + 1;
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            const duration = 20 + Math.random() * 30;
            const delay = Math.random() * -30;

            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(255, 61, 0, ${0.1 + Math.random() * 0.2});
                border-radius: 50%;
                left: ${startX}%;
                top: ${startY}%;
                animation: particleDrift${i} ${duration}s ${delay}s linear infinite;
            `;

            const keyframes = `
                @keyframes particleDrift${i} {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 0;
                    }
                    10% { opacity: ${0.2 + Math.random() * 0.3}; }
                    50% {
                        transform: translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px) scale(${0.5 + Math.random()});
                    }
                    90% { opacity: ${0.1 + Math.random() * 0.2}; }
                    100% {
                        transform: translate(${(Math.random() - 0.5) * 400}px, ${(Math.random() - 0.5) * 400}px) scale(0.5);
                        opacity: 0;
                    }
                }
            `;
            const style = document.createElement('style');
            style.textContent = keyframes;
            document.head.appendChild(style);

            particleContainer.appendChild(particle);
        }
    }
    createParticles();

    // ============================================================
    // 22. GLITCH EFFECT ON LOGO
    // ============================================================
    const siteLogo = document.querySelector('.site-logo');

    function logoGlitch() {
        siteLogo.style.animation = 'glitch 0.3s ease';
        setTimeout(() => {
            siteLogo.style.animation = '';
        }, 300);
    }

    // Random glitch every 8-15 seconds
    function scheduleGlitch() {
        const delay = 8000 + Math.random() * 7000;
        setTimeout(() => {
            logoGlitch();
            scheduleGlitch();
        }, delay);
    }
    scheduleGlitch();

    // ============================================================
    // 23. COLOR SHIFT ON SCROLL
    // ============================================================
    function updateAccentShift() {
        const progress = maxScroll > 0 ? scrollCurrent / maxScroll : 0;
        // Subtle hue shift on the accent glow
        const hue = Math.floor(progress * 15); // 0-15 degree shift
        document.documentElement.style.setProperty(
            '--accent-glow',
            `hsla(${14 + hue}, 100%, 50%, 0.15)`
        );
    }

    // ============================================================
    // 24. SCROLL VELOCITY BASED TEXT SKEW
    // ============================================================
    function updateTextSkew() {
        const skew = scrollVelocity * 0.01;
        const clampedSkew = Math.max(-3, Math.min(3, skew));
        panels.forEach((panel) => {
            const inner = panel.querySelector('.panel-inner');
            if (inner) {
                inner.style.transition = 'none';
                inner.style.transform = `skewX(${clampedSkew}deg)`;
            }
        });
    }

    // ============================================================
    // 25. FINAL ENHANCED MAIN LOOP
    // ============================================================
    function enhancedMainLoop() {
        const diff = scrollTarget - scrollCurrent;
        scrollVelocity = diff * scrollEase;
        scrollCurrent += scrollVelocity;

        if (Math.abs(diff) < 0.5) {
            scrollCurrent = scrollTarget;
        }

        // Apply smooth transform
        scrollContainer.style.transform = `translateX(${-scrollCurrent}px)`;

        // Progress bar
        const progress = maxScroll > 0 ? (scrollCurrent / maxScroll) * 100 : 0;
        progressFill.style.width = Math.min(progress, 100) + '%';

        // Panel counter
        const currentPanelIndex = Math.round(scrollCurrent / window.innerWidth);
        panelCounterCurrent.textContent = String(
            Math.min(currentPanelIndex + 1, panels.length)
        ).padStart(2, '0');

        // Hero parallax — moves opposite to scroll with fade
        const heroBg = document.getElementById('hero-bg');
        if (heroBg) {
            const parallaxSpeed = 0.15;
            heroBg.style.transform = `translateX(${-scrollCurrent * parallaxSpeed}px)`;
            // Fade out as user scrolls deeper into the site
            const fadeStart = window.innerWidth * 0.5;
            const fadeEnd = window.innerWidth * 4;
            const bgOpacity = Math.max(0, 1 - (scrollCurrent - fadeStart) / (fadeEnd - fadeStart));
            heroBg.style.opacity = Math.max(0.05, bgOpacity);
        }

        // Reveal system
        revealElements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const threshold = window.innerWidth * 0.12;
            if (rect.left < window.innerWidth - threshold && rect.right > threshold) {
                el.classList.add('revealed');
            }
        });

        animateCounters();
        animateSkillBars();
        checkWordReveals();
        updatePanelEffects();
        updateAccentShift();
        updateTextSkew();

        requestAnimationFrame(enhancedMainLoop);
    }

    // ============================================================
    // 26. INITIALIZATION
    // ============================================================
    function init() {
        setupCursorHover();
        setupTextScramble();
        setupRippleEffect();

        // Start the main animation loop
        enhancedMainLoop();

        console.log(
            '%c AL MASUM GAZI — Portfolio Engine v3.0 ',
            'background: #FF3D00; color: #fff; padding: 6px 12px; font-family: monospace; font-size: 12px;'
        );
    }

    // Wait for fonts to load
    if (document.fonts) {
        document.fonts.ready.then(init);
    } else {
        window.addEventListener('load', init);
    }

    // ============================================================
    // 27. RESIZE HANDLER
    // ============================================================
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            calculateMaxScroll();
            // Recalculate scroll position
            scrollTarget = Math.min(scrollTarget, maxScroll);
        }, 200);
    });

    // ============================================================
    // 28. PERFORMANCE MONITORING (dev only)
    // ============================================================
    let fpsFrames = 0;
    let fpsTime = performance.now();

    function monitorFPS() {
        fpsFrames++;
        const now = performance.now();
        if (now - fpsTime >= 1000) {
            // Uncomment to debug FPS:
            // console.log('FPS:', fpsFrames);
            fpsFrames = 0;
            fpsTime = now;
        }
        requestAnimationFrame(monitorFPS);
    }
    monitorFPS();

})();
