export class RepositoryError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'RepositoryError';
  }
}
