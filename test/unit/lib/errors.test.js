'use strict'
const assert = require('assert')
const errors = require('../../../dist/errors')

describe('lib.errors', () => {
  describe('#ModelErrors', () => {
    it('should create E_NOT_FOUND Error', () => {
      const err = new errors.ModelError('E_NOT_FOUND', 'Not Found')
      assert(err)
      assert.equal(err.statusCode, 404)
    })
    it('should create E_FORBIDDEN Error', () => {
      const err = new errors.ModelError('E_FORBIDDEN', 'Forbidden')
      assert(err)
      assert.equal(err.statusCode, 403)
    })
    it('should create E_BAD_REQUEST Error', () => {
      const err = new errors.ModelError('E_BAD_REQUEST', 'Bad Request')
      assert(err)
      assert.equal(err.statusCode, 400)
    })
    it('should create E_UNKNOWN Error', () => {
      const err = new errors.ModelError('E_UNKNOWN', 'Unknown Error Request')
      assert(err)
      assert.equal(err.statusCode, 500)
    })
  })
})
