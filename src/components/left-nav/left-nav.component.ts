import { Component, ChangeDetectionStrategy, signal, input, output } from '@angular/core';

interface NavItem {
  icon: string;
  label: string;
  active: boolean;
}

@Component({
  selector: 'app-left-nav',
  standalone: true,
  imports: [],
  templateUrl: './left-nav.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeftNavComponent {
  isCollapsed = input.required<boolean>();
  navToggled = output<void>();

  doctor = signal({
    name: 'Dra. Andréa Costa',
    avatarUrl: 'https://picsum.photos/seed/doctor2/100/100',
  });

  navItems = signal<NavItem[]>([
    { icon: 'calendar', label: 'Agenda', active: false },
    { icon: 'users', label: 'Pacientes', active: true },
    { icon: 'chart', label: 'Relatórios', active: false },
    { icon: 'settings', label: 'Configurações', active: false },
  ]);

  onToggleNav(): void {
    this.navToggled.emit();
  }

  getIconSVG(icon: string): string {
    const icons: { [key: string]: string } = {
      calendar: `<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M-7.5 12h18" />`,
      users: `<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-4.663M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />`,
      chart: `<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />`,
      settings: `<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.226a11.95 11.95 0 0 1 2.59 0c.55.219 1.02.684 1.11 1.226.09.542-.056 1.12-.34 1.606l-2.924 2.925a1.5 1.5 0 0 1-2.122 0L9.934 5.546c-.283-.486-.43-1.064-.34-1.606Z" />
               <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
               <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />`
    };
    return icons[icon] || '';
  }
}