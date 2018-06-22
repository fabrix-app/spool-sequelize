import * as _ from 'lodash'
import * as Sequelize from 'sequelize'
import { FabrixApp } from '@fabrix/fabrix'
import { FabrixModel } from '@fabrix/fabrix/dist/common'
import { pickBy, isString, startsWith } from 'lodash'

export const Transformer = {
  getModelOptions: (app: FabrixApp, model) => {
    const config = model.constructor.config(app, Sequelize)
    // Options must be
    if (!config.options) {
      config.options = {}
    }
    if (!config.options.tableName) {
      config.options.tableName = model.name.toLowerCase()
    }

    return config.options
  },

  getModelSchema: (app: FabrixApp, model) => {
    return model.constructor.schema(app, Sequelize)
  },

  getModelPrototypes: (model) => {
    return Object.getPrototypeOf(model)
  },

  getModelMethods: (model, prototypes) => {
    const methods = {}
    const methodNames = model.methods.filter(m => Object.keys(prototypes).indexOf(m) === -1)
    methodNames.forEach(m => methods[m] = model[m])
    return methods
  },

  defineModel: (app: FabrixApp, model, connections) => {
    const modelName = model.constructor.name
    const modelConfig = model.config
    const store = modelConfig.store || app.config.get('models.defaultStore')
    const connection = connections[store]
    const migrate = modelConfig.migrate || app.config.get('models.migrate') || connection.migrate
    const instanceMethods = Transformer.getModelPrototypes(model)
    const classMethods = Transformer.getModelMethods(model, instanceMethods)
    const options =  Transformer.getModelOptions(app, model)
    const schema = Transformer.getModelSchema(app, model)

    const SequelizeModel = connection.define(modelName, schema, options)
    SequelizeModel.store = store
    SequelizeModel.migrate = migrate

    Object.keys(classMethods).forEach(c => {
      SequelizeModel[c] = classMethods[c]
    })

    Object.keys(instanceMethods).forEach(i => {
      SequelizeModel.prototype[i] = instanceMethods[i]
    })

    connection.models[modelName] = SequelizeModel

    return SequelizeModel
  },

  /**
   * Create Sequelize object based on config options
   * @param  {Object} config fabrix.js store
   * @return {Sequelize}     Sequelize instance
   */
  createConnectionsFromConfig (config: {[key: string]: any}) {
    if (config.uri) {
      return new Sequelize(config.uri, Object.assign({}, config)) // Sequelize modify options object
    }
    else {
      return new Sequelize(config.database, config.username, config.password, config)
    }
  },

  /**
	 * Pick only SQL stores from app config
	 */
  pickStores (stores): {[key: string]: any} {
    return pickBy(stores, (_store, name) => {
      return ((_store.dialect && isString(_store.dialect) && _store.orm === 'sequelize')
        || startsWith(_store.uri, 'mysql://')
        || startsWith(_store.uri, 'mysql://')
        || startsWith(_store.uri, 'postgresql://')
        || startsWith(_store.uri, 'sqlite://'))
    })
  },

  /**
   * Pick only models stores from app config that will use this orm
   */
  pickModels (app: FabrixApp, connections): {[key: string]: any} {
    const stores = Object.keys(connections)
    return pickBy(app.models, (_model, name) => {
      const modelConfig = _model.config
      const store = modelConfig.store || app.config.get('models.defaultStore')
      return (stores.indexOf(store) > -1 )
    })
  },

  /**
   * Transform the FabrixApp "app.config.stores" into a Sequelize object
   */
  getConnections (app: FabrixApp) {
    const stores = Transformer.pickStores(app.config.get('stores'))
    const sequelize = {}
    Object.keys(stores).forEach(key => {
      sequelize[key] = Transformer.createConnectionsFromConfig(stores[key])
      sequelize[key].fabrixApp = app
      sequelize[key].migrate = stores[key].migrate
      sequelize[key].models = {}
    })

    return sequelize
  },

  getModels (app: FabrixApp, connections) {
    const models = Transformer.pickModels(app, connections)
    const sequelize = {}
    Object.keys(models).forEach(modelName => {
      sequelize[modelName] = Transformer.defineModel(app, models[modelName], connections)
    })
    Transformer.associateModels(app, sequelize)
    return sequelize
  },

  associateModels (app: FabrixApp, models) {
    Object.keys(models).forEach( modelName => {
      // Associate the models
      if (models[modelName].hasOwnProperty('associate')) {
        models[modelName].associate(models)
      }
    })
  }

}
