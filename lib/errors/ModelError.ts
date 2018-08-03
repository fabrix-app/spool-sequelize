export class ModelError extends Error {
  public statusCode
  public code
  public errors

  constructor(code, message, errors?) {
    super(message)
    this.code = code
    this.name = 'Model error'
    this.errors = errors

    switch (this.code) {
      case 'E_NOT_FOUND': {
        this.statusCode = '404'
        break
      }
      case 'E_FORBIDDEN': {
        this.statusCode = '403'
        break
      }
      case 'E_BAD_REQUEST': {
        this.statusCode = '400'
        break
      }
      default: {
        this.statusCode = '500'
      }
    }

    Object.defineProperty(ModelError.prototype, 'message', {
      configurable: true,
      enumerable: true
    })
  }
}
