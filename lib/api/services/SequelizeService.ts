import { FabrixService as Service } from '@fabrix/fabrix/dist/common'
import { defaults, omitBy, isArray, isObject, isString, isNil } from 'lodash'
import merge from 'merge-options'

export class SequelizeService extends Service {
  /**
   *
   * @param options
   * @returns {*|{}}
   */
  mergeOptionDefaults(...options) {
    let wheres = {}
    let limits = null
    let offsets = null
    let includes = []
    let orders = []
    let newOptions

    for (const option of options) {
      if (!(option instanceof Object)) {
        throw new Error(`Option must be an object, type of option was ${ typeof option }`)
      }
      includes = this.mergeOptionIncludes(includes, option.include)
      orders = this.mergeOptionOrders(orders, option.order)
      wheres = this.mergeOptionWheres(wheres, option.where)
      limits = this.mergeOptionLimits(limits, option.limit)
      offsets = this.mergeOptionOffsets(offsets, option.offset)
    }

    newOptions = {
      include: includes,
      order: orders,
      where: wheres,
      limit: limits,
      offset: offsets
    }

    for (const option of options.reverse()) {
      newOptions = defaults({}, newOptions, option)
    }
    return omitBy(newOptions, isNil)
  }

  /**
   *
   * @param defaults
   * @param overrides
   * @returns {*|Array}
   */
  mergeOptionIncludes(originals = [], overrides = []) {
    const includes = originals

    if (!isArray(originals) || !isArray(overrides)) {
      throw new Error('include must be an array')
    }

    overrides.map(include => {
      let inIncludes = -1
      if (include.model) {
        inIncludes = includes.findIndex(i => ((i.model === include.model) && (i.as === include.as))
          || (((i.association && i.association.target) === (include.model)) && (i.association.as === include.as))
          || ((i.target === include.model) && (i.as === include.as))
        )
      }
      else if (include.association) {
        inIncludes = includes.findIndex(i => (i.association === include.association)
          || ((i.model === include.association.target) && (i.as === include.as))
          || ((i.target === include.association.target) && (i.as === include.as))
        )
      }
      else if (include.target) {
        inIncludes = includes.findIndex(i => ((i.target === include.target) && (i.as === include.as))
          || ((i.model === include.target)  && (i.as === include.as))
          || (((i.association && i.association.target) === include.target) && (i.association.as === include.as))
        )
      }

      if (inIncludes !== -1) {
        includes[inIncludes] = include
      }
      else {
        includes.push(include)
      }
    })
    return includes
  }

  /**
   *
   */
  mergeOptionOrders(originals = [], overrides = []) {

    if (isString(originals)) {
      originals = [originals.trim().split(' ')]
    }

    let order = originals

    if (isString(overrides)) {
      order.push(overrides.trim().split(' '))
    }
    else if (isArray(overrides)) {
      order = order.concat(overrides)
    }
    else if (isObject(overrides)) {
      order.push([overrides])
    }


    return order // = defaultsDeep(order, overrides)
  }

  /**
   *
   */
  mergeOptionWheres(originals = {}, overrides = {}) {
    const where = merge(originals, overrides)
    return where
  }

  /**
   *
   */
  mergeOptionOffsets(originals, overrides) {
    let offset = originals
    if (overrides) {
      offset = overrides
    }
    return offset
  }

  /**
   *
   */
  mergeOptionLimits(originals, overrides) {
    let limit = originals
    if (overrides) {
      limit = overrides
    }
    return limit
  }
}
