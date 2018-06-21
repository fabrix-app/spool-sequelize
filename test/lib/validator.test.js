const assert = require('assert')
const app = require('../app')
const lib = require('../../dist/index')

describe('lib.Validator', () => {
  describe('#validateStoresConfig', () => {
    it('should validate a valid stores config', () => {
      return lib.Validator.validateStoresConfig(app.config.stores).then(assert)
    })
  })
})

