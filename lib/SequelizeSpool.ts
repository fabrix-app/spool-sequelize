import { DatastoreSpool } from '@fabrix/fabrix/dist/common/spools/datastore'

import * as Sequelize from 'sequelize'

import { Validator } from './validator'
import { Transformer } from './transformer'

import { SchemaMigrationService as TSchemaMigrationService } from './api/services/SchemaMigrationService'

import * as config from './config/index'
import * as pkg from '../package.json'
import * as api  from './api/index'


export class SequelizeSpool extends DatastoreSpool {
  _datastore = Sequelize
  private _connections: {[key: string]: any}
  private _models: {[key: string]: any}

  constructor(app) {
    super(app, {
      config: config,
      pkg: pkg,
      api: api
    })
    // this._datastore = Sequelize
  }

  get models() {
    return this._models
  }

  get connections () {
    return this._connections
  }
  /**
   * Validate the database config, and api.model definitions
   */
  async validate() {

    const requiredSpools = ['router']
    const spools = Object.keys(this.app.config.get('main.spools'))

    if (requiredSpools.some(v => spools.indexOf(v) >= 0)) {
      return Promise.reject(new Error(`spool-sequelize requires spools: ${ requiredSpools.join(', ') }!`))
    }

    const stores = this.app.config.get('stores')
    if (stores && Object.keys(stores).length === 0) {
      this.app.log.warn('No store configured at config.stores, models will be ignored')
    }
    return Promise.all([
      Validator.validateStoresConfig(this.app.config.get('stores'))
    ])
  }

  /**
   * Merge configuration into models, load Sequelize collections.
   */
  configure() {

  }

  /**
   * Initialize Sequelize. This will compile the schema and connect to the
   * database.
   */
  initialize() {
    // super.initialize()

    this._connections = Transformer.getConnections(this.app)
    this._models = Transformer.getModels(this.app, this._connections)

    Object.keys(this._models).forEach( m => {
      this.app.models[m] = this._models[m]
    })

    return this.migrate()
  }

  /**
   * Close all database connections
   */
  async unload() {
    return Promise.all(
      Object.entries(this._connections).map(([ _, store ]) => store.close())
    )
  }

  async migrate() {
    const SchemaMigrationService = this.app.services.SchemaMigrationService as TSchemaMigrationService
    return SchemaMigrationService.migrateDB(this._connections)
  }
}
