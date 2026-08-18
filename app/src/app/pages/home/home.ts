import { Component, computed, ElementRef, signal, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgStyle } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MagicBentoComponent } from '../../shared/components/magic-bento/magic-bento';

interface Specialty {
  label: string;
  sub: string;
  icon: string;
  bg: string;
  color: string;
}

interface Feature {
  title: string;
  desc: string;
  icon: string;
  span: string;
}

interface CodeToken {
  t: string;
  c: string;
}

interface RenderLine {
  tokens: CodeToken[];
  cursor: boolean;
}

const CODE_LINES: { tokens: CodeToken[] }[] = [
  { tokens: [{ t: '// TechHire CR', c: 'c' }] },
  { tokens: [{ t: 'const', c: 'k' }, { t: ' developer = ', c: '' }, { t: '{', c: '' }] },
  { tokens: [{ t: '  name: ', c: '' }, { t: '"Andrea"', c: 's' }, { t: ',', c: '' }] },
  { tokens: [{ t: '  rol: ', c: '' }, { t: '"Full Stack"', c: 's' }, { t: ',', c: '' }] },
  { tokens: [{ t: '  stack: ', c: '' }, { t: '"React / Node"', c: 's' }, { t: ',', c: '' }] },
  { tokens: [{ t: '  disponible: ', c: '' }, { t: 'true', c: 'k' }, { t: ',', c: '' }] },
  { tokens: [{ t: '  rating: ', c: '' }, { t: '5.0', c: 'n' }] },
  { tokens: [{ t: '};', c: '' }] },
];

const TYPE_DELAY_MS = 40;
const TYPE_START_DELAY_MS = 500;
const TYPE_PAUSE_MS = 20000;

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  standalone: true,
  imports: [
    FormsModule,
    NgStyle,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MagicBentoComponent,
  ],
})
export class Home implements OnInit, OnDestroy {
  searchQuery = '';

  quickTags = ['React', 'Node.js', 'Mobile', 'DevOps', 'Full Stack', 'Bases de datos'];

  private totalChars = CODE_LINES.reduce(
    (sum, line) => sum + line.tokens.reduce((s, tok) => s + tok.t.length, 0) + 1,
    -1
  );

  typedChars = signal(0);
  typingDone = signal(false);

  private typeTimer: any = null;

  private visible = true;
  private pageVisible = true;
  private waiting = false;
  private observer: IntersectionObserver | null = null;

  renderedLines = computed<RenderLine[]>(() => {
    let remaining = this.typedChars();
    const finished = remaining >= this.totalChars;
    const lines: RenderLine[] = [];

    for (let li = 0; li < CODE_LINES.length; li++) {
      const { tokens } = CODE_LINES[li];
      const lineLen = tokens.reduce((s, tok) => s + tok.t.length, 0);

      if (remaining <= 0) {
        lines.push({ tokens: [], cursor: false });
        continue;
      }

      const isLast = li === CODE_LINES.length - 1;

      if (remaining >= lineLen) {
        lines.push({ tokens, cursor: false });
        remaining -= lineLen;
        if (remaining > 0) remaining -= 1;

        // Park the caret at the end of a completed line so it never vanishes
        // between lines while the typing loop is still running.
        if (remaining === 0 && !finished && !isLast) {
          lines[li] = { tokens, cursor: true };
        }
      } else {
        let used = 0;
        const partial: CodeToken[] = [];
        for (const tok of tokens) {
          if (used >= remaining) break;
          const take = Math.min(tok.t.length, remaining - used);
          partial.push({ t: tok.t.slice(0, take), c: tok.c });
          used += take;
        }
        lines.push({ tokens: partial, cursor: true });
        remaining = 0;
      }

      if (finished && isLast) {
        lines[li] = { tokens, cursor: true };
      }
    }

    return lines;
  });

