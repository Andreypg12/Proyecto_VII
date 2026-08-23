import {
    Component,
    AfterViewInit,
    OnDestroy,
    ElementRef,
    ContentChild,
    input,
    signal,
    NgZone,
    ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';

const MOBILE_BREAKPOINT = 768;

@Component({
    selector: 'app-magic-bento',
    standalone: true,
    imports: [CommonModule],
    template: `<ng-content></ng-content>`,
    styleUrls: ['./magic-bento.css'],
    encapsulation: ViewEncapsulation.None,
})
export class MagicBentoComponent implements AfterViewInit, OnDestroy {
    enableStars = input(true);
    enableSpotlight = input(true);
    enableBorderGlow = input(true);
    enableTilt = input(false);
    enableMagnetism = input(true);
    clickEffect = input(true);
    spotlightRadius = input(300);
    particleCount = input(12);
    glowColor = input('0, 218, 248');
    disableAnimations = input(false);

    @ContentChild('bentoGrid') gridRef!: ElementRef<HTMLElement>;

    private spotlightEl: HTMLElement | null = null;
    private cleanupFns: (() => void)[] = [];
    private isMobile = signal(false);
    private resizeObserver: ResizeObserver | null = null;

    constructor(private el: ElementRef<HTMLElement>, private ngZone: NgZone) {}

    ngAfterViewInit(): void {
        this.checkMobile();

        this.resizeObserver = new ResizeObserver(() => this.checkMobile());
        this.resizeObserver.observe(window.document.body);

        this.ngZone.runOutsideAngular(() => {
            if (this.enableSpotlight()) {
                this.initSpotlight();
            }

            this.initCards();
        });
    }

    ngOnDestroy(): void {
        this.cleanupFns.forEach((fn) => fn());
        this.cleanupFns = [];
        this.spotlightEl?.remove();
        this.resizeObserver?.disconnect();
    }

    private get shouldDisable(): boolean {
        return this.disableAnimations() || this.isMobile();
    }

    private checkMobile(): void {
        this.isMobile.set(window.innerWidth <= MOBILE_BREAKPOINT);
    }

    /* ── SPOTLIGHT ─────────────────────────── */
    private initSpotlight(): void {
        const spotlight = document.createElement('div');
        spotlight.className = 'mbento-global-spotlight';
        const gc = this.glowColor();
        spotlight.style.cssText = `
            position:fixed;width:800px;height:800px;border-radius:50%;
            pointer-events:none;
            background:radial-gradient(circle,rgba(${gc},0.15) 0%,rgba(${gc},0.08) 15%,rgba(${gc},0.04) 25%,rgba(${gc},0.02) 40%,rgba(${gc},0.01) 65%,transparent 70%);
            z-index:200;opacity:0;transform:translate(-50%,-50%);mix-blend-mode:screen;
        `;
        document.body.appendChild(spotlight);
        this.spotlightEl = spotlight;

        const section = this.el.nativeElement;
        const radius = this.spotlightRadius();
        const proximity = radius * 0.5;
        const fadeDistance = radius * 0.75;
        const gcVal = this.glowColor();

        const onMove = (e: MouseEvent) => {
            const rect = section.getBoundingClientRect();
            const inside =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;

            const cards = section.querySelectorAll<HTMLElement>('.bento-card, .stat-card, .section-card, .servicio-item');

            if (!inside) {
                gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' });
                cards.forEach((c) => c.style.setProperty('--glow-intensity', '0'));
                return;
            }

            let minDist = Infinity;

            cards.forEach((card) => {
                const cr = card.getBoundingClientRect();
                const cx = cr.left + cr.width / 2;
                const cy = cr.top + cr.height / 2;
                const dist = Math.max(0, Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(cr.width, cr.height) / 2);
                minDist = Math.min(minDist, dist);

                let intensity = 0;
                if (dist <= proximity) intensity = 1;
                else if (dist <= fadeDistance) intensity = (fadeDistance - dist) / (fadeDistance - proximity);

                const rx = ((e.clientX - cr.left) / cr.width) * 100;
                const ry = ((e.clientY - cr.top) / cr.height) * 100;
                card.style.setProperty('--glow-x', `${rx}%`);
                card.style.setProperty('--glow-y', `${ry}%`);
                card.style.setProperty('--glow-intensity', intensity.toString());
                card.style.setProperty('--glow-radius', `${radius}px`);
            });

            gsap.to(spotlight, { left: e.clientX, top: e.clientY, duration: 0.1, ease: 'power2.out' });

            const targetOpacity =
                minDist <= proximity ? 0.8 : minDist <= fadeDistance ? ((fadeDistance - minDist) / (fadeDistance - proximity)) * 0.8 : 0;

            gsap.to(spotlight, {
                opacity: targetOpacity,
                duration: targetOpacity > 0 ? 0.2 : 0.5,
                ease: 'power2.out',
            });
        };

        const onLeave = () => {
            section.querySelectorAll<HTMLElement>('.bento-card, .stat-card, .section-card, .servicio-item').forEach((c) => c.style.setProperty('--glow-intensity', '0'));
            gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseleave', onLeave);
        this.cleanupFns.push(() => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseleave', onLeave);
        });
    }

    /* ── PER-CARD EFFECTS ────────────────────── */
    private initCards(): void {
        const cards = this.el.nativeElement.querySelectorAll('.bento-card, .stat-card, .section-card, .servicio-item');
        const gc = this.glowColor();

        cards.forEach((card) => {
            const particles: HTMLElement[] = [];
            const timeouts: ReturnType<typeof setTimeout>[] = [];
            let hovered = false;
            const memoized: HTMLElement[] = [];

            const createParticle = (x: number, y: number) => {
                const p = document.createElement('div');
                p.className = 'mbento-particle';
                p.style.cssText = `position:absolute;width:4px;height:4px;border-radius:50%;background:rgba(${gc},1);box-shadow:0 0 6px rgba(${gc},0.6);pointer-events:none;z-index:100;left:${x}px;top:${y}px;`;
                return p;
            };

            const initMemo = () => {
                if (memoized.length) return;
                const r = card.getBoundingClientRect();
                for (let i = 0; i < this.particleCount(); i++) {
                    memoized.push(createParticle(Math.random() * r.width, Math.random() * r.height));
                }
            };

            const clearParticles = () => {
                timeouts.forEach(clearTimeout);
                timeouts.length = 0;
                particles.forEach((p) => {
                    gsap.to(p, {
                        scale: 0,
                        opacity: 0,
                        duration: 0.3,
                        ease: 'back.in(1.7)',
                        onComplete: () => p.parentNode?.removeChild(p),
                    });
                });
                particles.length = 0;
            };

            const animateParticles = () => {
                if (!hovered) return;
                initMemo();
                memoized.forEach((m, i) => {
                    const tid = setTimeout(() => {
                        if (!hovered) return;
                        const clone = m.cloneNode(true) as HTMLElement;
                        card.appendChild(clone);
                        particles.push(clone);
                        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
                        gsap.to(clone, { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100, rotation: Math.random() * 360, duration: 2 + Math.random() * 2, ease: 'none', repeat: -1, yoyo: true });
                        gsap.to(clone, { opacity: 0.3, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: true });
                    }, i * 100);
                    timeouts.push(tid);
                });
            };

            const onMouseEnter = () => {
                hovered = true;
                if (!this.shouldDisable && this.enableStars()) animateParticles();
                if (!this.shouldDisable && this.enableTilt()) {
                    gsap.to(card, { rotateX: 5, rotateY: 5, duration: 0.3, ease: 'power2.out', transformPerspective: 1000 });
                }
            };

            const onMouseLeave = () => {
                hovered = false;
                clearParticles();
                if (this.enableTilt()) gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' });
                if (this.enableMagnetism()) gsap.to(card, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
            };

            const onMouseMove = (evt: Event) => {
                if (this.shouldDisable) return;
                const e = evt as MouseEvent;
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left;
                const y = e.clientY - r.top;
                const cx = r.width / 2;
                const cy = r.height / 2;

                if (this.enableTilt()) {
                    gsap.to(card, {
                        rotateX: ((y - cy) / cy) * -10,
                        rotateY: ((x - cx) / cx) * 10,
                        duration: 0.1,
                        ease: 'power2.out',
                        transformPerspective: 1000,
                    });
                }
                if (this.enableMagnetism()) {
                    gsap.to(card, { x: (x - cx) * 0.05, y: (y - cy) * 0.05, duration: 0.3, ease: 'power2.out' });
                }
            };

            const onClick = (evt: Event) => {
                if (this.shouldDisable || !this.clickEffect()) return;
                const e = evt as MouseEvent;
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left;
                const y = e.clientY - r.top;
                const maxD = Math.max(Math.hypot(x, y), Math.hypot(x - r.width, y), Math.hypot(x, y - r.height), Math.hypot(x - r.width, y - r.height));
                const ripple = document.createElement('div');
                ripple.style.cssText = `position:absolute;width:${maxD * 2}px;height:${maxD * 2}px;border-radius:50%;background:radial-gradient(circle,rgba(${gc},0.4) 0%,rgba(${gc},0.2) 30%,transparent 70%);left:${x - maxD}px;top:${y - maxD}px;pointer-events:none;z-index:1000;`;
                card.appendChild(ripple);
                gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() });
            };

            card.addEventListener('mouseenter', onMouseEnter);
            card.addEventListener('mouseleave', onMouseLeave);
            card.addEventListener('mousemove', onMouseMove);
            card.addEventListener('click', onClick);

            this.cleanupFns.push(() => {
                hovered = false;
                card.removeEventListener('mouseenter', onMouseEnter);
                card.removeEventListener('mouseleave', onMouseLeave);
                card.removeEventListener('mousemove', onMouseMove);
                card.removeEventListener('click', onClick);
                clearParticles();
            });
        });
    }
}