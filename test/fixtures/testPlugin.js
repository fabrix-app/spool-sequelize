module.exports = function(Sequelize) {
  if (!Sequelize) {
    Sequelize = require('sequelize')
  }

  if (Sequelize.prototype.helloWorld) {
    console.log('testPlugin Broke!', Sequelize.prototype.helloWorld)
    throw new Error('TEST PLUGIN 1 WAS DOUBLED LOADED')
  }
  Sequelize.prototype.helloWorld = function() {
    return 'hello world'
  }

  // return Sequelize
  return Sequelize
}
