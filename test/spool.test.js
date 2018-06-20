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
})
