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
            gradient.addColorStop(0, 'rgba(124, 58, 237, 0.12)');
            gradient.addColorStop(1, 'rgba(14, 165, 233, 0.1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            particles.forEach(particle => {
                ctx.beginPath();
                ctx.fillStyle = `rgba(148, 163, 255, ${particle.alpha})`;
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fill();

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
})();
