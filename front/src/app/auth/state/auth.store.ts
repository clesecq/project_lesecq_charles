import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { of } from 'rxjs';

// State model
export interface AuthStateModel {
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id: string;
    login: string;
    nom: string;
    prenom: string;
  } | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Actions
export class Login {
  static readonly type = '[Auth] Login';
  constructor(public pseudo: string, public password: string) {}
}

export class Register {
  static readonly type = '[Auth] Register';
  constructor(
    public nom: string,
    public prenom: string,
    public login: string,
    public password: string
  ) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class SetTokens {
  static readonly type = '[Auth] Set Tokens';
  constructor(
    public accessToken: string,
    public refreshToken: string,
    public user: any
  ) {}
}

export class ClearError {
  static readonly type = '[Auth] Clear Error';
}

// State
@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
})
@Injectable()
export class AuthState {
  private authService = inject(AuthService);

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return state.isAuthenticated;
  }

  @Selector()
  static user(state: AuthStateModel) {
    return state.user;
  }

  @Selector()
  static accessToken(state: AuthStateModel): string | null {
    return state.accessToken;
  }

  @Selector()
  static loading(state: AuthStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: AuthStateModel): string | null {
    return state.error;
  }

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, action: Login) {
    ctx.patchState({ loading: true, error: null });

    return this.authService.login(action.pseudo, action.password).pipe(
      tap((response) => {
        ctx.patchState({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: response.user,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.error?.message || 'Erreur de connexion',
        });
        return of(null);
      })
    );
  }

  @Action(Register)
  register(ctx: StateContext<AuthStateModel>, action: Register) {
    ctx.patchState({ loading: true, error: null });

    return this.authService
      .register(action.nom, action.prenom, action.login, action.password)
      .pipe(
        tap((response) => {
          ctx.patchState({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            user: response.user,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        }),
        catchError((error) => {
          ctx.patchState({
            loading: false,
            error: error.error?.message || "Erreur lors de l'inscription",
          });
          return of(null);
        })
      );
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    ctx.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  }

  @Action(SetTokens)
  setTokens(ctx: StateContext<AuthStateModel>, action: SetTokens) {
    ctx.patchState({
      accessToken: action.accessToken,
      refreshToken: action.refreshToken,
      user: action.user,
      isAuthenticated: true,
    });
  }

  @Action(ClearError)
  clearError(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ error: null });
  }
}
