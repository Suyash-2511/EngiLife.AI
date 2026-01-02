
import React, { useEffect, useRef } from 'react';

export const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId: number;
    let mouse = { x: -1000, y: -1000 };
    let isDark = document.documentElement.classList.contains('dark');
    
    const getColors = (dark: boolean) => {
      return {
        // Solar Theme: Orange, Rose, Indigo
        particles: dark 
          ? ['rgba(249, 115, 22, 0.4)', 'rgba(225, 29, 72, 0.4)', 'rgba(99, 102, 241, 0.3)'] 
          : ['rgba(249, 115, 22, 0.3)', 'rgba(225, 29, 72, 0.3)', 'rgba(79, 70, 229, 0.2)'],
        line: dark ? 'rgba(249, 115, 22, 0.05)' : 'rgba(249, 115, 22, 0.05)'
      };
    };

    let colors = getColors(isDark);
    let particleCount = Math.min(Math.floor(width * height / 15000), 60);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          isDark = document.documentElement.classList.contains('dark');
          colors = getColors(isDark);
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 3 + 1;
        this.color = colors.particles[Math.floor(Math.random() * colors.particles.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse avoidance
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
            const angle = Math.atan2(dy, dx);
            const force = (150 - distance) / 150;
            const pushX = Math.cos(angle) * force * 2;
            const pushY = Math.sin(angle) * force * 2;
            this.x -= pushX;
            this.y -= pushY;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    let particles: Particle[] = [];
    const initParticles = () => {
      particles = [];
      particleCount = Math.min(Math.floor(width * height / 15000), 60);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = colors.line;
            ctx.lineWidth = 1 - distance / 120;
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none bg-slate-50 dark:bg-[#0a090f]">
         {/* Engineering Grid (Graph Paper) - Enhanced Visibility */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:32px_32px]"></div>
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:160px_160px]"></div>
         
         {/* Radial Vignette to focus center */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,9,15,0.8)_100%)] opacity-80"></div>

         {/* Warm Solar Blobs - Slightly more saturated for better visibility */}
         <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-orange-400/20 dark:bg-orange-600/10 blur-[120px] animate-float opacity-60"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-rose-400/20 dark:bg-rose-600/10 blur-[120px] animate-float-delayed opacity-60"></div>
         <div className="absolute top-[40%] right-[30%] w-[30%] h-[30%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[80px] animate-pulse-slow opacity-50"></div>
      </div>
      
      {/* Particle Canvas Layer */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-[-1] pointer-events-none"
      />
    </>
  );
};
