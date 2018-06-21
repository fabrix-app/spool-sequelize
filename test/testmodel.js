require('@fabrix/fabrix')

module.exports = Test = class Test extends Model {
  static config(app, Sequelize) {
    return {
      options: {}
    }
  }

  static schema(app, Sequelize) {
    return {
      name: {type: Sequelize.STRING, allowNull: false}
    }
  }

  classLevelMethod() {
    return 'foo'
  }
}

Test.prototype.instanceLevelMethod = function() {
  return 'bar'
}
