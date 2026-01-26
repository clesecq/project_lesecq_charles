/**
 * Validation utilities using regex patterns for input sanitization
 */

// Alphanumeric only, 1-20 characters
export const REGEX_ALPHANUMERIC = /^[A-Za-z0-9]{1,20}$/;

// Alphanumeric with spaces and accents, 1-100 characters
export const REGEX_NAME = /^[A-Za-zÀ-ÿ0-9\s'-]{1,100}$/;

// Text with basic punctuation, 3-500 characters
export const REGEX_TEXT = /^[A-Za-zÀ-ÿ0-9\s.,!?;:()'"\-–—]{3,500}$/;

// Text with extended punctuation for descriptions, 10-2000 characters
export const REGEX_DESCRIPTION = /^[\w\W]{10,2000}$/;

// ISO 8601 date format
export const REGEX_ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

// Latitude: -90 to 90
export const REGEX_LATITUDE = /^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;

// Longitude: -180 to 180
export const REGEX_LONGITUDE = /^-?((1[0-7]\d|[1-9]?\d)(\.\d+)?|180(\.0+)?)$/;

// URL with http/https
export const REGEX_URL = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// Pollution types (must match model enum)
export const REGEX_POLLUTION_TYPE = /^(plastique|chimique|depot-sauvage|eau|air|autre)$/;

// Numeric ID
export const REGEX_NUMERIC_ID = /^\d+$/;

// UUID v4
export const REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validation functions
 */

export interface ValidationError {
  field: string;
  message: string;
}

export function validateLogin(login: string): ValidationError | null {
  if (!login) {
    return { field: 'login', message: 'Login est requis' };
  }
  if (!REGEX_ALPHANUMERIC.test(login)) {
    return { field: 'login', message: 'Login doit contenir uniquement des lettres et chiffres (1-20 caractères)' };
  }
  return null;
}

export function validatePassword(password: string): ValidationError | null {
  if (!password) {
    return { field: 'password', message: 'Mot de passe est requis' };
  }
  if (password.length < 4) {
    return { field: 'password', message: 'Mot de passe doit contenir au moins 4 caractères' };
  }
  if (!REGEX_ALPHANUMERIC.test(password)) {
    return { field: 'password', message: 'Mot de passe doit contenir uniquement des lettres et chiffres' };
  }
  return null;
}

export function validateName(name: string, fieldName: string): ValidationError | null {
  if (!name) {
    return { field: fieldName, message: `${fieldName} est requis` };
  }
  if (!REGEX_NAME.test(name)) {
    return { field: fieldName, message: `${fieldName} contient des caractères invalides` };
  }
  return null;
}

export function validateTitle(title: string): ValidationError | null {
  if (!title) {
    return { field: 'title', message: 'Titre est requis' };
  }
  if (title.length < 3 || title.length > 200) {
    return { field: 'title', message: 'Titre doit contenir entre 3 et 200 caractères' };
  }
  if (!REGEX_TEXT.test(title)) {
    return { field: 'title', message: 'Titre contient des caractères invalides' };
  }
  return null;
}

export function validateDescription(description: string): ValidationError | null {
  if (!description) {
    return { field: 'description', message: 'Description est requise' };
  }
  if (!REGEX_DESCRIPTION.test(description)) {
    return { field: 'description', message: 'Description doit contenir entre 10 et 2000 caractères' };
  }
  return null;
}

export function validatePollutionType(type: string): ValidationError | null {
  if (!type) {
    return { field: 'type', message: 'Type de pollution est requis' };
  }
  if (!REGEX_POLLUTION_TYPE.test(type)) {
    return { field: 'type', message: 'Type de pollution invalide' };
  }
  return null;
}

export function validateISODate(date: string, fieldName: string): ValidationError | null {
  if (!date) {
    return { field: fieldName, message: `${fieldName} est requis` };
  }
  if (!REGEX_ISO_DATE.test(date)) {
    return { field: fieldName, message: `${fieldName} doit être au format ISO 8601` };
  }
  // Additional validation: check if it's a valid date
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { field: fieldName, message: `${fieldName} n'est pas une date valide` };
  }
  return null;
}

export function validateLocation(location: string): ValidationError | null {
  if (!location) {
    return { field: 'location', message: 'Lieu est requis' };
  }
  if (location.length < 3 || location.length > 200) {
    return { field: 'location', message: 'Lieu doit contenir entre 3 et 200 caractères' };
  }
  if (!REGEX_TEXT.test(location)) {
    return { field: 'location', message: 'Lieu contient des caractères invalides' };
  }
  return null;
}

export function validateLatitude(latitude: number): ValidationError | null {
  if (latitude === null || latitude === undefined) {
    return { field: 'latitude', message: 'Latitude est requise' };
  }
  if (typeof latitude !== 'number' || isNaN(latitude)) {
    return { field: 'latitude', message: 'Latitude doit être un nombre' };
  }
  if (!REGEX_LATITUDE.test(latitude.toString())) {
    return { field: 'latitude', message: 'Latitude doit être entre -90 et 90' };
  }
  return null;
}

export function validateLongitude(longitude: number): ValidationError | null {
  if (longitude === null || longitude === undefined) {
    return { field: 'longitude', message: 'Longitude est requise' };
  }
  if (typeof longitude !== 'number' || isNaN(longitude)) {
    return { field: 'longitude', message: 'Longitude doit être un nombre' };
  }
  if (!REGEX_LONGITUDE.test(longitude.toString())) {
    return { field: 'longitude', message: 'Longitude doit être entre -180 et 180' };
  }
  return null;
}

export function validateNumericId(id: string, fieldName: string = 'id'): ValidationError | null {
  if (!id) {
    return { field: fieldName, message: `${fieldName} est requis` };
  }
  if (!REGEX_NUMERIC_ID.test(id)) {
    return { field: fieldName, message: `${fieldName} doit être un nombre` };
  }
  return null;
}

/**
 * Validate user creation data
 */
export function validateUserCreation(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  const nomError = validateName(data.nom, 'nom');
  if (nomError) errors.push(nomError);

  const prenomError = validateName(data.prenom, 'prenom');
  if (prenomError) errors.push(prenomError);

  const loginError = validateLogin(data.login);
  if (loginError) errors.push(loginError);

  const passError = validatePassword(data.pass);
  if (passError) errors.push(passError);

  return errors;
}

/**
 * Validate pollution creation/update data
 */
export function validatePollutionData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  const titleError = validateTitle(data.title);
  if (titleError) errors.push(titleError);

  const typeError = validatePollutionType(data.type);
  if (typeError) errors.push(typeError);

  const descriptionError = validateDescription(data.description);
  if (descriptionError) errors.push(descriptionError);

  const observedAtError = validateISODate(data.observedAt, 'observedAt');
  if (observedAtError) errors.push(observedAtError);

  const locationError = validateLocation(data.location);
  if (locationError) errors.push(locationError);

  const latitudeError = validateLatitude(data.latitude);
  if (latitudeError) errors.push(latitudeError);

  const longitudeError = validateLongitude(data.longitude);
  if (longitudeError) errors.push(longitudeError);

  const discoveredByError = validateName(data.discoveredBy, 'discoveredBy');
  if (discoveredByError) errors.push(discoveredByError);

  return errors;
}
