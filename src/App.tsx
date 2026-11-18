import { useState, useEffect, useRef } from "react";

const asset = (name: string) => `/assets/${name}`;

function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className="brand" aria-label="GWM">
      <img src={asset(light ? "48238.svg" : "73e86.svg")} width="41.1017" height="27.7813" alt="" />
      <img src={asset(light ? "95438.svg" : "0284b.svg")} width="84.096" height="17.5251" alt="" />
    </span>
  );
}

const specifications = [
  { icon: "31e45.svg", value: "200mph", label: "Top Speed" },
  { icon: "ed7fe.svg", value: "4,561 lbs", label: "Weight" },
  { icon: "067ac.svg", value: "396mi", label: "Range (EPA est.)" },
  { icon: "14dd1.svg", value: "1.99s", label: "0–60 mph" },
];

const stories = [
  {
    eyebrow: ["AMG PERFORMANCE 4MATIC", "ALL-WHEEL DRIVE"],
    title: "FORCE OF FOUR",
    body: "Based on legendary Mercedes-Benz 4MATIC technology, the AMG Performance 4MATIC all-wheel drive system is not only engineered to preserve the signature AMG feel while making the best use of available torque - it's also up to 35% lighter than comparable systems. Which means it's a force to be reckoned with.",
  },
  {
    eyebrow: ["MERCEDES-BENZ", "ENGINEERING IN FOCUS"],
    title: "POWER WITHIN",
    body: "A closer look at the heart of Mercedes-Benz engineering. From the sculpted engine cover to the intricate components beneath, every detail comes together in one integrated power unit. Precision you can see. Performance at its core.",
  },
  {
    eyebrow: ["PLUG-IN HYBRID TECHNOLOGY", "ELECTRIC MEETS PETROL"],
    title: "POWER IN SYNC",
    body: "Electric power for everyday journeys. Petrol power for the road ahead. A plug-in hybrid brings a rechargeable battery and an electric motor together with a combustion engine. Plug in to recharge, then enjoy the flexibility of two power sources working as one.",
  },
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const storyRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const TOTAL_FRAMES = 56;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    const bitmaps: (ImageBitmap | HTMLImageElement)[] = new Array(TOTAL_FRAMES);
    let targetProgress = 0;
    let currentProgress = 0;
    let lastRenderedFrameFloat = -1;
    let needsRedraw = true;
    let cachedTrackHeight = 1;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const idx = i - 1;
      const img = new Image();
      const pad = String(i).padStart(3, "0");
      img.src = `/Scequence/ezgif-frame-${pad}.png`;
      images[idx] = img;

      img.onload = () => {
        if (idx === 0) needsRedraw = true;
        if (window.createImageBitmap) {
          createImageBitmap(img).then((bmp) => {
            bitmaps[idx] = bmp;
            if (idx === 0) needsRedraw = true;
          }).catch(() => {});
        } else if (img.decode) {
          img.decode().then(() => {
            bitmaps[idx] = img;
            if (idx === 0) needsRedraw = true;
          }).catch(() => {});
        }
      };
    }

    function getBestImage(idx: number) {
      if (bitmaps[idx]) return bitmaps[idx];
      if (images[idx] && images[idx].complete && images[idx].naturalWidth > 0) return images[idx];
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = idx - offset;
        if (prev >= 0) {
          if (bitmaps[prev]) return bitmaps[prev];
          if (images[prev]?.complete && images[prev].naturalWidth > 0) return images[prev];
        }
        const next = idx + offset;
        if (next < TOTAL_FRAMES) {
          if (bitmaps[next]) return bitmaps[next];
          if (images[next]?.complete && images[next].naturalWidth > 0) return images[next];
        }
      }
      return null;
    }

    function updateSize() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        needsRedraw = true;
      }
      if (trackRef.current) {
        cachedTrackHeight = Math.max(1, trackRef.current.offsetHeight - h);
      }
    }

    function renderBlended(frameFloat: number) {
      const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, frameFloat));
      const idxA = Math.floor(clamped);
      const idxB = Math.min(TOTAL_FRAMES - 1, idxA + 1);
      const fraction = clamped - idxA;

      const imgA = getBestImage(idxA);
      const imgB = idxB !== idxA ? getBestImage(idxB) : null;
      if (!imgA || !canvas || !ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "#e6e6e6";
      ctx.fillRect(0, 0, w, h);

      const imgRatio = 1920 / 1080;
      const canvasRatio = w / h;
      let drawW: number, drawH: number;

      if (canvasRatio < 1.3) {
        if (canvasRatio > imgRatio) {
          drawH = h;
          drawW = h * imgRatio;
        } else {
          drawW = w;
          drawH = w / imgRatio;
        }
      } else {
        if (canvasRatio > imgRatio) {
          drawW = w;
          drawH = w / imgRatio;
        } else {
          drawH = h;
          drawW = h * imgRatio;
        }
      }

      const drawX = (w - drawW) / 2;
      const drawY = (h - drawH) / 2;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.globalAlpha = 1.0;
      ctx.drawImage(imgA, drawX, drawY, drawW, drawH);

      if (imgB && fraction > 0.005) {
        ctx.globalAlpha = fraction;
        ctx.drawImage(imgB, drawX, drawY, drawW, drawH);
        ctx.globalAlpha = 1.0;
      }

      ctx.restore();
    }

    function calcVisibility(progress: number, enterStart: number, enterEnd: number, exitStart: number, exitEnd: number) {
      if (progress < enterStart || progress > exitEnd) return 0;
      if (progress >= enterEnd && progress <= exitStart) return 1;
      if (progress < enterEnd) return (progress - enterStart) / (enterEnd - enterStart);
      return 1 - (progress - exitStart) / (exitEnd - exitStart);
    }

    function applyLayer(el: HTMLElement | null, opacity: number) {
      if (!el) return;
      const clamped = Math.max(0, Math.min(1, opacity));
      const translateY = (1 - clamped) * 24;
      el.style.opacity = clamped.toFixed(3);
      el.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
      el.style.pointerEvents = clamped > 0.1 ? "auto" : "none";
    }

    function updateLayers(progress: number) {
      const heroOpacity = progress < 0.1 ? 1 : Math.max(0, 1 - (progress - 0.1) / 0.08);
      applyLayer(heroRef.current, heroOpacity);

      const s0 = calcVisibility(progress, 0.18, 0.26, 0.38, 0.45);
      applyLayer(storyRefs.current[0], s0);

      const s1 = calcVisibility(progress, 0.45, 0.52, 0.62, 0.69);
      applyLayer(storyRefs.current[1], s1);

      const s2 = calcVisibility(progress, 0.69, 0.76, 0.86, 0.93);
      applyLayer(storyRefs.current[2], s2);
    }

    function handleScroll() {
      targetProgress = Math.max(0, Math.min(1, window.scrollY / cachedTrackHeight));
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateSize);

    let animId: number;
    function animate() {
      const ease = 0.075;
      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) > 0.00005) {
        currentProgress += diff * ease;
      } else {
        currentProgress = targetProgress;
      }

      const frameFloat = currentProgress * (TOTAL_FRAMES - 1);

      if (Math.abs(frameFloat - lastRenderedFrameFloat) > 0.008 || needsRedraw) {
        renderBlended(frameFloat);
        lastRenderedFrameFloat = frameFloat;
        needsRedraw = false;
      }

      updateLayers(currentProgress);
      animId = requestAnimationFrame(animate);
    }

    updateSize();
    handleScroll();
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  const scrollToStories = () => {
    setMenuOpen(false);
    if (!trackRef.current) return;
    const max = trackRef.current.offsetHeight - window.innerHeight;
    window.scrollTo({ top: max * 0.28, behavior: "smooth" });
  };

  const scrollToContact = () => {
    setMenuOpen(false);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main id="top">
      {/* Background Frame Sequence Canvas */}
      <div className="canvas-viewport">
        <canvas ref={canvasRef} id="sequence-canvas" />
      </div>

      {/* Navigation */}
      <nav className="navigation" aria-label="Main navigation">
        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <img src={asset("e43e2.svg")} width="61.6409" height="30.8205" alt="" />
        </button>
        <a className="nav-brand" href="#top" aria-label="GWM home">
          <Brand />
        </a>
        <a className="test-drive" href="#contact" onClick={scrollToContact}>
          Book a Test Drive
        </a>
      </nav>

      {menuOpen && (
        <div className="site-menu open" id="site-menu">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Overview
          </a>
          <a
            href="#stories"
            onClick={(e) => {
              e.preventDefault();
              scrollToStories();
            }}
          >
            Technology
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToContact();
            }}
          >
            Contact
          </a>
        </div>
      )}

      {/* Scroll-Driven Foreground Sections */}
      <div className="scroll-track" ref={trackRef}>
        <div className="sticky-wrapper">
          {/* Hero Section */}
          <section className="hero-layer" ref={heroRef} aria-labelledby="hero-title">
            <div className="introduction">
              <span className="badge">Electric Car</span>
              <h1 id="hero-title">
                <span>SEE IN</span>
                Bangladesh
              </h1>
              <p className="intro-copy">
                Discover Bangladesh’s vibrant culture, scenic
                <br />
                landscapes, and unforgettable places to explore.
              </p>
              <p className="price">
                <span>From*</span> 36k BDT
              </p>
              <a
                className="primary-button"
                href="#stories"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToStories();
                }}
              >
                <img src={asset("3136c.svg")} width="31.962" height="30.8205" alt="" />
                EXPLORE MORE
              </a>
            </div>

            <div className="specifications" aria-label="Vehicle specifications">
              {specifications.map((spec) => (
                <article className="spec-card" key={spec.label}>
                  <span className="spec-icon">
                    <img src={asset(spec.icon)} width="29.679" height="31.962" alt="" />
                  </span>
                  <strong>{spec.value}</strong>
                  <span>{spec.label}</span>
                </article>
              ))}
            </div>
          </section>

          {/* Stories */}
          {stories.map((story, idx) => (
            <section
              className="story-layer"
              key={story.title}
              ref={(el) => (storyRefs.current[idx] = el)}
            >
              <div className="story-content">
                <p className="story-eyebrow">
                  {story.eyebrow[0]}
                  <br />
                  {story.eyebrow[1]}
                </p>
                <h2>{story.title}</h2>
                <p className="story-copy">{story.body}</p>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <footer id="contact" className="footer">
        {/* Background Video */}
        <div className="footer-video-bg" aria-hidden="true">
          <video className="footer-video" autoPlay muted loop playsInline preload="auto">
            <source src={asset("gwm-brand-tvc-pc.mp4")} type="video/mp4" />
            <source src={asset("gwm-brand-tvc-mobile.mp4")} type="video/mp4" />
          </video>
          <div className="footer-video-overlay" />
        </div>

        <div className="footer-hero">
          <p className="footer-kicker">GWM BANGLADESH</p>
          <h2>
            YOUR NEXT
            <br />
            CHAPTER.
          </h2>
          <p className="footer-subtitle">A new perspective. For Bangladesh.</p>
          <a className="informed-button" href="mailto:info@gwmbangladesh.com">
            Stay informed
            <img src={asset("e4d41.svg")} width="29.7099" height="29.7099" alt="" />
          </a>
          <span className="journey-caption">
            <span className="caption-image" aria-hidden="true">
              <img src={asset("efc83.png")} alt="" />
            </span>
            THE JOURNEY CONTINUES
          </span>
        </div>

        <div className="brand-footer">
          <div className="footer-brand-row">
            <Brand light />
            <span className="brand-divider" />
            <span className="country">BANGLADESH</span>
            <a
              className="back-to-top"
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Back to top
              <img src={asset("5b348.svg")} width="22.2824" height="32.1857" alt="" />
            </a>
          </div>
          <div className="footer-divider" />
          <div className="footer-legal">
            <p>
              Design concept · Vehicles shown are illustrative.
              <br />
              Bangladesh lineup, specifications and availability are to be confirmed.
            </p>
            <p>GWM BANGLADESH / CREATIVE PREVIEW</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
