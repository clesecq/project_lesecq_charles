import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Pollution, PollutionType } from '../pollution.model';

const TYPE_LABELS: Record<PollutionType, string> = {
  plastique: 'Plastique',
  chimique: 'Chimique',
  'depot-sauvage': 'Depot sauvage',
  eau: 'Eau',
  air: 'Air',
  autre: 'Autre'
};

@Component({
  selector: 'app-pollution-recap',
  imports: [CommonModule],
  template: `
    @if (data(); as pollution) {
      <section class="recap">
        <header class="recap__header">
          <div>
            <h3>Recapitulatif de la declaration</h3>
            <p>Revoyez les informations enregistrees avant d'en declarer une nouvelle.</p>
          </div>
          <button type="button" class="recap__button" (click)="resetRequested.emit()">
            Declarer une autre pollution
          </button>
        </header>

        <dl class="recap__grid">
          <div class="recap__item">
            <dt>Titre</dt>
            <dd>{{ pollution.title }}</dd>
          </div>
          <div class="recap__item">
            <dt>Type</dt>
            <dd>{{ labelType(pollution.type) }}</dd>
          </div>
          <div class="recap__item">
            <dt>Date de l'observation</dt>
            <dd>{{ pollution.observedAt | date: 'dd/MM/yyyy HH:mm' }}</dd>
          </div>
          <div class="recap__item">
            <dt>Lieu</dt>
            <dd>{{ pollution.location }}</dd>
          </div>
          <div class="recap__item">
            <dt>Latitude</dt>
            <dd>{{ pollution.latitude }}</dd>
          </div>
          <div class="recap__item">
            <dt>Longitude</dt>
            <dd>{{ pollution.longitude }}</dd>
          </div>
        </dl>
      </section>
    }
  `,
  styles: [
    `
      .recap {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .recap__header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .recap__header h3 {
        margin: 0;
        font-size: 1.4rem;
      }

      .recap__header p {
        margin: 0.4rem 0 0;
        color: #4b5563;
      }

      .recap__button {
        align-self: flex-start;
        padding: 0.6rem 1.2rem;
        border-radius: 0.6rem;
        border: none;
        background: #2563eb;
        color: #ffffff;
        font-weight: 600;
        cursor: pointer;
      }

      .recap__button:hover,
      .recap__button:focus {
        background: #1d4ed8;
      }

      .recap__button:focus-visible {
        outline: 2px solid #1d4ed8;
        outline-offset: 2px;
      }

      .recap__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
        margin: 0;
        padding: 0;
      }

      .recap__item {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        background: #f9fafb;
        padding: 1rem;
        border-radius: 0.75rem;
        min-height: 120px;
      }

      .recap__item--full {
        grid-column: 1 / -1;
      }

      .recap__item dt {
        font-size: 0.75rem;
        text-transform: uppercase;
        color: #6b7280;
        letter-spacing: 0.04em;
      }

      .recap__item dd {
        margin: 0;
        font-weight: 600;
        color: #111827;
      }

      .recap__photo {
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .recap__photo img {
        width: 100%;
        max-height: 320px;
        object-fit: cover;
        border-radius: 0.75rem;
        border: 1px solid #e5e7eb;
      }

      .recap__photo figcaption {
        font-size: 0.85rem;
        color: #4b5563;
      }

      @media (max-width: 640px) {
        .recap__item {
          min-height: auto;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollutionRecapComponent {
  readonly data = input<Pollution | null>(null);
  readonly resetRequested = output<void>();

  labelType(type: PollutionType) {
    return TYPE_LABELS[type] ?? type;
  }
}
