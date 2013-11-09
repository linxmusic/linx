var Linx = require('../app.js');

module.exports = Linx.module('Players.Tracks.Clips', function (Clips, App, Backbone) {

  Clips.ClipList = Backbone.Collection.extend({

    'model': Clips.Clip,

    // include documents in Map Reduce response.
    'pouch': {
      'listen': true,
      'fetch': 'query',
      'options': {
        'query': {
          'include_docs': true,
          'fun': {
            'map': function (doc) {
              console.log(doc)
              emit(doc, null);
            },
          },
        },
        'changes': {
          'include_docs': true,
          'filter': function(doc) {
            return doc._deleted || doc.type === 'clip';
          }
        },
      },
    },

    // parse view result, use doc property injected via `include_docs`
    'parse': function (result) {
      return _.pluck(result.rows, 'doc');
    },

  });
});