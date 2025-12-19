import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (toastState(); as state) {
      <div class="fixed top-24 right-8 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex items-start w-full max-w-sm animate-fade-in-down">
        <div class="flex-shrink-0" [class]="state.type === 'success' ? 'text-green-500' : 'text-red-500'">
          @if (state.type === 'success') {
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />
            </svg>
          }
        </div>
        <div class="ml-3 flex-1">
          <p class="font-semibold text-gray-800">{{ state.title }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ state.message }}</p>
        </div>
        <button (click)="hideToast()" class="ml-4 p-1 -mr-2 -mt-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
    }
  `,
  styles: [`
    .animate-fade-in-down {
      animation: fadeInDown 0.3s ease-out forwards;
    }

    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translate3d(0, -20px, 0);
      }
      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  private toastService = inject(ToastService);
  toastState = this.toastService.toastState;

  hideToast() {
    this.toastService.hide();
  }
}
