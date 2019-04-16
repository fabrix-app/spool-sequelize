const Model = require('@fabrix/fabrix/dist/common').FabrixModel
const SequelizeResolver = require('../../dist/index').SequelizeResolver

const TestResolver = class TestResolver extends SequelizeResolver {

}

module.exports = TestExtend = class TestExtend extends Model {
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

TestExtend.prototype.instanceLevelMethod = function() {
  return 'bar'
}
TestExtend.prototype.superLevelMethod = function() {
  return 'baf'
}
