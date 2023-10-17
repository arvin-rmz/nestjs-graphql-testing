interface ICustomErrorExtensions {
  code: string;
  field?: string;
}
export class CustomError extends Error {
  extensions: ICustomErrorExtensions;

  constructor(message: string, extensions: ICustomErrorExtensions) {
    super(message);
    this.extensions = extensions;
  }
}
