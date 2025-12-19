import { Component, ChangeDetectionStrategy, signal, inject, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  isDropdownOpen = signal(false);
  private elementRef = inject(ElementRef);
  private router = inject(Router);

  doctor = {
    name: 'Dra. Andréa Costa',
    avatarUrl: 'https://lh3.googleusercontent.com/rd-d/ALs6j_GQbntr7zRiBfNBAsG7xlv1zXl3zXpmg8Z88H2VxdKdm4PZGHU3cj8ZIVsAWP4MMe6eIz_EJZz0YYB6yQlYUhOwIbp6say0F_BKSP0s9CVgrwrHXGN8O3fxcI8qzramMHIBKbr__quJTGunSW26exl_ptkX3jFV-acW0H5tFmsy30_UQp0NzeDsdBbdPS2u33OKGfBRnrZTU5FA6JlJJoYK9OX1g0_LYMwz-4-JEwPEWimeWiim_wLOR-4kNsgcQTOlb9Dr1qlttlMvKjdwivJEXWoakrk2l8SJ3on7g-ujSqqB_ZvNg-W-pHkvnC9IltMq5PK9HIp_RY71QJZamrwQRi3vp-SH3fMrMP6qQ5RP63e1lZ2WseNK52HKmWTvNmNJAGPrwykgLYVZ-04Q_F2fMuPG83kFDxQd68inJzdiSavVTGdGcuPy4AfWQ8Od_RTFlIZHadKP2tFJUc6J5MgCrnsVWNHh4mVkuMGRYl02bkXauEocnQEfrBEA1dDj4O9gZewN84OXdhvCcLB6Q0PcexfRX1Qc_Rp3KwSEYckuNL6zEV_8kJ0AqqIo5f7KOOmQPdZoIS6piJdoa_fm1_kszO0y1qVUwM0Zcx3XTd3ov9YJ-Wvgs_eXe9Mjk28krXzTnQBdOHOJ3kXlO5hXgBkPAa9aF-yIeAAqwFDj_JWbvYGwDYXz1OKrgbhYgb35SdllxG5_u9fuN7zPcZirCDbzIyduew7t70O_3MxIpLyZNKCTuRF9AEyYGrOxE6USuE_FR3qTT9c4MNt3dTWGmJhr2_IOmxvu6UZaC5Q-gUsI0-euUOEua0XHuII6no4bJI1kHWuF2FZlpozb3al7HGwmWhUA94yTE6cvbHpwA9KW0Uo76e0Pt5zmxjd3AbHGskj-G6_wBxrhnjwDpEqjIBMqyr8XWdV88_7KZs2bg26OV0o2ziBzax7E_UIZ8SDUGsHD1TvhM3cgA-WHM7FZqouJMQ9nvypM6vbD0tRxVuukfR5jEseASN1CGvS5_Ndbw0NdWv37B9yshoJSmWYsOfqVqIRbLs8T5xbb69ctHt6N_q8zuDfvPV2e9pq_lAm5kORryHGl1izCgY2hU4u5e7rQg2Wf2xMpqxXMays3A2KJslV49jvDKVMhi8fidd-mCHQxTIXWOzMwKUuk7RamPQPEk4MeIySmNAl0ebFzT8AR2mjoQ9zn-hTmzDPFen9ct_YjyvsxXfXSR50AVSK_yYF63tPv82kG=w1920-h912?auditContext=thumbnail&auditContext=prefetch',
  };

  // Bound function to maintain 'this' context when used as an event listener
  private handleClickOutside = this.onDocumentClick.bind(this);

  ngOnInit(): void {
    // Add event listener when the component is initialized
    document.addEventListener('click', this.handleClickOutside, true);
  }

  ngOnDestroy(): void {
    // Remove event listener when the component is destroyed to prevent memory leaks
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update(open => !open);
  }
  
  logout(): void {
    // In a real app, this would call an AuthService
    this.router.navigate(['/login']);
  }

  private onDocumentClick(event: MouseEvent): void {
    if (this.isDropdownOpen()) {
      const clickedInside = this.elementRef.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.isDropdownOpen.set(false);
      }
    }
  }
}