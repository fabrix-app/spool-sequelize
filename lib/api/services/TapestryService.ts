import { FabrixService as Service } from '@fabrix/fabrix/dist/common'
import * as _ from 'lodash'
import { ModelError } from '../../errors'

const manageError = err => {
  if (err.name === 'SequelizeValidationError') {
    return Promise.reject(new ModelError('E_VALIDATION', err.message, err.errors))
  }
  return Promise.reject(err)
}

/**
 * fabrix Service that maps abstract ORM methods to their respective Waterine
 * methods. This service can be thought of as an "adapter" between fabrix and
 * Sequelize. All methods return native ES6 Promises.
 */
export class TapestryService extends Service {

  /**
   * Internal method to retreive model object
   * @param modelName name of the model to retreive
   * @returns {*} sequelize model object
   * @private
   */
  _getModel(modelName) {
    return this.app.models[modelName] || this.app.spools['sequelize'].models[modelName]
  }

  /**
   * Create a model, or models. Multiple models will be created if "values" is
   * an array.
   *
   * @param modelName The name of the model to create
   * @param values The model's values
   * @param options to pass to sequelize
   * @return Promise
   */
  create(modelName, values, options) {
    const Model = this._getModel(modelName)
    const modelOptions = _.defaultsDeep({}, options, this.app.config.get('tapestries.models.options'))
    if (!Model) {
      return Promise.reject(new ModelError('E_NOT_FOUND', `${modelName} can't be found`))
    }
    if (modelOptions.populate) {
      modelOptions.include = this._createIncludeField(Model, modelOptions.populate)
    }
    return Model.create(values, modelOptions).catch(manageError)
  }

  _createIncludeField(model, populate) {
    if (populate === true || populate === 'all') {
      return {all: true}
    }
    if (_.isPlainObject(populate) || _.isArray(populate)) {
      return populate
    }

    const fields = populate.split(',')
    const includes = []

    fields.forEach((value, key) => {
      includes.push(model.associations[value])
    })

    return includes
  }

  /**
   * Find all models that satisfy the given criteria. If a primary key is given,
   * the return value will be a single Object instead of an Array.
   *
   * @param modelName The name of the model
   * @param criteria The criteria that filter the model resultset
   * @param options to pass to sequelize
   * @return Promise
   */
  find(modelName, criteria, options) {
    const Model = this._getModel(modelName)
    const modelOptions = _.defaultsDeep({}, options, this.app.config.get('tapestries.models.options'))
    let query
    if (!Model) {
      return Promise.reject(new ModelError('E_NOT_FOUND', `${modelName} can't be found`))
    }
    if (modelOptions.populate) {
      modelOptions.include = this._createIncludeField(Model, modelOptions.populate)
    }
    delete modelOptions.populate

    if (!_.isPlainObject(criteria) || modelOptions.findOne === true) {
      if (modelOptions.findOne === true) {
        if (!criteria.where) {
          criteria = {where: criteria}
        }

        query = Model.find(_.defaults(criteria, modelOptions))
      }
      else {
        query = Model.find(_.defaults({
          where: {
            [Model.primaryKeyAttribute]: criteria
          }
        }, modelOptions))
      }
    }
    else {
      if (!criteria.where) {
        criteria = {where: criteria}
      }
      if (modelOptions.sort) {
        criteria.order = modelOptions.sort
        delete modelOptions.sort
      }
      query = Model.findAll(_.defaults(criteria, modelOptions))
    }

    return query.catch(manageError)
  }

  /**
   * Update an existing model, or models, matched by the given by criteria, with
   * the given values. If the criteria given is the primary key, then return
   * exactly the object that is updated; otherwise, return an array of objects.
   *
   * @param modelName The name of the model
   * @param criteria The criteria that determine which models are to be updated   *
   * @param [id] A optional model id; overrides "criteria" if both are specified.
   * @param values to update
   * @param options extends { where: criteria } then passed to sequelize
   * @return Promise
   */
  update(modelName, criteria, values, options: {[key: string]: any} = {}) {
    const Model = this._getModel(modelName)
    if (!Model) {
      return Promise.reject(new ModelError('E_NOT_FOUND', `${modelName} can't be found`))
    }
    let query
    if (!criteria) {
      criteria = {}
    }

    if (_.isArray(options.populate) || _.isPlainObject(options.populate)) {
      options.include = options.populate
      delete options.populate
    }

    if (_.isPlainObject(criteria)) {
      if (!criteria.where) {
        criteria = {where: criteria}
      }
      query = Model.update(values, _.extend(criteria, options))
    }
    else {
      criteria = {
        where: {
          [Model.primaryKeyAttribute]: criteria
        }
      }

      query = Model.update(values, _.extend(criteria, options))
    }

    return query.catch(manageError)
  }

