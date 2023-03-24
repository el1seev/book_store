import { HttpCode } from '../types/http_code';

interface AppErrorArgs {
  httpCode: HttpCode;
  description: string;
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly httpCode: number;
  public readonly description: string;
  public readonly isOperational: boolean = true;

  constructor(args: AppErrorArgs) {
    super(args.description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.httpCode = args.httpCode;
    this.description = args.description;

    if (args.isOperational !== undefined) {
      this.isOperational = args.isOperational;
    }
  }
}
