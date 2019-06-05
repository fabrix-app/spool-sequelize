module.exports = function(Sequelize, config) {
  if (!Sequelize) {
    Sequelize = require('sequelize')
  }

  if (Sequelize.prototype.helloEarth) {
    throw new Error('PLUGIN WAS DOUBLED LOADED')
  }
  Sequelize.prototype.helloEarth = function() {
    return 'hello earth'
  }

  return Sequelize
}
