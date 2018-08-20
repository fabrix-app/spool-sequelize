/**
 * Spool Configuration
 *
 * This manifest declares the application resources which are provided and/or
 * modified by this spool.
 * @see {@link https://fabrix.app/docs/spool/config
 */
export const spool = {
  provides: {
    resources: [
      'services'
    ],
    api: {
      services: [
        'SchemaMigrationService',
        'TapestryService'
      ]
    },
    config: [
      'models',
      'sequelize',
      'stores'
    ]
  },
  /**
   * Configure the lifecycle of this pack; that is, how it boots up, and which
   * order it loads relative to other spools.
   */
  lifecycle: {
    configure: {
      /**
       * List of events that must be fired before the configure lifecycle
       * method is invoked on this Spool
       */
      listen: [ ],

      /**
       * List of events emitted by the configure lifecycle method
       */
      emit: [ ]
    },
    initialize: {
      listen: [ ],
      emit: [ ]
    }
  }
}

