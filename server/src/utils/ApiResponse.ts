export class ApiResponse<T> {
  public readonly statusCode: number;
  public readonly success: boolean;
  public readonly data: T;
  public readonly message: string;

  constructor(statusCode: number, data: T, message: string) {
    this.statusCode = statusCode;
    this.data = data;
    this.success = statusCode < 400;
    this.message = message;
  }
}
