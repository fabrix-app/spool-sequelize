import { FabrixModel, FabrixResolver } from '@fabrix/fabrix/dist/common'
import { Sequelize, Model, DataTypes } from 'sequelize'
import { Transformer } from './transformer'

export class SequelizeResolver extends FabrixResolver {
  private _connection
  private _options
  private _schema
  private _sequelize
  private _sequelizeModel
  private _plugins

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

  /**
   * Fabrix Specific to spool-models
   */
  get dataStoreModel() {
    return this._sequelizeModel
  }

  get sequelize() {
    return this._sequelize
  }

  /**
   * Get plugins installed
   */
  get plugins() {
    return this._sequelize ? this._sequelize.plugins : new Set()
  }

  /**
   * Get options provided to the model when connected
   */
  get options() {
    return this._options
  }

  /**
   * Get schema provided to the model when connected
   */
  get schema() {
    return this._schema
  }

  get datastore() {
    return this._sequelize
  }

  get instance() {
    return this._sequelizeModel
  }

  public connect(
    modelName: string,
    schema: {
      [key: string]: {
        [key: string]: any,
        type: any
      }
    },
    options: {[key: string]: any} = {}
  ) {
    this._options = options
    this._schema = schema

    // Define the Sequelize Connection on the provided connection
    this._sequelizeModel = this._connection.define(modelName, schema, options)

    // Special shim to make removing the primary key easier if not needed
    if (options.primaryKey === false) {
      this._sequelizeModel.removeAttribute('id')
    }

    // Special to make it easy to remove attributes created by Sequelize
    // Why this isn't just part of Sequelize? Who knows.
    if (options.removeAttributes && options.removeAttributes.length > 0) {
      options.removeAttributes.forEach(a => {
        this._sequelizeModel.removeAttribute(a)
      })
    }

    // Add a copy of the Fabrix app to the connection model
    this._sequelizeModel.app = this.app
    // this._sequelizeModel.model = this.model

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

    // Attach Fabrix Model to the instance prototype
    this._sequelizeModel.prototype.resolver = this

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
  build(dataValues, options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.build(dataValues, options)
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
  bulkUpdate(values: any, records: any, options = {}) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.bulkUpdate(values, records, options)
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

  /**
   *
   */
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
      this.app.log.info('findById is deprecated, use findByPk instead')
      return this._sequelizeModel.findByPk(id, options)
    }
  }

  /**
   *
   */
  findByPk(id, options = { }) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.findByPk(id, options)
    }
  }

  /**
   *
   */
  findCreateFind(criteria) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.findCreateFind(criteria)
    }
  }

  /**
   *
   */
  findOne(criteria) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.findOne(criteria)
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

  addHook(values, options = {}) {
    if (this._sequelizeModel) {
      return this._sequelizeModel.addHook(values, options)
    }
  }
}
