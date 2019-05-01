'use strict'

const assert = require('assert')
const Transformer = require('../../dist/transformer').Transformer

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
    assert.ok(instance.app)
    assert.ok(instance.app.config.get('main'))
    done()
  })


  it('should access an inherited instanceLevelMethod', (done) => {
    const instance = global.app.models.testModelExtend2.build({name: 'test'})
    assert.equal(instance.nextInstanceLevelMethod(), 'baz')
    assert.equal(instance.instanceLevelMethod(), 'bar')
    assert.equal(instance.superLevelMethod(), 'baf')
    assert.ok(instance.app)
    assert.ok(instance.app.config.get('main'))
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

  it('instance should have access to model', (done) => {
    const instance = global.app.models.testModel.build({name: 'test'})
    assert.ok(instance.model)
    assert.equal(instance.model, global.app.models.testModel)
    done()
  })

  it('should build and save an instance with associations', (done) => {
    const instance = global.app.models.User.build({
      name: 'test',
      roles: [
        {
          name: 'test'
        }
      ]
    }, {
      include: [
        {
          model: global.app.models.Role.instance,
          as: 'roles'
        }
      ]
    })
    instance.save().then(i => {
      assert.ok(i.roles)
      assert.equal(i.roles.length, 1)
      done()
    })
      .catch(err => {
        done(err)
      })
  })


  it('should build, save, reload an instance with associations', (done) => {
    const instance = global.app.models.User.build({
      name: 'test',
      roles: [
        {
          name: 'test'
        }
      ]
    }, {
      include: [
        {
          model: global.app.models.Role.instance,
          as: 'roles'
        }
      ]
    })
    instance.save().then(i => {
      assert.ok(i.roles)
      assert.equal(i.roles.length, 1)
      return i.reload()
    })
      .then(i => {
        assert.ok(i.roles)
        assert.equal(i.roles.length, 1)
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
  // TODO ENABLE IN Sequelize 5.0
  it.skip('should bulk create instances', (done) => {
    const instance = global.app.models.testModel.bulkUpdate({name: 'test'}, { name: 'test' })
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
    const instance = global.app.models.testModel.findByPk(1)
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

  it('should be able to access the options provided', (done) => {
    const instance = global.app.models.testModel.resolver.options
    done()
  })
  it('should be able to access the schema provided', (done) => {
    const instance = global.app.models.testModel.resolver.schema
    done()
  })

  describe('Model Extending', () => {
    it('should create an instance of an extended model', (done) => {
      const instance = global.app.models.testModel2.create({name: 'test', name2: 'test'})
        .then(i => {
          assert.equal(i.name, 'test')
          assert.equal(i.name2, 'test')
          done()
        })
        .catch(err => {
          done(err)
        })
    })
  })
})
