'use strict'
const lib = require('../../../dist/index')
const assert = require('assert')
const FabrixApp = require('@fabrix/fabrix').FabrixApp
const SequelizeSpool = require('../../../dist/index').SequelizeSpool

describe('app.spools.SequelizeSpool', () => {
  let app
  beforeEach(() => {
    app = new FabrixApp({pkg: {}, config: {}, api: {}})
  })
  describe('#validate', () => {
    it('should validate that a router is not present', (done) => {
      const spool = new SequelizeSpool(app, {})

      spool.validate()
        .then(() => {
          done(new Error('This should not have validated'))
        })
        .catch(err => {
          assert(err)
          done()
        })
    })
    it('should log that models will be ignored', (done) => {
      // hack this attribute so we can run this
      app._spools = {router: {}}
      app.config.immutable = false
      app.config.set('stores', {})
      const spool = new SequelizeSpool(app, {})
      spool.validate()
        .then(() => {
          done()
        })
        .catch(err => {
          done(err)
        })
    })
  })
})
