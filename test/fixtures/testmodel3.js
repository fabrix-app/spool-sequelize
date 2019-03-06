const SequelizeResolver = require('../../dist/index').SequelizeResolver
const Test = require('./testmodel')

const Utils = require('../../dist/utils').Utils

const TestResolver = class TestResolver extends SequelizeResolver {

}

module.exports = Test3 = class Test3 extends Test {
  static config(app, Sequelize) {
    return Utils.mergeConfig(Test.config(app, Sequelize), {
      options: {
        primaryKey: false
      }
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
