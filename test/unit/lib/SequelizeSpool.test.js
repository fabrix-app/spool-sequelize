'use strict'
const lib = require('../../../dist/index')
const assert = require('assert')
const FabrixApp = require('@fabrix/fabrix').FabrixApp
const SequelizeSpool = require('../../../dist/index').SequelizeSpool
const RouterSpool = require('@fabrix/spool-router').RouterSpool
const ErrorsSpool = require('@fabrix/spool-errors').ErrorsSpool

describe('app.spools.SequelizeSpool', () => {
  let app
  describe('#validate', () => {
    it('should validate that a router is not present', (done) => {
      app = new FabrixApp({pkg: {}, config: {}, api: {}})
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
      app = new FabrixApp({pkg: {}, config: {
        main: {
          spools: [
            RouterSpool,
            ErrorsSpool
          ]
        }
      }, api: {}})

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
