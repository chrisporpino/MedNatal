import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './create-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePasswordComponent {
  private router = inject(Router);

  isPasswordVisible = signal(false);
  isConfirmPasswordVisible = signal(false);

  passwordForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', Validators.required),
  }, { validators: this.passwordsMatchValidator });
  
  passwordStrength = computed(() => {
    const password = this.passwordForm.get('password')?.value || '';
    if (password.length < 8) return 0;
    let score = 0;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score; // 0-4
  });

  private passwordsMatchValidator(control: FormGroup): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordsNotMatching: true });
      return { passwordsNotMatching: true };
    }
    // Clear error if they match now
    if (confirmPassword?.hasError('passwordsNotMatching')) {
       confirmPassword.setErrors(null);
    }
    return null;
  };

  togglePasswordVisibility(): void { this.isPasswordVisible.update(v => !v); }
  toggleConfirmPasswordVisibility(): void { this.isConfirmPasswordVisible.update(v => !v); }

  handleSavePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    console.log('Password reset attempt:', this.passwordForm.value.password);
    this.router.navigate(['/login']);
  }
}
