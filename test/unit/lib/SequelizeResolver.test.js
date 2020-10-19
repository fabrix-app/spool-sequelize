const assert = require('assert')
const FabrixApp = require('@fabrix/fabrix').FabrixApp
const lib = require('../../../dist/index')
const SequelizeResolver = lib.SequelizeResolver

const Sequelize = require('sequelize')

describe('lib.SequelizeResolver', () => {
  let resolver
  before(() => {
    resolver = global.app.models.Page.resolver
  })

  it('should exist on a model', () => {
    assert(resolver)
  })

  it('should be an instance of a sequelize resolver', () => {
    assert(resolver instanceof SequelizeResolver)
  })
})
