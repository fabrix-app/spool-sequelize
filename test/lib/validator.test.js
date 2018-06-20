const assert = require('assert')
const app = require('../app')
const lib = require('../../dist/index')

describe('lib.Validator', () => {
  describe('#validateDatabaseConfig', () => {
    it('should validate a valid database config', () => {
      return lib.Validator.validateDatabaseConfig(app.config.database).then(assert)
    })
  })
})

