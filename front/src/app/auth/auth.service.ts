import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthUser {
  id: string;
  login: string;
  nom: string;
  prenom: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  login(pseudo: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, {
      pseudo,
      password,
    });
  }

  register(
    nom: string,
    prenom: string,
    login: string,
    password: string
  ): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, {
      nom,
      prenom,
      login,
      pass: password,
    });
  }

  me(): Observable<{ user: AuthUser }> {
    return this.http.get<{ user: AuthUser }>(`${this.baseUrl}/me`);
  }
}

