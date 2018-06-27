'use strict'
const lib = require('../../../dist/index')
const assert = require('assert')
const FabrixApp = require('@fabrix/fabrix').FabrixApp
const TestModel = require('../../testmodel')
const App = {
  pkg: {
    name: 'spool-sequelize-test'
  },
  api: {
    models: {
      Test: TestModel
    }
  },
  config: {
    main: {
      spools: [
        require('@fabrix/spool-router').RouterSpool,
        require('../../../dist/index').SequelizeSpool // spool-sequelize
      ]
    },
    stores: {
      sqlitedev: {
        orm: 'sequelize',
        database: 'dev',
        storage: '../../.tmp/dev.sqlite',
        host: '127.0.0.1',
        dialect: 'sqlite',
        migrate: 'drop'
      }
    },
    models: {
      defaultStore: 'sqlitedev',
      migrate: 'drop'
    }
  }
}

describe('api.services.SchemaMigrationService', () => {
  let SchemaMigrationService
  let connections
  let models
  let app

  beforeEach(() => {
    app = new FabrixApp(App)
    SchemaMigrationService = app.services.SchemaMigrationService
    connections = lib.Transformer.getConnections(app) || {}
    models = lib.Transformer.getModels(app, connections) || {}

    it('should exist', () => {
      assert(SchemaMigrationService)
      assert(connections)
      assert(models)
    })
  })

  describe('#sanity', () => {
    it('should exist', () => {
      assert(SchemaMigrationService)
      assert(connections)
      assert(models)
    })
  })
  describe('#dropModel', () => {
    it.skip('drop model', (done) => {
      SchemaMigrationService.dropModel(models['Test'], connections['sqlitedev'])
        .then(() => {
          done()
        })
        .catch(err => done(err))
    })
  })
  describe('#alterModel', () => {
    it.skip('should alter models', (done) => {
      SchemaMigrationService.alterModel(models['Test'], connections['sqlitedev'])
        .then(() => {
          done()
        })
        .catch(err => done(err))
    })
  })
  describe('#migrateModels', () => {
    it('should migrate models', () => {
      assert(SchemaMigrationService.migrateModels(models, connections['sqlitedev']))
    })
  })
  describe('#dropDB', () => {
    it.skip('should drop Database and recreate', (done) => {
      SchemaMigrationService.dropDB(connections['sqlitedev'])
        .then(() => {
          done()
        })
        .catch(err => done(err))
    })
  })
  describe('#alterDB', () => {
    it.skip('should alter Database and recreate', (done) => {
      SchemaMigrationService.alterDB(connections['sqlitedev'])
        .then(() => {
          done()
        })
        .catch(err => done(err))
    })
  })
  describe('#migrateDB', () => {
    it.skip('should migrate Database and migrate', (done) => {
      SchemaMigrationService.migrateDB(connections)
        .then(() => {
          done()
        })
        .catch(err => done(err))
    })
  })
})
