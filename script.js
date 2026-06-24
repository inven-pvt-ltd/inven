// --- 1. Dynamic Background Particle System ---
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let particlesArray = [];
const numberOfParticles = 60;

// Resize canvas to fill window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Mouse tracking for particle interaction
const mouse = { x: null, y: null };
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Particle Class
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.baseSize = this.size;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off bounds
        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;

        // Enlarge if near mouse cursor
        if (mouse.x !== null && mouse.y !== null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            this.size = dist < 120 ? Math.min(this.baseSize + 2, 5) : this.baseSize;
        }
    }
    draw() {
        ctx.fillStyle = 'rgba(0, 255, 204, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize Particle Array
function initParticles() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

// Draw Connection Lines between close particles
function connectParticles() {
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let dx = particlesArray[a].x - particlesArray[b].x;
            let dy = particlesArray[a].y - particlesArray[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                const opacity = Math.max(0, 0.25 * (1 - distance / 120));
                ctx.strokeStyle = `rgba(0, 200, 255, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

// Animation Loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(particle => {
        particle.update();
        particle.draw();
    });
    connectParticles();
    requestAnimationFrame(animate);
}

initParticles();
animate();


// --- 2. Smooth Scroll Reveal Animations ---
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${Math.random() * 0.25}s`;
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Runs animation only once
        }
    });
}, {
    threshold: 0.15
});

revealElements.forEach(element => {
    revealObserver.observe(element);
});


// --- 3. Dynamic Form Handling ---
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const feedback = document.getElementById('formFeedback');
    feedback.style.color = '#00ffcc';
    feedback.innerText = "Transmitting message secure channel...";
    const submitButton = this.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    // Simulating a server submission delay
    setTimeout(() => {
        feedback.innerText = "Message sent successfully! Inven engineering will connect soon.";
        if (submitButton) submitButton.disabled = false;
        this.reset();
    }, 1500);
});

// Mobile Menu Toggle
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

mobileMenu.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    // Simple inline style toggle for mobile drawer demonstration
    if(navLinks.classList.contains('active')) {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '70px';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = '#0a0c10';
        navLinks.style.padding = '2rem';
    } else {
        navLinks.style.display = 'none';
    }
});