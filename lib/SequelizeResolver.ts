import { FabrixModel, FabrixResolver } from '@fabrix/fabrix/dist/common'
import { Sequelize, Model, DataTypes } from 'sequelize'
import { Transformer } from './transformer'

export class SequelizeResolver extends FabrixResolver {
  private _connection
  private _sequelize
  private _sequelizeModel

  constructor (model: FabrixModel, datastore?: Sequelize) {
    super(model)
    if (!model) {
      throw new RangeError('Resolver must be given a Model to bind to')
    }
    this._sequelize = datastore
  }

  get connection() {
    return this._connection
  }

  set connection(connection) {
    this._connection = connection
  }

  get sequelizeModel() {
    return this._sequelizeModel
  }

  get dataStoreModel() {
    return this._sequelizeModel
  }

  get sequelize() {
    return this._sequelize
  }

  get datastore() {
    return this._sequelize
  }

  get instance() {
    return this._sequelizeModel
  }

  public connect(modelName, schema, options) {
    // Define the Sequelize Connection on the provided connection
    this._sequelizeModel = this._connection.define(modelName, schema, options)
    // Add a copy of the Fabrix app to the connection model
    this._sequelizeModel.app = this.app

    // A helpful exposure of the instance of Sequelize being used
    this._sequelize = this._sequelizeModel.sequelize
    this.model.datastore = this.model['sequelize'] = this.datastore

    // Get the instance methods
    const instanceMethods = Transformer.getModelPrototypes(this.model)
    const classMethods = Transformer.getModelMethods(this.model, instanceMethods)

    // Assign Class Methods from the Model
    Object.keys(classMethods).forEach(c => {
      this._sequelizeModel[c] = classMethods[c]
    })

    // Assign Instance Methods from the Model
    Object.keys(instanceMethods).forEach(i => {
      this._sequelizeModel.prototype[i] = instanceMethods[i]
    })

    // Attach Fabrix to the instance prototype
    this._sequelizeModel.prototype.app = this.app

    // Add this model to the connection.models for use later
    this._connection.models[modelName] = this._sequelizeModel

    // Bind the new methods to the Fabrix model
    const resolverMethods = Transformer.getClassMethods(this)
    Object.entries(resolverMethods).forEach(([ _, method]: [any, string])  => {
      this.model[method] = this[method].bind(this)
    })
  }

  /***********************
   * Getters             *
   ***********************/
  /**
   *
   */
  get associations() {
    if (this._sequelizeModel) {
      return this._sequelizeModel.associations
    }
  }

  /************************
   * Class Methods        *
   ************************/

  /**
   *
   */
  addScope(name, scope, options = {}) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.addScope(name, scope, options)
    }
  }

  /**
   *
   */
  aggregate(filed, aggregateFunction, options = {}) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.aggregate(filed, aggregateFunction, options)
    }
  }

  /**
   *
   */
  belongsTo(target, options = {}) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.belongsTo(target, options)
    }
  }

  belongsToMany(target, options = {}) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.belongsToMany(target, options)
    }
  }

  /**
   *
   */
  build(options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.build(options)
    }
  }

  /**
   *
   */
  bulkCreate(records: any[], options = {}) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.bulkCreate(records, options)
    }
  }

  /**
   *
   */
  count(criteria, options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.count(criteria, options)
    }
  }

  /**
   *
   */
  create (values, options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.create(values, options)
    }
  }

  /**
   *
   */
  decrement(fields, options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.decrement(fields, options)
    }
  }
  describe(schema, options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.describe(schema, options)
    }
  }

  /**
   *
   */
  // Delete is a Fabrix Alias of Sequelize.destroy
  delete(options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.destroy(options)
    }
  }

  /**
   *
   */
  destroy(options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.destroy(options)
    }
  }

  /**
   *
   */
  drop(options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.drop(options)
    }
  }

  /**
   *
   */
  findAll(options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.findAll(options)
    }
  }

  /**
   *
   */
  findAndCountAll(options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.findAndCountAll(options)
    }
  }

  /**
   *
   */
  findById(id, options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.findById(id, options)
    }
  }

  /**
   *
   */
  findOne(criteria, options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.findOne(criteria, options)
    }
  }

  /**
   *
   */
  findOrBuild(criteria) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.findOrBuild(criteria)
    }
  }

  /**
   *
   */
  findOrCreate(criteria) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.findOrCreate(criteria)
    }
  }

  /**
   *
   */
  getTableName() {
    if (this._sequelizeModel) {
      return this._sequelizeModel.getTableName()
    }
  }

  /**
   *
   */
  hasMany(arget, options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.hasMany(arget, options)
    }
  }

  /**
   *
   */
  hasOne(target, options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.hasOne(target, options)
    }
  }

  /**
   *
   */
  increment(fields, options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.increment(fields, options)
    }
  }

  /**
   *
   */
  init(attributes, options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.init(attributes, options)
    }
  }

  /**
   *
   */
  max(criteria, options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.max(criteria, options)
    }
  }

  /**
   *
   */
  min(criteria, options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.min(criteria, options)
    }
  }

  /**
   *
   */
  removeAttribute(attribute) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.removeAttribute(attribute)
    }
  }

  /**
   *
   */
  restore(options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.restore(options)
    }
  }

  // Conflicts with Fabrix Resolver?
  // schema(schema, options = { }) {
  //
  // }

  /**
   *
   */
  scope(options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.scope(options)
    }
  }

  /**
   *
   */
  sum(riteria, options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.sum(riteria, options)
    }
  }

  /**
   *
   */
  sync(options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.sync(options)
    }
  }

  /**
   *
   */
  truncate(options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.truncate(options)
    }
  }

  unscoped() {
    if (this._sequelizeModel) {
      return this._sequelizeModel.unscoped()
    }
  }

  /**
   *
   */
  // Save is a Fabrix Alias of Sequelize.update
  save(values, options = {}) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.update(values, options)
    }
  }

  /**
   *
   */
  update(values, options = {}) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.update(values, options)
    }
  }

  /**
   *
   */
  upsert(values, options = {}) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.upsert(values, options)
    }
  }
}