  /**
   * Destroy (delete) the model, or models, that match the given criteria.
   *
   * @param modelName The name of the model
   * @param criteria The criteria that determine which models are to be updated
   * @param options to pass to sequelize
   * @return Promise
   */
  destroy(modelName, criteria, options: {[key: string]: any} = {}) {
    const Model = this._getModel(modelName)
    let query
    if (!Model) {
      return Promise.reject(new ModelError('E_NOT_FOUND', `${modelName} can't be found`))
    }

    if (_.isArray(options.populate) || _.isPlainObject(options.populate)) {
      options.include = options.populate
      delete options.populate
    }

    if (_.isPlainObject(criteria)) {
      if (!criteria.where) {
        criteria = {where: criteria}
      }
      if (_.isArray(options.populate) || _.isPlainObject(options.populate)) {
        criteria.include = options.populate
        delete options.populate
      }
      query = Model.destroy(_.extend(criteria, options))
    }
    else {
      criteria = {
        where: {
          [Model.primaryKeyAttribute]: criteria
        }
      }
      query = Model.destroy(_.extend(criteria, options)).then(results => results[0])
    }

    return query.catch(manageError)
  }

  /**
   * Create a model, and associate it with its parent model.
   *
   * @param parentModelName The name of the model's parent
   * @param childAttributeName The name of the model to create
   * @param parentId The id (required) of the parent model
   * @param values The model's values
   * @param options to pass to sequelize
   * @return Promise
   */
  createAssociation(parentModelName, parentId, childAttributeName, values, options) {
    const parentModel = this._getModel(parentModelName)
    if (!parentModel) {
      return Promise.reject(new ModelError('E_NOT_FOUND', `${parentModelName} can't be found`))
    }
    const association = parentModel.associations[childAttributeName]
    if (!association) {
      return Promise.reject(new ModelError('E_NOT_FOUND', `${parentModelName}'s association ${childAttributeName} can't be found`))
    }
    const childModelName = association.target.name
    const childModel = this._getModel(childModelName)

    if (!options) {
      options = {}
    }
    // Used for things like hasMany
    if (association.foreignKeyField || (association.sourceKey && !association.targetKey)) {
      values[association.foreignKeyField || association.foreignKey] = parentId
    }
    return parentModel.sequelize.transaction(t => {
      options.transaction = t
      return this.create(childModelName, values, options).then(child => {
        let promise = Promise.resolve()
        // Used for things like belongsToMany
        if (association.throughModel) {
          promise = promise.then(association.throughModel.create({
            [association.identifierField]: parentId,
            [association.foreignIdentifierField]: child[childModel.primaryKeyAttribute]
          }, options))
        }
        // Used for things like belongsTo
        if (!association.foreignKeyField) {
          promise = promise.then(this.update(parentModelName, parentId, {
            [association.identifierField]: child[childModel.primaryKeyAttribute]
          }, options).then(() => child))
        }
        promise = promise.then(() => child)
        return promise
      })
    })
  }

