import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { catchError, finalize, tap, throwError, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, UserPayload } from './user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  private readonly usersState = signal<User[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly users = computed(() => this.usersState());
  readonly isLoading = computed(() => this.loadingState());
  readonly error = computed(() => this.errorState());

  refresh() {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.get<User[]>(this.baseUrl).pipe(
      tap((users) => this.usersState.set(users)),
      catchError((error) => {
        this.errorState.set('Impossible de charger les utilisateurs.');
        return throwError(() => error);
      }),
      finalize(() => this.loadingState.set(false)),
      shareReplay(1)
    );
  }

  create(payload: UserPayload) {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.post<User>(this.baseUrl, payload).pipe(
      tap((created) => this.usersState.update((users) => [created, ...users])),
      catchError((error) => {
        this.errorState.set("Impossible d'ajouter l'utilisateur.");
        return throwError(() => error);
      }),
      finalize(() => this.loadingState.set(false))
    );
  }
}
