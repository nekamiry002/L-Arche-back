// Classe ApiError pour une gestion cohérente des erreurs
class ApiError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

// Classe de validation pour les données
class ValidationError extends ApiError {
  constructor(message, details = null) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

// Classe pour les erreurs d'authentification
class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

// Classe pour les erreurs d'autorisation
class AuthorizationError extends ApiError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

// Classe pour les ressources non trouvées
class NotFoundError extends ApiError {
  constructor(resource = 'Resource', id = null) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

// Classe pour les conflits (ex: email déjà utilisé)
class ConflictError extends ApiError {
  constructor(message, details = null) {
    super(message, 409, details);
    this.name = 'ConflictError';
  }
}

// Middleware pour formater les erreurs dans les réponses
const errorHandler = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Erreurs ApiError (nos erreurs personnalisées)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        name: err.name,
        message: err.message,
        statusCode: err.statusCode,
        ...(isDevelopment && err.details && { details: err.details }),
      },
    });
  }

  // Erreur Supabase
  if (err.message && err.message.includes('PGRST')) {
    return res.status(400).json({
      error: {
        name: 'DatabaseError',
        message: isDevelopment ? err.message : 'Database operation failed',
        statusCode: 400,
      },
    });
  }

  // Erreur générique
  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: {
      name: 'InternalServerError',
      message: isDevelopment ? err.message : 'An unexpected error occurred',
      statusCode: 500,
    },
  });
};

module.exports = {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  errorHandler,
};
