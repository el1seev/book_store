import { NextFunction, Response, Request } from 'express';
import { AppError } from '../helpers/error_helper';
import { HttpCode } from '../types/http_code';

export class ErrorHandler {
  private static isTrustedError(err: Error): boolean {
    if (err instanceof AppError) {
      return err.isOperational;
    }
    return false;
  }

  private static handleTrustedError(err: AppError, res: Response): void {
    res.status(err.httpCode).json({ message: err.message });
  }

  private static handleCriticalError(err: Error | AppError, res: Response): void {
    if (res) {
      res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }

    console.log('Application encountered a critical error. Exiting');
    process.exit(1);
  }

  public static handleError(err: Error | AppError, res: Response, req: Request, next: NextFunction): void {
    if (this.isTrustedError(err) && res) {
      this.handleTrustedError(err as AppError, res);
    } else {
      this.handleCriticalError(err, res);
    }
  }
}
