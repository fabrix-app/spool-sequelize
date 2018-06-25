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

  migrateModels(models) {
    let promises = []
    Object.entries(models).forEach(([ _, model ]: [ any, {[key: string]: any}]) => {
      if (model.migrate === 'drop') {
        promises.push(this.dropModel(model))
      }
      else if (model.migrate === 'alter') {
        promises.push(this.alterModel(model))
      }
      else if (model.migrate === 'none') {
        return
      }
      else {
        return
      }
    })
    return promises
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

  /**
   * Migrate the DB
   * Checks the connection level instances first and the reverts to model level migration strategy
   */
  async migrateDB(connections) {
    let promises = []

    Object.entries(connections).forEach(([ _, store ]: [ any, {[key: string]: any}]) => {
      if (store.migrate === 'drop') {
        promises.push(this.dropDB(store))
      }
      else if (store.migrate === 'alter') {
        promises.push(this.alterDB(store))
      }
      else if (store.migrate === 'none') {
        return
      }
      else {
        promises = [...promises, ...this.migrateModels(store.models)]
      }
    })

    return Promise.all(promises)
  }
}
