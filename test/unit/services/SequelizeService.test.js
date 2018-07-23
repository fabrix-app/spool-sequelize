'use strict'

const assert = require('assert')

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
})
