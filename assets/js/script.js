(function () {
    const root = document.documentElement;
    const themeToggle = document.querySelector('[data-theme-toggle]');
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav-links');
    const navLinks = nav ? Array.from(nav.querySelectorAll('a')) : [];
    const storageKey = 'slo-theme';
    const backToTop = document.getElementById('back-to-top');
    const contactForm = document.querySelector('[data-contact-form]');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        if (themeToggle) {
            themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        }
    }

    function initTheme() {
        const storedTheme = localStorage.getItem(storageKey);
        const initialTheme = storedTheme || (prefersDark.matches ? 'dark' : 'light');
        applyTheme(initialTheme);
        if (!storedTheme) {
            localStorage.setItem(storageKey, initialTheme);
        }
    }

    initTheme();

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(current);
            localStorage.setItem(storageKey, current);
        });
    }

    prefersDark.addEventListener('change', event => {
        const storedTheme = localStorage.getItem(storageKey);
        if (!storedTheme) {
            applyTheme(event.matches ? 'dark' : 'light');
        }
    });

    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!isExpanded));
            nav.classList.toggle('is-open');
            document.body.classList.toggle('nav-open', !isExpanded);
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.setAttribute('aria-expanded', 'false');
                nav.classList.remove('is-open');
                document.body.classList.remove('nav-open');
            });
        });
    }

    if (navLinks.length) {
        const sections = navLinks
            .map(link => document.querySelector(link.getAttribute('href')))
            .filter(Boolean);

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = `#${entry.target.id}`;
                        navLinks.forEach(link => {
                            link.classList.toggle('is-active', link.getAttribute('href') === id);
                        });
                    }
                });
            },
            { threshold: 0.55 }
        );

        sections.forEach(section => observer.observe(section));
    }

    const meters = document.querySelectorAll('.meter');
    if (meters.length) {
        const meterObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const value = el.getAttribute('data-progress') || '75';
                        el.style.setProperty('--target-progress', `${value}%`);
                        el.classList.add('is-visible');
                        meterObserver.unobserve(el);
                    }
                });
            },
            { threshold: 0.6 }
        );

        meters.forEach(meter => meterObserver.observe(meter));
    }

    if (contactForm) {
        const status = contactForm.querySelector('.form-status');
        contactForm.addEventListener('submit', event => {
            event.preventDefault();
            if (status) {
                status.hidden = false;
                status.textContent = 'Merci ! Je reviens très vite vers toi.';
            }
            contactForm.reset();
        });
    }

    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('is-visible', window.scrollY > 400);
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const yearElement = document.querySelector('[data-current-year]');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear().toString();
    }

    const canvas = document.getElementById('nebula-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width;
        let height;
        let particles = [];
        const particleCount = 60;

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        function createParticles() {
            particles = Array.from({ length: particleCount }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: 1.5 + Math.random() * 2.5,
                alpha: 0.15 + Math.random() * 0.35,
                speed: 0.15 + Math.random() * 0.35,
                drift: -0.5 + Math.random()
            }));
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);

            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, 'rgba(124, 58, 237, 0.15)');
            gradient.addColorStop(0.5, 'rgba(14, 165, 233, 0.12)');
            gradient.addColorStop(1, 'rgba(244, 114, 182, 0.1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            particles.forEach((particle, index) => {
                // Draw particle glow
                const glowGradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.radius * 3
                );
                glowGradient.addColorStop(0, `rgba(148, 163, 255, ${particle.alpha * 0.8})`);
                glowGradient.addColorStop(0.5, `rgba(125, 211, 252, ${particle.alpha * 0.3})`);
                glowGradient.addColorStop(1, 'rgba(148, 163, 255, 0)');
                
                ctx.beginPath();
                ctx.fillStyle = glowGradient;
                ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
                ctx.fill();

                // Draw particle core
                ctx.beginPath();
                ctx.fillStyle = `rgba(148, 163, 255, ${particle.alpha})`;
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fill();

                // Connect nearby particles
                particles.forEach((otherParticle, otherIndex) => {
                    if (index !== otherIndex) {
                        const dx = particle.x - otherParticle.x;
                        const dy = particle.y - otherParticle.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < 150) {
                            ctx.beginPath();
                            ctx.strokeStyle = `rgba(148, 163, 255, ${0.15 * (1 - distance / 150)})`;
                            ctx.lineWidth = 0.5;
                            ctx.moveTo(particle.x, particle.y);
                            ctx.lineTo(otherParticle.x, otherParticle.y);
                            ctx.stroke();
                        }
                    }
                });

                particle.y -= particle.speed;
                particle.x += particle.drift * 0.3;

                if (particle.y < -10) particle.y = height + 10;
                if (particle.x > width + 10) particle.x = -10;
                if (particle.x < -10) particle.x = width + 10;
            });

            requestAnimationFrame(draw);
        }

        resize();
        createParticles();
        draw();
        window.addEventListener('resize', () => {
            resize();
            createParticles();
        });
    }

    // Smooth reveal animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealElements = document.querySelectorAll('.skill-card, .project-card, .timeline-item, .detail-card');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        revealObserver.observe(el);
    });

    // Mouse parallax effect on hero
    const heroVisual = document.querySelector('.hero-visual');
    const heroCopy = document.querySelector('.hero-copy');
    
    if (heroVisual && heroCopy) {
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth - 0.5;
            const mouseY = e.clientY / window.innerHeight - 0.5;
            
            heroVisual.style.transform = `translate(${mouseX * 20}px, ${mouseY * 20}px)`;
            heroCopy.style.transform = `translate(${mouseX * -10}px, ${mouseY * -10}px)`;
        });
    }

    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple-effect');
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Custom cursor effect
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    const cursorFollower = document.createElement('div');
    cursorFollower.className = 'cursor-follower';
    document.body.appendChild(cursorFollower);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.3;
        cursorY += (mouseY - cursorY) * 0.3;
        
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;

        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px)`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor interaction with interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .pill, .chip-row span, .skill-card, .project-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
            cursorFollower.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
            cursorFollower.classList.remove('cursor-hover');
        });
    });
})();
