const Model = require('@fabrix/fabrix/dist/common').FabrixModel
const SequelizeResolver = require('../../dist/index').SequelizeResolver

const TestResolver = class TestResolver extends SequelizeResolver {

}

module.exports = Test = class Test extends Model {
  static config(app, Sequelize) {
    return {
      options: {}
    }
  }

  static schema(app, Sequelize) {
    return {
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      virtual: {
        type: Sequelize.VIRTUAL,
        allowNull: true
      }
    }
  }

  static get resolver () {
    return TestResolver
  }

  classLevelMethod() {
    return 'foo'
  }
}

Test.prototype.instanceLevelMethod = function() {
  return 'bar'
}
