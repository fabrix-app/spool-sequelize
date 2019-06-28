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

  getModelOptions: (app: FabrixApp, sequelize, model) => {
    const config = model.constructor.config(app, sequelize)
    // Options must be
    if (!config.options) {
      config.options = {}
    }

    if (!config.options.tableName) {
      config.options.tableName = model.name.toLowerCase()
    }

    return config.options
  },

  getModelSchema: (app: FabrixApp, sequelize, model) => {
    const schema = Transformer.transformSchema(sequelize, model.constructor.schema(app, sequelize))
    return schema
  },

  replaceDataType: (sequelize, dataType) => {
    let transformed
    try {
      Object.keys(Transformer.dataTypes).forEach(type => {
        const exp = new RegExp(type)
        if (exp.test(dataType)) {
          transformed = sequelize[dataType.replace(exp, Transformer.dataTypes[type])]
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
  transformSchema: (sequelize, schema) => {
    const transformed: {[key: string]: any } = {}
    Object.keys(schema).forEach(s => {
      if (typeof schema[s] === 'string') {
        transformed[s] = Transformer.replaceDataType(sequelize, schema[s])
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
   * Get the prototypes of a model and it's parent
   */
  getModelPrototypes: (model) => {
    const sup = model.__proto__ ? Object.getPrototypeOf(model.__proto__) : {}
    const props = Object.getPrototypeOf(model)
    return {...sup, ...props}
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

  defineModel: (app: FabrixApp, sequelize, model: FabrixModel, connections) => {
    const modelName = model.constructor.name
    const modelConfig = model.config
    const store = modelConfig.store
      || app.config.get(`models.${modelName}.store`)
      || app.config.get('models.defaultStore')

    const connection = connections[store]
    const migrate = modelConfig.migrate
      || app.config.get(`models.${modelName}.migrate`)
      || app.config.get('models.migrate')
      || connection.migrate

    const options =  Transformer.getModelOptions(app, sequelize, model)
    const schema = Transformer.getModelSchema(app, sequelize, model)

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
    const store_plugins = Object.keys(store_config)
    const plugs = new Map()

    global_plugins.forEach(n => {
      plugs.set(n, plugins[n])
    })

    store_plugins.forEach(n => {
      plugs.set(n, store_config[n])
    })

    return plugs
  },

  /**
   * Create Sequelize object based on config options
   * @param {FabrixApp} app
   * @param {Sequelize} sequelize
   * @param {String} name
   * @param  {Object} config from config.stores<n>
   * @param {Object} plugins global plugins from config.sequelize
   * @return {Sequelize} Sequelize instance
   */
  createConnectionsFromConfig (app: FabrixApp, sequelize, name, config: {[key: string]: any}, plugins: {[key: string]: any} = {}) {
    const logger = function(val) {
      // https://github.com/sequelize/sequelize/issues/3781#issuecomment-421282703
      // If for whatever reason the Sequelize logger exports a Sequelize object, then, this must be done
      if (val && val.toJSON && typeof val.toJSON === 'function') {
        val = val.toJSON()
      }
      app.log.debug(val)
    }

    const plugs: Map<string, any> = Transformer.definePlugins(app, config.plugins, plugins)

    // Resolve or Define Connection plugin namespace
    if (!sequelize.plugins.has(name)) {
      sequelize.plugins.set(name, new Set())
    }

    // Make a copy so plugins don't collide on multiple stores
    let Seq = sequelize

    // Quick check to see if sequelize is already started
    if (Seq instanceof sequelize) {
      throw new Error('Sequelize is already initialized and cannot be loaded again, check your plugins')
    }

    // console.log('BRK HERE', name)
    // Array.from(plugs).reduce(function(accumulator, val, index, array) {
    //   const plug: any = array[index]
    //   const key: string =
    //
    //   app.log.debug(`Resolving ${key} on ${name}...`)
    //
    //   if (!sequelize.plugins.get('plugins').has(key) && !sequelize.plugins.get(name).has(key)) {
    //     try {
    //       if (typeof plug === 'function') {
    //         Seq = plug(Seq)
    //       }
    //       else if (typeof plug === 'object' && plug.func && plug.config) {
    //         Seq = plug.func(Seq, plug.config)
    //       }
    //       else {
    //         app.log.debug(`Transformer: ${key} ${plug} was not a function or Fabrix sequelize object`)
    //       }
    //       sequelize.plugins.get('plugins').add(key)
    //       sequelize.plugins.get(name).add(key)
    //     }
    //     catch (err) {
    //       console.log('BRK err', err)
    //       app.log.error(`${key} plugin threw an error:`, err)
    //     }
    //   }
    //   else {
    //     app.log.debug(`Attempted to add ${ key } as a sequelize instance plugin more than once`)
    //   }
    //
    //   return accumulator + 1
    // }, 0)

    // For each of the defined plugs
    plugs.forEach((plug, key, map) => {
      app.log.debug(`Resolving ${key} on ${name}...`)
      if (!sequelize.plugins.get('plugins').has(key) && !sequelize.plugins.get(name).has(key)) {
        try {
          if (typeof plug === 'function') {
            Seq = plug(Seq)
          }
          else if (typeof plug === 'object' && plug.func && plug.config) {
            Seq = plug.func(Seq, plug.config)
          }
          else {
            app.log.debug(`Transformer: ${key} ${plug} was not a function or Fabrix sequelize object`)
          }
          sequelize.plugins.get('plugins').add(key)
          sequelize.plugins.get(name).add(key)
        }
        catch (err) {
          console.log('BRK err', err)
          app.log.error(`${key} plugin threw an error:`, err)
        }
      }
      else {
        app.log.debug(`Attempted to add ${ key } as a sequelize instance plugin more than once`)
      }
    })

    // Log out that the plugins were added
    app.log.silly(`${ Array.from(sequelize.plugins.get(name))} installed on connection`)

    // Based on the config, initialize the sequelize instance
    if (config.uri) {
      // Sequelize modify options object
      Seq = new Seq(config.uri, Object.assign({}, { logging: logger }, config))
    }
    else {
      Seq = new Seq(
        config.database,
        config.username || process.env.POSTGRES_USER,
        config.password || process.env.POSTGRES_PASSWORD,
        // Sequelize modify options object
        Object.assign({}, { logging: logger }, config)
      )
    }

    // A handy way to see what plugins are loaded on the connection instance added to the resolver
    Seq.plugins = sequelize.plugins.get(name)

    return Seq
  },

  /**
	 * Pick only Sequelize SQL stores from app config
	 */
  // TODO, this is too greedy, it should likely just grab stores that define the orm.sequelize
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
  getConnections (app: FabrixApp, sequelize, plugins: {[key: string]: any} = {}) {
    const stores = Transformer.pickStores(app.config.get('stores'))
    const _sequelize = {}
    Object.keys(stores).forEach(key => {
      _sequelize[key] = Transformer.createConnectionsFromConfig(app, sequelize, key, stores[key], plugins)
      _sequelize[key].fabrixApp = app
      _sequelize[key].migrate = stores[key].migrate
      _sequelize[key].models = {}
    })

    return _sequelize
  },

  /**
   * Transform sequelize connections for sequelize models
   */
  getModels (app: FabrixApp, sequelize, connections) {
    const models = Transformer.pickModels(app, connections)
    const sModels = {}
    Object.keys(models).forEach(modelName => {
      sModels[modelName] = Transformer.defineModel(app, sequelize, models[modelName], connections).resolver.sequelizeModel
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
