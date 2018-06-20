import { FabrixApp } from '@fabrix/fabrix'
const _ = require('lodash')

export const Sequelize = {

  defineModels: (app, models, connections) => {
    _.each(models, (model, modelName) => {
      _.each(connections, (connection, name) => {
        if (model.connection === name) {

          const Model = connection.define(modelName, model.schema, model.options)

          Object.defineProperties(Model, {
            app: {
              enumerable: false,
              value: app
            }
          })

          Model.methods = model.methods
          Model.methods.forEach(method => {
            Model[method] = model[method]
          })

          // Migration to Version 2 Assistance for classMethods
          if (model.options) {
            if (model.options.classMethods) {
              app.log.warn(`
                Sequelize v4 does not support classMethods,
                sequelize ${modelName}.classMethods will be deprecated in v3`
              )
              for (const methodName of Object.keys(model.options.classMethods)) {
                Model[methodName] = model.options.classMethods[methodName]
              }
            }

            // Migration to Version 2 Assistance for instnaceMethods
            if (model.options.instanceMethods) {
              app.log.warn(`
                Sequelize v4 does not support instanceMethods,
                sequelize ${modelName}.instanceMethods will be deprecated in v3`
              )
              for (const methodName of Object.keys(model.options.instanceMethods)) {
                Model.prototype[methodName] = model.options.instanceMethods[methodName]
              }
            }
          }

          app.orm[model.globalId] = Model
        }
      })
    })
  },

  transformOrm: (app, orm, models) => {
    _.each(models, (model, modelName) => {

      // ignore model if not configured
      if (!app.orm[model.globalId]) {
        return
      }

      // Assoc
      if (app.orm[model.globalId].associate) {
        app.orm[model.globalId].associate(app.orm)
      }

      orm[model.globalId.toLowerCase()] = app.orm[model.globalId]
    })
  },

  migrate: (app: FabrixApp, connections) => {
    const SchemaMigrationService = app.services.SchemaMigrationService
    const models = app.config.get('models')

    if (models.migrate === 'none') {
      return Promise.resolve()
    }

    return Promise.all(
      connections.map(connection => {
        if (models.migrate === 'drop') {
          return SchemaMigrationService.dropDB(connection)
        }
        else if (models.migrate === 'alter') {
          return SchemaMigrationService.alterDB(connection)
        }
      })
    )
  }
}
