import { Injectable, signal } from '@angular/core';

export interface ToastState {
  message: string;
  title: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toastState = signal<ToastState | null>(null);
  private timer: any;

  show(
    title: string,
    message: string,
    type: 'success' | 'error' = 'success'
  ) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.toastState.set({ message, title, type });
    this.timer = setTimeout(() => this.hide(), 4000);
  }

  hide() {
    this.toastState.set(null);
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
