module.exports = function(Sequelize, config) {
  if (!Sequelize) {
    Sequelize = require('sequelize')
  }

  if (Sequelize.prototype.helloEarth) {
    console.log('testPlugin2 Broke!', Sequelize.prototype.helloEarth)
    throw new Error('TEST PLUGIN 2 WAS DOUBLED LOADED')
  }
  Sequelize.prototype.helloEarth = function() {
    return 'hello earth'
  }

  return Sequelize
}
