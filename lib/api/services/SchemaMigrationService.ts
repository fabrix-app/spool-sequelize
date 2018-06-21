import { FabrixService as Service } from '@fabrix/fabrix/dist/common'
/**
 * @module SchemaMigrationService
 * @description Schema Migrations
 */
export class SchemaMigrationService extends Service {

  /**
   * Drop collection
   * @param model model object
   */
  async dropModel(model) {
    return model.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return model.sync({force: true})
      })
      .then(() => {
        return model.sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
      })
      .catch(err => {
        return model.sync({force: true})
      })
  }

  /**
   * Alter an existing schema
   * @param model model object
   */
  async alterModel(model) {
    return model.sync()
  }

  async migrateModels(models) {
    return Promise.all(
      Object.entries(models).map(([ _, model ]: [ any, {[key: string]: any}]) => {
        if (model.migrate === 'drop') {
          return this.dropModel(model)
        }
        else if (model.migrate === 'alter') {
          return this.alterModel(model)
        }
        else if (model.migrate === 'none') {
          return
        }
        else {
          return
        }
      })
    )
  }

  /**
   * Drop collections in current connection
   * @param connection connection object
   */
  async dropDB(connection) {
    const dialect = connection.dialect.connectionManager.dialectName
    return connection.query(dialect === 'sqlite' ? 'PRAGMA foreign_keys = OFF' : 'SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return connection.sync({force: true})
      })
      .then(() => {
        return connection.query(dialect === 'sqlite' ? 'PRAGMA foreign_keys = ON' : 'SET FOREIGN_KEY_CHECKS = 1')
      })
      .catch(err => {
        return connection.sync({force: true})
      })
  }

  /**
   * Alter an existing database
   * @param connection connection object
   */
  async alterDB(connection) {
    return connection.sync()
  }

  async migrateDB(connections) {
    const promises = []
    return Promise.all(
      Object.entries(connections).map(([ _, store ]: [ any, {[key: string]: any}]) => {
        if (store.migrate === 'drop') {
          return this.dropDB(store)
        }
        else if (store.migrate === 'alter') {
          return this.alterDB(store)
        }
        else if (store.migrate === 'none') {
          return
        }
        else {
          return this.migrateModels(store.models)
        }
      })
    )
  }
}
