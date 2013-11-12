var Linx = require('../../');

module.exports = Linx.module('Samples.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SampleListView = Backbone.Marionette.CompositeView.extend({
    'template': require('templates')['library/samples/SampleList'],
    'itemView': Views.SampleView,
    'itemViewContainer': '.list',

    'initialize': function () {
      if (debug) {
        console.log("initing sampleList view", this);
        this.on('all', function (e) { console.log("sampleList view event: ", e); });
      }
    },

    // 
    // sample drop
    // 
    'events': {
      'drop .drop': 'onDrop',
      'dragenter': 'onDragenter',
      'dragleave': 'onDragleave',
      'dragover': 'onDragover',
    },
    'onDrop': function (e) {
      e.stopPropagation();
      e.preventDefault();
      var dataTransfer = e.originalEvent.dataTransfer;
      // create sample from given file
      var file = (dataTransfer && dataTransfer.files) && dataTransfer.files[0];
      this.collection.create({
        'file': file,
      });
    },
    'onDragover': function (e) {
      e.stopPropagation();
      e.preventDefault();
    },
    'onDragleave': function (e) {
      e.stopPropagation();
      e.preventDefault();
    },
    // 
    // /sample drop
    // 

  });
});