/* =============================================
   KEYSERTRON - Main JavaScript
   Animations, scroll effects, navigation
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  // ---- Navbar Scroll Effect ----
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Update active nav link
    updateActiveNavLink();
  });

  // ---- Mobile Menu Toggle ----
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ---- Active Nav Link on Scroll ----
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = navLinks.querySelector(`a[href="#${id}"]`);

      if (link) {
        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.querySelectorAll('a').forEach(a => a.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  }

  // ---- Smooth Scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---- Scroll Reveal Animation ----
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ---- Animated Counters ----
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'));
        animateCounter(counter, target);
        counterObserver.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  function animateCounter(element, target) {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * eased);
      element.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(updateCounter);
  }

  // ---- Floating Particles (Hero) ----
  const particleContainer = document.getElementById('hero-particles');
  
  function createParticles() {
    const colors = ['rgba(46,125,50,0.4)', 'rgba(76,175,80,0.3)', 'rgba(0,230,118,0.2)', 'rgba(2,119,189,0.3)'];
    
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      const size = Math.random() * 6 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const delay = Math.random() * 15;
      const duration = Math.random() * 10 + 15;
      
      particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        left: ${left}%;
        animation-delay: -${delay}s;
        animation-duration: ${duration}s;
        box-shadow: 0 0 ${size * 2}px ${color};
      `;
      
      particleContainer.appendChild(particle);
    }
  }

  createParticles();

  // ---- Circuit Line Particles ----
  function createCircuitLines() {
    for (let i = 0; i < 3; i++) {
      const line = document.createElement('div');
      line.className = 'particle';
      
      const width = Math.random() * 60 + 20;
      const left = Math.random() * 100;
      const delay = Math.random() * 20;
      const duration = Math.random() * 15 + 20;
      
      line.style.cssText = `
        width: ${width}px;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(46,125,50,0.3), transparent);
        left: ${left}%;
        border-radius: 0;
        animation-delay: -${delay}s;
        animation-duration: ${duration}s;
      `;
      
      particleContainer.appendChild(line);
    }
  }

  createCircuitLines();

  // ---- Contact Form Handling ----
  const contactForm = document.getElementById('contact-form-element');
  const formSuccess = document.getElementById('form-success');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Simulate form submission
      const submitBtn = document.getElementById('form-submit-btn');
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;
      
      setTimeout(() => {
        contactForm.style.display = 'none';
        formSuccess.classList.add('show');
      }, 1500);
    });
  }

  // Parallax disabled for performance
  // window.addEventListener('scroll', ...) removed

  // ---- Service Card Tilt Effect ----
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ---- Cursor glow effect on cards ----
  document.querySelectorAll('.service-card, .impact-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
});
