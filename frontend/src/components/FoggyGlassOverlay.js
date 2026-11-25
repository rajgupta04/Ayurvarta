import React, { useEffect, useRef } from 'react';
import styles from './FoggyGlassOverlay.module.css';

const BLUR_SCALE = 0.22;
const SIM_MAX_WIDTH = 420;
const BASE_FOG = 0.86; // Leaves headroom up to 1.0 so pushed-up wipe rims visibly thicken
const DWELL_WAIT_SEC = 2.6;

function createNoisePattern(ctx) {
  const tile = document.createElement('canvas');
  tile.width = 256;
  tile.height = 256;
  const tctx = tile.getContext('2d');
  const img = tctx.createImageData(256, 256);
  const data = img.data;

  for (let i = 0; i < data.length; i += 4) {
    const grain = Math.random();
      if (grain > 0.64) {
        const lum = 228 + Math.floor(Math.random() * 27);
        data[i] = lum;
        data[i + 1] = lum + 2;
        data[i + 2] = lum + 1;
        data[i + 3] = Math.floor((grain - 0.64) * 95);
      } else {
        data[i] = 222;
        data[i + 1] = 234;
        data[i + 2] = 229;
        data[i + 3] = 8;
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

  // Smooth multi-octave value noise for natural heterogeneous glass condensation
  function buildGlassGrainField(simW, simH) {
    const len = simW * simH;
    const out = new Float32Array(len);

    const coarseW = Math.max(8, Math.ceil(simW / 12));
    const coarseH = Math.max(6, Math.ceil(simH / 12));
    const coarse = new Float32Array(coarseW * coarseH);
    for (let i = 0; i < coarse.length; i += 1) coarse[i] = Math.random();

    const medW = Math.max(16, Math.ceil(simW / 4));
    const medH = Math.max(12, Math.ceil(simH / 4));
    const med = new Float32Array(medW * medH);
    for (let i = 0; i < med.length; i += 1) med[i] = Math.random();

    const sampleBilinear = (grid, gw, gh, u, v) => {
      const gx = Math.min(gw - 1.001, Math.max(0, u * (gw - 1)));
      const gy = Math.min(gh - 1.001, Math.max(0, v * (gh - 1)));
      const x0 = Math.floor(gx);
      const y0 = Math.floor(gy);
      const fx = gx - x0;
      const fy = gy - y0;
      const i00 = y0 * gw + x0;
      const i10 = i00 + 1;
      const i01 = i00 + gw;
      const i11 = i01 + 1;
      const top = grid[i00] + (grid[i10] - grid[i00]) * fx;
      const bot = grid[i01] + (grid[i11] - grid[i01]) * fx;
      return top + (bot - top) * fy;
    };

    for (let y = 0; y < simH; y += 1) {
      const v = y / Math.max(1, simH - 1);
      for (let x = 0; x < simW; x += 1) {
        const u = x / Math.max(1, simW - 1);
        const c = sampleBilinear(coarse, coarseW, coarseH, u, v);
        const m = sampleBilinear(med, medW, medH, u, v);
        const f = Math.random();
        out[y * simW + x] = c * 0.55 + m * 0.30 + f * 0.15;
      }
    }
    return out;
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

      const wetCanvas = document.createElement('canvas');
      const wetCtx = wetCanvas.getContext('2d');

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
      let simW = 0;
      let simH = 0;
      let scaleX = 1;
      let scaleY = 1;

      // Physical condensation simulation buffers
      let fogField = null;
      let fogPrev = null;
      let wetField = null;
      let cooldownField = null;
      let grainField = null;
      let maskImgData = null;
      let wetImgData = null;

      let cloudMist = null;
      let droplets = [];
      let microBeads = [];
      let lastPointer = null;
      let strokePhase = Math.random() * 10;
      let rafId = 0;
      let lastTime = performance.now();

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

        // Simulation grid (~420px wide): fast enough for 60fps PDE physics, crisp enough for trails
        simW = Math.max(180, Math.min(SIM_MAX_WIDTH, Math.round(width * 0.34)));
        simH = Math.max(120, Math.round((simW * height) / width));
        scaleX = simW / width;
        scaleY = simH / height;

        maskCanvas.width = simW;
        maskCanvas.height = simH;
        wetCanvas.width = simW;
        wetCanvas.height = simH;

        const len = simW * simH;
        fogField = new Float32Array(len);
        fogPrev = new Float32Array(len);
        wetField = new Float32Array(len);
        cooldownField = new Float32Array(len);
        grainField = buildGlassGrainField(simW, simH);

        fogField.fill(BASE_FOG);
        fogPrev.fill(BASE_FOG);

        maskImgData = maskCtx.createImageData(simW, simH);
        wetImgData = wetCtx.createImageData(simW, simH);
        const baseAlpha = Math.round(BASE_FOG * 255);
        for (let i = 0; i < len; i += 1) {
          const p = i * 4;
          maskImgData.data[p] = 255;
          maskImgData.data[p + 1] = 255;
          maskImgData.data[p + 2] = 255;
          maskImgData.data[p + 3] = baseAlpha;

          wetImgData.data[p] = 236;
          wetImgData.data[p + 1] = 250;
          wetImgData.data[p + 2] = 245;
          wetImgData.data[p + 3] = 0;
        }

        blurCanvas.width = Math.max(180, Math.round(width * BLUR_SCALE));
        blurCanvas.height = Math.max(100, Math.round(height * BLUR_SCALE));

        tinyCanvas.width = Math.max(48, Math.round(width * 0.06));
        tinyCanvas.height = Math.max(28, Math.round(height * 0.06));

        cloudMist = createCloudMistCanvas(width, height);

        const dropCount = Math.min(16, Math.max(7, Math.floor(width / 115)));
        droplets = Array.from({ length: dropCount }, () => spawnDroplet(width, height, true));
        microBeads = createMicroBeads(width, height);
      };

        // Physical hand / cloth rub stamp on the Float32Array condensation field
        const applyHandRub = (cxCss, cyCss, angle, speedPx, pressure = 1.0) => {
          if (!fogField) return;

        const cx = cxCss * scaleX;
        const cy = cyCss * scaleY;

          // Cloth / palm oval dimensions in sim grid units (broad across stroke, tighter along)
          const rxAlong = 36 * scaleX;
          const ryAcross = 54 * scaleY;
          const maxR = Math.ceil(Math.max(rxAlong, ryAcross) * 1.38);

          const minX = Math.max(0, Math.floor(cx - maxR));
          const maxX = Math.min(simW - 1, Math.ceil(cx + maxR));
          const minY = Math.max(0, Math.floor(cy - maxR));
          const maxY = Math.min(simH - 1, Math.ceil(cy + maxR));

          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);

            // Fast sweeps leave slight natural cloth streaks; slow deliberate rubs clear deeply
            const speedFactor = Math.max(0.48, 1 - Math.min(0.45, speedPx / 1800));

            for (let y = minY; y <= maxY; y += 1) {
              const dy = y - cy;
              for (let x = minX; x <= maxX; x += 1) {
                const dx = x - cx;

                // Rotate into movement frame (along vs across the cloth/hand)
                const along = dx * cosA + dy * sinA;
                const across = -dx * sinA + dy * cosA;

                const u = along / rxAlong;
                const v = across / ryAcross;

                // Warp boundary gently so cloth/hand edge is never a rigid geometric ellipse
                const edgeWarp = 1 + 0.14 * Math.sin(v * 4.5 + strokePhase) + 0.09 * Math.cos(u * 5.0 - strokePhase * 0.7);
                const dist = Math.hypot(u, v) / edgeWarp;

                if (dist < 1.28) {
                  const idx = y * simW + x;
                  const grain = grainField[idx];

                  if (dist < 1.0) {
                    // Cloth / finger-ridge striation perpendicular to motion
                    const ridge = 0.66 + 0.34 * Math.sin(across * 0.62 + grain * 3.1 + strokePhase);
                    const falloff = (1 - dist * dist);
                    const clearAmt = falloff * ridge * speedFactor * pressure * 0.68;

                    const prevFog = fogField[idx];
                    const nextFog = Math.max(0, prevFog - clearAmt);
                    const removed = prevFog - nextFog;
                    fogField[idx] = nextFog;

                    // Leave brief wet moisture sheen where condensation was wiped
                    if (removed > 0.02) {
                      wetField[idx] = Math.min(0.9, wetField[idx] + removed * 0.48);
                    }

                    // Hold cleared spot clear (~2.6 - 3.6s based on glass grain) before re-fogging
                    cooldownField[idx] = Math.max(cooldownField[idx], DWELL_WAIT_SEC + grain * 1.0);
                  } else {
                    // Displaced moisture rim: mist pushed outward along border of hand wipe
                    const rimFactor = 1 - (dist - 1.0) / 0.28;
                    fogField[idx] = Math.min(1.0, fogField[idx] + rimFactor * 0.045 * pressure);
                  }
                }
              }
            }
          };

            const rubPath = (x0, y0, x1, y1, dtSec) => {
              const dx = x1 - x0;
              const dy = y1 - y0;
              const dist = Math.hypot(dx, dy);
              if (dist < 0.5) return;

              const angle = Math.atan2(dy, dx);
              const speed = dist / Math.max(0.008, dtSec);
              const steps = Math.max(1, Math.min(18, Math.ceil(dist / 14)));

                for (let i = 1; i <= steps; i += 1) {
                  const t = i / steps;
                  applyHandRub(x0 + dx * t, y0 + dy * t, angle, speed, 1.0);
                }

                // Gently nudge droplets under the hand/duster sweep
                for (let i = 0; i < droplets.length; i += 1) {
                  const d = droplets[i];
                    if (Math.hypot(d.x - x1, d.y - y1) < 62) {
                      d.vx += dx * 0.14;
                      d.vy = Math.max(d.vy, d.baseSpeed * 1.15);
                      d.pauseTimer = 0;
                    }
                  }
                };

                const carveDropletGrid = (xCss, yCss, rCss) => {
                  if (!fogField) return;
                  const cx = xCss * scaleX;
                  const cy = yCss * scaleY;
                  const rGrid = Math.max(1.35, rCss * 0.65 * scaleX);
                  const rCeil = Math.ceil(rGrid + 1);

                  const minX = Math.max(0, Math.floor(cx - rCeil));
                  const maxX = Math.min(simW - 1, Math.ceil(cx + rCeil));
                  const minY = Math.max(0, Math.floor(cy - rCeil));
                  const maxY = Math.min(simH - 1, Math.ceil(cy + rCeil));

                  for (let y = minY; y <= maxY; y += 1) {
                    const dy = y - cy;
                    for (let x = minX; x <= maxX; x += 1) {
                      const dx = x - cx;
                      const dist = Math.hypot(dx, dy);
                      if (dist <= rGrid) {
                        const idx = y * simW + x;
                        const k = 1 - (dist / rGrid) * 0.5;
                        fogField[idx] = Math.max(0, fogField[idx] - 0.85 * k);
                        wetField[idx] = Math.min(0.95, wetField[idx] + 0.35 * k);
                        cooldownField[idx] = Math.max(cooldownField[idx], 1.2 + grainField[idx] * 0.6);
                      }
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

                let lastMoveTime = performance.now();

                const handlePointerMove = (e) => {
                  const pt = getLocalCoords(e);
                    const now = performance.now();
                    const dtSec = Math.max(0.008, (now - lastMoveTime) / 1000);
                    lastMoveTime = now;

                    if (!lastPointer) {
                      lastPointer = pt;
                      applyHandRub(pt.x, pt.y, 0, 200, 0.85);
                      return;
                    }

                    rubPath(lastPointer.x, lastPointer.y, pt.x, pt.y, dtSec);
                    lastPointer = pt;
                  };

                  const handlePointerDown = (e) => {
                    const pt = getLocalCoords(e);
                    lastMoveTime = performance.now();
                    lastPointer = pt;
                    strokePhase = Math.random() * 10;
                    applyHandRub(pt.x, pt.y, 0, 120, 1.1);
                  };

                  const handlePointerLeave = () => {
                    lastPointer = null;
                  };

                  const drawDroplet = (d) => {
                    if (d.trail.length > 2) {
                      ctx.save();
                      ctx.beginPath();
                      ctx.moveTo(d.trail[0].x, d.trail[0].y);
                      for (let i = 1; i < d.trail.length; i += 1) {
                        ctx.lineTo(d.trail[i].x, d.trail[i].y);
                      }
                      ctx.strokeStyle = 'rgba(232, 248, 242, 0.16)';
                      ctx.lineWidth = Math.max(1, d.r * 0.45);
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

                      if (!width || !height || !fogField) {
                        setupSize();
                      }

                      // 1. Update sliding droplets & carve crisp water tracks
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

                          carveDropletGrid(d.x, d.y, d.r);
                          d.trail.push({ x: d.x, y: d.y });
                          if (d.trail.length > 26) d.trail.shift();
                        }

                        if (d.y > height + 24 || d.x < -30 || d.x > width + 30) {
                          droplets[i] = spawnDroplet(width, height, false);
                        }
                      }

                      // 2. Step physical condensation diffusion + per-cell wait-then-regrow + wet evaporation
                      fogPrev.set(fogField);
                      const maskPixels = maskImgData.data;
                      const wetPixels = wetImgData.data;
                      const evapRate = dt * 0.72;
                      const len = simW * simH;

                      for (let y = 0; y < simH; y += 1) {
                        const rowOffset = y * simW;
                        const yUp = y > 0 ? -simW : 0;
                        const yDown = y < simH - 1 ? simW : 0;

                        for (let x = 0; x < simW; x += 1) {
                          const idx = rowOffset + x;

                          // Fade damp sheen left behind after wiping
                          let wVal = wetField[idx];
                          if (wVal > 0.004) {
                            wVal = Math.max(0, wVal - evapRate);
                            wetField[idx] = wVal;
                          } else {
                            wVal = 0;
                          }

                          // Per-cell wait timer before condensation refills
                          const cd = cooldownField[idx];
                          let fVal = fogPrev[idx];

                          if (cd > 0) {
                            cooldownField[idx] = Math.max(0, cd - dt);
                          } else if (fVal < BASE_FOG) {
                            const xLeft = x > 0 ? -1 : 0;
                            const xRight = x < simW - 1 ? 1 : 0;
                            const nAvg = 0.25 * (
                              fogPrev[idx + xLeft] +
                              fogPrev[idx + xRight] +
                              fogPrev[idx + yUp] +
                              fogPrev[idx + yDown]
                            );
                            // Mist creeps inward from foggy borders & blooms along uneven glass grain
                            const regrow = (0.044 + 0.155 * nAvg) * (0.45 + 0.9 * grainField[idx]) * dt;
                            fVal = Math.min(BASE_FOG, fVal + regrow);
                            fogField[idx] = fVal;
                          } else if (fVal > BASE_FOG) {
                            // Gently settle pushed-up moisture rim back toward baseline frost
                            fVal = Math.max(BASE_FOG, fVal - dt * 0.14);
                            fogField[idx] = fVal;
                          }

                          const p = idx * 4;
                          const clampedFog = fVal > 1 ? 1 : (fVal < 0 ? 0 : fVal);
                          maskPixels[p + 3] = (clampedFog * 255) | 0;
                          wetPixels[p + 3] = (wVal * 44) | 0;
                        }
                      }

                      maskCtx.putImageData(maskImgData, 0, 0);
                      wetCtx.putImageData(wetImgData, 0, 0);

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

                      // Mask frosted layer using the bilinear-smoothed physical condensation grid
                      frostCtx.globalCompositeOperation = 'destination-in';
                      frostCtx.imageSmoothingEnabled = true;
                      frostCtx.drawImage(maskCanvas, 0, 0, width, height);
                      frostCtx.restore();

                      // 4. Composite frosted glass, faint damp sheen on freshly wiped paths, and slipping droplets
                      ctx.clearRect(0, 0, width, height);
                      ctx.drawImage(frostCanvas, 0, 0, width, height);

                      ctx.save();
                      ctx.imageSmoothingEnabled = true;
                      ctx.drawImage(wetCanvas, 0, 0, width, height);
                      ctx.restore();

                      for (let i = 0; i < droplets.length; i += 1) {
                        drawDroplet(droplets[i]);
                      }

                      if (len > 0) {
                        rafId = requestAnimationFrame(renderFrame);
                      }
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
