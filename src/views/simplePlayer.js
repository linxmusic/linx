var Linx = require('../app.js');

module.exports = Linx.module('Players.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SimplePlayer = Views.Player.extend({
    'template': require('templates')['simplePlayer'],

    'events': {
      'click .playPause': 'playPause',
      'click .stop': 'stop',
    },

    'initialize': function () {
      // initialize track list view
      this.trackListView = new App.Players.Tracks.Views.SimpleTrackListView({
        'collection': this.model.trackList,
      });
      // render this
      this.show();
    },

    'playPause': function() {
      this.model.playPause();
    },

    'stop': function() {
      this.model.stop();
    },
  });
});