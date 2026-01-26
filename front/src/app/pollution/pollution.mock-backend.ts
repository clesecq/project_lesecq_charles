import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { delay, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pollution, PollutionPayload } from './pollution.model';

const apiUrl = environment.apiUrl.replace(/\/$/, '');
const basePath = `${apiUrl}/pollutions`;

let nextId = 6;

const inMemoryPollutions: Pollution[] = [
  {
    id: 1,
    title: 'Filets abandones sur la Seine',
    type: 'plastique',
    description: 'Filets de peche et plastiques flottants bloques pres des quais.',
    observedAt: new Date('2025-03-11T08:30:00Z').toISOString(),
    location: 'Paris - Quai de Bercy',
    latitude: 48.833,
    longitude: 2.379,
    discoveredBy: 'Jean Dupont'
  },
  {
    id: 2,
    title: 'Camion dechets chimiques',
    type: 'chimique',
    description: 'Camion stationne diffusant une forte odeur chimique a proximite du port.',
    observedAt: new Date('2025-03-09T09:10:00Z').toISOString(),
    location: 'Lyon - Port Edouard Herriot',
    latitude: 45.723,
    longitude: 4.839,
    discoveredBy: 'Marie Martin'
  },
  {
    id: 3,
    title: 'Tas de gravats et pneus',
    type: 'depot-sauvage',
    description: 'Accumulation de gravats melanges a des pneus et dechets menagers.',
    observedAt: new Date('2025-03-07T15:45:00Z').toISOString(),
    location: 'Marseille - Quartier de la Cabucelle',
    latitude: 43.322,
    longitude: 5.359,
    discoveredBy: 'Pierre Durand'
  },
  {
    id: 4,
    title: 'Ecoulement trouble dans la riviere',
    type: 'eau',
    description: 'Eau trouble et odeur suspecte observes a la sortie dun tuyau.',
    observedAt: new Date('2025-03-10T06:30:00Z').toISOString(),
    location: 'Grenoble - Isere a Saint-Martin-le-Vinoux',
    latitude: 45.203,
    longitude: 5.697,
    discoveredBy: 'Sophie Bernard'
  },
  {
    id: 5,
    title: 'Fumee noire recurrente',
    type: 'air',
    description: 'Panache de fumee epaisse provenant dune usine en bord de zone portuaire.',
    observedAt: new Date('2025-03-08T19:20:00Z').toISOString(),
    location: 'Toulouse - Zone Portuaire du Sud-Ouest',
    latitude: 43.598,
    longitude: 1.427,
    discoveredBy: 'Luc Petit'
  }
];

const delayMs = 150;

export const mockPollutionBackendInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  if (!req.url.startsWith(basePath)) {
    return next(req);
  }

  const { method } = req;
  const resourcePath = req.url.substring(basePath.length);
  const idSegment = resourcePath.replace(/^\//, '').split('/')[0] || null;
  const id = idSegment ? Number.parseInt(idSegment, 10) : null;

  switch (method) {
    case 'GET': {
      if (id === null) {
        return of(new HttpResponse({ status: 200, body: [...inMemoryPollutions] })).pipe(delay(delayMs));
      }

      const pollution = inMemoryPollutions.find((item) => item.id === id);
      if (!pollution) {
        return throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' }));
      }

      return of(new HttpResponse({ status: 200, body: { ...pollution } })).pipe(delay(delayMs));
    }
    case 'POST': {
      const payload = req.body as PollutionPayload;
      const created: Pollution = { ...payload, id: nextId++ };
      inMemoryPollutions.unshift(created);
      return of(new HttpResponse({ status: 201, body: created })).pipe(delay(delayMs));
    }
    case 'PUT': {
      if (id === null) {
        return throwError(() => new HttpErrorResponse({ status: 400, statusText: 'Bad Request' }));
      }

      const payload = req.body as PollutionPayload;
      const index = inMemoryPollutions.findIndex((item) => item.id === id);

      if (index === -1) {
        return throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' }));
      }

      const updated: Pollution = { ...payload, id };
      inMemoryPollutions.splice(index, 1, updated);

      return of(new HttpResponse({ status: 200, body: updated })).pipe(delay(delayMs));
    }
    case 'DELETE': {
      if (id === null) {
        return throwError(() => new HttpErrorResponse({ status: 400, statusText: 'Bad Request' }));
      }

      const index = inMemoryPollutions.findIndex((item) => item.id === id);

      if (index === -1) {
        return throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' }));
      }

      inMemoryPollutions.splice(index, 1);

      return of(new HttpResponse({ status: 204 })).pipe(delay(delayMs));
    }
    default:
      return next(req);
  }
};
