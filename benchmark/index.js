var b = require('b')
var low = require('../lib')
var song


b('insert').run(1000, function() {
  low('songs').insert({title: 'low!'})
})

song = low.db.songs[500]

b('get').run(1000, function() {
  low('songs').get(song.id)
})

b('update').run(1000, function() {
  low('songs').update(song.id, {title: '!wol'})
})

songs = low.db.songs

b('remove').run(1000, function() {
  low.db.songs = songs
  low('songs').remove(song.id)
})

console.log()