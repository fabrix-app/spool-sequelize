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

  it('should be able to access the datastore service', (done) => {
    assert(global.app.models.testModel.resolver.datastore)
    assert(global.app.models.testModel.resolver.sequelize)
    assert(global.app.models.testModel.datastore)
    assert(global.app.models.testModel.sequelize)
    assert.equal(global.app.models.testModel.sequelize, global.app.models.testModel.resolver.sequelize)
    assert.equal(global.app.models.testModel.instance, global.app.models.testModel.resolver.sequelizeModel)
    done()
  })

  it('should access a classLevelMethod', (done) => {
    assert.equal(global.app.models.testModel.classLevelMethod(), 'foo')
    assert.equal(global.app.models.testModel.resolver._sequelizeModel.classLevelMethod(), 'foo')
    done()
  })

  it('should access a instanceLevelMethod', (done) => {
    const instance = global.app.models.testModel.build({name: 'test'})
    assert.equal(instance.instanceLevelMethod(), 'bar')
    // assert.ok(instance.app)
    done()
  })

  it('should save an instance', (done) => {
    const instance = global.app.models.testModel.build({name: 'test'})
    instance.save().then(i => {
      done()
    })
      .catch(err => {
        done(err)
      })
  })

  it('should create an instance', (done) => {
    const instance = global.app.models.testModel.create({name: 'test'})
      .then(i => {
        done()
      })
        .catch(err => {
          done(err)
        })
  })

  it('should bulk create instances', (done) => {
    const instance = global.app.models.testModel.bulkCreate([{name: 'test'}])
      .then(i => {
        done()
      })
      .catch(err => {
        done(err)
      })
  })

  it('should count instances', (done) => {
    const instance = global.app.models.testModel.count({where: {name: 'test'}})
      .then(i => {
        done()
      })
      .catch(err => {
        done(err)
      })
  })

  it('should find an instance', (done) => {
    const instance = global.app.models.testModel.findOne({where: {name: 'test'}})
      .then(i => {
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should find an instance by id', (done) => {
    const instance = global.app.models.testModel.findById(1)
      .then(i => {
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should find an all of an instance', (done) => {
    const instance = global.app.models.testModel.findAll({where: {name: 'test'}})
      .then(i => {
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should find and count all of an instance', (done) => {
    const instance = global.app.models.testModel.findAndCountAll({where: {name: 'test'}})
      .then(i => {
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should find or create  an instance', (done) => {
    const instance = global.app.models.testModel.findOrCreate({where: {name: 'test'}, defaults: {name: 'test'}})
      .spread((i, c) => {
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should find or build an instance', (done) => {
    const instance = global.app.models.testModel.findOrBuild({where: {name: 'test'}, defaults: {name: 'test'}})
      .spread((i, c) => {
        done()
      })
      .catch(err => {
        done(err)
      })
  })

  it('should get table name', (done) => {
    const instance = global.app.models.testModel.getTableName()
    done()
  })
})
