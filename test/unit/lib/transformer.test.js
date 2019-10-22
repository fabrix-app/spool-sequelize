const assert = require('assert')
const lib = require('../../../dist/index')
const FabrixApp = require('@fabrix/fabrix').FabrixApp

const Sequelize = require('sequelize')

describe('lib.Transformer', () => {
  let app
  beforeEach(() => {
    app = new FabrixApp(require('../../fixtures/app'))
  })

  describe('#getPlugins', () => {
    it('should transform properly', () => {
      const plugins = lib.Transformer.getPlugins(app)
      const connections = lib.Transformer.getConnections(app, Sequelize, plugins)
      const models = lib.Transformer.getModels(app, Sequelize, connections)

      assert.ok(plugins)
      assert.strictEqual(Sequelize.prototype.helloWorld(), 'hello world')
      assert.strictEqual(Sequelize.prototype.helloEarth(), 'hello earth')
    })
  })

  describe('#getConnections', () => {
    it('should transform properly', () => {
      const connections = lib.Transformer.getConnections(app, Sequelize)

      assert(connections.teststore)
      assert.strictEqual(connections.storeoverride.options.dialect, 'postgres')
      assert(connections.replicatorStore)
      assert.deepStrictEqual(connections.replicatorStore.options.replication, app.config.stores.replicatorStore.replication)
    })
    it('should transform uri properly', () => {
      const connections = lib.Transformer.getConnections(app, Sequelize)
      assert(connections.uristore)
      assert.strictEqual(connections.uristore.options.dialect, 'postgres')
      assert.strictEqual(connections.uristore.options.host, '127.0.0.1')
      assert.strictEqual(connections.uristore.config.host, '127.0.0.1')
      assert.strictEqual(connections.uristore.config.database, 'Sequelize2')
      // test config for other dialects
      assert.strictEqual(connections.uristore.config.port, 5432)
      assert.strictEqual(connections.uristore.config.username, 'postgres')
      assert.strictEqual(connections.uristore.config.password, null)
    })
  })
  describe('#getModels', () => {
    it('should transform properly', () => {
      const connections = lib.Transformer.getConnections(app, Sequelize)
      const models = lib.Transformer.getModels(app, Sequelize, connections)
    })
    it('should not have a primary key for testModel3', () => {
      const connections = lib.Transformer.getConnections(app, Sequelize)
      const models = lib.Transformer.getModels(app, Sequelize, connections)
    })
  })
})
