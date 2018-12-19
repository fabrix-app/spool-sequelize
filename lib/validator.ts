import * as joi from 'joi'
import { Schemas } from './schemas'

export const Validator = {
  validateStoresConfig (config) {
    return new Promise((resolve, reject) => {
      joi.validate(config, Schemas.storesConfig, (err, value) => {
        if (err) {
          return reject(err)
        }
        return resolve(value)
      })
    })
  },
  validateModelsConfig (config) {
    return new Promise((resolve, reject) => {
      joi.validate(config, Schemas.modelsConfig, (err, value) => {
        if (err) {
          return reject(err)
        }
        return resolve(value)
      })
    })
  }
}
