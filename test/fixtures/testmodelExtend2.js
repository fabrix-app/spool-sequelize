const TestExtend = require('./testmodelExtend')
const SequelizeResolver = require('../../dist/index').SequelizeResolver

const TestResolver = class TestResolver extends SequelizeResolver {

}

module.exports = TestExtend2 = class TestExtend2 extends TestExtend {
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
TestExtend2.prototype.instanceLevelMethod = TestExtend.prototype.instanceLevelMethod
TestExtend2.prototype.nextInstanceLevelMethod = function() {
  return 'baz'
}
