module.exports = function(Sequelize, config) {
  if (!Sequelize) {
    Sequelize = require('sequelize')
  }
  return Sequelize
}
