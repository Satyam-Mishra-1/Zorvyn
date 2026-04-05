export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details;

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  const body = { error: message };
  if (details) body.details = details;
  res.status(status).json(body);
}

export class AppError extends Error {
  constructor(message, status = 400, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
