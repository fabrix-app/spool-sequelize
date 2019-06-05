module.exports = function(Sequelize) {
  if (!Sequelize) {
    Sequelize = require('sequelize')
  }

  if (Sequelize.prototype.helloWorld) {
    throw new Error('PLUGIN WAS DOUBLED LOADED')
  }
  Sequelize.prototype.helloWorld = function() {
    return 'hello world'
  }

  // return Sequelize
  return Sequelize
}
