import React, { useEffect, useRef } from 'react';
import styles from './FoggyGlassOverlay.module.css';

const MASK_SCALE = 0.5;
const BLUR_SCALE = 0.22;
const WAIT_BEFORE_REFILL_MS = 2800; // Wait ~2.8s after user stops rubbing before refilling
const REFILL_STEP_MS = 85;
const REFILL_ALPHA = 0.017; // Gentle natural mist recovery (~8-9s once wait expires)
const CURSOR_DAMPING = 7.2;

function createNoisePattern(ctx) {
  const tile = document.createElement('canvas');
  tile.width = 256;
  tile.height = 256;
  const tctx = tile.getContext('2d');
  const img = tctx.createImageData(256, 256);
  const data = img.data;

  for (let i = 0; i < data.length; i += 4) {
    const grain = Math.random();
    if (grain > 0.65) {
      const lum = 228 + Math.floor(Math.random() * 27);
      data[i] = lum;
      data[i + 1] = lum + 2;
      data[i + 2] = lum + 1;
      data[i + 3] = Math.floor((grain - 0.65) * 95);
    } else {
      data[i] = 222;
      data[i + 1] = 234;
      data[i + 2] = 229;
      data[i + 3] = 9;
    }
  }
  tctx.putImageData(img, 0, 0);
  return ctx.createPattern(tile, 'repeat');
}

function createCloudMistCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const cctx = c.getContext('2d');

  // Subtle organic uneven mist patches (thicker near edges, airy near center pond)
  const patches = [
    { x: w * 0.12, y: h * 0.45, r: Math.max(w, h) * 0.36, a: 0.24 },
    { x: w * 0.88, y: h * 0.52, r: Math.max(w, h) * 0.36, a: 0.24 },
    { x: w * 0.28, y: h * 0.86, r: Math.max(w, h) * 0.34, a: 0.22 },
    { x: w * 0.78, y: h * 0.18, r: Math.max(w, h) * 0.30, a: 0.18 },
    { x: w * 0.18, y: h * 0.16, r: Math.max(w, h) * 0.28, a: 0.18 },
  ];

  patches.forEach((p) => {
    const g = cctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    g.addColorStop(0, `rgba(224, 238, 232, ${p.a})`);
    g.addColorStop(0.6, `rgba(216, 232, 226, ${p.a * 0.45})`);
    g.addColorStop(1, 'rgba(216, 232, 226, 0)');
    cctx.fillStyle = g;
    cctx.fillRect(0, 0, w, h);
  });

  return c;
}

function createMicroBeads(w, h) {
  const count = Math.min(85, Math.max(28, Math.floor((w * h) / 22000)));
  const beads = [];
  for (let i = 0; i < count; i += 1) {
    beads.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1.1 + Math.random() * 2.2,
      alpha: 0.16 + Math.random() * 0.24,
    });
  }
  return beads;
}

function spawnDroplet(w, h, initial = false) {
  const r = 4.2 + Math.random() * 5.2;
  return {
    x: Math.random() * w,
    y: initial ? Math.random() * h : -14 - Math.random() * 70,
    r,
    vy: 5 + Math.random() * 11,
    vx: 0,
    baseSpeed: 11 + Math.random() * 18 + r * 2.0,
    wobblePhase: Math.random() * Math.PI * 2,
    wobbleFreq: 0.018 + Math.random() * 0.025,
    pauseTimer: initial && Math.random() < 0.4 ? Math.random() * 1.4 : 0,
    trail: [],
  };
}

function computeCoverCrop(srcW, srcH, dstW, dstH) {
  const srcRatio = srcW / srcH;
  const dstRatio = dstW / dstH;
  if (dstRatio > srcRatio) {
    const sw = srcW;
    const sh = srcW / dstRatio;
    return { sx: 0, sy: (srcH - sh) * 0.5, sw, sh };
  }
  const sh = srcH;
  const sw = srcH * dstRatio;
  return { sx: (srcW - sw) * 0.5, sy: 0, sw, sh };
}

