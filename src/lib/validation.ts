import { z } from 'zod';

/**
 * Validation schemas and input sanitization utilities
 * Security best practices for user input handling
 */

// Auth form validation schemas
export const authSchemas = {
  signIn: z.object({
    email: z.string()
      .trim()
      .min(1, 'El email es requerido')
      .email('Email inválido')
      .max(255, 'Email demasiado largo'),
    password: z.string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(100, 'Contraseña demasiado larga')
  }),
  
  signUp: z.object({
    email: z.string()
      .trim()
      .min(1, 'El email es requerido')
      .email('Email inválido')
      .max(255, 'Email demasiado largo'),
    password: z.string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(100, 'Contraseña demasiado larga')
      .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/, 'Caracteres no válidos en contraseña'),
    displayName: z.string()
      .trim()
      .max(100, 'Nombre demasiado largo')
      .optional()
      .transform(val => val || undefined)
  })
};

// Input sanitization utilities
export const sanitizeInput = {
  // Remove potential XSS characters
  text: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .trim();
  },
  
  // Sanitize recipe names for edge functions
  recipeName: (name: string): string => {
    return name
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/[^\w\s\-,.áéíóúñÁÉÍÓÚÑ]/g, '') // Allow only safe characters
      .trim()
      .slice(0, 200); // Limit length
  }
};
