/**
 * Express Middleware
 * CORS, body parsing, error handling
 */

import { Express, Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';
import { error as logError } from '../utils/logger';

export function setupMiddleware(app: Express): void {
  // CORS
  const isAllowedOrigin = (origin: string): boolean => {
    // Standard allowed origins
    const allowedOrigins = [
      'http://localhost:8000',
      'http://localhost:3000',
      'http://localhost:8765',
      'http://localhost:8766',
      'http://localhost:8767',
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    ];

    if (allowedOrigins.indexOf(origin) !== -1) return true;

    // Allow jetstart.site and any subdomains
    if (origin === 'https://jetstart.site' || origin.endsWith('.jetstart.site')) return true;

    return false;
  };

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (isAllowedOrigin(origin) || !process.env.IS_PROD) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    });

    next();
  });

  // Error handling
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    logError(`Server error: ${err.message}`);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  });
}