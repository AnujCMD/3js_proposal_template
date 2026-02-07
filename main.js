// import * as THREE from 'three'; // using global THREE from CDN

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffccd5); // Soft pink background
scene.fog = new THREE.Fog(0xffccd5, 10, 60); // Increased fog range

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30; // Moved back to see more hearts

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// --- Lights ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xff4d6d, 1.5); // Increased intensity
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// --- Heart Geometry ---
const x = 0, y = 0;
const heartShape = new THREE.Shape();
heartShape.moveTo(x + 5, y + 5);
heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

const extrudeSettings = {
    depth: 2,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 2,
    bevelSize: 1,
    bevelThickness: 1
};

const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
heartGeometry.center();

// --- Material ---
const heartMaterial = new THREE.MeshPhongMaterial({
    color: 0xff4d6d,
    shininess: 100,
    specular: 0xffffff
});

// --- Create Floating Hearts ---
const hearts = [];
function addHeart() {
    const heart = new THREE.Mesh(heartGeometry, heartMaterial);

    // Spread hearts across the view
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(50));
    heart.position.set(x, y, z);

    heart.rotation.x = Math.random() * Math.PI;
    heart.rotation.y = Math.random() * Math.PI;

    const scale = THREE.MathUtils.randFloat(0.1, 0.4);
    heart.scale.set(scale, scale, scale);

    scene.add(heart);
    hearts.push({
        mesh: heart,
        speedY: THREE.MathUtils.randFloat(0.02, 0.08),
        rotateSpeed: THREE.MathUtils.randFloat(0.01, 0.03)
    });
}

for (let i = 0; i < 60; i++) {
    addHeart();
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    hearts.forEach(h => {
        h.mesh.position.y += h.speedY;
        h.mesh.rotation.x += h.rotateSpeed;
        h.mesh.rotation.y += h.rotateSpeed;

        if (h.mesh.position.y > 25) {
            h.mesh.position.y = -25;
            h.mesh.position.x = THREE.MathUtils.randFloatSpread(50);
            h.mesh.position.z = THREE.MathUtils.randFloatSpread(50);
        }
    });

    renderer.render(scene, camera);
}

animate();

// --- Window Resize ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- UI Interaction ---
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const buttonsDiv = document.querySelector('.buttons');
const celebrationDiv = document.getElementById('celebration');
const questionHeading = document.querySelector('h1#question');

// Runaway "No" Button
// Runaway "No" Button
function moveNoButton() {
    // 1. If first run, move to body to escape the transformed container
    // and set initial position to match current visual position
    if (noBtn.parentNode !== document.body) {
        const rect = noBtn.getBoundingClientRect();

        noBtn.style.position = 'fixed';
        noBtn.style.left = rect.left + 'px';
        noBtn.style.top = rect.top + 'px';
        noBtn.style.width = rect.width + 'px'; // Maintain width
        noBtn.style.zIndex = '1000';

        document.body.appendChild(noBtn);

        // Force reflow to ensure the browser registers the start position
        void noBtn.offsetWidth;
    }

    // 2. Calculate new random position
    const btnRect = noBtn.getBoundingClientRect();
    const maxX = window.innerWidth - btnRect.width - 40;
    const maxY = window.innerHeight - btnRect.height - 40;

    const randomX = Math.random() * maxX + 20;
    const randomY = Math.random() * maxY + 20;

    // 3. Apply new position (CSS transition will animate this)
    noBtn.style.left = randomX + 'px';
    noBtn.style.top = randomY + 'px';
}

noBtn.addEventListener('mouseover', moveNoButton);
noBtn.addEventListener('touchstart', (e) => {
    // prevent default to stop click if possible, though moving it is enough
    moveNoButton();
}, { passive: true });
noBtn.addEventListener('click', moveNoButton);

