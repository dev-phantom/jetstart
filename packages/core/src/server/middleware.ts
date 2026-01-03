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
  app.use(cors({
    origin: '*',
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