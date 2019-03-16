import * as _ from 'lodash'
import * as Sequelize from 'sequelize'
import { FabrixApp } from '@fabrix/fabrix'
import { FabrixModel } from '@fabrix/fabrix/dist/common'
import { pickBy, isString, startsWith } from 'lodash'
import { SequelizeResolver } from './SequelizeResolver'

export const Transformer = {
  BreakException: {},

  /**
   * Reserved Methods that the model shouldn't inherit from the resolver
   */
  reservedMethods: [
    '_app',
    '_datastore',
    'app',
    'api',
    'log',
    '__', // this reserved method comes from i18n
    'constructor',
    'undefined',
    'methods',
    'config',
    'schema',
    'services',
    'models',
    'connect'
  ],

  /**
   * Supplied by Model vs Recognized by Sequelize
   * Generally Fabrix ORMS support: string, int, date
   */
  dataTypes: {
    '^(STRING|string)': 'STRING',
    '^(STRING|string)\((\w*)\)': 'STRING($2)',
    '(STRING.BINARY)': 'STRING.BINARY',
    '^(TEXT|text)': 'TEXT',
    '^(TEXT|text)\((\w*)\)': 'TEXT($2)',
    '^(INTEGER|integer|int)': 'INTEGER',
    '^(BIGINT)': 'BIGINT',
    '^(BIGINT)\((\d*)\)': 'BIGINT($2)',
    '^(FLOAT)': 'FLOAT',
    '^(FLOAT)\((\d*)\)': 'FLOAT($2)',
    '^(FLOAT)\((\d*),\s(\d*)\)': 'FLOAT($2, $3)',
    '^(REAL)': 'REAL',
    '^(REAL)\((\d*)\)': 'REAL($2)',
    '^(REAL)\((\d*),\s(\d*)\)': 'REAL($2, $3)',
    '^(DOUBLE)': 'DOUBLE',
    '^(DOUBLE)\((\d*)\)': 'DOUBLE($2)',
    '^(DOUBLE)\((\d*),\s(\d*)\)': 'DOUBLE($2, $3)',
    '^(DECIMAL)': 'DECIMAL',
    '^(DECIMAL)\((\d*),\s(\d*)\)': 'DECIMAL($2, $3)',
    '^(DATE|date)': 'DATE',
    '^(DATE)\((\d*)\)': 'DATE($2)',
    '^(DATEONLY)': 'DATEONLY',
    '^(BOOLEAN)': 'BOOLEAN',
    '^(ENUM)': 'ENUM',
    '^(ENUM)\((.*)?\)': 'ENUM($2)',
    '^(ARRAY)\((\w*)\)': 'ARRAY($2)',
    '^(JSON|json)': 'JSON',
    '^(JSONB|jsonb)': 'JSONB',
    '^(BLOB)': 'BLOB',
    '^(BLOB)\((\w*)\)': 'BLOB($2)',
    '^(UUID)': 'UUID',
    '^(CIDR)': 'CIDR',
    '^(INET)': 'INET',
    '^(MACADDR)': 'MACADDR',
    '^(RANGE)\((\w*)\)': 'RANGE($2)',
    '^(GEOMETRY)': 'GEOMETRY',
    '^(GEOMETRY)\((\w*)\)': 'GEOMETRY($2)',
    '^(GEOMETRY)\((\w*),\s(\d*)\)': 'GEOMETRY($2, $3)'
  },

  /**
   * Traverse prototype chain and aggregate all class method names
   */
  getClassMethods (obj: any): string[] {
    const props: string[] = [ ]
    const objectRoot = new Object()

    while (!obj.isPrototypeOf(objectRoot)) {
      Object.getOwnPropertyNames(obj).forEach(prop => {
        if (
          props.indexOf(prop) === -1
          && !Transformer.reservedMethods.some(p => p === prop)
          && typeof obj[prop] === 'function'
        ) {
          props.push(prop)
        }
      })
      obj = Object.getPrototypeOf(obj)
    }
    return props
  },

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
    const schema = Transformer.transformSchema(model.constructor.schema(app, Sequelize))
    return schema
  },

  replaceDataType: (dataType) => {
    let transformed
    try {
      Object.keys(Transformer.dataTypes).forEach(type => {
        const exp = new RegExp(type)
        if (exp.test(dataType)) {
          transformed = Sequelize[dataType.replace(exp, Transformer.dataTypes[type])]
          throw Transformer.BreakException
        }
      })
    }
    catch (e) {
      if (e !== Transformer.BreakException) {
        throw e
      }
    }
    return transformed
  },
  /**
   * Transforms Schema to Sequelize method if defined as a string
   * Common from Spools built for waterline
   */
  transformSchema: (schema) => {
    const transformed: {[key: string]: any } = {}
    Object.keys(schema).forEach(s => {
      if (typeof schema[s] === 'string') {
        transformed[s] = Transformer.replaceDataType(schema[s])
      }
      // else if (
      //   typeof schema[s] === 'object'
      //   && schema[s].hasOwnProperty('type')
      //   && typeof schema[s].type === 'string'
      // ) {
      //   schema[s].type = Transformer.replaceDataType(schema[s].type)
      //   transformed[s] = schema[s]
      // }
      else {
        transformed[s] = schema[s]
      }
    })
    return transformed
  },

  /**
   * Get the prototypes of a model
   */
  getModelPrototypes: (model) => {
    return Object.getPrototypeOf(model)
  },

  /**
   * Get the Methods of a model
   */
  getModelMethods: (model, prototypes) => {
    const methods = {}
    const methodNames = model.methods.filter(m => Object.keys(prototypes).indexOf(m) === -1)
    methodNames.forEach(m => methods[m] = model[m])
    return methods
  },

  defineModel: (app: FabrixApp, model: FabrixModel, connections) => {
    const modelName = model.constructor.name
    const modelConfig = model.config
    const store = modelConfig.store || app.config.get('models.defaultStore')
    const connection = connections[store]
    const migrate = modelConfig.migrate || app.config.get('models.migrate') || connection.migrate
    const options =  Transformer.getModelOptions(app, model)
    const schema = Transformer.getModelSchema(app, model)

    if (!model.resolver || !model.resolver.connect) {
      throw new Error(`${modelName} was set to use Sequelize but the resolver is missing "connect"`)
    }
    if (!(model.resolver instanceof SequelizeResolver)) {
      throw new Error(`${modelName} is not a Sequelize Resolver`)
    }

    model.store = store
    model.migrate = migrate
    model.resolver.connection = connection
    model.resolver.connect(modelName, schema, options)

    return model
  },

  definePlugins(app: FabrixApp, store_config = {}, plugins = {}) {
    const global_plugins = Object.keys(plugins)
    const store_plugins = Object.keys(store_config).filter(n => {
      if (global_plugins.indexOf(n) === -1) {
        return n
      }
    })
    const plugs = [
      ...global_plugins.map(n => {
        app.log.debug(`Defining Global Sequelize Plugin ${n}`)
        return plugins[n]
      }),
      ...store_plugins.map(n => {
        app.log.debug(`Defining Local Sequelize Plugin ${n}`)
        return store_config[n]
      })
    ]
    return plugs
  },

  /**
   * Create Sequelize object based on config options
   * @param  {Object} app.config.store
   * @return {Sequelize} Sequelize instance
   */
  createConnectionsFromConfig (app: FabrixApp, config: {[key: string]: any}, plugins: {[key: string]: any} = {}) {
    const logger = function(str) {
      app.log.debug(str)
    }
    const plugs = Transformer.definePlugins(app, config.plugins, plugins)

    // Make a copy so plugins don't collide on multiple stores
    const Seq = Sequelize

    // Add plugins
    plugs.forEach((plug: any) => {
      try {
        if (typeof plug === 'function') {
          plug(Seq)
        }
        else if (typeof plug === 'object' && plug.func && plug.config) {
          plug.func(Seq, plug.config)
        }
        else {
          app.log.debug(`Transformer: ${plug} was not a function or Fabrix sequelize object`)
        }
      }
      catch (err) {
        app.log.error(err)
      }
    })

    if (config.uri) {
      // Sequelize modify options object
      return new Seq(config.uri, Object.assign({}, { logging: logger }, config))
    }
    else {
      return new Seq(
        config.database,
        config.username || process.env.POSTGRES_USER,
        config.password || process.env.POSTGRES_PASSWORD,
        Object.assign({}, { logging: logger }, config)
      )
    }
  },

  /**
	 * Pick only Sequelize SQL stores from app config
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
  getConnections (app: FabrixApp, plugins: {[key: string]: any} = {}) {
    const stores = Transformer.pickStores(app.config.get('stores'))
    const sequelize = {}
    Object.keys(stores).forEach(key => {
      sequelize[key] = Transformer.createConnectionsFromConfig(app, stores[key], plugins)
      sequelize[key].fabrixApp = app
      sequelize[key].migrate = stores[key].migrate
      sequelize[key].models = {}
    })

    return sequelize
  },

  /**
   * Transform sequelize connections for sequelize models
   */
  getModels (app: FabrixApp, connections) {
    const models = Transformer.pickModels(app, connections)
    const sModels = {}
    Object.keys(models).forEach(modelName => {
      sModels[modelName] = Transformer.defineModel(app, models[modelName], connections).resolver.sequelizeModel
    })
    Transformer.associateModels(app, models, sModels)
    return sModels
  },

  /**
   * Call the associate method on configured models
   */
  associateModels (app: FabrixApp, models, sequelizeModels) {
    Object.keys(models).forEach( modelName => {
      // Associate the models
      if (models[modelName].constructor.hasOwnProperty('associate')) {
        models[modelName].constructor.associate(sequelizeModels)
      }
      // Convenience link between model.associations and the sequelize.model.associations
      // models[modelName].associations = models[modelName].resolver.sequelizeModel.associations
    })
  },

  /**
   * Add Plugins
   */
  getPlugins(app: FabrixApp) {
    const plugins = app.config.get('sequelize.plugins')
    return plugins
  }
}
