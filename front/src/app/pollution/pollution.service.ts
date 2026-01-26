import { HttpClient } from '@angular/common/http';
import { inject, Injectable, computed, signal } from '@angular/core';
import { catchError, finalize, tap, throwError, shareReplay, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pollution, PollutionPayload } from './pollution.model';

@Injectable({ providedIn: 'root' })
export class PollutionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pollutions`;

  private readonly pollutionsState = signal<Pollution[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly pollutions = computed(() => this.pollutionsState());
  readonly isLoading = computed(() => this.loadingState());
  readonly error = computed(() => this.errorState());

  refresh() {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.get<Pollution[]>(this.baseUrl).pipe(
      tap((pollutions) => this.pollutionsState.set(pollutions)),
      catchError((error) => {
        this.errorState.set('Impossible de charger les pollutions.');
        return throwError(() => error);
      }),
      finalize(() => this.loadingState.set(false)),
      shareReplay(1)
    );
  }

  getById(id: number) {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.get<Pollution>(`${this.baseUrl}/${id}`).pipe(
      tap((pollution) => this.upsert(pollution)),
      catchError((error) => {
        this.errorState.set('Pollution introuvable.');
        return throwError(() => error);
      }),
      finalize(() => this.loadingState.set(false)),
      shareReplay(1)
    );
  }

  create(payload: PollutionPayload) {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.post<Pollution>(this.baseUrl, payload).pipe(
      tap((created) => this.pollutionsState.update((pollutions) => [created, ...pollutions])),
      catchError((error) => {
        this.errorState.set("Impossible d'ajouter la pollution.");
        return throwError(() => error);
      }),
      finalize(() => this.loadingState.set(false))
    );
  }

  update(id: number, payload: PollutionPayload) {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.put<Pollution>(`${this.baseUrl}/${id}`, payload).pipe(
      tap((updated) =>
        this.pollutionsState.update((pollutions) =>
          pollutions.map((pollution) => (pollution.id === updated.id ? updated : pollution))
        )
      ),
      catchError((error) => {
        this.errorState.set('Impossible de mettre a jour la pollution.');
        return throwError(() => error);
      }),
      finalize(() => this.loadingState.set(false))
    );
  }

  remove(id: number) {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() =>
        this.pollutionsState.update((pollutions) => pollutions.filter((pollution) => pollution.id !== id))
      ),
      catchError((error) => {
        this.errorState.set('Impossible de supprimer la pollution.');
        return throwError(() => error);
      }),
      finalize(() => this.loadingState.set(false))
    );
  }

  pollutionById(id: number) {
    return computed(() => this.pollutionsState().find((pollution) => pollution.id === id) ?? null);
  }

  uploadPhoto(id: number, file: File) {
    this.loadingState.set(true);
    this.errorState.set(null);

    const formData = new FormData();
    formData.append('photo', file);

    return this.http.post(`${this.baseUrl}/${id}/photo`, formData).pipe(
      tap(() => {
        // Refresh pollution to get updated data
        this.getById(id).subscribe();
      }),
      catchError((error) => {
        this.errorState.set("Impossible d'uploader la photo.");
        return throwError(() => error);
      }),
      finalize(() => this.loadingState.set(false))
    );
  }

  getPhotoUrl(id: number): string {
    return `${this.baseUrl}/${id}/photo`;
  }

  getPhoto(id: number) {
    return this.http.get(`${this.baseUrl}/${id}/photo`, { responseType: 'blob' });
  }

  hasPhoto(pollution: Pollution): boolean {
    return !!pollution.photo;
  }

  /**
   * Server-side search with automatic request cancellation.
   * When used with switchMap, previous requests are cancelled when a new search is triggered.
   * Example usage:
   * searchControl.valueChanges.pipe(
   *   debounceTime(300),
   *   distinctUntilChanged(),
   *   switchMap(query => this.pollutionService.search(query))
   * )
   */
  search(query: string): Observable<Pollution[]> {
    const params: Record<string, string> = query ? { q: query } : {};
    return this.http.get<Pollution[]>(`${this.baseUrl}/search`, { params }).pipe(
      shareReplay(1)
    );
  }

  private upsert(pollution: Pollution) {
    this.pollutionsState.update((pollutions) => {
      const exists = pollutions.some((item) => item.id === pollution.id);
      return exists
        ? pollutions.map((item) => (item.id === pollution.id ? pollution : item))
        : [pollution, ...pollutions];
    });
  }
}
