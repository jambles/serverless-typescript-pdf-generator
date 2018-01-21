export class Response {
  public headers: {} = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json'
  };
  public statusCode: number;
  public body: string;
  public message?: string;

  constructor(statusCode: number, body: {}) {
    this.statusCode = statusCode;
    this.body = JSON.stringify(body);
  }
}
