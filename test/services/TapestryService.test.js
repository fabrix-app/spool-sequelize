'use strict'

const assert = require('assert')

describe('api.services.TapestryService', () => {
  let TapestryService
  before(() => {
    TapestryService = global.app.services.TapestryService
  })
  describe('#sanity', () => {
    it('should exists', () => {
      assert(TapestryService)
    })
  })
  describe('#create', () => {
    it('should insert a record', () => {
      return TapestryService.create('Role', {name: 'createtest'})
        .then(role => {
          assert.equal(role.name, 'createtest')
        })
    })
    it('should insert a record with child', () => {
      return TapestryService.create('User', {name: 'userTest', roles: [{name: 'roleTest'}]}, {populate: 'roles'})
        .then(user => {
          assert.equal(user.name, 'userTest')
          assert.equal(user.roles.length, 1)
          assert.equal(user.roles[0].name, 'roleTest')
        })
    })
    it('should return a not found error', () => {
      return TapestryService.create('UnknownModel', {name: 'userTest'})
        .catch(err => {
          assert.equal(err.code, 'E_NOT_FOUND')
          assert.equal(err.message, 'UnknownModel can\'t be found')
          assert.equal(err.name, 'Model error')
        })
    })
    it('should return a validation error', () => {
      return TapestryService.create('User', {roles: [{name: 'roleTest'}]}, {populate: 'roles'})
        .catch(err => {
          assert.equal(err.code, 'E_VALIDATION')
          assert.equal(err.message, 'notNull Violation: User.name cannot be null')
          assert.equal(err.errors[0].path, 'name')
          assert.equal(err.errors[0].message, 'User.name cannot be null')
          assert.equal(err.errors[0].type, 'notNull Violation')
          assert.equal(err.name, 'Model error')
        })
    })
  })
  describe('#find', () => {
    it('should find a single record', () => {
      return TapestryService.create('Role', {name: 'findtest'})
        .then(role => {
          assert.equal(role.name, 'findtest')
          assert(role.id)
          return TapestryService.find('Role', role.id)
        })
        .then(role => {
          assert(!role.length)
          assert.equal(role.dataValues.name, 'findtest')
        })
    })
    it('should find a set of records', () => {
      return TapestryService.create('Role', {name: 'findtest'})
        .then(role => {
          assert.equal(role.name, 'findtest')
          assert(role.id)
          return TapestryService.find('Role', {name: 'findtest'})
        })
        .then(roles => {
          assert(roles[0])
          //assert.equal(roles.length, 1)
          assert.equal(roles[0].name, 'findtest')
        })
    })

    it('should return a not found error', () => {
      return TapestryService.find('UnknowModel', {name: 'findtest'})
        .catch(err => {
          assert.equal(err.code, 'E_NOT_FOUND')
          assert.equal(err.message, 'UnknowModel can\'t be found')
          assert.equal(err.name, 'Model error')
        })
    })
  })
  describe('#update', () => {
    it('should update a set of records', () => {
      return TapestryService.create('Role', {name: 'updatetest'})
        .then(role => {
          assert.equal(role.name, 'updatetest')
          assert(role.id)
          return TapestryService.update(
            'Role',
            {name: 'updatetest'},
            {name: 'updated'}
          )
        })
        .then(results => {
          assert(results[0])
          assert.equal(results[0], 1)
        })
    })
    it('should return a not found error', () => {
      return TapestryService.update(
        'UnknowModel',
        {name: 'updatetest'},
        {name: 'updated'}
        )
        .catch(err => {
          assert.equal(err.code, 'E_NOT_FOUND')
          assert.equal(err.message, 'UnknowModel can\'t be found')
          assert.equal(err.name, 'Model error')
        })
    })
  })
  describe('#destroy', () => {
    it('should delete a set of records', () => {
      return TapestryService.create('Role', {name: 'destroytest'})
        .then(role => {
          assert.equal(role.name, 'destroytest')
          assert(role.id)
          return TapestryService.destroy('Role', {name: 'destroytest'})
        })
        .then(nbRowDeleted => {
          assert.equal(nbRowDeleted, 1)
          return TapestryService.find('Role', {name: 'destroytest'})
        })
        .then(roles => {
          assert.equal(roles.length, 0)
        })
    })

    it('should return a not found error', () => {
      return TapestryService.destroy('UnknowModel', {name: 'destroy'})
        .catch(err => {
          assert.equal(err.code, 'E_NOT_FOUND')
          assert.equal(err.message, 'UnknowModel can\'t be found')
          assert.equal(err.name, 'Model error')
        })
    })
  })
  describe('#createAssociation', () => {
    it('should work for hasOne', () => {
      let projectId
      return TapestryService.create('Project', {name: 'createassociationhasonetest'})
        .then(project => {
          assert(project)
          assert(project.id)
          projectId = project.id
          return TapestryService.createAssociation('Project', project.id, 'Page', {
            name: 'createassociatedpage'
          })
        })
        .then(page => {
          assert(page)
          assert(page.id)
          assert.equal(page.dataValues.ProjectId, projectId)
        })
    })

    it('should work for hasMany', () => {
      let userId
      return TapestryService.create('User', {name: 'createassociationhasmanytest'})
        .then(user => {
          assert(user)
          assert(user.id)
          userId = user.id
          return TapestryService.createAssociation('User', user.id, 'roles', {
            name: 'createassociatedrole'
          })
        })
        .then(role => {
          assert(role)
          assert(role.id)
          assert.equal(role.dataValues.UserId, userId)
        })
    })

    it('should work for belongsTo', () => {
      return TapestryService.create('Page', {name: 'createassociationbelongstotest'})
        .then(page => {
          assert(page)
          assert(page.id)
          return TapestryService.createAssociation('Page', page.id, 'Owner', {
            name: 'createassociateduser'
          })
          .then(user => {
            return TapestryService.find('Page', page.id)
              .then(page => assert.equal(page.dataValues.OwnerId, user.id))
          })
        })
    })

    it('should work for belongsToMany', () => {
      let projectId, userId
      return TapestryService.create('Project', {name: 'createassociationbelongstomanytest'})
        .then(project => {
          assert(project)
          assert(project.id)
          projectId = project.id
          return TapestryService.createAssociation('Project', project.id, 'Users', {
            name: 'createassociateduser'
          })
        })
        .then(user => {
          assert(user)
          assert(user.id)
          userId = user.id
          return TapestryService.find('UserProject', {
            UserId: userId,
            ProjectId: projectId
          })
        })
        .then(userProjects => {
          assert.equal(userProjects.length, 1)
          const userProject = userProjects[0]
          assert(userProject)
          assert.equal(userProject.UserId, userId)
          assert.equal(userProject.ProjectId, projectId)
        })
    })
  })
  describe('#findAssociation', () => {
    it('should work for hasOne', () => {
      let projectId
      return TapestryService.create('Project', {name: 'createassociationhasonetest'})
        .then(project => {
          assert(project)
          assert(project.id)
          projectId = project.id
          return TapestryService.createAssociation('Project', project.id, 'Page', {
            name: 'createassociatedpage'
          })
        })
        .then(page => {
          assert(page)
          assert(page.id)
          assert.equal(page.dataValues.ProjectId, projectId)
          return TapestryService.findAssociation('Project', projectId, 'Page')
        })
        .then(pages => {
          const page = pages[0]
          assert(page)
          assert(page.id)
          assert.equal(page.dataValues.ProjectId, projectId)
        })
    })

    it('should work for hasMany', () => {
      let userId
      return TapestryService.create('User', {name: 'findassociationtest'})
        .then(user => {
          assert(user)
          assert(user.id)
          userId = user.id
          return TapestryService.createAssociation('User', user.id, 'roles', {
            name: 'findassociatedrole'
          })
        })
        .then(role => {
          assert(role)
          assert(role.id)
          return TapestryService.findAssociation('User', userId, 'roles')
        })
        .then(roles => {
          const role = roles[0]
          assert(role)
          assert(role.id)
          assert.equal(role.dataValues.UserId, userId)
        })
    })

    it('should work for belongsTo', () => {
      let pageId
      return TapestryService.create('Page', {name: 'findassociationbelongstotest'})
        .then(page => {
          assert(page)
          assert(page.id)
          pageId = page.id
          return TapestryService.createAssociation('Page', page.id, 'Owner', {
            name: 'findassociatedowner'
          })
        })
        .then(owner => {
          assert(owner)
          assert(owner.id)
          return TapestryService.findAssociation('Page', pageId, 'Owner')
            .then(user => assert.equal(user.id, owner.id))
        })
    })

    it('should work for belongsToMany', () => {
      let projectId, userId
      return TapestryService.create('Project', {name: 'findassociationbelongstotest'})
        .then(project => {
          assert(project.id)
          projectId = project.id
          return TapestryService.create('User', {name: 'findassociateduser'})
        })
        .then(user => {
          assert(user.id)
          userId = user.id
          return TapestryService.create('UserProject', {UserId: user.id, ProjectId: projectId})
        })
        .then(userproject => {
          return TapestryService.findAssociation('Project', projectId, 'Users')
            .then(users => assert.equal(users[0].id, userId))
        })
    })

    it('should join criteria with an and clause for belongsToMany', () => {
      let projectId
      return TapestryService.create('Project', {name: 'findassociationbelongstotest'})
        .then(project => {
          assert(project.id)
          projectId = project.id
          return TapestryService.create('User', {name: 'findunassociateduser'})
        })
        .then(user=> {
          return TapestryService.findAssociation('Project', projectId, 'Users', {
            id: user.id
          })
            .then(users => assert(!users.length))
        })
    })

  })
  describe('#updateAssociation', () => {
    it('should work for hasOne', () => {
      let projectId
      return TapestryService.create('Project', {name: 'updateassociationhasonetest'})
        .then(project => {
          assert(project)
          assert(project.id)
          projectId = project.id
          return TapestryService.createAssociation('Project', projectId, 'Page', {
            name: 'findassociatedpage'
          })
        })
        .then(page => {
          assert(page)
          assert(page.id)
          return TapestryService.updateAssociation('Project', projectId, 'Page', {}, {name: 'updateassociatedpage'})
        })
        .then(() => {
          return TapestryService.findAssociation('Project', projectId, 'Page')
        }).then(roles => {
          const role = roles[0]
          assert.equal(role.dataValues.name, 'updateassociatedpage')
        })
    })

    it('should work for hasMany', () => {
      let userId
      return TapestryService.create('User', {name: 'updateassociationhasmanytest'})
        .then(user => {
          assert(user)
          assert(user.id)
          userId = user.id
          return TapestryService.createAssociation('User', user.id, 'roles', {
            name: 'findassociatedrole'
          })
        })
        .then(role => {
          assert(role)
          assert(role.id)
          return TapestryService.updateAssociation('User', userId, 'roles', {}, {name: 'updateassociatedrole'})
        })
        .then(() => {
          return TapestryService.findAssociation('User', userId, 'roles')
        }).then(roles => {
          const role = roles[0]
          assert.equal(role.dataValues.name, 'updateassociatedrole')
        })
    })

    it('should work for belongsTo', () => {
      let pageId
      return TapestryService.create('Page', {name: 'updateassociationbelongstotest'})
        .then(page => {
          assert(page.id)
          pageId = page.id
          return TapestryService.createAssociation('Page', page.id, 'Owner', {
            name: 'updateassociatedowner'
          })
        })
        .then(user => {
          assert(user.id)
          return TapestryService.updateAssociation('Page', pageId, 'Owner', {}, {name: 'updatedassociatedowner'})
        })
        .then(() => {
          return TapestryService.findAssociation('Page', pageId, 'Owner')
        })
        .then(user => assert.equal(user.dataValues.name, 'updatedassociatedowner'))
    })

    it('should work for belongsToMany', () => {
      let projectId
      return TapestryService.create('Project', {name: 'updatebelongstomanytest'})
        .then(project => {
          assert(project.id)
          projectId = project.id
          return TapestryService.create('User', {name: 'originalassociateduser'})
        })
        .then(user => {
          assert(user.id)
          return TapestryService.create('UserProject', {UserId: user.id, ProjectId: projectId})
        })
        .then(userproject => {
          return TapestryService.updateAssociation('Project', projectId, 'Users', {}, {name: 'updatedassociateduser'})
        })
        .then(updated => {
          return TapestryService.findAssociation('Project', projectId, 'Users')
        })
        .then(users => {
          assert.equal(users.length, 1)
          assert.equal(users[0].dataValues.name, 'updatedassociateduser')
        })
    })
  })
  describe('#destroyAssociation', () => {
    it('should delete an associated record', () => {
      let userId
      return TapestryService.create('User', {name: 'destroyassociationtest'})
        .then(user => {
          assert(user)
          assert(user.id)
          userId = user.id
          return TapestryService.createAssociation('User', user.id, 'roles', {
            name: 'findassociatedrole'
          })
        })
        .then(role => {
          assert(role)
          assert(role.id)
          return TapestryService.destroyAssociation('User', userId, 'roles', role.id)
        })
        .then(roles => {
          assert(roles)
          return TapestryService.find('User', userId, {populate: 'roles'})
        })
        .then(user => {
          assert.equal(user.roles.length, 0)
        })
    })
  })
  it('should work case insensitive', () => {
    it('should insert a record', () => {
      return TapestryService.create('role', {name: 'insensitive'})
        .then(role => {
          assert.equal(role.name, 'insensitive')
        })
    })
  })
})
