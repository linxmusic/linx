var Linx = require('../app.js');

module.exports = Linx.module('Tracks', function (Tracks, App, Backbone) {

  Tracks.Track = Backbone.Model.extend({

    // 
    // must be implemented by inheriters
    //
    'assertState': function () {
      throw new Error("Track.assertState not implemented");
    },

    'getClipState': function (clips) {
      throw new Error("Track.getClipState not implemented");
    },
    //
    // / must be implemented by inheriters
    //

    'defaults': function () {
      var order = App.Players.conductor.player.trackList.nextOrder();
      return {
        'type': 'track',
        'state': 'stop',
        'order': order,
        'clips': undefined, // a single id string or a map of ids
      };
    },

    'initialize': function () {
      // ask the player what state it wants this track in
      this.set('state',
        App.Players.conductor.player.getTrackState(this));
      this.on('all', function (name) {
        console.log("track event: "+name);
      });
      // reassert state on state change
      this.on('change:state', this.assertState);
    },

  });
});