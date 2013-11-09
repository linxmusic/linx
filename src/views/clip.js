var Linx = require('../app.js');

module.exports = Linx.module('Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.ClipView = Marionette.ItemView.extend({
    'tagName': 'li',
    'template': require('templates')['clip'],
    'modelEvents': {
      'destroy': 'close',
    },

    'initialize': function () {
      var self = this;
      self.on('all', function (e) { console.log("clip event: ", e) });
      // rerender wave on each new render
      // TODO: optimize (or remove) this
      console.log(this);
      self.on('render', function () {
        // TODO: generalize arguments for retrieving source
        var source = App.Library.librarian.library.index.get(self.model.get('source'));
        console.log('src', self.$('.source')[0]);
        source.getSource({
          'container': self.$('.source')[0],
          'audioContext': App.audioContext,
        }, function (err, wave) {
          if (err) throw err;
          self['wave'] = wave;
        });
      });
    },

    'events': {
      'click .play-pause': 'onPlayPause',
      'click .stop': 'onStop',
    },

    'onPlayPause': function () {
      this.wave.playPause();
    },

    'onStop': function () {
      this.wave.stop();
    },

  });
});