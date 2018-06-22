'use strict'

const assert = require('assert')

describe('lib.Transformer.SequelizeCallbacks', () => {
  let TapestryService
  before(() => {
    TapestryService = global.app.services.TapestryService

  })
  describe('#beforeCreate', () => {
    it('should create a record with beforeCreate attribute set', () => {
      //TapestryService.destroy('ModelCallbacks',{})
      return TapestryService.create('ModelCallbacks', {
        name: 'fabrix_beforeCreate',
        beforeCreate: 0,
        beforeValidate: 0
      })
        .then(record => {
          assert.equal(record.beforeCreate, 1)
        })
    })
  })
  describe('#afterCreate', () => {
    it('should create a record with afterCreate attribute set', () => {
      //TapestryService.destroy('ModelCallbacks',{})
      return TapestryService.create('ModelCallbacks', {name: 'fabrix_afterCreate', beforeValidate: 0, afterCreate: 0})
        .then(record => {
          assert.equal(record.afterCreate, 1)
        })
    })
  })
  describe('#beforeUpdate', () => {
    it('beforeUpdate should be called', () => {
      return TapestryService.create('ModelCallbacks', {
        name: 'fabrix_beforeUpdate',
        beforeCreate: 0,
        beforeValidate: 0
      })
        .then(record => {
          return TapestryService.update(
            'ModelCallbacks',
            {name: 'fabrix_beforeUpdate'},
            {name: 'fabrix_UpdatedBefore', beforeValidate: 0, beforeUpdate: 0}
          )
        })
        .then(records => {
          assert.equal(records[0], 1)
          return TapestryService.find('ModelCallbacks', {name: 'fabrix_UpdatedBefore'})
        })
        .then(records => {
          assert.equal(records[0].beforeUpdate, 1)
        })
    })
  })
  describe('#afterUpdate', () => {
    it.skip('afterUpdate should be called', () => {
      return TapestryService.create('ModelCallbacks', {
        name: 'fabrix_afterUpdate', beforeValidate: 0, afterUpdate: 0
      })
        .then(record => {
          return TapestryService.update(
            'ModelCallbacks',
            {name: 'fabrix_afterUpdate'},
            {name: 'fabrix_UpdatedAfter', beforeValidate: 0, afterUpdate: 0}
          )
        })
        .then(results => {
          assert.equal(results[0], 1)
          return TapestryService.find('ModelCallbacks', {
            name: 'fabrix_UpdatedAfter'
          })
        })
        .then(records => {
          assert.equal(records[0].afterUpdate, 1)
        })
    })
  })
  describe('#beforeValidate', () => {
    it('should create a record with a beforeValidate attribute', () => {
      return TapestryService.create('ModelCallbacks', {name: 'fabrix_beforeCreate', beforeValidate: 0})
        .then(record => {
          assert.equal(record.beforeValidate, 1)
        })
    })
  })
  describe('#afterValidate', () => {
    it('should create a record with a afterValidate attribute', () => {
      return TapestryService.create('ModelCallbacks', {
        name: 'fabrix_afterCreate',
        beforeValidate: 0,
        afterValidate: 0
      })
        .then(record => {
          assert.equal(record.afterValidate, 1)
        })
    })
  })
  describe('#beforeDestroy', () => {
    it('should call the beforeDestroy callback and continue', () => {
      return TapestryService.create('ModelCallbacks', {name: 'fabrix_beforeDestroy', beforeValidate: 0})
        .then(record => {
          return TapestryService.destroy('ModelCallbacks', {name: 'fabrix_beforeDestroy'})
        })
        .then(records => {
          return TapestryService.find('ModelCallbacks', {name: 'fabrix_beforeDestroy'})
        })
        .then(records => {
          assert.equal(records.length, 0)
        })
    })
  })
  describe('#afterDestroy', () => {
    it('should call the afterDestroy callback and continue', () => {
      return TapestryService.create('ModelCallbacks', {name: 'fabrix_afterDestroy', beforeValidate: 0})
        .then(record => {
          return TapestryService.destroy('ModelCallbacks', {name: 'fabrix_afterDestroy'})
        })
        .then(records => {
          return TapestryService.find('ModelCallbacks', {name: 'fabrix_afterDestroy'})
        })
        .then(records => {
          assert.equal(records.length, 0)
        })
    })
  })

})
