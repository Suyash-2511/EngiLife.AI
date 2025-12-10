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
    let ripples: { x: number, y: number, radius: number, alpha: number }[] = [];

    // Time of day logic for dynamic colors
    const getTimeBasedColors = (dark: boolean) => {
      const hour = new Date().getHours();
      
      // Default (Day/Night) - Indigo/Violet Theme
      let palette = {
        particle: dark ? 'rgba(139, 92, 246, 0.5)' : 'rgba(99, 102, 241, 0.5)', 
        line: dark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(99, 102, 241, 0.1)',
        highlight: dark ? 'rgba(56, 189, 248, 0.6)' : 'rgba(14, 165, 233, 0.6)' // Cyan highlight
      };

      if (hour >= 6 && hour < 11) {
        // Morning: Fresh Teal / Emerald
        palette.particle = dark ? 'rgba(52, 211, 153, 0.5)' : 'rgba(16, 185, 129, 0.5)';
        palette.line = dark ? 'rgba(52, 211, 153, 0.1)' : 'rgba(16, 185, 129, 0.1)';
        palette.highlight = 'rgba(251, 191, 36, 0.6)'; // Amber highlight
      } else if (hour >= 17 && hour < 20) {
        // Evening: Warm Rose / Purple
        palette.particle = dark ? 'rgba(244, 63, 94, 0.5)' : 'rgba(225, 29, 72, 0.5)';
        palette.line = dark ? 'rgba(244, 63, 94, 0.1)' : 'rgba(225, 29, 72, 0.1)';
        palette.highlight = 'rgba(168, 85, 247, 0.6)'; // Purple highlight
      } else if (hour >= 20 || hour < 5) {
        // Deep Night: Slate / Blue
        palette.particle = dark ? 'rgba(148, 163, 184, 0.4)' : 'rgba(71, 85, 105, 0.4)';
        palette.line = dark ? 'rgba(148, 163, 184, 0.05)' : 'rgba(71, 85, 105, 0.05)';
        palette.highlight = 'rgba(56, 189, 248, 0.5)';
      }

      return palette;
    };

    let colors = getTimeBasedColors(isDark);
    let particleCount = Math.min(Math.floor(width * height / 12000), 100);

    // Observer for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          isDark = document.documentElement.classList.contains('dark');
          colors = getTimeBasedColors(isDark);
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
      baseX: number;
      baseY: number;
      density: number;
      depth: number; // 0.5 to 1.5, affects speed and size

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.depth = Math.random() * 1 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.5 * this.depth;
        this.vy = (Math.random() - 0.5) * 0.5 * this.depth;
        this.size = (Math.random() * 2 + 1) * this.depth;
        this.density = (Math.random() * 30) + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse Interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceDistance = 150;

        if (distance < forceDistance) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (forceDistance - distance) / forceDistance;
          // Heavier particles (closer/larger) move more
          const directionX = forceDirectionX * force * this.density * 0.8 * this.depth;
          const directionY = forceDirectionY * force * this.density * 0.8 * this.depth;

          this.x -= directionX;
          this.y -= directionY;
        }
        
        // Ripple Interaction
        ripples.forEach(ripple => {
            const rdx = ripple.x - this.x;
            const rdy = ripple.y - this.y;
            const rDist = Math.sqrt(rdx * rdx + rdy * rdy);
            if (rDist < ripple.radius + 50 && rDist > ripple.radius - 50) {
                // Push particles out based on ripple
                const angle = Math.atan2(rdy, rdx);
                const push = (1 - (Math.abs(rDist - ripple.radius) / 50)) * 2;
                this.x -= Math.cos(angle) * push;
                this.y -= Math.sin(angle) * push;
            }
        });
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = colors.particle;
        // Fade out distant particles slightly
        ctx.globalAlpha = this.depth * 0.5 + 0.2; 
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    let particles: Particle[] = [];
    const initParticles = () => {
      particles = [];
      particleCount = Math.min(Math.floor(width * height / 12000), 100);
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
    
    const handleClick = (e: MouseEvent) => {
        ripples.push({
            x: e.clientX,
            y: e.clientY,
            radius: 0,
            alpha: 1
        });
    };

    const handleMouseLeave = () => {
        mouse.x = -1000;
        mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('mouseout', handleMouseLeave);
    handleResize();

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.radius += 5;
          r.alpha -= 0.02;
          
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = colors.highlight;
          ctx.lineWidth = 2;
          ctx.globalAlpha = r.alpha * 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;

          if (r.alpha <= 0) {
              ripples.splice(i, 1);
          }
      }

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Connections
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const connectDistance = 120;

          if (distance < connectDistance) {
            ctx.beginPath();
            
            // Interaction Check for Line Color
            const midX = (particles[i].x + particles[j].x) / 2;
            const midY = (particles[i].y + particles[j].y) / 2;
            const distMouse = Math.sqrt((mouse.x - midX)**2 + (mouse.y - midY)**2);

            if (distMouse < 100) {
                ctx.strokeStyle = colors.highlight;
                ctx.lineWidth = 1;
                ctx.globalAlpha = 1 - (distMouse / 100); 
            } else {
                ctx.strokeStyle = colors.line;
                ctx.lineWidth = 0.5;
                // Fade line based on depth difference (parallax feel)
                const depthDiff = Math.abs(particles[i].depth - particles[j].depth);
                if (depthDiff > 0.5) {
                    ctx.globalAlpha = 0; // Don't connect particles too far apart in z-depth
                } else {
                    ctx.globalAlpha = (1 - (distance / connectDistance)) * 0.5;
                }
            }
            
            if (ctx.globalAlpha > 0) {
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('mouseout', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* CSS Gradient Blobs with Float Animation */}
      <div className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-500/5 dark:bg-primary-500/10 blur-[120px] animate-float"></div>
         <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] animate-float-delayed"></div>
         <div className="absolute -bottom-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] animate-pulse-slow"></div>
      </div>
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-[-1] pointer-events-none"
      />
    </>
  );
};
