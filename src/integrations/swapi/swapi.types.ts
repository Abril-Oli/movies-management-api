export interface SwapiFilmProperties {
  title: string;
  director: string;
  producer: string;
  release_date: string;
  opening_crawl: string;
}

export interface SwapiFilmResource {
  uid: string;
  description?: string;
  properties: SwapiFilmProperties;
}

export interface SwapiResponse<T> {
  message: string;
  result: T | T[];
}