  /**
   * Find all models that satisfy the given criteria, and which is associated
   * with the given Parent Model.
   *
   * @param parentModelName The name of the model's parent
   * @param childAttributeName The name of the model to create
   * @param parentId The id (required) of the parent model
   * @param criteria The search criteria
   * @param options to pass to sequelize
   * @return Promise
   */
  findAssociation(parentModelName, parentId, childAttributeName, criteria, options) {
    const parentModel = this._getModel(parentModelName)
    if (!parentModel) {
      return Promise.reject(new ModelError('E_NOT_FOUND', `${parentModelName} can't be found`))
    }
    const association = parentModel.associations[childAttributeName]
    if (!association) {
      return Promise.reject(new ModelError('E_NOT_FOUND', `${parentModelName}'s association ${childAttributeName} can't be found`))
    }
    const childModelName = association.target.name
    const childModel = this._getModel(childModelName)
    if (!childModel) {
      return Promise.reject(new ModelError('E_NOT_FOUND', `${childModelName} can't be found`))
    }

    // Used for things like hasMany
    if (association.foreignKeyField || (association.sourceKey && !association.targetKey)) {
      if (!criteria) {
        criteria = {}
      }
      else if (!_.isPlainObject(criteria)) {
        criteria = {
          [childModel.primaryKeyAttribute]: criteria
        }
      }
      criteria[association.foreignKeyField || association.foreignKey] = parentId
      if (!options) {
        options = {}
      }
      return this.find(childModelName, criteria, options)
    }
    // Used for things like belongsToMany
    else if (association.throughModel) {
      // Get all through tables with the parent
      return this._getThroughModelAssociation(association, parentId)
        .then(ids => childModel.findAll(_.extend({
          where: {
            $and: [
              criteria || {},
              {
                [childModel.primaryKeyAttribute]: {
                  $in: ids
                }
              }
            ]
          }
        }, options)))
        .catch(manageError)
    }
    // Used for things like belongsTo
    else {
      return this.find(parentModelName, parentId, options)
        .then(parent => this.find(childModelName, parent[association.identifierField], options))
    }
  }

  /**
   * Update models by criteria, and which is associated with the given
   * Parent Model.
   *
   * @param parentModelName The name of the model's parent
   * @param parentId The id (required) of the parent model
   * @param childAttributeName The name of the model to create
   * @param criteria The search criteria
   * @param values to update
   * @param options to pass to sequelize
   * @return Promise
   */
  updateAssociation(parentModelName, parentId, childAttributeName, criteria, values, options) {
    const parentModel = this._getModel(parentModelName)
    if (!parentModel) {
      return Promise.reject(new ModelError('E_NOT_FOUND', `${parentModelName} can't be found`))
    }
    const association = parentModel.associations[childAttributeName]
    if (!association) {
      return Promise.reject(new ModelError('E_NOT_FOUND', `${parentModelName}'s association ${childAttributeName} can't be found`))
    }
    const childModelName = association.target.name
    const childModel = this._getModel(childModelName)
    if (!childModel) {
      return Promise.reject(new ModelError('E_NOT_FOUND', `${childModelName} can't be found`))
    }

    // Used for things like hasMany
    if (association.foreignKeyField || (association.sourceKey && !association.targetKey)) {
      if (!options) {
        options = {}
      }
      if (!criteria) {
        criteria = {}
      }
      else if (!_.isPlainObject(criteria)) {
        criteria = {
          [childModel.primaryKeyAttribute]: criteria
        }
        options.findOne = true
      }
      criteria[association.foreignKeyField || association.foreignKey] = parentId
      return this.update(childModelName, criteria, values, options)
    }
    // Used for things like belongsToMany
    else if (association.throughModel) {
      // Get all through tables with the parent
      return this._getThroughModelAssociation(association, parentId)
        .then(ids => childModel.update(values, _.extend({
          where: {
            $and: [
              criteria || {},
              {
                [childModel.primaryKeyAttribute]: {
                  $in: ids
                }
              }
            ]
          }
        }, options)))
        .catch(manageError)
    }
    // Used for things like belongsTo
    else {
      return this.find(parentModelName, parentId, options)
        .then(parent => this.update(childModelName, parent[association.identifierField], values, options))
    }
  }

  _getThroughModelAssociation(association, parentId) {
    return association.throughModel.findAll({
      where: {
        [association.identifierField]: parentId
      },
      attributes: [association.foreignIdentifierField]
    })
      // Get the childrens' IDs
      .then(throughTables => throughTables.map(throughTable => throughTable[association.foreignIdentifierField]))
  }

  /**
   * Destroy models by criteria, and which is associated with the
   * given Parent Model.
   *
   * @param parentModelName The name of the model's parent
   * @param parentId The id (required) of the parent model
   * @param childAttributeName The name of the model to create
   * @param criteria The search criteria
   * @param options to pass to sequelize
   * @return Promise
   */
  destroyAssociation(parentModelName, parentId, childAttributeName, criteria, options) {
    return this
      .findAssociation(parentModelName, parentId, childAttributeName, criteria, options)
      .then(records => {
        // If criteria is the ID for instance
        if (!(records instanceof Array)) {
          records = [records]
        }
        return Promise.all(records.map(record => {
          return record.destroy()
        }))
      })
      .catch(manageError)
  }
}