  features = signal<Feature[]>([
    {
      title: 'Talento verificado',
      desc: 'Cada profesional es validado y evaluado antes de ingresar a nuestra red, garantizando calidad y fiabilidad en cada proyecto.',
      icon: 'verified_user',
      span: 'is-wide',
    },
    {
      title: 'Agenda inteligente',
      desc: 'Coordiná citas y reuniones en minutos con disponibilidad sincronizada en tiempo real.',
      icon: 'event_available',
      span: '',
    },
    {
      title: 'Especialistas senior',
      desc: 'Acceso exclusivo a ingenieros líderes en arquitectura, cloud, móvil y seguridad.',
      icon: 'military_tech',
      span: '',
    },
    {
      title: 'Conectá en minutos',
      desc: 'Buscá por especialidad, tecnología y tarifa. La contratación de talento nunca fue tan simple.',
      icon: 'rocket_launch',
      span: 'is-wide',
    },
  ]);

  specialties = signal<Specialty[]>([
    { label: 'Desarrollo Frontend', sub: 'React, Angular, Vue',   icon: 'dashboard',    bg: '#00363f', color: '#baf2ff' },
    { label: 'Backend & APIs',      sub: 'Node, Python, Java',    icon: 'dns',          bg: '#0d1c2d', color: '#baf2ff' },
    { label: 'Mobile',              sub: 'Flutter, React Native', icon: 'phone_android',bg: '#122131', color: '#baf2ff' },
    { label: 'DevOps & Cloud',      sub: 'AWS, Docker, CI/CD',    icon: 'cloud',        bg: '#1c2b3c', color: '#baf2ff' },
    { label: 'Bases de datos',      sub: 'MySQL, PostgreSQL',     icon: 'storage',      bg: '#273647', color: '#baf2ff' },
    { label: 'QA & Testing',        sub: 'Jest, Cypress, E2E',    icon: 'bug_report',   bg: '#122131', color: '#baf2ff' },
    { label: 'Diseño UI/UX',        sub: 'Figma, Adobe XD, Wireframes', icon: 'palette', bg: '#0d1c2d', color: '#baf2ff' },
    { label: 'Seguridad',           sub: 'Pentest, Compliance, ISO',    icon: 'security', bg: '#1c2b3c', color: '#baf2ff' },
  ]);

  constructor(private router: Router, private el: ElementRef<HTMLElement>) {}

  private onVisibilityChange = () => {
    this.pageVisible = !document.hidden;
    if (this.pageVisible) {
      this.resume();
    } else {
      this.pause();
    }
  };

  ngOnInit() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.typedChars.set(this.totalChars);
      this.typingDone.set(true);
      return;
    }
    this.setupVisibility();
    this.startTyping();
  }

  private setupVisibility() {
    const block = this.el.nativeElement.querySelector('.hero-code-block');
    if (block instanceof HTMLElement && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          this.visible = entry.isIntersecting;
          if (this.visible) {
            this.resume();
          } else {
            this.pause();
          }
        },
        { threshold: 0.15 }
      );
      this.observer.observe(block);
    }
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  ngOnDestroy() {
    this.pause();
    this.observer?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  private startTyping() {
    this.pause();
    this.typedChars.set(0);
    this.typingDone.set(false);
    this.waiting = false;
    this.typeTimer = setTimeout(() => this.tick(), TYPE_START_DELAY_MS);
  }

  private tick() {
    if (!this.visible || !this.pageVisible) {
      this.pause();
      return;
    }
    if (this.typedChars() >= this.totalChars) {
      this.typingDone.set(true);
      this.typeTimer = setTimeout(() => this.startTyping(), TYPE_PAUSE_MS);
      return;
    }
    this.typedChars.set(this.typedChars() + 1);
    this.typeTimer = setTimeout(() => this.tick(), TYPE_DELAY_MS);
  }

  private pause() {
    if (this.typeTimer) {
      clearTimeout(this.typeTimer);
      this.typeTimer = null;
    }
    this.waiting = true;
  }

  private resume() {
    if (!this.waiting) return;
    this.waiting = false;
    this.tick();
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/servicios'], { queryParams: { q: this.searchQuery } });
    }
  }

  onTagClick(tag: string) {
    this.router.navigate(['/servicios'], { queryParams: { especialidad: tag } });
  }

  onSpecClick(spec: Specialty) {
    this.router.navigate(['/servicios'], { queryParams: { categoria: spec.label } });
  }
}