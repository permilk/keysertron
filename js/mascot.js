/* =============================================
   KEYSERTRON - Premium Interactive Mascot Engine
   Frame-by-frame animation + spring physics
   ============================================= */

(function() {
  'use strict';

  const mascot = document.getElementById('mascot-img');
  if (!mascot) return;

  const mascotContainer = document.querySelector('.hero-mascot');
  const frames = JSON.parse(mascot.dataset.frames || '[]');
  
  // ---- Preload all frames ----
  const preloadedImages = [];
  frames.forEach(src => {
    const img = new Image();
    img.src = src;
    preloadedImages.push(img);
  });

  // ---- State ----
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let posX = 0, posY = 0;
  let velX = 0, velY = 0;
  let rotation = 0;
  let scale = 1;
  let time = 0;
  let currentFrame = 0;
  let animationPhase = 'idle'; // idle, wave, flex, walk
  let phaseTimer = 0;
  let phaseDuration = 3;
  let isHovered = false;
  let lastClickTime = 0;
  let idleSeconds = 0;

  // Animation sequence: defines a looped show of poses
  const animationSequence = [
    { pose: 0, duration: 3.0, label: 'idle' },      // Standing idle
    { pose: 3, duration: 1.5, label: 'walk' },       // Walk step
    { pose: 0, duration: 1.0, label: 'idle' },       // Return to idle
    { pose: 1, duration: 2.0, label: 'wave' },       // Wave hello
    { pose: 0, duration: 2.0, label: 'idle' },       // Idle
    { pose: 3, duration: 1.5, label: 'walk' },       // Walk
    { pose: 2, duration: 2.0, label: 'flex' },       // Flex muscles
    { pose: 0, duration: 2.5, label: 'idle' },       // Idle
  ];
  let sequenceIndex = 0;
  let sequenceTimer = 0;

  // ---- Sparkle System ----
  const sparkleContainer = document.createElement('div');
  sparkleContainer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:visible;z-index:10;';
  mascotContainer.appendChild(sparkleContainer);

  function emitSparkles(cx, cy, count = 8, color = '#00E676') {
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      const size = 3 + Math.random() * 7;
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const dist = 30 + Math.random() * 70;
      const dur = 500 + Math.random() * 500;
      
      s.style.cssText = `
        position:absolute;width:${size}px;height:${size}px;
        background:radial-gradient(circle,${color},transparent);
        border-radius:50%;left:${cx}px;top:${cy}px;
        box-shadow:0 0 ${size*2}px ${color}80;z-index:100;
        pointer-events:none;
      `;
      sparkleContainer.appendChild(s);
      
      s.animate([
        { transform: 'scale(1) translate(0,0)', opacity: 1 },
        { transform: `scale(0) translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px)`, opacity: 0 }
      ], { duration: dur, easing: 'cubic-bezier(0,0.8,0.2,1)', fill: 'forwards' })
      .onfinish = () => s.remove();
    }
  }

  // ---- Ambient energy particles ----
  function emitEnergyOrb() {
    const orb = document.createElement('div');
    const size = 4 + Math.random() * 6;
    const startX = Math.random() * mascotContainer.offsetWidth;
    const startY = mascotContainer.offsetHeight * 0.8;
    
    orb.style.cssText = `
      position:absolute;width:${size}px;height:${size}px;
      background:radial-gradient(circle,#00E676,#4CAF50);
      border-radius:50%;left:${startX}px;top:${startY}px;
      box-shadow:0 0 ${size*3}px rgba(0,230,118,0.5);
      pointer-events:none;z-index:5;
    `;
    sparkleContainer.appendChild(orb);
    
    const drift = (Math.random() - 0.5) * 100;
    orb.animate([
      { transform: 'translateY(0) scale(1)', opacity: 0.8 },
      { transform: `translateY(-${150 + Math.random()*100}px) translateX(${drift}px) scale(0)`, opacity: 0 }
    ], { duration: 2000 + Math.random() * 2000, easing: 'ease-out', fill: 'forwards' })
    .onfinish = () => orb.remove();
  }

  // ---- Circuit pulse lines ----
  function emitCircuitPulse() {
    const line = document.createElement('div');
    const isVert = Math.random() > 0.5;
    const len = 15 + Math.random() * 40;
    const x = Math.random() * mascotContainer.offsetWidth;
    const y = Math.random() * mascotContainer.offsetHeight;
    
    line.style.cssText = `
      position:absolute;left:${x}px;top:${y}px;
      width:${isVert?2:len}px;height:${isVert?len:2}px;
      background:linear-gradient(${isVert?'180deg':'90deg'},transparent,#00E676,transparent);
      opacity:0;pointer-events:none;border-radius:1px;z-index:5;
    `;
    sparkleContainer.appendChild(line);
    
    line.animate([
      { opacity: 0, transform: 'scaleX(0)' },
      { opacity: 0.5, transform: 'scaleX(1)' },
      { opacity: 0, transform: 'scaleX(1)' }
    ], { duration: 1200 + Math.random() * 800, easing: 'ease-in-out', fill: 'forwards' })
    .onfinish = () => line.remove();
  }

  // ---- Speech bubble ----
  const speechBubble = document.createElement('div');
  speechBubble.className = 'mascot-speech';
  speechBubble.style.cssText = `
    position:absolute;top:-15px;left:50%;
    transform:translateX(-50%) scale(0);
    background:rgba(15,23,42,0.95);border:1px solid rgba(46,125,50,0.5);
    border-radius:16px;padding:10px 18px;font-family:'Inter',sans-serif;
    font-size:0.85rem;color:#E2E8F0;white-space:nowrap;z-index:20;
    backdrop-filter:blur(10px);box-shadow:0 4px 20px rgba(0,0,0,0.3),0 0 20px rgba(46,125,50,0.15);
    transition:transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275),opacity 0.3s ease;
    opacity:0;pointer-events:none;
  `;
  mascotContainer.appendChild(speechBubble);

  const phrases = [
    '♻️ ¡Recicla con nosotros!',
    '🔒 Tus datos están seguros',
    '🌍 Cuidemos el planeta',
    '⚡ ¡Cotiza ahora!',
    '🤖 ¡Hola! Soy Keysertron',
    '📦 Recogemos tus equipos',
    '✅ Certificación ISO 14001',
    '💚 +5,000 ton recicladas'
  ];
  let phraseIdx = 0;

  function showSpeech(text, dur = 2500) {
    speechBubble.textContent = text || phrases[phraseIdx++ % phrases.length];
    speechBubble.style.transform = 'translateX(-50%) scale(1)';
    speechBubble.style.opacity = '1';
    setTimeout(() => {
      speechBubble.style.transform = 'translateX(-50%) scale(0)';
      speechBubble.style.opacity = '0';
    }, dur);
  }

  // ---- Frame switching with crossfade ----
  function switchFrame(frameIndex) {
    if (frameIndex === currentFrame || !frames[frameIndex]) return;
    currentFrame = frameIndex;
    
    // Smooth crossfade: create overlay image and fade
    const overlay = document.createElement('img');
    overlay.src = frames[frameIndex];
    overlay.style.cssText = `
      position:absolute;top:0;left:0;width:100%;height:100%;
      object-fit:contain;opacity:0;transition:opacity 0.3s ease;
      pointer-events:none;z-index:2;
    `;
    mascotContainer.appendChild(overlay);
    
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      mascot.src = frames[frameIndex];
      setTimeout(() => overlay.remove(), 350);
    });
  }

  // ---- Mouse tracking ----
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    idleSeconds = 0;
  });

  // ---- Interactions ----
  mascot.addEventListener('mouseenter', () => {
    isHovered = true;
    switchFrame(1); // Wave when hovered
    idleSeconds = 0;
  });

  mascot.addEventListener('mouseleave', () => {
    isHovered = false;
    switchFrame(0); // Back to idle
  });

  mascot.addEventListener('click', (e) => {
    const now = Date.now();
    const rect = mascotContainer.getBoundingClientRect();
    const lx = e.clientX - rect.left;
    const ly = e.clientY - rect.top;

    if (now - lastClickTime < 400) {
      // Double click = flex power pose + big sparkle burst
      switchFrame(2);
      emitSparkles(lx, ly, 16, '#00E676');
      emitSparkles(lx, ly, 8, '#4CAF50');
      showSpeech('🎉 ¡Juntos hacemos la diferencia!');
      velY = -12;
      setTimeout(() => switchFrame(0), 2000);
    } else {
      // Single click = wave + sparkle
      switchFrame(1);
      emitSparkles(lx, ly, 10);
      showSpeech();
      velY = -5;
      setTimeout(() => { if (!isHovered) switchFrame(0); }, 1800);
    }
    
    lastClickTime = now;
  });

  // ---- Main animation loop ----
  function animate() {
    const dt = 0.016;
    time += dt;
    
    // ---- Automatic pose sequence ----
    if (!isHovered) {
      sequenceTimer += dt;
      const currentSeq = animationSequence[sequenceIndex];
      
      if (sequenceTimer >= currentSeq.duration) {
        sequenceTimer = 0;
        sequenceIndex = (sequenceIndex + 1) % animationSequence.length;
        const nextSeq = animationSequence[sequenceIndex];
        switchFrame(nextSeq.pose);
        
        // Add movement based on pose
        if (nextSeq.label === 'walk') {
          velX += (Math.random() > 0.5 ? 3 : -3);
          velY -= 2;
        } else if (nextSeq.label === 'wave') {
          velY -= 3;
        } else if (nextSeq.label === 'flex') {
          velY -= 4;
          emitSparkles(mascotContainer.offsetWidth/2, mascotContainer.offsetHeight/2, 6);
        }
      }
    }

    // ---- Floating motion (complex oscillation) ----
    const float1 = Math.sin(time * 1.3) * 12;
    const float2 = Math.sin(time * 2.1 + 1) * 5;
    const float3 = Math.cos(time * 0.8) * 3;
    const floatY = float1 + float2 + float3;
    const floatX = Math.sin(time * 0.9) * 8 + Math.cos(time * 1.7) * 4;

    // ---- Mouse parallax (look-at) ----
    const rect = mascotContainer.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (mouseX - cx) / window.innerWidth;
    const dy = (mouseY - cy) / window.innerHeight;
    
    const targetX = dx * 30;
    const targetRot = dx * 8;
    const targetScale = isHovered ? 1.08 : 1 + Math.sin(time * 1.2) * 0.02;

    // ---- Spring physics ----
    const spring = 0.05;
    const damp = 0.88;

    velX += (targetX - posX) * spring;
    velY += (0 - posY) * spring;
    velX *= damp;
    velY *= damp;
    posX += velX;
    posY += velY;

    rotation += (targetRot - rotation) * 0.06;
    scale += (targetScale - scale) * 0.08;

    // ---- Apply transform ----
    const totalX = posX + floatX;
    const totalY = posY + floatY;
    mascot.style.transform = `translate(${totalX}px, ${totalY}px) rotate(${rotation}deg) scale(${scale})`;

    // ---- Update glow ----
    const glow = mascotContainer.querySelector('.mascot-glow');
    if (glow) {
      glow.style.left = (50 + totalX * 0.15) + '%';
      glow.style.top = (50 + totalY * 0.15) + '%';
    }

    // ---- Update shadow ----
    const shadow = mascotContainer.querySelector('.mascot-shadow');
    if (shadow) {
      const sy = 1 - Math.abs(floatY) / 25;
      shadow.style.transform = `translateX(${-50 + totalX * 0.3}%) scaleX(${Math.max(0.5, sy)})`;
      shadow.style.opacity = Math.max(0.15, 0.45 - Math.abs(floatY) / 40);
    }

    // ---- Ambient particles ----
    if (Math.random() < 0.012) emitEnergyOrb();
    if (Math.random() < 0.006) emitCircuitPulse();

    // ---- Idle speech ----
    idleSeconds += dt;
    if (idleSeconds > 10) {
      showSpeech();
      idleSeconds = 0;
    }

    requestAnimationFrame(animate);
  }

  // ---- Entrance animation ----
  mascot.style.transform = 'translate(80px, 60px) scale(0.3) rotate(15deg)';
  mascot.style.opacity = '0';
  
  setTimeout(() => {
    mascot.style.transition = 'transform 1.2s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.8s ease';
    mascot.style.opacity = '1';
    mascot.style.transform = 'translate(0,0) scale(1) rotate(0deg)';
    
    setTimeout(() => {
      mascot.style.transition = 'none';
      emitSparkles(mascotContainer.offsetWidth/2, mascotContainer.offsetHeight/2, 14);
      setTimeout(() => showSpeech('👋 ¡Hola! Soy Keysertron'), 1000);
      animate();
    }, 1300);
  }, 600);

  // ---- Scroll parallax ----
  window.addEventListener('scroll', () => {
    velY += window.scrollY * 0.001;
  }, { passive: true });

  // ---- Touch support ----
  mascot.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    const rect = mascotContainer.getBoundingClientRect();
    switchFrame(1);
    emitSparkles(t.clientX - rect.left, t.clientY - rect.top, 8);
    showSpeech();
    velY -= 5;
    setTimeout(() => switchFrame(0), 2000);
  }, { passive: true });

})();
