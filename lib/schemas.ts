'use strict'
const joi = require('joi')

export const Schemas = {
  storesConfig: joi.object(),
  modelsConfig: joi.object(),

  models: joi.object().keys({
    autoPK: joi.boolean(),
    autoCreatedAt: joi.boolean(),
    autoUpdatedAt: joi.boolean(),
    attributes: joi.object()
  })
}
