document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. BACKGROUND CONFETTI PARTICLE SYSTEM
    // ==========================================
    const bgCanvas = document.querySelector('#webgl-canvas');
    const bgScene = new THREE.Scene();

    const bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    bgCamera.position.z = 40;

    const bgRenderer = new THREE.WebGLRenderer({
        canvas: bgCanvas,
        alpha: true, 
        antialias: true
    });
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    let particles = [];
    const particleCount = 500; 

    const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.05);
    const colors = [0xFF8A00, 0x9D00FF, 0x4A5568, 0xFFE5D0];

    for (let i = 0; i < particleCount; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const material = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: Math.random() * 0.5 + 0.2 
        });

        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.x = (Math.random() - 0.5) * 100;
        mesh.position.y = (Math.random() - 0.5) * 100;
        mesh.position.z = (Math.random() - 0.5) * 50;

        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;

        mesh.userData = {
            baseX: mesh.position.x,
            baseY: mesh.position.y,
            rotSpeedX: (Math.random() - 0.5) * 0.02,
            rotSpeedY: (Math.random() - 0.5) * 0.02,
            driftSpeedY: (Math.random() * 0.03) + 0.01,
            driftSpeedX: (Math.random() - 0.5) * 0.01,
            velocity: new THREE.Vector3(0,0,0),
            isBurstParticle: false
        };

        bgScene.add(mesh);
        particles.push(mesh);
    }

    // ==========================================
    // 2. HERO LOGO INTERACTIVE WEBGL MESH
    // ==========================================
    const logoContainer = document.getElementById('hero-logo-container');
    let logoMesh = null;
    let logoScene, logoCamera, logoRenderer;

    if (logoContainer) {
        logoScene = new THREE.Scene();
        
        const logoAspect = logoContainer.clientWidth / logoContainer.clientHeight;
        logoCamera = new THREE.PerspectiveCamera(45, logoAspect, 0.1, 1000);
        logoCamera.position.z = 15; 

        logoRenderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        logoRenderer.setSize(logoContainer.clientWidth, logoContainer.clientHeight);
        logoRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        logoContainer.appendChild(logoRenderer.domElement);

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            'LOGO.png',
            function (texture) {
                const imgAspect = texture.image.width / texture.image.height;
                const planeHeight = 14; 
                const planeWidth = planeHeight * imgAspect;

                const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
                const planeMaterial = new THREE.MeshBasicMaterial({ 
                    map: texture, 
                    transparent: true 
                });
                
                logoMesh = new THREE.Mesh(planeGeometry, planeMaterial);
                logoMesh.userData = { targetScale: 1.0 };
                logoScene.add(logoMesh);
            },
            undefined,
            function (err) {
                console.error('An error happened loading the logo texture:', err);
            }
        );
    }

    // ==========================================
    // 3. AUDIO SYNTHESIZER (SATISFYING CLICK)
    // ==========================================
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    function playSatisfyingClick() {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.6, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
    }

    // ==========================================
    // 4. CLICK EVENT - LOGO EXPLOSION
    // ==========================================
    if (logoContainer) {
        logoContainer.addEventListener('click', () => {
            playSatisfyingClick();

            if (logoMesh) {
                logoMesh.userData.targetScale = 1.3; 
            }

            // Scatter existing ambient particles violently outward
            particles.forEach(p => {
                const dx = p.position.x;
                const dy = p.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;
                
                const blastForce = (Math.random() * 1.5) + 0.5;
                p.userData.velocity.x += (dx / distance) * blastForce;
                p.userData.velocity.y += (dy / distance) * blastForce;
                
                p.userData.rotSpeedX += (Math.random() - 0.5) * 0.5;
                p.userData.rotSpeedY += (Math.random() - 0.5) * 0.5;
            });

            // CREATE A BRAND NEW CONFETTI BURST ORIGINATING FROM THE CENTER
            const burstCount = 150;
            for (let i = 0; i < burstCount; i++) {
                const color = colors[Math.floor(Math.random() * colors.length)];
                const material = new THREE.MeshBasicMaterial({ 
                    color: color,
                    transparent: true,
                    opacity: 1.0 
                });

                const burstMesh = new THREE.Mesh(geometry, material);
                burstMesh.position.set(0, 0, 10);
                
                const angle = Math.random() * Math.PI * 2;
                const speed = (Math.random() * 3) + 1.5; 

                burstMesh.userData = {
                    velocity: new THREE.Vector3(
                        Math.cos(angle) * speed, 
                        Math.sin(angle) * speed, 
                        (Math.random() - 0.5) * 2 
                    ),
                    rotSpeedX: (Math.random() - 0.5) * 0.4,
                    rotSpeedY: (Math.random() - 0.5) * 0.4,
                    driftSpeedY: 0,
                    driftSpeedX: 0,
                    isBurstParticle: true, 
                    life: 1.0 
                };

                bgScene.add(burstMesh);
                particles.push(burstMesh);
            }
        });
    }

    // ==========================================
    // 5. GLOBAL INTERACTIVITY & ANIMATION
    // ==========================================
    let mouseX = 0;
    let mouseY = 0;
    let normalizedMouseX = 0;
    let normalizedMouseY = 0;
    
    let mouseWorldX = 0;
    let mouseWorldY = 0;
    
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    // Track scroll positions for the flow effect
    let currentScrollY = window.scrollY;
    let lastScrollY = window.scrollY;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);

        normalizedMouseX = (event.clientX / window.innerWidth) * 2 - 1;
        normalizedMouseY = -(event.clientY / window.innerHeight) * 2 + 1;

        mouseWorldX = normalizedMouseX * 50;
        mouseWorldY = normalizedMouseY * 30;
    });

    let targetX = 0;
    let targetY = 0;

    function animate() {
        requestAnimationFrame(animate);

        // --- Calculate Scroll Delta for Flow Effect ---
        currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;
        lastScrollY = currentScrollY;

        // --- Animate Background Parallax ---
        targetX = mouseX * 0.005;
        targetY = mouseY * 0.005;
        bgCamera.position.x += (targetX - bgCamera.position.x) * 0.05;
        bgCamera.position.y += (-targetY - bgCamera.position.y) * 0.05;
        bgCamera.lookAt(bgScene.position);

        let survivingParticles = [];

        particles.forEach(p => {
            p.rotation.x += p.userData.rotSpeedX;
            p.rotation.y += p.userData.rotSpeedY;
            
            // For ambient particles only: Repel, Spring-Back, and Scroll Flow effect
            if (!p.userData.isBurstParticle) {

                // --- NEW: SCROLL FLOW EFFECT ---
                // Add fluid momentum based on scroll speed
                const scrollParallax = scrollDelta * 0.03;
                p.userData.baseY += scrollParallax;
                p.position.y += scrollParallax;
                
                // Add a little extra push to velocity for bounce/fluidity
                p.userData.velocity.y += scrollDelta * 0.002;

                // Update the invisible "base" position so it continues to drift properly
                p.userData.baseX += p.userData.driftSpeedX;
                p.userData.baseY += p.userData.driftSpeedY;

                // Wrap base positions if they drift off screen
                if (p.userData.baseY > 50) {
                    p.userData.baseY = -50;
                    p.userData.baseX = (Math.random() - 0.5) * 100;
                    // Reset physical position to match
                    p.position.y = p.userData.baseY;
                    p.position.x = p.userData.baseX;
                } else if (p.userData.baseY < -50) {
                    p.userData.baseY = 50;
                    p.position.y = p.userData.baseY;
                }

                // 1. Mouse Repel Logic
                const dx = p.position.x - mouseWorldX;
                const dy = p.position.y - mouseWorldY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 15) {
                    const force = (15 - distance) / 15;
                    p.userData.velocity.x += (dx / distance) * force * 0.3;
                    p.userData.velocity.y += (dy / distance) * force * 0.3;
                }

                // 2. Spring-Back Logic
                const homeDx = p.userData.baseX - p.position.x;
                const homeDy = p.userData.baseY - p.position.y;
                
                p.userData.velocity.x += homeDx * 0.02;
                p.userData.velocity.y += homeDy * 0.02;
            }

            // Apply velocity 
            p.position.x += p.userData.velocity.x;
            p.position.y += p.userData.velocity.y;
            p.position.z += p.userData.velocity.z || 0; 

            // Add friction so they settle
            p.userData.velocity.x *= 0.90;
            p.userData.velocity.y *= 0.90;
            if (p.userData.velocity.z) p.userData.velocity.z *= 0.92;

            p.userData.rotSpeedX *= 0.98;
            p.userData.rotSpeedY *= 0.98;

            if (p.userData.isBurstParticle) {
                // Gravity & Fade for burst particles
                p.userData.velocity.y -= 0.02; 
                p.userData.life -= 0.015; 
                p.material.opacity = p.userData.life; 

                if (p.userData.life > 0) {
                    survivingParticles.push(p);
                } else {
                    bgScene.remove(p);
                    p.material.dispose();
                    p.geometry.dispose();
                }
            } else {
                survivingParticles.push(p);
            }
        });

        particles = survivingParticles;
        bgRenderer.render(bgScene, bgCamera);

        // --- Animate Interactive Logo ---
        if (logoScene && logoCamera && logoRenderer && logoMesh) {
            const targetRotationX = normalizedMouseY * 0.35; 
            const targetRotationY = normalizedMouseX * 0.35; 

            logoMesh.rotation.x += (targetRotationX - logoMesh.rotation.x) * 0.1;
            logoMesh.rotation.y += (targetRotationY - logoMesh.rotation.y) * 0.1;

            logoMesh.scale.x += (logoMesh.userData.targetScale - logoMesh.scale.x) * 0.1;
            logoMesh.scale.y += (logoMesh.userData.targetScale - logoMesh.scale.y) * 0.1;
            logoMesh.scale.z += (logoMesh.userData.targetScale - logoMesh.scale.z) * 0.1;

            if (logoMesh.userData.targetScale > 1.0) {
                logoMesh.userData.targetScale -= 0.02;
                if (logoMesh.userData.targetScale < 1.0) {
                    logoMesh.userData.targetScale = 1.0;
                }
            }

            logoRenderer.render(logoScene, logoCamera);
        }
    }

    animate();

    // ==========================================
    // 6. WINDOW RESIZE HANDLING
    // ==========================================
    window.addEventListener('resize', () => {
        bgCamera.aspect = window.innerWidth / window.innerHeight;
        bgCamera.updateProjectionMatrix();
        bgRenderer.setSize(window.innerWidth, window.innerHeight);

        if (logoContainer && logoCamera && logoRenderer) {
            logoCamera.aspect = logoContainer.clientWidth / logoContainer.clientHeight;
            logoCamera.updateProjectionMatrix();
            logoRenderer.setSize(logoContainer.clientWidth, logoContainer.clientHeight);
        }
    });
});