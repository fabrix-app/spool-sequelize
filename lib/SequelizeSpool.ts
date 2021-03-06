import { DatastoreSpool } from '@fabrix/fabrix/dist/common/spools/datastore'

import { Sequelize } from 'sequelize'
// import Sequelize from 'sequelize'

import { Validator } from './validator'
import { Transformer } from './transformer'

import { SchemaMigrationService as TSchemaMigrationService } from './api/services/SchemaMigrationService'

import * as config from './config/index'
import * as pkg from '../package.json'
import * as api  from './api/index'


export class SequelizeSpool extends DatastoreSpool {
  _datastore

  private _plugins: {[key: string]: any} = { }
  private _connections: {[key: string]: any} = { }
  private _models: {[key: string]: any} = { }

  constructor(app) {
    super(app, {
      config: config,
      pkg: pkg,
      api: api
    })
    this._datastore = Sequelize
  }

  /**
   * Get all the Sequelize Plugins that were installed
   */
  get plugins () {
    return this._plugins || {}
  }

  /**
   * Get all the Sequelize Connections that were made
   */
  get connections () {
    return this._connections || {}
  }

  /**
   * Get all the Fabrix Models that are bound to Sequelize
   */
  get models() {
    return this._models || {}
  }


  /**
   * Validate the database config, and api.model definitions
   */
  async validate() {

    const requiredSpools = ['router', 'errors']
    const spools = Object.keys(this.app.spools)

    if (!spools.some(v => requiredSpools.indexOf(v) !== -1)) {
      return Promise.reject(new Error(`spool-sequelize requires spools: ${ requiredSpools.join(', ') }!`))
    }

    const stores = this.app.config.get('stores')
    if (stores && Object.keys(stores).length === 0) {
      this.app.log.warn('No store configured at config.stores, models will be ignored')
    }
    const models = this.app.config.get('models')
    if (models && Object.keys(models).length === 0) {
      this.app.log.warn('No models configured at config.models, models will be ignored')
    }
    return Promise.all([
      Validator.validateStoresConfig(stores),
      Validator.validateModelsConfig(models),
      Validator.validatePluginsConfig(models)
    ])
  }

  /**
   * Merge configuration into models, load Sequelize collections.
   */
  configure() {
    // This set tracks the plugins that are being added to a single sequelize instance
    this._datastore['plugins'] = this._datastore['plugins'] || new Map([['plugins', new Set()]])

    // Get all the global plugins
    this._plugins = Transformer.getPlugins(this.app, this._datastore)
    // Holds a collection of the connections made through Sequelize
    this._connections = Transformer.getConnections(this.app, this._datastore, this.plugins)
    // Holds a collection of the Sequelize models
    this._models = Transformer.getModels(this.app, this._datastore, this.connections)
  }

  /**
   * Initialize Sequelize. This will compile the schema and connect to the
   * database.
   */
  async initialize() {
    // Migrate the connections and/or models by their migration strategy
    return this.migrate()
  }

  /**
   * Close all database connections
   */
  async unload() {
    return Promise.all(
      Object.entries(this.connections).map(([ _, store ]) => store.close())
    )
  }

  /**
   * Migrate the database connections
   */
  async migrate() {
    const SchemaMigrationService = this.app.services.SchemaMigrationService as TSchemaMigrationService
    return SchemaMigrationService.migrateDB(this.connections)
  }

  /**
   * Make sure everything is configured correctly
   */
  async sanity() {
    return Promise.resolve()
  }
}
