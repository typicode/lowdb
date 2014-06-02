EventEmitter = require('events').EventEmitter
util         = require 'util'
_            = require 'lodash'
underdb      = require 'underscore.db'
underdb.mixWith _

#
# Event emitter
#

ee = new EventEmitter()

#
# Lo-Dash
#

_.mixin
  get: _.wrap _.get, (get, coll, id) ->
    obj   = coll._index?[id]
    obj or= get coll, id
    obj

  insert: _.wrap _.insert, (insert, coll, doc) ->
    insert coll, doc
    ee.emit 'add', low._currentCollName, doc
    doc

  update: _.wrap _.update, (update, coll, id, attrs) ->
    previousDoc = _.get coll, id
    previousDoc = _.clone previousDoc if previousDoc 

    doc = update coll, id, attrs
    ee.emit 'update', low._currentCollName, doc, previousDoc if doc
    doc

  updateWhere: _.wrap _.updateWhere, (updateWhere, coll, whereAttrs, attrs) ->
    previousDocs = _.where coll, whereAttrs
    previousDocs = _.clone previousDocs

    docs = updateWhere coll, whereAttrs, attrs
    ee.emit 'update', low._currentCollName, docs, previousDocs if docs.length > 0
    docs

  remove: _.wrap _.remove, (remove, coll, id) ->
    doc = remove(coll, id)
    ee.emit 'remove', low._currentCollName, doc if doc
    doc

  removeWhere: _.wrap _.removeWhere, (removeWhere, coll, whereAttrs) ->
    docs = removeWhere(coll, whereAttrs)
    ee.emit 'remove', low._currentCollName, docs if docs.length > 0
    docs

#
# Low
#

low = (str, arg1, arg2) ->
  low._currentCollName = str
  low.db[str] or= []
  chain = _ low.db[str]
  
  if arg2

    if arg2 is 1 # insert
      return chain.insert(arg1).value()
    
    if arg2 is -1 # remove or removeWhere
      if _.isString arg1 #remove
        return chain.remove(arg1).value()

      if _.isObject arg1 #removeWhere
        return chain.removeWhere(arg1).value()
    
    if _.isObject arg2 # updateWhere
      return chain.updateWhere(arg1, arg2).value()

  if arg1

    if _.isString arg1 # get
      return chain.get(arg1).value()

    if _.isObject arg1 # where
      return chain.where(arg1).value()

  chain

low.db = {}

low.path = 'db.json'

low.autoSave = true

low.save = (path = low.path) ->
  underdb.save low.db, path

low.throttledSave = _.throttle low.save, 100

low.load = (path = low.path) ->
  low.db = underdb.load path

low.on = (event, listener) ->
  ee.on event, listener

#
# Expose _
#

low._ = _

#
# Listen to events
#

low.on 'add'   , -> ee.emit 'change'
low.on 'update', -> ee.emit 'change'
low.on 'remove', -> ee.emit 'change'
low.on 'change', -> low.throttledSave() if low.autoSave

#
# Indexing
#

low.on 'add', (name, obj) ->
  coll = low(name).value()
  coll._index or= {}
  coll._index[obj.id] = obj

low.on 'remove', (name, obj) ->
  coll = low(name).value()
  delete coll._index[obj.id] if coll._index

# For testing purpose
low.ee = ee

#
# Export
#

module.exports = low