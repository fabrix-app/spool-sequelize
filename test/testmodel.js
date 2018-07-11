const Model = require('@fabrix/fabrix/dist/common').FabrixModel
const SequelizeResolver = require('../dist').SequelizeResolver

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
      name: {type: Sequelize.STRING, allowNull: false}
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
