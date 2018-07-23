const assert = require('assert')
const app = require('../../fixtures/app')
const lib = require('../../../dist/index')

describe('lib.Validator', () => {
  describe('#validateStoresConfig', () => {
    it('should validate a valid stores config', () => {
      return lib.Validator.validateStoresConfig(app.config.stores).then(assert)
    })
    it('should reject a bad config', (done) => {
      lib.Validator.validateStoresConfig('string!')
        .then(() => {
          const err = new Error('Should have failed validation!')
          done(err)
        })
        .catch(err => {
          assert(err)
          done()
        })
    })
  })
})


