import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { PollutionService } from '../pollution.service';
import { Pollution, PollutionPayload, PollutionType } from '../pollution.model';
import { finiteNumberValidator, validDateTimeValidator } from '../pollution.validators';
import { PollutionRecapComponent } from './pollution-recap.component.js';
import { FavoritesService } from '../favorites.service';

@Component({
  selector: 'app-pollution-list',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, PollutionRecapComponent],
  templateUrl: './pollution-list.component.html',
  styleUrl: './pollution-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollutionListComponent {
  private readonly pollutionService = inject(PollutionService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  readonly favoritesService = inject(FavoritesService);

  readonly pollutions = this.pollutionService.pollutions;
  readonly isLoading = this.pollutionService.isLoading;
  readonly error = this.pollutionService.error;

  readonly typeOptions: ReadonlyArray<{ value: PollutionType; label: string }> = [
    { value: 'plastique', label: 'Plastique' },
    { value: 'chimique', label: 'Chimique' },
    { value: 'depot-sauvage', label: 'Depot sauvage' },
    { value: 'eau', label: 'Eau' },
    { value: 'air', label: 'Air' },
    { value: 'autre', label: 'Autre' }
  ];

  readonly filtersForm = this.fb.group({
    title: this.fb.control(''),
    location: this.fb.control(''),
    type: this.fb.control<'all' | PollutionType>('all')
  });

  readonly createForm = this.fb.group({
    title: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(3)]
    }),
    type: this.fb.control<PollutionType>('plastique', {
      validators: [Validators.required]
    }),
    description: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(10)]
    }),
    observedAt: this.fb.control(this.currentDateTimeLocal(), {
      validators: [Validators.required, validDateTimeValidator()]
    }),
    location: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(3)]
    }),
    latitude: this.fb.control(0, {
      validators: [
        Validators.required,
        finiteNumberValidator(),
        Validators.min(-90),
        Validators.max(90)
      ]
    }),
    longitude: this.fb.control(0, {
      validators: [
        Validators.required,
        finiteNumberValidator(),
        Validators.min(-180),
        Validators.max(180)
      ]
    }),
    discoveredBy: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(3)]
    })
  });

  readonly selectedPhoto = signal<File | null>(null);
  readonly recapPollution = signal<Pollution | null>(null);
  readonly showRecap = computed(() => this.recapPollution() !== null);

  private readonly filters = toSignal(
    this.filtersForm.valueChanges.pipe(
      startWith(this.filtersForm.getRawValue()),
      map((values) => ({
        title: (values.title ?? '').trim().toLowerCase(),
        location: (values.location ?? '').trim().toLowerCase(),
        type: values.type ?? 'all'
      }))
    ),
    { initialValue: { title: '', location: '', type: 'all' as const } }
  );

  readonly filteredPollutions = computed(() => {
    const filters = this.filters();

    return this.pollutions().filter((pollution) => {
      const titleMatch = filters.title ? pollution.title.toLowerCase().includes(filters.title) : true;
      const locationMatch = filters.location
        ? pollution.location.toLowerCase().includes(filters.location)
        : true;
      const typeMatch = filters.type === 'all' ? true : pollution.type === filters.type;
      return titleMatch && locationMatch && typeMatch;
    });
  });

  constructor() {
    effect(() => {
      this.pollutionService
        .refresh()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          error: () => {
            /* error state already handled by the service */
          }
        });
    }, { allowSignalWrites: true });
  }

  onCreate() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const raw = this.createForm.getRawValue();
    const payload: PollutionPayload = {
      ...raw,
      observedAt: this.toIso(raw.observedAt)
    };

    this.pollutionService
      .create(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created) => {
          // If a photo was selected, upload it
          const photo = this.selectedPhoto();
          if (photo) {
            this.pollutionService
              .uploadPhoto(created.id, photo)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: () => {
                  this.recapPollution.set(created);
                  this.selectedPhoto.set(null);
                  this.createForm.markAsPristine();
                  this.createForm.markAsUntouched();
                },
                error: () => {
                  // Still show recap even if photo upload fails
                  this.recapPollution.set(created);
                  this.selectedPhoto.set(null);
                }
              });
          } else {
            this.recapPollution.set(created);
            this.createForm.markAsPristine();
            this.createForm.markAsUntouched();
          }
        }
      });
  }

  onRecapReset() {
    this.recapPollution.set(null);
    this.selectedPhoto.set(null);
    this.createForm.reset(this.defaultCreateValues());
    this.createForm.markAsPristine();
    this.createForm.markAsUntouched();
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille du fichier ne doit pas dépasser 5 MB');
        input.value = '';
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Seuls les fichiers image sont acceptés');
        input.value = '';
        return;
      }
      this.selectedPhoto.set(file);
    }
  }

  onDelete(id: number) {
    const shouldDelete = globalThis.confirm('Supprimer cette declaration ?');
    if (!shouldDelete) {
      return;
    }

    this.pollutionService
      .remove(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  private defaultCreateValues() {
    return {
      title: '',
      type: 'plastique' as PollutionType,
      description: '',
      observedAt: this.currentDateTimeLocal(),
      location: '',
      latitude: 0,
      longitude: 0,
      photoUrl: '',
      discoveredBy: ''
    };
  }

  private currentDateTimeLocal() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private toIso(value: string) {
    if (!value) {
      return new Date().toISOString();
    }

    return new Date(value).toISOString();
  }

  labelType(type: PollutionType) {
    return this.typeOptions.find((option) => option.value === type)?.label ?? type;
  }

  toggleFavorite(pollutionId: number) {
    this.favoritesService.toggle(pollutionId);
  }

  isFavorite(pollutionId: number): boolean {
    return this.favoritesService.isFavorite(pollutionId);
  }
}
