const assert = require('assert')
const app = require('../../fixtures/app')
const lib = require('../../../dist/index')

describe('lib.Utils', () => {
  describe('#mergeConfig', () => {
    it('should merge objects', () => {
      const items = lib.Utils.mergeConfig({test1: 1}, {test2: 2}, {test3: 3})
      assert.deepStrictEqual(items, {
        test1:  1,
        test2: 2,
        test3: 3
      })
    })
    it('should merge objects with arrays', () => {
      const items = lib.Utils.mergeConfig({test1: 1, arr: [1] }, {test2: 2, arr: [2]}, {test3: 3, arr: [3]})
      assert.deepStrictEqual(items, {
        test1:  1,
        test2: 2,
        test3: 3,
        arr: [1, 2, 3]
      })
    })
  })
})
