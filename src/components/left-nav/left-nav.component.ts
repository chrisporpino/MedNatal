import { Component, ChangeDetectionStrategy, signal, input, output, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

  private sanitizer = inject(DomSanitizer);

  doctor = signal({
    name: 'Dra. Andréa Costa',
    avatarUrl: 'https://lh3.googleusercontent.com/rd-d/ALs6j_GQbntr7zRiBfNBAsG7xlv1zXl3zXpmg8Z88H2VxdKdm4PZGHU3cj8ZIVsAWP4MMe6eIz_EJZz0YYB6yQlYUhOwIbp6say0F_BKSP0s9CVgrwrHXGN8O3fxcI8qzramMHIBKbr__quJTGunSW26exl_ptkX3jFV-acW0H5tFmsy30_UQp0NzeDsdBbdPS2u33OKGfBRnrZTU5FA6JlJJoYK9OX1g0_LYMwz-4-JEwPEWimeWiim_wLOR-4kNsgcQTOlb9Dr1qlttlMvKjdwivJEXWoakrk2l8SJ3on7g-ujSqqB_ZvNg-W-pHkvnC9IltMq5PK9HIp_RY71QJZamrwQRi3vp-SH3fMrMP6qQ5RP63e1lZ2WseNK52HKmWTvNmNJAGPrwykgLYVZ-04Q_F2fMuPG83kFDxQd68inJzdiSavVTGdGcuPy4AfWQ8Od_RTFlIZHadKP2tFJUc6J5MgCrnsVWNHh4mVkuMGRYl02bkXauEocnQEfrBEA1dDj4O9gZewN84OXdhvCcLB6Q0PcexfRX1Qc_Rp3KwSEYckuNL6zEV_8kJ0AqqIo5f7KOOmQPdZoIS6piJdoa_fm1_kszO0y1qVUwM0Zcx3XTd3ov9YJ-Wvgs_eXe9Mjk28krXzTnQBdOHOJ3kXlO5hXgBkPAa9aF-yIeAAqwFDj_JWbvYGwDYXz1OKrgbhYgb35SdllxG5_u9fuN7zPcZirCDbzIyduew7t70O_3MxIpLyZNKCTuRF9AEyYGrOxE6USuE_FR3qTT9c4MNt3dTWGmJhr2_IOmxvu6UZaC5Q-gUsI0-euUOEua0XHuII6no4bJI1kHWuF2FZlpozb3al7HGwmWhUA94yTE6cvbHpwA9KW0Uo76e0Pt5zmxjd3AbHGskj-G6_wBxrhnjwDpEqjIBMqyr8XWdV88_7KZs2bg26OV0o2ziBzax7E_UIZ8SDUGsHD1TvhM3cgA-WHM7FZqouJMQ9nvypM6vbD0tRxVuukfR5jEseASN1CGvS5_Ndbw0NdWv37B9yshoJSmWYsOfqVqIRbLs8T5xbb69ctHt6N_q8zuDfvPV2e9pq_lAm5kORryHGl1izCgY2hU4u5e7rQg2Wf2xMpqxXMays3A2KJslV49jvDKVMhi8fidd-mCHQxTIXWOzMwKUuk7RamPQPEk4MeIySmNAl0ebFzT8AR2mjoQ9zn-hTmzDPFen9ct_YjyvsxXfXSR50AVSK_yYF63tPv82kG=w1920-h912?auditContext=thumbnail&auditContext=prefetch',
  });

  navItems = signal<NavItem[]>([
    { icon: 'calendar', label: 'Agenda', active: false },
    { icon: 'users', label: 'Pacientes', active: true },
    { icon: 'chart', label: 'Relatórios', active: false },
    { icon: 'settings', label: 'Configurações', active: false },
  ]);

  private iconSvgTemplates: { [key: string]: string } = {
    calendar: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25m10.5 0V3m0 2.25h-15A2.25 2.25 0 0 0 3 7.5v11.25c0 1.24 1.01 2.25 2.25 2.25h13.5c1.24 0 2.25-1.01 2.25-2.25V7.5A2.25 2.25 0 0 0 18.75 5.25h-15Z" /></svg>`,
    users: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
</svg>
`,
    chart: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>`,
    settings: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>
`
  };

  onToggleNav(): void {
    this.navToggled.emit();
  }

  getSafeIconHtml(iconName: string): SafeHtml {
    const svgContent = this.iconSvgTemplates[iconName] || '';
    return this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }
}
