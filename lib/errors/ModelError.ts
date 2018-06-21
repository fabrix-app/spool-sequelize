export class ModelError extends Error {
  public code
  public errors

  constructor(code, message, errors?) {
    super(message)
    this.code = code
    this.name = 'Model error'
    this.errors = errors

    Object.defineProperty(ModelError.prototype, 'message', {
      configurable: true,
      enumerable: true
    })
  }
}
