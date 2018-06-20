const lib = require('./')
const _ = require('lodash')

import { DatastoreSpool } from '@fabrix/fabrix/dist/common/spools/Datastore'
import { Validator } from './validator'
import { Transformer } from './transformer'

import * as config from './config/index'
import * as pkg from '../package.json'
import * as api  from './api/index'

export class SequelizeSpool extends DatastoreSpool {
  private _connections: {[key: string]: any}

  constructor(app) {
    super(app, {
      config: config,
      pkg: pkg,
      api: api
    })
  }

  /**
   * Validate the database config, and api.model definitions
   */
  async validate() {

    if (!_.includes(_.keys(this.app.spools), 'router')) {
      return Promise.reject(new Error('Spool-sequelize requires spool-router!'))
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
    // this.app.config.set('stores.orm', 'sequelize')
    // _.merge(this.app.config, lib.FailsafeConfig)
  }

  /**
   * Initialize Sequelize. This will compile the schema and connect to the
   * database.
   */
  initialize() {
    // super.initialize()

    this.orm = this.orm || {}
    this.app.orm = {}
    this._connections = Transformer.transformStores(this.app)
    // this.models = lib.Transformer.transformModels(this.app)

    console.log('BROKE', Object.keys(this._connections))

    // // Define the new models into Sequelize Models
    // lib.Sequelize.defineModels(this.app, this.models, this.connections)
    //
    // // Transform the ORM
    // lib.Sequelize.transformOrm(this.app, this.orm, this.models)
    //
    // // Migrate the Schema of the new Models
    // return lib.Sequelize.migrate(this.app, this.connections)
    return Promise.resolve()
  }

  /**
   * Close all database connections
   */
  async unload() {
    return Promise.all(
      _.map(this.connections, connection => {
        return new Promise((resolve, reject) => {
          connection.close()
          resolve()
        })
      })
    )
  }

  async migrate() {
    const SchemaMigrationService = this.app.services.SchemaMigrationService

    return Promise.all(
      _.map(this.stores, store => {
        if (store.migrate === 'drop') {
          return SchemaMigrationService.dropDB(store.connection)
        }
        else if (store.migrate === 'alter') {
          return SchemaMigrationService.alterDB(store.connection)
        }
        else if (store.migrate === 'none') {
          return
        }
        else {
          return
        }
      })
    )
  }
}
