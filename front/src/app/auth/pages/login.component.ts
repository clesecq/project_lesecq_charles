import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngxs/store';
import { Login, AuthState } from '../state/auth.store';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AsyncPipe],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Connexion</h2>
          <p>Connectez-vous à votre compte</p>
        </div>

        @if (error$ | async; as error) {
          <div class="error-message">
            {{ error }}
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="pseudo">Pseudo</label>
            <input 
              id="pseudo" 
              type="text" 
              formControlName="pseudo"
              placeholder="Votre pseudo"
              [class.invalid]="loginForm.get('pseudo')?.invalid && loginForm.get('pseudo')?.touched"
            />
            @if (loginForm.get('pseudo')?.invalid && loginForm.get('pseudo')?.touched) {
              <div class="error">
                Le pseudo est requis
              </div>
            }
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input 
              id="password" 
              type="password" 
              formControlName="password"
              placeholder="Votre mot de passe"
              [class.invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <div class="error">Le mot de passe est requis</div>
            }
          </div>

          <button 
            type="submit" 
            [disabled]="loginForm.invalid || (loading$ | async)"
            class="btn-primary"
          >
            @if (loading$ | async) {
              Connexion en cours...
            } @else {
              Se connecter
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>
            Pas encore de compte ? 
            <a routerLink="/register" class="link">Créer un compte</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .auth-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      padding: 3rem;
      max-width: 450px;
      width: 100%;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-header h2 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 2rem;
    }

    .auth-header p {
      margin: 0;
      color: #666;
      font-size: 1rem;
    }

    .error-message {
      background-color: #fee;
      color: #c33;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #555;
    }

    input {
      width: 100%;
      padding: 0.875rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    input.invalid {
      border-color: #c33;
    }

    .error {
      color: #c33;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .btn-primary {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
      margin-top: 1rem;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .auth-footer {
      margin-top: 2rem;
      text-align: center;
      color: #666;
    }

    .auth-footer p {
      margin: 0;
    }

    .link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .link:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  readonly error$ = this.store.select(AuthState.error);
  readonly loading$ = this.store.select(AuthState.loading);

  readonly loginForm = this.fb.nonNullable.group({
    pseudo: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const { pseudo, password } = this.loginForm.getRawValue();
    
    this.store.dispatch(new Login(pseudo, password)).subscribe(() => {
      const isAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);
      if (isAuthenticated) {
        this.router.navigate(['/pollutions']);
      }
    });
  }
}
