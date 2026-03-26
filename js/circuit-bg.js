/* =============================================
   KEYSERTRON - Animated Circuit Board Background
   Canvas-based PCB trace renderer with glow effects
   ============================================= */

(function () {
  'use strict';

  const canvas = document.getElementById('circuit-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;
  let nodes = [];
  let connections = [];
  let pulses = [];
  let mouse = { x: -1000, y: -1000 };
  let time = 0;

  // ---- Configuration ----
  const CONFIG = {
    nodeCount: 30,
    connectionDistance: 150,
    nodeRadius: 2.5,
    lineWidth: 1,
    pulseSpeed: 120,
    pulseLength: 40,
    baseColor: 'rgba(46, 125, 50, 0.15)',
    glowColor: 'rgba(0, 230, 118, 0.6)',
    nodeColor: 'rgba(76, 175, 80, 0.4)',
    activeNodeColor: 'rgba(0, 230, 118, 0.9)',
    mouseRadius: 160,
    gridSpacing: 60,
  };

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initNodes();
  }

  function initNodes() {
    nodes = [];
    connections = [];

    // Create grid-aligned nodes (PCB style)
    const cols = Math.ceil(W / CONFIG.gridSpacing) + 2;
    const rows = Math.ceil(H / CONFIG.gridSpacing) + 2;

    for (let i = 0; i < CONFIG.nodeCount; i++) {
      // Snap to approximate grid with some randomness
      const gx = Math.floor(Math.random() * cols) * CONFIG.gridSpacing;
      const gy = Math.floor(Math.random() * rows) * CONFIG.gridSpacing;
      nodes.push({
        x: gx + (Math.random() - 0.5) * 10,
        y: gy + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        baseX: gx,
        baseY: gy,
        radius: CONFIG.nodeRadius + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        type: Math.random() > 0.7 ? 'chip' : 'node', // some are "chip" nodes (larger)
      });
    }

    // Build orthogonal connections (PCB traces go horizontal/vertical)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = Math.abs(nodes[i].x - nodes[j].x);
        const dy = Math.abs(nodes[i].y - nodes[j].y);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectionDistance && Math.random() > 0.5) {
          // Create L-shaped connections (PCB style)
          connections.push({
            from: i,
            to: j,
            type: Math.random() > 0.5 ? 'h-first' : 'v-first',
            opacity: 0.08 + Math.random() * 0.12,
          });
        }
      }
    }
  }

  // ---- Draw PCB-style L-shaped connection ----
  function drawConnection(conn) {
    const a = nodes[conn.from];
    const b = nodes[conn.to];

    const midX = conn.type === 'h-first' ? b.x : a.x;
    const midY = conn.type === 'h-first' ? a.y : b.y;

    // Mouse proximity glow
    const mx1 = (a.x + midX) / 2;
    const my1 = (a.y + midY) / 2;
    const mx2 = (midX + b.x) / 2;
    const my2 = (midY + b.y) / 2;
    const d1 = Math.hypot(mouse.x - mx1, mouse.y - my1);
    const d2 = Math.hypot(mouse.x - mx2, mouse.y - my2);
    const minD = Math.min(d1, d2);
    const proximity = Math.max(0, 1 - minD / CONFIG.mouseRadius);

    const baseOp = conn.opacity + proximity * 0.3;
    const glow = proximity * 0.5;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(midX, midY);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = `rgba(46, 125, 50, ${baseOp})`;
    ctx.lineWidth = CONFIG.lineWidth + glow * 2;
    ctx.stroke();

    // Glow layer
    if (proximity > 0.1) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(midX, midY);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(0, 230, 118, ${glow * 0.3})`;
      ctx.lineWidth = CONFIG.lineWidth + glow * 6;
      ctx.stroke();
    }
  }

  // ---- Draw data pulse traveling along a connection ----
  function drawPulse(pulse) {
    const conn = connections[pulse.connIdx];
    const a = nodes[conn.from];
    const b = nodes[conn.to];

    const midX = conn.type === 'h-first' ? b.x : a.x;
    const midY = conn.type === 'h-first' ? a.y : b.y;

    // Build path points
    const path = [
      { x: a.x, y: a.y },
      { x: midX, y: midY },
      { x: b.x, y: b.y },
    ];

    // Total path length
    let totalLen = 0;
    for (let i = 1; i < path.length; i++) {
      totalLen += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
    }

    const headPos = pulse.progress * totalLen;
    const tailPos = Math.max(0, headPos - CONFIG.pulseLength);

    // Find point at distance along path
    function pointAt(dist) {
      let accum = 0;
      for (let i = 1; i < path.length; i++) {
        const segLen = Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
        if (accum + segLen >= dist) {
          const t = (dist - accum) / segLen;
          return {
            x: path[i - 1].x + (path[i].x - path[i - 1].x) * t,
            y: path[i - 1].y + (path[i].y - path[i - 1].y) * t,
          };
        }
        accum += segLen;
      }
      return path[path.length - 1];
    }

    const head = pointAt(headPos);
    const tail = pointAt(tailPos);

    const gradient = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
    gradient.addColorStop(0, 'rgba(0, 230, 118, 0)');
    gradient.addColorStop(0.7, 'rgba(0, 230, 118, 0.7)');
    gradient.addColorStop(1, 'rgba(0, 230, 118, 1)');

    // Draw pulse trail  
    ctx.beginPath();
    ctx.moveTo(tail.x, tail.y);

    // Interpolate along path segments between tail and head
    let accum = 0;
    let started = false;
    for (let i = 1; i < path.length; i++) {
      const segLen = Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
      const segEnd = accum + segLen;

      if (segEnd >= tailPos && !started) {
        started = true;
      }
      if (started && accum <= headPos) {
        const endP = segEnd <= headPos ? path[i] : pointAt(headPos);
        ctx.lineTo(endP.x, endP.y);
      }
      if (segEnd >= headPos) break;
      accum += segLen;
    }

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glow at head
    ctx.beginPath();
    ctx.arc(head.x, head.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 230, 118, 0.8)';
    ctx.fill();

    // Outer glow
    ctx.beginPath();
    ctx.arc(head.x, head.y, 10, 0, Math.PI * 2);
    const radGrad = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 10);
    radGrad.addColorStop(0, 'rgba(0, 230, 118, 0.4)');
    radGrad.addColorStop(1, 'rgba(0, 230, 118, 0)');
    ctx.fillStyle = radGrad;
    ctx.fill();
  }

  // ---- Draw node ----
  function drawNode(node) {
    const dist = Math.hypot(mouse.x - node.x, mouse.y - node.y);
    const proximity = Math.max(0, 1 - dist / CONFIG.mouseRadius);
    const pulse = Math.sin(time * 2 + node.phase) * 0.3 + 0.7;

    const r = node.radius * (1 + proximity * 0.8);
    const alpha = (0.3 + proximity * 0.7) * pulse;

    if (node.type === 'chip') {
      // Draw as small square (IC chip pad)
      const s = r * 2.5;
      ctx.fillStyle = `rgba(76, 175, 80, ${alpha * 0.5})`;
      ctx.fillRect(node.x - s / 2, node.y - s / 2, s, s);
      ctx.strokeStyle = `rgba(0, 230, 118, ${alpha * 0.8})`;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(node.x - s / 2, node.y - s / 2, s, s);
    } else {
      // Draw as circle (via pad)
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(76, 175, 80, ${alpha * 0.6})`;
      ctx.fill();
    }

    // Glow for active nodes
    if (proximity > 0.3) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r * 3, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 3);
      g.addColorStop(0, `rgba(0, 230, 118, ${proximity * 0.3})`);
      g.addColorStop(1, 'rgba(0, 230, 118, 0)');
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  // ---- Animation loop ----
  function animate() {
    const dt = 0.016;
    time += dt;

    ctx.clearRect(0, 0, W, H);

    // Subtle drift of nodes
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      // Spring back to base
      n.vx += (n.baseX - n.x) * 0.001;
      n.vy += (n.baseY - n.y) * 0.001;
      n.vx *= 0.99;
      n.vy *= 0.99;
    });

    // Draw connections
    connections.forEach(drawConnection);

    // Draw nodes
    nodes.forEach(drawNode);

    // Spawn random pulses
    if (Math.random() < 0.02 && connections.length > 0) {
      pulses.push({
        connIdx: Math.floor(Math.random() * connections.length),
        progress: 0,
        speed: 0.008 + Math.random() * 0.012,
      });
    }

    // Update and draw pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      pulses[i].progress += pulses[i].speed;
      if (pulses[i].progress > 1.3) {
        pulses.splice(i, 1);
      } else {
        drawPulse(pulses[i]);
      }
    }

    requestAnimationFrame(animate);
  }

  // ---- Mouse tracking ----
  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY + window.scrollY;
  });

  window.addEventListener('scroll', () => {
    // Offset mouse position with scroll for fixed canvas
  }, { passive: true });

  // ---- Init ----
  window.addEventListener('resize', resize);
  resize();
  animate();
})();
