import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key error
  if ((err as NodeJS.ErrnoException & { code?: number }).code === 11000) {
    const keyValue = (err as unknown as { keyValue: Record<string, string> }).keyValue;
    const field = Object.keys(keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(', ');
    statusCode = 400;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  // Multer errors
  if (err.message?.includes('Only JPEG, PNG')) {
    statusCode = 400;
  }
  if (err.message?.includes('File too large')) {
    message = 'File size too large. Maximum 10MB per image.';
    statusCode = 400;
  }
  if (err.message?.includes('Too many files')) {
    message = 'Maximum 10 images allowed per car.';
    statusCode = 400;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};
