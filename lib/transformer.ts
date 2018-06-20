import * as _ from 'lodash'
import { Sequelize } from 'sequelize'


export const Transformer = {

  /**
   * Augment the model definition with some sequelize-required properties
   */
  transformModels (app) {
    const models = app.models
    const dbConfig = app.config.get('stores')
    dbConfig.models = app.config.get('models')

    return _.mapValues(models, (model, modelName) => {
      // Augment config
      const config = model.constructor.config(app, Sequelize) || {}
      // Augment Schema
      const schema = model.constructor.schema(app, Sequelize) || {}
      if (!config.options) {
        config.options = {}
      }

      if (!config.options.tableName) {
        config.options.tableName = modelName.toLowerCase()
      }

      // Initiate the transformed Model
      const transform = {
        identity: modelName.toLowerCase(),
        globalId: modelName,
        tableName: config.tableName || modelName.toLowerCase(),
        connection: config.store || dbConfig.models.defaultStore,
        migrate: config.migrate || dbConfig.models.migrate,
        config: config,
        options: config.options,
        schema: schema,
        methods: model.methods
      }

      // Add model methods
      transform.methods.forEach(method => {
        transform[method] = model[method]
      })

      return transform

    })
  },

  /**
   * Create Sequelize object based on config options
   * @param  {Object} config fabrix.js store
   * @return {Sequelize}     Sequelize instance
   */
  createFromConfig (config) {
    if (config.uri) {
      return new Sequelize(config.uri, _.clone(config)) // Sequelize modify options object
    }
    else {
      return new Sequelize(config.database, config.username, config.password, config)
    }
  },

  /**
	 * Pick only SQL stores from app config
	 * @param {Object} stores
	 * @return {Object}
	 */
  pickStores (stores) {
    return _.pickBy(stores, (_store, name) => {
      return ((_store.dialect && _.isString(_store.dialect) && _store.orm === 'sequelize')
        || _.startsWith(_store.uri, 'mysql://')
        || _.startsWith(_store.uri, 'mysql://')
        || _.startsWith(_store.uri, 'postgresql://')
        || _.startsWith(_store.uri, 'sqlite://'))
    })
  },

  /**
   * Transform the fabrix "stores" config into a Sequelize object
   */
  transformStores (app) {
    const stores = this.pickStores(app.config.get('stores'))
    const sequelize = {}
    Object.keys(stores).forEach(key => {
      sequelize[key] = this.createFromConfig(stores[key])
      sequelize[key].fabrixApp = app
    })

    return sequelize
  }

}
