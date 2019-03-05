'use strict'

const _ = require('lodash')
const smokesignals = require('smokesignals')
const testModel = require('./testmodel')
const testModel2 = require('./testmodel2')
const SequelizeResolver = require('../../dist/index').SequelizeResolver

const Model = require('@fabrix/fabrix/dist/common').FabrixModel

const App = {
  pkg: {
    name: 'spool-sequelize-test'
  },
  api: {
    models: {
      Page: class Page extends Model {
        static config(app, Sequelize) {
          return {
            options: {}
          }
        }

        static schema(app, Sequelize) {
          return {
            name: { type: Sequelize.STRING, allowNull: false}
          }
        }

        static get resolver () {
          return SequelizeResolver
        }

        static associate(models) {
          models.Page.belongsTo(models.User, {
            as: 'Owner'
          })
        }
      },
      Project: class Project extends Model {
        static config(app, Sequelize) {
          return {
            options: {}
          }
        }

        static schema(app, Sequelize) {
          return {
            name: Sequelize.STRING
          }
        }

        static get resolver () {
          return SequelizeResolver
        }

        static associate(models) {
          models.Project.belongsToMany(models.User, {
            through: models.UserProject
          })

          models.Project.hasOne(models.Page)
        }
      },
      UserProject: class UserProject extends Model {
        static schema(app, Sequelize) {
          return {
            status: Sequelize.STRING
          }
        }

        static get resolver () {
          return SequelizeResolver
        }
      },
      User: class User extends Model {
        static config(app, Sequelize) {
          return {
            options: { }
          }
        }

        static schema(app, Sequelize) {
          return {
            name: {
              type: Sequelize.STRING,
              allowNull: false
            },
            password: Sequelize.STRING,
            displayName: Sequelize.STRING
          }
        }

        static get resolver () {
          return SequelizeResolver
        }

        static associate(models) {
          models.User.hasMany(models.Role, {
            as: 'roles',
            onDelete: 'CASCADE',
            foreignKey: {
              allowNull: true
            }
          })
        }
      },
      Role: class Role extends Model {
        static config(app, Sequelize) {
          return {
            store: 'storeoverride',
            options: {}
          }
        }

        static schema(app, Sequelize) {
          return {
            name: 'string'
          }
        }

        static get resolver () {
          return SequelizeResolver
        }

        static associate(models) {
          models.Role.belongsTo(models.User, {
            onDelete: 'CASCADE',
            foreignKey: {
              allowNull: true
            }
          })
        }
      },
      ModelCallbacks: class ModelCallbacks extends Model {
        static config(app, Sequelize) {
          return {
            options: {
              hooks: {
                beforeCreate: (values, options) => {
                  if (values.dataValues.beforeCreate === 0)
                    values.beforeCreate += 1
                },
                afterCreate: (values, options) => {
                  if (values.dataValues.afterCreate === 0)
                    values.afterCreate += 1
                },
                beforeBulkUpdate: (values)=> {
                  if (values.attributes.beforeUpdate === 0)
                    values.attributes.beforeUpdate += 1
                },
                afterBulkUpdate: (values)=> {
                  if (values.attributes.afterUpdate === 0)
                    values.attributes.afterUpdate += 1
                },
                beforeUpdate: (values, options) => {
                  if (values.dataValues.beforeUpdate === 0)
                    values.beforeUpdate += 1
                },
                afterUpdate: (values, options) => {
                  if (values.dataValues.afterUpdate === 0)
                    values.afterUpdate += 1
                },
                beforeValidate: (values, options) => {
                  if (values.dataValues.beforeValidate === 0)
                    values.beforeValidate += 1
                },
                afterValidate: (values, options) => {
                  if (values.dataValues.afterValidate === 0)
                    values.afterValidate += 1
                },
                beforeDestroy: (values, options) => {

                },
                afterDestroy: (values, options) => {

                }
              }
            }
          }
        }

        static schema(app, Sequelize) {
          return {
            name: Sequelize.STRING,
            beforeCreate: Sequelize.INTEGER,
            afterCreate: Sequelize.INTEGER,
            beforeUpdate: Sequelize.INTEGER,
            afterUpdate: Sequelize.INTEGER,
            beforeValidate: Sequelize.INTEGER,
            afterValidate: Sequelize.INTEGER
          }
        }

        static get resolver () {
          return SequelizeResolver
        }
      },
      testModel,
      testModel2
    }
  },
  config: {
    main: {
      spools: [
        require('@fabrix/spool-router').RouterSpool,
        require('@fabrix/spool-tapestries').TapestriesSpool,
        require('../../dist/index').SequelizeSpool // spool-sequelize
      ]
    },
    sequelize: {
      plugins: {
        test_global: require('./testPlugin')
      }
    },
    stores: {
      teststore: {
        migrate: 'drop',
        orm: 'sequelize',
        database: 'Sequelize',
        host: '127.0.0.1',
        dialect: 'postgres',
        plugins: {
          test_local: require('./testPlugin')
        }
      },
      storeoverride: {
        migrate: 'drop',
        orm: 'sequelize',
        database: 'Sequelize',
        host: '127.0.0.1',
        dialect: 'postgres'
      },
      uristore: {
        migrate: 'drop',
        orm: 'sequelize',
        uri: 'sqlite://testuser:password@testhost:1234/testdb'
      }
    },
    models: {
      defaultStore: 'teststore',
      migrate: 'drop',
      Override: {
        tableName: 'override'
      }
    }
  }
}

_.defaultsDeep(App, smokesignals.FailsafeConfig)
module.exports = App
