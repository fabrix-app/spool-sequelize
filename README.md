# spool-sequelize

[![Gitter][gitter-image]][gitter-url]
[![NPM version][npm-image]][npm-url]
[![Build Status][ci-image]][ci-url]
[![Test Coverage][coverage-image]][coverage-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Follow @FabrixApp on Twitter][twitter-image]][twitter-url]

[![Waffle.io - Columns and their card count](https://badge.waffle.io/fabrix-app/spool-sequelize.svg?columns=all)](https://waffle.io/fabrix-app/spool-sequelize)

Loads Application Models (in `api/models`) into the Sequelize ORM; Integrates with [spool-router](https://github.com/fabrix-app/spool-router) to
generate Tapestries for routes.

## Install
```sh
$ npm install @fabrix/spool-sequelize --save
```

## Usage
Unlike other Fabrix ORMs, spool-sequelize does not need to use a resolver.  Instead, it will transfer your configured model into a sequelize one.

### Configure

```js
// config/main.js
module.exports = {
  // ...
  spools: [
    require('@fabrix/spool-sequelize').SequelizeSpool
  ]
}
```

A basic `config/store.js` can be found here : https://github.com/fabrix-app/spool-sequelize/blob/master/lib/archetype/config/database.js

### Models

```js
import { FabrixModel as Model } from '@fabrix/fabrix/dist/common'
import { SequelizeResolver } from '@fabrix/spool-sequelize'

export class User extends Model {
  // More about supported schema here : http://docs.sequelizejs.com/en/latest/docs/models-definition/
  static schema (app, Sequelize) {
    return {
       name: { type: Sequelize.STRING, allowNull: false },
       password: Sequelize.STRING,
       displayName: Sequelize.STRING
     }
  }

  static config (app, Sequelize) {
    return {
       migrate: 'drop', //override default models configurations if needed
       store: 'sqlite', //override default models configurations if needed
       // More informations about supported models options here : http://docs.sequelizejs.com/en/latest/docs/models-definition/#configuration
       options: {}
     }
  }
  
  // The Way this model interacts with Sequelize
  static get resolver () {
    return SequelizeResolver
  }
  
  // If you need associations, put them here
  associate(models) {
     // More information about associations here : http://docs.sequelizejs.com/en/latest/docs/associations/
     models.User.hasMany(models.Role, {
       as: 'roles',
       onDelete: 'CASCADE',
       foreignKey: {
         allowNull: true
       }
     })
  }
}
```

### Query

```js
// api/services/UserService.js
module.exports = class UserService extends Service {
  /**
   * Finds people with the given email.
   * @return Promise
   * @example {
   *    name: 'Ludwig Beethoven',
   *    email: 'someemail@email.com',
   *    favoriteColors: [
   *      { name: 'yellow', hex: 'ffff00' },
   *      { name: 'black', hex: '000000' }
   *     ]
   * }
   */
  findUser (email) {
    //More info about queries here : http://docs.sequelizejs.com/en/latest/docs/models-usage/
    return this.app.models.User.find({ where: {email: email} })
  }
}
```
For more informations about sequelize queries, please look at [the official documentation](http://docs.sequelizejs.com/en/latest/docs/querying/)

## Tapestries query options
Some options can be provide as query param for the `find` method, example `GET /api/v1/user`.

### Populate 
You can add `/api/v1/user?populate=all` to populate all associations or use `/api/v1/user?populate=field1,field2` to populate only some association.

### Pagination
By settings `offset` and `limit` you can do some pagination, example `/api/v1/user?offset=10&limit=10` will return only 10 items started from 10 (id 10 to 20). 

## Contributing
We love contributions! Please check out our [Contributor's Guide](https://github.com/fabrix-app/fabrix/blob/master/CONTRIBUTING.md) for more
information on how our projects are organized and how to get started.


## License
[MIT](https://github.com/fabrix-app/spool-sequelize/blob/master/LICENSE)

## Changelog
[Changelog](https://github.com/fabrix-app/spool-sequelize/blob/master/CHANGELOG.md)

[npm-image]: https://img.shields.io/npm/v/@fabrix/spool-sequelize.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@fabrix/spool-sequelize
[ci-image]: https://img.shields.io/circleci/project/github/fabrix-app/spool-sequelize/master.svg
[ci-url]: https://circleci.com/gh/fabrix-app/spool-sequelize/tree/master
[daviddm-image]: http://img.shields.io/david/fabrix-app/spool-sequelize.svg?style=flat-square
[daviddm-url]: https://david-dm.org/fabrix-app/spool-sequelize
[gitter-image]: http://img.shields.io/badge/+%20GITTER-JOIN%20CHAT%20%E2%86%92-1DCE73.svg?style=flat-square
[gitter-url]: https://gitter.im/fabrix-app/fabrix
[twitter-image]: https://img.shields.io/twitter/follow/FabrixApp.svg?style=social
[twitter-url]: https://twitter.com/FabrixApp
[coverage-image]: https://img.shields.io/codeclimate/coverage/github/fabrix-app/spool-sequelize.svg?style=flat-square
[coverage-url]: https://codeclimate.com/github/fabrix-app/spool-sequelize/coverage