export default function FoggyGlassOverlay({ videoRef, posterSrc = '/bg/bgPoster.webp', reducedMotion = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    const maskCanvas = document.createElement('canvas');
    const maskCtx = maskCanvas.getContext('2d');

    const blurCanvas = document.createElement('canvas');
    const blurCtx = blurCanvas.getContext('2d');

    const tinyCanvas = document.createElement('canvas');
    const tinyCtx = tinyCanvas.getContext('2d');

    const frostCanvas = document.createElement('canvas');
    const frostCtx = frostCanvas.getContext('2d');

    const supportsFilter = typeof blurCtx.filter === 'string';
    const noisePattern = createNoisePattern(frostCtx);

    const posterImg = new Image();
    posterImg.src = posterSrc;

    let width = 0;
    let height = 0;
    let cloudMist = null;
    let droplets = [];
    let microBeads = [];
    let targetPointer = null;
    let smoothPointer = null;
    let rafId = 0;
    let lastTime = performance.now();
    let lastUserRubAt = 0;
    let refillAccum = 0;

    const setupSize = () => {
      const rect = canvas.getBoundingClientRect();
      const nextW = Math.max(1, Math.round(rect.width));
      const nextH = Math.max(1, Math.round(rect.height));
      if (nextW === width && nextH === height) return;

      width = nextW;
      height = nextH;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      frostCanvas.width = width;
      frostCanvas.height = height;

      maskCanvas.width = Math.max(1, Math.round(width * MASK_SCALE));
      maskCanvas.height = Math.max(1, Math.round(height * MASK_SCALE));
      maskCtx.globalCompositeOperation = 'source-over';
      maskCtx.fillStyle = '#ffffff';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

      blurCanvas.width = Math.max(180, Math.round(width * BLUR_SCALE));
      blurCanvas.height = Math.max(100, Math.round(height * BLUR_SCALE));

      tinyCanvas.width = Math.max(48, Math.round(width * 0.06));
      tinyCanvas.height = Math.max(28, Math.round(height * 0.06));

      cloudMist = createCloudMistCanvas(width, height);

      const dropCount = Math.min(16, Math.max(7, Math.floor(width / 115)));
      droplets = Array.from({ length: dropCount }, () => spawnDroplet(width, height, true));
      microBeads = createMicroBeads(width, height);
    };

    const eraseDropletTrail = (x, y, radius, strength = 0.78) => {
      const mx = x * MASK_SCALE;
      const my = y * MASK_SCALE;
      const mr = radius * MASK_SCALE;

      maskCtx.save();
      maskCtx.globalCompositeOperation = 'destination-out';
      const grad = maskCtx.createRadialGradient(mx, my, mr * 0.15, mx, my, mr);
      grad.addColorStop(0, `rgba(0, 0, 0, ${strength})`);
      grad.addColorStop(0.7, `rgba(0, 0, 0, ${strength * 0.55})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      maskCtx.fillStyle = grad;
      maskCtx.beginPath();
      maskCtx.arc(mx, my, mr, 0, Math.PI * 2);
      maskCtx.fill();
      maskCtx.restore();
    };

    // Hand / duster rubbing stamp: tilted broad cloth ellipse with parallel fiber streaks
    const stampDusterRub = (x, y, angle, rx, ry, strength = 0.52) => {
      const mx = x * MASK_SCALE;
      const my = y * MASK_SCALE;
      const mrx = rx * MASK_SCALE;
      const mry = ry * MASK_SCALE;

      maskCtx.save();
      maskCtx.translate(mx, my);
      maskCtx.rotate(angle);
      maskCtx.globalCompositeOperation = 'destination-out';

      // Soft wide palm / cloth base smudge
      maskCtx.save();
      maskCtx.scale(1, mry / mrx);
      const baseGrad = maskCtx.createRadialGradient(0, 0, mrx * 0.1, 0, 0, mrx);
      baseGrad.addColorStop(0, `rgba(0, 0, 0, ${strength * 0.72})`);
      baseGrad.addColorStop(0.55, `rgba(0, 0, 0, ${strength * 0.42})`);
      baseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      maskCtx.fillStyle = baseGrad;
      maskCtx.beginPath();
      maskCtx.arc(0, 0, mrx, 0, Math.PI * 2);
      maskCtx.fill();
      maskCtx.restore();

      // Longitudinal duster / finger-ridge streaks inside the rub width
      const streakOffsets = [-0.62, -0.32, -0.04, 0.26, 0.56];
      for (let s = 0; s < streakOffsets.length; s += 1) {
        const sy = streakOffsets[s] * mry;
        const streakLen = mrx * (0.75 + (s % 2) * 0.18);
        const streakThick = mry * (0.16 + (s % 3) * 0.04);
        maskCtx.save();
        maskCtx.translate(0, sy);
        maskCtx.scale(1, streakThick / streakLen);
        const sg = maskCtx.createRadialGradient(0, 0, 0, 0, 0, streakLen);
        sg.addColorStop(0, `rgba(0, 0, 0, ${strength * 0.58})`);
        sg.addColorStop(0.7, `rgba(0, 0, 0, ${strength * 0.25})`);
        sg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        maskCtx.fillStyle = sg;
        maskCtx.beginPath();
        maskCtx.arc(0, 0, streakLen, 0, Math.PI * 2);
        maskCtx.fill();
        maskCtx.restore();
      }

      maskCtx.restore();
    };

    const rubGlassSegment = (x0, y0, x1, y1) => {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const steps = Math.max(1, Math.ceil(dist / 12));

      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const px = x0 + dx * t;
        const py = y0 + dy * t;
        // Broad palm/duster footprint (~135px wide x 90px tall)
        stampDusterRub(px, py, angle, 68, 46, 0.44);
      }

      // Gently nudge droplets caught under the hand/duster sweep
      for (let i = 0; i < droplets.length; i += 1) {
        const d = droplets[i];
        if (Math.hypot(d.x - x1, d.y - y1) < 72) {
          d.vx += dx * 0.08;
          d.vy = Math.max(d.vy, d.baseSpeed * 1.15);
          d.pauseTimer = 0;
        }
      }
    };

    const getLocalCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handlePointerMove = (e) => {
      const pt = getLocalCoords(e);
      lastUserRubAt = performance.now();
      if (!smoothPointer) {
        smoothPointer = { ...pt };
        stampDusterRub(pt.x, pt.y, 0, 64, 44, 0.46);
      }
      targetPointer = pt;
    };

    const handlePointerDown = (e) => {
      const pt = getLocalCoords(e);
      lastUserRubAt = performance.now();
      targetPointer = pt;
      if (!smoothPointer) smoothPointer = { ...pt };
      stampDusterRub(pt.x, pt.y, 0, 70, 48, 0.56);
    };

    const handlePointerLeave = () => {
      targetPointer = null;
      smoothPointer = null;
    };

    const drawDroplet = (d) => {
      if (d.trail.length > 2) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(d.trail[0].x, d.trail[0].y);
        for (let i = 1; i < d.trail.length; i += 1) {
          ctx.lineTo(d.trail[i].x, d.trail[i].y);
        }
        ctx.strokeStyle = 'rgba(230, 246, 240, 0.15)';
        ctx.lineWidth = Math.max(1, d.r * 0.52);
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
      }

      const speedFactor = Math.min(1.42, 1 + d.vy / 260);
      const rx = d.r * (1 / Math.sqrt(speedFactor));
      const ry = d.r * speedFactor;

      ctx.save();
      ctx.translate(d.x, d.y);

      ctx.beginPath();
      ctx.ellipse(1.2, 2.2, rx * 1.04, ry * 1.04, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(4, 18, 12, 0.34)';
      ctx.fill();

      const bodyGrad = ctx.createRadialGradient(-rx * 0.25, -ry * 0.3, rx * 0.1, 0, 0, Math.max(rx, ry));
      bodyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
      bodyGrad.addColorStop(0.55, 'rgba(185, 224, 212, 0.14)');
      bodyGrad.addColorStop(0.88, 'rgba(235, 250, 245, 0.38)');
      bodyGrad.addColorStop(1, 'rgba(255, 255, 255, 0.55)');

      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, ry * 0.16, rx * 0.72, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = Math.max(0.8, rx * 0.22);
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(-rx * 0.34, -ry * 0.34, Math.max(0.9, rx * 0.26), Math.max(0.7, ry * 0.19), -0.45, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.fill();

      ctx.restore();
    };

    const renderFrame = (now) => {
      if (document.hidden) {
        lastTime = now;
        rafId = requestAnimationFrame(renderFrame);
        return;
      }

      const dtMs = Math.min(50, Math.max(4, now - lastTime));
      const dt = dtMs / 1000;
      lastTime = now;

      if (!width || !height) {
        setupSize();
      }

      // 0. Smooth weighted hand/duster rub following pointer
      if (targetPointer && smoothPointer) {
        const lerp = 1 - Math.exp(-CURSOR_DAMPING * dt);
        const nextX = smoothPointer.x + (targetPointer.x - smoothPointer.x) * lerp;
        const nextY = smoothPointer.y + (targetPointer.y - smoothPointer.y) * lerp;
        if (Math.hypot(nextX - smoothPointer.x, nextY - smoothPointer.y) > 0.7) {
          lastUserRubAt = now;
          rubGlassSegment(smoothPointer.x, smoothPointer.y, nextX, nextY);
          smoothPointer.x = nextX;
          smoothPointer.y = nextY;
        }
      }

      // 1. Wait ~2.8s after user stops rubbing before condensation refills
      if (now - lastUserRubAt >= WAIT_BEFORE_REFILL_MS) {
        refillAccum += dtMs;
        if (refillAccum >= REFILL_STEP_MS) {
          const steps = Math.floor(refillAccum / REFILL_STEP_MS);
          refillAccum -= steps * REFILL_STEP_MS;
          const combinedAlpha = Math.min(0.35, 1 - Math.pow(1 - REFILL_ALPHA, steps));
          maskCtx.save();
          maskCtx.globalCompositeOperation = 'source-over';
          maskCtx.fillStyle = `rgba(255, 255, 255, ${combinedAlpha.toFixed(4)})`;
          maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
          maskCtx.restore();
        }
      } else {
        refillAccum = 0;
      }

      // 2. Update sliding droplets & carve glistening trails in fog mask
      for (let i = 0; i < droplets.length; i += 1) {
        const d = droplets[i];

        if (d.pauseTimer > 0) {
          d.pauseTimer -= dt;
        } else {
          const wobble = Math.sin(d.y * d.wobbleFreq + d.wobblePhase) * 9;
          d.vx = d.vx * 0.93 + wobble * 0.07;
          d.vy = Math.min(d.baseSpeed * 1.45, d.vy + (11 + d.r * 1.5) * dt);

          d.x += d.vx * dt;
          d.y += d.vy * dt;

          if (Math.random() < 0.01 && d.y > 40 && d.y < height - 60) {
            d.pauseTimer = 0.28 + Math.random() * 0.58;
            d.vy *= 0.25;
          }

          eraseDropletTrail(d.x, d.y, Math.max(5.5, d.r * 1.55), 0.78);
          d.trail.push({ x: d.x, y: d.y });
          if (d.trail.length > 26) d.trail.shift();
        }

        if (d.y > height + 24 || d.x < -30 || d.x > width + 30) {
          droplets[i] = spawnDroplet(width, height, false);
        }
      }

      // 3. Capture & blur live background frame (video when ready, poster image at t=0)
      const video = videoRef?.current;
      const hasVideo = video && video.readyState >= 2 && video.videoWidth > 0;
      const source = hasVideo ? video : (posterImg.complete && posterImg.naturalWidth > 0 ? posterImg : null);
      const srcW = hasVideo ? video.videoWidth : (source ? source.naturalWidth : 1920);
      const srcH = hasVideo ? video.videoHeight : (source ? source.naturalHeight : 1080);

      frostCtx.clearRect(0, 0, width, height);
      frostCtx.save();

      if (source) {
        const { sx, sy, sw, sh } = computeCoverCrop(srcW, srcH, width, height);
        blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);

        if (supportsFilter) {
          blurCtx.filter = 'blur(5.5px) brightness(1.05) saturate(1.1)';
          blurCtx.drawImage(source, sx, sy, sw, sh, 0, 0, blurCanvas.width, blurCanvas.height);
          blurCtx.filter = 'none';
        } else {
          tinyCtx.imageSmoothingEnabled = true;
          tinyCtx.drawImage(source, sx, sy, sw, sh, 0, 0, tinyCanvas.width, tinyCanvas.height);
          blurCtx.imageSmoothingEnabled = true;
          blurCtx.drawImage(tinyCanvas, 0, 0, blurCanvas.width, blurCanvas.height);
        }

        frostCtx.imageSmoothingEnabled = true;
        frostCtx.drawImage(blurCanvas, 0, 0, width, height);
      } else {
        frostCtx.fillStyle = 'rgba(20, 44, 34, 0.72)';
        frostCtx.fillRect(0, 0, width, height);
      }

      // Light condensation glaze + organic cloud density + frost grain
      frostCtx.fillStyle = 'rgba(222, 236, 231, 0.16)';
      frostCtx.fillRect(0, 0, width, height);

      if (cloudMist) {
        frostCtx.drawImage(cloudMist, 0, 0, width, height);
      }

      if (noisePattern) {
        frostCtx.fillStyle = noisePattern;
        frostCtx.fillRect(0, 0, width, height);
      }

      for (let i = 0; i < microBeads.length; i += 1) {
        const b = microBeads[i];
        frostCtx.fillStyle = `rgba(244, 252, 249, ${b.alpha})`;
        frostCtx.beginPath();
        frostCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        frostCtx.fill();
      }

      // Apply condensation wipe mask (punches sharp hand-rubbed & droplet windows)
      frostCtx.globalCompositeOperation = 'destination-in';
      frostCtx.drawImage(maskCanvas, 0, 0, width, height);
      frostCtx.restore();

      // 4. Composite frosted glass + slipping droplets
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(frostCanvas, 0, 0, width, height);

      for (let i = 0; i < droplets.length; i += 1) {
        drawDroplet(droplets[i]);
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    setupSize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(setupSize) : null;
    if (ro) ro.observe(canvas);
    window.addEventListener('resize', setupSize);

    canvas.addEventListener('pointermove', handlePointerMove, { passive: true });
    canvas.addEventListener('pointerdown', handlePointerDown, { passive: true });
    canvas.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', setupSize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [posterSrc, reducedMotion, videoRef]);

  if (reducedMotion) {
    return <div className={styles.staticFrost} aria-hidden="true" />;
  }

  return (
    <canvas
      ref={canvasRef}
      className={styles.fogCanvas}
      aria-label="Interactive frosted glass surface — rub cursor to clear mist"
    />
  );
}
