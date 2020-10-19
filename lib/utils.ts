import { mergeWith } from 'lodash'
export const Utils = {
  /**
   * Merges Static Model schema definitions
   * @param objValue
   * @param srcValue
   */
  mergeConfigUtil: (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
      return [...objValue, ...srcValue]
    }
  },
  /**
   *
   * @param values
   */
  mergeConfig: (...values): {[key: string]: any} => {
    const config = {}
    values.forEach(val => {
      return mergeWith(config, val, Utils.mergeConfigUtil)
    })
    return config
  }
}
