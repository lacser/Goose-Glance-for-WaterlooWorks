import React, { useEffect, useRef } from "react";
import SymbolsProvider from "../symbols";
import { useTranslation } from "react-i18next";

const SetupFinishPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track the icon center position in the viewport in real time
    let iconCenter = { x: width / 2, y: height / 3 };

    const updateIconCenter = () => {
      const el = iconRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      iconCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };
    // Initial calculation
    updateIconCenter();

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      updateIconCenter();
    };
    window.addEventListener("resize", onResize);
    // Position also changes on scroll
    window.addEventListener("scroll", updateIconCenter, { passive: true });

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      vr: number;
      alpha: number;
      age: number;
    };

    const colors = [
      "#F59E0B", // amber-500
      "#EF4444", // red-500
      "#10B981", // emerald-500
      "#3B82F6", // blue-500
      "#8B5CF6", // violet-500
      "#F97316", // orange-500
      "#EAB308", // yellow-500
      "#22C55E", // green-500
      "#06B6D4", // cyan-500
      "#EC4899", // pink-500
    ];

    const rand = (min: number, max: number) =>
      Math.random() * (max - min) + min;
    const particles: Particle[] = [];

    // Emit bursts initially
    const emit = (count: number) => {
      // Ensure using the latest icon center
      updateIconCenter();
      for (let i = 0; i < count; i++) {
        const angle = rand(-Math.PI, 0);
        particles.push({
          x: iconCenter.x + rand(-10, 10),
          y: iconCenter.y,
          vx: Math.cos(angle) * rand(2, 6),
          vy: Math.sin(angle) * rand(2, 6) - 2,
          size: rand(4, 8),
          color: colors[(Math.random() * colors.length) | 0],
          rotation: rand(0, Math.PI * 2),
          vr: rand(-0.1, 0.1),
          alpha: 1,
          age: 0,
        });
      }
    };

    // Burst a few times
    emit(160);
    const burstTimers = [400, 900, 1400].map((t) =>
      setTimeout(() => emit(120), t)
    );

    const gravity = 0.06;
    const drag = 0.995;

    const startTime = performance.now();
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += gravity;
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;
        p.age++;

        // Fragments that are very slow or have lived too long fade out gradually
        const speed = Math.hypot(p.vx, p.vy);
        const tooSlow = speed < 0.15 && p.y > height * 0.6;
        const tooOld = p.age > 360; // About 6 seconds (rough estimate at 60fps)
        if (tooSlow || tooOld) {
          p.alpha -= 0.02;
          if (p.alpha < 0) p.alpha = 0;
        }

        // Remove if out of view
        if (
          p.alpha <= 0.01 ||
          p.y - p.size > height ||
          p.x < -50 ||
          p.x > width + 50
        ) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
      // Stop the animation if all particles disappear or hard timeout is exceeded
      const elapsed = performance.now() - startTime;
      if (particles.length === 0 || elapsed > 12000) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", updateIconCenter);
      burstTimers.forEach(clearTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="relative h-screen bg-gray-50">
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-10"
        aria-hidden
      />

      <section className="bg-gradient-to-b from-white to-brand-100/40 flex items-center h-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight flex items-center gap-2">
                <span>{t("setupFinish.title")}</span>
                <span ref={iconRef} className="inline-flex items-center">
                  <SymbolsProvider
                    classname="text-brand-600"
                    iconSize="2.25rem"
                    fill={1}
                  >
                    celebration
                  </SymbolsProvider>
                </span>
              </h1>
              <p className="mt-3 text-lg text-gray-600 leading-relaxed">
                {t("setupFinish.subtitle")}
              </p>

              <div className="mt-8">
                <a
                  href="https://waterlooworks.uwaterloo.ca/home.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    "spotlight-card spotlight-white inline-flex items-center justify-between gap-3 rounded-xl px-5 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white ring-1 ring-brand-700/40 shadow-sm transition-all duration-300 ease-out " +
                    "relative overflow-visible z-0 after:content-[''] after:absolute after:-inset-1 after:rounded-xl after:bg-gradient-to-r after:from-brand-400/25 after:to-brand-600/25 after:blur-lg after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300 after:ease-out after:pointer-events-none after:-z-10 " +
                    "before:content-[''] before:absolute before:inset-0 before:rounded-xl before:bg-white before:opacity-0 hover:before:opacity-10 before:transition-opacity before:duration-300 before:ease-out before:pointer-events-none"
                  }
                >
                  <span className="text-base font-medium">
                    {t("setupFinish.actions.openWaterlooWorks")}
                  </span>
                  <SymbolsProvider classname="ml-2" color="white" fill={1}>
                    open_in_new
                  </SymbolsProvider>
                </a>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="aspect-auto rounded-xl overflow-hidden shadow ring-1 ring-gray-200 bg-white">
                <img
                  src="./HowToUseImage.webp"
                  alt={t("setupFinish.alt.imageAlt")}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="sr-only">{t("setupFinish.alt.usageImageSrOnly")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SetupFinishPage;
