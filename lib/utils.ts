import { mergeWith } from 'lodash'
export const Utils = {
  mergeConfigUtil: (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
      return [...objValue, ...srcValue]
    }
  },
  mergeConfig: (...values): {[key: string]: any} => {
    const config = {}
    values.forEach(val => {
      return mergeWith(config, val, Utils.mergeConfigUtil)
    })
    return config
  }
}
