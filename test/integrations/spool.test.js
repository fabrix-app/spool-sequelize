'use strict'

const assert = require('assert')

describe('Spool', () => {
  let spool
  before(() => {
    spool = global.app.spools['sequelize']
  })
  it('should be loaded into the app.spools collection', () => {
    assert(spool)
  })
  it('should create directly through app.models', (done) => {
    global.app.models.Page.create({name: 'test'})
      .then(page => {
        assert.equal(page.name, 'test')
        done()
      })
      .catch(err => {
        done(err)
      })
  })

  it('should access a classLevelMethod', (done) => {
    assert.equal(global.app.models.testModel.classLevelMethod(), 'foo')
    assert.equal(global.app.models.testModel.resolver._sequelizeModel.classLevelMethod(), 'foo')
    done()
  })

  it('should access a instanceLevelMethod', (done) => {
    const instance = global.app.models.testModel.build({name: 'test'})
    assert.equal(instance.instanceLevelMethod(), 'bar')
    done()
  })
})
