import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface Specialty {
  label: string;
  sub: string;
  icon: string;
  bg: string;
  color: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
  ],
})
export class Home {
  searchQuery = '';

  quickTags = ['React', 'Node.js', 'Mobile', 'DevOps', 'Full Stack', 'Bases de datos'];

  specialties = signal<Specialty[]>([
    { label: 'Desarrollo Frontend', sub: 'React, Angular, Vue',   icon: 'dashboard',    bg: '#1e1b4b', color: '#818cf8' },
    { label: 'Backend & APIs',      sub: 'Node, Python, Java',    icon: 'dns',          bg: '#042f2e', color: '#34d399' },
    { label: 'Mobile',              sub: 'Flutter, React Native', icon: 'phone_android',bg: '#2e1065', color: '#c084fc' },
    { label: 'DevOps & Cloud',      sub: 'AWS, Docker, CI/CD',    icon: 'cloud',        bg: '#0c1a3a', color: '#60a5fa' },
    { label: 'Bases de datos',      sub: 'MySQL, PostgreSQL',     icon: 'storage',      bg: '#1e293b', color: '#94a3b8' },
    { label: 'QA & Testing',        sub: 'Jest, Cypress, E2E',    icon: 'bug_report',   bg: '#052e16', color: '#4ade80' },
    { label: 'Diseño UI/UX',             sub: 'Figma, Adobe XD, Wireframes', icon: 'palette',      bg: '#4c0519', color: '#f43f5e' },
    { label: 'Aseguramiento de Calidad', sub: 'Manual, Automation, Plan', icon: 'verified_user', bg: '#131e3a', color: '#38bdf8' },
  ]);

  constructor(private router: Router) {}

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