// "Yes" Button Click
// Scatter function to reuse
// Scatter function to reuse
function scatterMemories(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.classList.remove('hidden');
    const photos = container.querySelectorAll('.memory-photo');

    // Define exclusion zone (central panel area)
    const panelWidth = 600; // Approximate width of glass panel
    const panelHeight = 500; // Approximate height
    const exclusionMargin = 50; // Extra buffer

    const exclusionW = panelWidth + exclusionMargin * 2;
    const exclusionH = panelHeight + exclusionMargin * 2;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    photos.forEach((photo, index) => {
        let left, top;
        let overlap = true;
        let attempts = 0;

        while (overlap && attempts < 50) {
            // Generate random position
            // Photo size approx 250x300
            left = Math.random() * (window.innerWidth - 250);
            top = Math.random() * (window.innerHeight - 300);

            // Check center of photo against exclusion zone
            const photoCenterX = left + 125;
            const photoCenterY = top + 150;

            const inHorz = photoCenterX > (centerX - exclusionW / 2) && photoCenterX < (centerX + exclusionW / 2);
            const inVert = photoCenterY > (centerY - exclusionH / 2) && photoCenterY < (centerY + exclusionH / 2);

            if (!inHorz || !inVert) {
                overlap = false;
            }
            attempts++;
        }

        // Final fallback if no spot found: push to safe sides
        if (overlap) {
            if (Math.random() > 0.5) {
                // Left strip
                left = Math.random() * (centerX - exclusionW / 2 - 250);
                if (left < 0) left = 10;
            } else {
                // Right strip
                left = (centerX + exclusionW / 2) + Math.random() * (window.innerWidth - (centerX + exclusionW / 2) - 250);
                if (left > window.innerWidth - 260) left = window.innerWidth - 260;
            }
            // Retain calculated top or randomize again safely? Let's just keep top, horizontal push is enough to clear center.
        }

        const randomRotation = (Math.random() - 0.5) * 40;

        photo.style.left = `${left}px`;
        photo.style.top = `${top}px`;
        photo.style.setProperty('--rotation', `${randomRotation}deg`);

        // Staggered animation
        setTimeout(() => {
            photo.classList.add('visible');
        }, index * 200);

        // Enable Dragging
        makeDraggable(photo);
    });
}

// Initial Scatter
window.addEventListener('load', () => {
    scatterMemories('initial-memories');
});

// "Yes" Button Click
yesBtn.addEventListener('click', () => {
    buttonsDiv.style.display = 'none';
    questionHeading.style.display = 'none';

    if (noBtn.parentNode) {
        noBtn.parentNode.removeChild(noBtn);
    }

    celebrationDiv.classList.remove('hidden');

    createHeartExplosion();

    // Play video automatically
    const video = document.querySelector('video');
    if (video) {
        video.play().catch(e => console.log("Auto-play prevented:", e));
    }

    // Hide Initial Memories
    const initialMemories = document.getElementById('initial-memories');
    if (initialMemories) {
        initialMemories.style.transition = 'opacity 1s ease';
        initialMemories.style.opacity = '0';
        setTimeout(() => {
            initialMemories.style.display = 'none';
        }, 1000);
    }

    // Show Celebration Memories (Snapchat)
    scatterMemories('celebration-memories');
});

function makeDraggable(element) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    // Mouse Events
    element.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    // Touch Events
    element.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }

        // Parse current position
        initialLeft = parseFloat(element.style.left || 0);
        initialTop = parseFloat(element.style.top || 0);

        if (e.target === element || element.contains(e.target)) {
            isDragging = true;
            element.style.zIndex = 1001; // Bring to front
            element.style.cursor = 'grabbing';
        }
    }

    function drag(e) {
        if (!isDragging) return;

        e.preventDefault(); // Prevent scrolling

        let currentX, currentY;
        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        } else {
            currentX = e.clientX;
            currentY = e.clientY;
        }

        const dx = currentX - startX;
        const dy = currentY - startY;

        element.style.left = `${initialLeft + dx}px`;
        element.style.top = `${initialTop + dy}px`;
    }

    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        element.style.cursor = 'grab';
        // Keep z-index high so it stays on top of others
        element.style.zIndex = 1000;
    }
}

function createHeartExplosion() {
    const geometry = new THREE.ShapeGeometry(heartShape);

    const particles = [];
    for (let i = 0; i < 150; i++) {
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(Math.random(), 1, 0.6)
        });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.scale.set(0.15, 0.15, 0.15);
        mesh.position.set(0, 0, 10);

        // Random velocity in sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const speed = Math.random() * 0.5 + 0.2;

        const velocity = new THREE.Vector3(
            speed * Math.sin(phi) * Math.cos(theta),
            speed * Math.sin(phi) * Math.sin(theta),
            speed * Math.cos(phi)
        );

        scene.add(mesh);
        particles.push({ mesh, velocity });
    }

    function animateExplosion() {
        if (particles.length === 0) return;
        requestAnimationFrame(animateExplosion);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.mesh.position.add(p.velocity);
            p.mesh.rotation.z += 0.1;
            p.mesh.rotation.y += 0.1;

            // Cleanup
            if (p.mesh.position.length() > 50) {
                scene.remove(p.mesh);
                particles.splice(i, 1);
            }
        }
        renderer.render(scene, camera);
    }
    animateExplosion();
}
