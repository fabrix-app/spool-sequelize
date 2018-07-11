import * as _ from 'lodash'
import * as Sequelize from 'sequelize'
import { FabrixApp } from '@fabrix/fabrix'
import { FabrixModel } from '@fabrix/fabrix/dist/common'
import { pickBy, isString, startsWith } from 'lodash'

export const Transformer = {
  BreakException: {},

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
  // Supplied by Model vs Recognized by Sequelize
  // Generally Fabrix ORMS support: string, int, date
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

  /**
   * Transforms Schema to Sequelize method if defined as a string
   * Common from Spools built for waterline
   */
  transformSchema: (schema) => {
    const transformed: {[key: string]: any } = {}
    Object.keys(schema).forEach(s => {
      if (typeof schema[s] === 'string') {
        try {
          Object.keys(Transformer.dataTypes).forEach(type => {
            const exp = new RegExp(type)
            if (exp.test(schema[s])) {
              transformed[s] = Sequelize[schema[s].replace(exp, Transformer.dataTypes[type])]
              throw Transformer.BreakException
            }
          })
        }
        catch (e) {
          if (e !== Transformer.BreakException) {
            throw e
          }
        }
      }
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
    // const instanceMethods = Transformer.getModelPrototypes(model)
    // const classMethods = Transformer.getModelMethods(model, instanceMethods)
    const options =  Transformer.getModelOptions(app, model)
    const schema = Transformer.getModelSchema(app, model)

    // const SequelizeModel = connection.define(modelName, schema, options)
    // model.resolver.store = store
    // model.resolver.migrate = migrate
    // console.log('BROKE BEFORE', typeof model.resolver.create)
    model.store = store
    model.migrate = migrate
    model.resolver.connection = connection
    model.resolver.connect(modelName, schema, options)

    return model
  },

  /**
   * Create Sequelize object based on config options
   * @param  {Object} app.config.store
   * @return {Sequelize} Sequelize instance
   */
  createConnectionsFromConfig (config: {[key: string]: any}) {
    if (config.uri) {
      return new Sequelize(config.uri, Object.assign({}, config)) // Sequelize modify options object
    }
    else {
      return new Sequelize(
        config.database,
        config.username || process.env.POSTGRES_USER,
        config.password || process.env.POSTGRES_PASSWORD,
        config
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
      if (models[modelName].hasOwnProperty('associate')) {
        models[modelName].associate(sequelizeModels)
      }
      models[modelName].associations = models[modelName].resolver.sequelizeModel.associations
    })
  }
}
