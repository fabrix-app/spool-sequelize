'use strict'
const joi = require('joi')

export const Schemas = {
  storesConfig: joi.object().keys({

  }).unknown(),
  modelsConfig: joi.object().keys({

  }).unknown(),
  pluginsConfig: joi.object().keys({

  }).unknown(),

  models: joi.object().keys({
    autoPK: joi.boolean(),
    autoCreatedAt: joi.boolean(),
    autoUpdatedAt: joi.boolean(),
    attributes: joi.object()
  })
}
