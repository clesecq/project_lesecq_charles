import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { PollutionService } from '../pollution.service';
import { PollutionPayload, PollutionType } from '../pollution.model';
import { finiteNumberValidator, validDateTimeValidator } from '../pollution.validators';
import { FavoritesService } from '../favorites.service';

@Component({
  selector: 'app-pollution-detail',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './pollution-detail.component.html',
  styleUrl: './pollution-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollutionDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  readonly service = inject(PollutionService);
  private readonly destroyRef = inject(DestroyRef);
  readonly favoritesService = inject(FavoritesService);

  readonly isLoading = this.service.isLoading;
  readonly error = this.service.error;
  readonly typeOptions: ReadonlyArray<{ value: PollutionType; label: string }> = [
    { value: 'plastique', label: 'Plastique' },
    { value: 'chimique', label: 'Chimique' },
    { value: 'depot-sauvage', label: 'Depot sauvage' },
    { value: 'eau', label: 'Eau' },
    { value: 'air', label: 'Air' },
    { value: 'autre', label: 'Autre' }
  ];

  readonly pollutionId = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id')),
      map((id) => {
        if (!id) {
          return null;
        }

        const parsed = Number.parseInt(id, 10);
        return Number.isNaN(parsed) ? null : parsed;
      })
    ),
    { initialValue: null }
  );

  readonly pollution = computed(() => {
    const id = this.pollutionId();
    if (id === null) {
      return null;
    }

    return this.service.pollutions().find((item) => item.id === id) ?? null;
  });

  readonly form = this.fb.group({
    title: this.fb.control('', { validators: [Validators.required, Validators.minLength(3)] }),
    type: this.fb.control<PollutionType>('plastique', { validators: [Validators.required] }),
    description: this.fb.control('', { validators: [Validators.required, Validators.minLength(10)] }),
    observedAt: this.fb.control('', { validators: [Validators.required, validDateTimeValidator()] }),
    location: this.fb.control('', { validators: [Validators.required, Validators.minLength(3)] }),
    latitude: this.fb.control(0, {
      validators: [Validators.required, finiteNumberValidator(), Validators.min(-90), Validators.max(90)]
    }),
    longitude: this.fb.control(0, {
      validators: [Validators.required, finiteNumberValidator(), Validators.min(-180), Validators.max(180)]
    }),
    photoUrl: this.fb.control(''),
    discoveredBy: this.fb.control('', { validators: [Validators.required, Validators.minLength(3)] })
  });

  private readonly formChanges = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() }
  );

  readonly selectedPhoto = signal<File | null>(null);
  readonly statusMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.pollutionId();
      if (id === null) {
        return;
      }

      const pollution = this.pollution();
      if (!pollution) {
        this.service
          .getById(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe();
        return;
      }

      this.form.reset(
        {
          title: pollution.title,
          type: pollution.type,
          description: pollution.description,
          observedAt: this.toDateTimeLocal(pollution.observedAt),
          location: pollution.location,
          latitude: pollution.latitude,
          longitude: pollution.longitude,
          photoUrl: pollution.photoUrl ?? ''
        },
        { emitEvent: false }
      );
    }, { allowSignalWrites: true });

    effect(() => {
      this.formChanges();
      this.statusMessage.set(null);
    }, { allowSignalWrites: true });
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.pollutionId();
    if (id === null) {
      return;
    }

    const raw = this.form.getRawValue();

    const payload: PollutionPayload = {
      ...raw,
      observedAt: this.toIso(raw.observedAt),
      photoUrl: raw.photoUrl?.trim() ? raw.photoUrl.trim() : undefined
    };

    this.service
      .update(id, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.statusMessage.set('Declaration mise a jour.');
        }
      });
  }

  onDelete() {
    const id = this.pollutionId();
    if (id === null) {
      return;
    }

    const shouldDelete = globalThis.confirm('Supprimer cette declaration ?');
    if (!shouldDelete) {
      return;
    }

    this.service
      .remove(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          void this.router.navigate(['/pollutions']);
        }
      });
  }

  toggleFavorite() {
    const id = this.pollutionId();
    if (id !== null) {
      this.favoritesService.toggle(id);
    }
  }

  isFavorite(): boolean {
    const id = this.pollutionId();
    return id !== null && this.favoritesService.isFavorite(id);
  }

  labelType(type: PollutionType) {
    return this.typeOptions.find((option) => option.value === type)?.label ?? type;
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

  onUploadPhoto() {
    const id = this.pollutionId();
    const photo = this.selectedPhoto();
    
    if (id === null || !photo) {
      return;
    }

    this.service
      .uploadPhoto(id, photo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.statusMessage.set('Photo uploadée avec succès');
          this.selectedPhoto.set(null);
          setTimeout(() => this.statusMessage.set(null), 3000);
        },
        error: () => {
          this.statusMessage.set('Erreur lors de l\'upload de la photo');
          setTimeout(() => this.statusMessage.set(null), 3000);
        }
      });
  }

  private toDateTimeLocal(value: string) {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private toIso(value: string) {
    if (!value) {
      return new Date().toISOString();
    }

    const date = new Date(value);
    return date.toISOString();
  }
}
