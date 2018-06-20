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
  dropModel(model) {
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
  alterModel(model) {
    return model.sync()
  }

  /**
   * Drop collections in current connection
   * @param connection connection object
   */
  dropDB(connection) {
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
  alterDB(connection) {
    return connection.sync()
  }
}
