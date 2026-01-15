export type PollutionType = 'plastique' | 'chimique' | 'depot-sauvage' | 'eau' | 'air' | 'autre';

export interface Pollution {
  id: number;
  title: string;
  type: PollutionType;
  description: string;
  observedAt: string;
  location: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  photo?: boolean; // Indicates if a photo blob exists
  photoMimeType?: string;
  discoveredBy: string;
}

export type PollutionPayload = Omit<Pollution, 'id'>;
