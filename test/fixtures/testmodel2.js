const SequelizeResolver = require('../../dist/index').SequelizeResolver
const Test = require('./testmodel')

const Utils = require('../../dist/utils').Utils

const TestResolver = class TestResolver extends SequelizeResolver {

}

module.exports = Test2 = class Test2 extends Test {
  static config(app, Sequelize) {
    return Utils.mergeConfig(Test.config(app, Sequelize), {
      options: {}
    })
  }

  static schema(app, Sequelize) {
    return Utils.mergeConfig(Test.schema(app, Sequelize), {
      name2: {type: Sequelize.STRING, allowNull: false}
    })
  }

  static get resolver () {
    return TestResolver
  }

  classLevelMethod() {
    return 'foo'
  }
}

Test2.prototype.instanceLevelMethod = function() {
  return 'bar'
}
