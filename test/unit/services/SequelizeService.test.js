'use strict'

const assert = require('assert')
const sequelize = require('sequelize')

describe('api.services.SequelizeService', () => {
  it.skip('should do stringify sort', (done) => {
    const sort = [['created_at','ASC']]
    const s = global.app.services.SequelizeService.sortToString(sort)
    console.log('STRING', s)
    done()
  })
  it.skip('should do stringify a bad sort', (done) => {
    const sort = []
    const s = global.app.services.SequelizeService.sortToString(sort)
    console.log('STRING', s)
    done()
  })
  it('should merge includes', (done) => {
    const newOptions = global.app.services.SequelizeService.mergeOptionDefaults({
      include: [{ model: 'hello' }]
    }, {
      include: [{ model: 'world'}]
    })
    assert.equal(newOptions.include.length, 2)
    assert.equal(newOptions.include[0].model, 'hello')
    assert.equal(newOptions.include[1].model, 'world')
    done()
  })
  it('should merge duplicate includes', (done) => {
    const newOptions = global.app.services.SequelizeService.mergeOptionDefaults({
      include: [{ model: 'hello', as: 'world' }]
    }, {
      include: [{ model: 'hello', as: 'world' }]
    })
    assert.equal(newOptions.include.length, 1)
    assert.equal(newOptions.include[0].model, 'hello')
    done()
  })
  it('should merge includes with same model', (done) => {
    const newOptions = global.app.services.SequelizeService.mergeOptionDefaults({
      include: [{ model: 'hello', as: 'world' }]
    }, {
      include: [{ model: 'hello', as: 'planet' }]
    })
    assert.equal(newOptions.include.length, 2)
    assert.equal(newOptions.include[0].model, 'hello')
    assert.equal(newOptions.include[1].model, 'hello')
    done()
  })
  it('should merge order and fix incorrect instances', (done) => {
    const newOptions = global.app.services.SequelizeService.mergeOptionDefaults({
      order: [['created_at','ASC']]
    }, {
      order: 'updated_at DESC'
    })
    assert.equal(newOptions.order.length, 2)
    done()
  })
  it('should merge wheres', (done) => {
    const newOptions = global.app.services.SequelizeService.mergeOptionDefaults({
      where: { name: 'hello'}
    }, {
      where: { created_at: 'now' }
    })
    assert.equal(newOptions.where.name, 'hello')
    assert.equal(newOptions.where.created_at, 'now')
    done()
  })
  it('should merge wheres with operator symbol', (done) => {
    const newOptions = global.app.services.SequelizeService.mergeOptionDefaults({
      where: {}
    }, {
      where: {
        name: {
          [sequelize.Op.in]: [1, 2, 3]
      }}
    })
    assert.equal(newOptions.where.name[sequelize.Op.in][0], 1)
    assert.equal(newOptions.where.name[sequelize.Op.in][1], 2)
    assert.equal(newOptions.where.name[sequelize.Op.in][2], 3)
    done()
  })
  
  it('should merge limit', (done) => {
    const newOptions = global.app.services.SequelizeService.mergeOptionDefaults({
      limit: null
    }, {
      limit: 10
    })
    assert.equal(newOptions.limit, 10)
    done()
  })
  it('should merge offset', (done) => {
    const newOptions = global.app.services.SequelizeService.mergeOptionDefaults({
      offset: null
    }, {
      offset: 10
    })
    assert.equal(newOptions.offset, 10)
    done()
  })
  it('should merge with unknown variables', (done) => {
    const newOptions = global.app.services.SequelizeService.mergeOptionDefaults({
      hello: 'world'
    }, {})
    assert.equal(newOptions.hello, 'world')
    done()
  })
  it('should replace model with association object that match', (done) => {
    const newOptions = global.app.services.SequelizeService.mergeOptionDefaults({
      include: [{ model: 'hello' }]
    }, {
        include: [{ target: 'hello' }]
      })
    assert.equal(newOptions.include.length, 1)
    assert.equal(newOptions.include[0].target, 'hello')
    done()
  })
  it('should replace association object with model that match', (done) => {
    const newOptions = global.app.services.SequelizeService.mergeOptionDefaults({
      include: [{ target: 'model' }]
    }, {
        include: [{ model: 'model' }]
    })
    assert.equal(newOptions.include.length, 1)
    assert.equal(newOptions.include[0].model, 'model')
    done()
  })

  it('should replace model with association object that match', (done) => {
    const newOptions = global.app.services.SequelizeService.mergeOptionDefaults({
      include: [ {model: 'hello' }]
    }, {
        include: [{ target: 'hello' }]
      })
    assert.equal(newOptions.include.length, 1)
    assert.equal(newOptions.include[0].target, 'hello')
    done()
  })
  it('should replace model with association prop that match', (done) => {
    const newOptions = global.app.services.SequelizeService.mergeOptionDefaults({
      include: [{ model: 'hello' }]
    }, {
        include: [{ association: { target: 'hello' }}
      ]
      })
    assert.equal(newOptions.include.length, 1)
    assert.equal(newOptions.include[0].association.target, 'hello')
    done()
  })
  it('should replace association with model that match', (done) => {
    const newOptions = global.app.services.SequelizeService.mergeOptionDefaults({
      include: [{ association: { target: 'model' }}]
    }, {
        include: [{ model: 'model' }]
    })
    assert.equal(newOptions.include.length, 1)
    assert.equal(newOptions.include[0].model, 'model')
    done()
  })
  it('should merge includes when one uses model and another uses associate include formats', (done) => {
    const newOptions = global.app.services.SequelizeService.mergeOptionDefaults({
      include: [{association: { target: 'hello'} }]
    }, {
      include: [{ model: 'world' }]
    })
    assert.equal(newOptions.include.length, 2)
    assert.equal(newOptions.include[0].association.target, 'hello')
    assert.equal(newOptions.include[1].model, 'world')
    done()
  })
  it('should replace model with association prop that match with multiple include objects', (done) => {
    const newOptions = global.app.services.SequelizeService.mergeOptionDefaults({
      include: [{ model: 'hello' }]
    }, {
      include: [
        {model: 'world'},
        {association: { target: 'hello' }}
      ]
    })
    assert.equal(newOptions.include.length, 2)
    assert.equal(newOptions.include[0].association.target, 'hello')
    assert.equal(newOptions.include[1].model, 'world')
    done()
  })
  it('should replace association with model that match with multiple include objects', (done) => {
    const newOptions = global.app.services.SequelizeService.mergeOptionDefaults({
      include: [
        { model: 'world' },
        {association: { target: 'hello' }}
      ]
    }, {
      include: [{ model: 'hello' }]
    })
    assert.equal(newOptions.include.length, 2)
    assert.equal(newOptions.include[0].model, 'world')
    assert.equal(newOptions.include[1].model, 'hello')
    done()
  })
})
