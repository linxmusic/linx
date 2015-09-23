import Ember from 'ember';
import DS from 'ember-data';

import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';
import ReadinessMixin from 'linx/mixins/readiness';

import withDefaultModel from 'linx/lib/computed/with-default-model';

export default DS.Model.extend(
  ReadinessMixin('isTrackReady'),
  DependentRelationshipMixin('audioMeta'), {

  title: DS.attr('string'),
  artist: DS.attr('string'),
  length: DS.attr('number'),

  md5: DS.attr('string'),
  s3Url: DS.attr('string'),

  _echonestTrack: DS.belongsTo('echonest-track', { async: true }),
  echonestTrack: withDefaultModel('_echonestTrack', function() {
    return this.fetchEchonestTrack();
  }),

  _audioMeta: DS.belongsTo('audio-meta', { async: true }),
  audioMeta: withDefaultModel('_audioMeta', function() {
    return this.fetchAudioMeta();
  }),

  // implement readiness
  isTrackReady: Ember.computed.reads('audioMeta.isReady'),

  // injected by app
  echonest: null,

  // TODO: abstract into audio-source?
  streamUrl: Ember.computed.reads('s3StreamUrl'),
  s3StreamUrl: function() {
    if (!Ember.isNone(this.get('s3Url'))) {
      // TODO: move to s3 service
      return "http://s3-us-west-2.amazonaws.com/linx-music/" + this.get('s3Url');
    }
  }.property('s3Url'),
  scStreamUrl: function() {
      var clientId = Config.clientId_Soundcloud;
      return soundcloud.stream_url + '?client_id=' + clientId;
    return null;
  }.property(),
  // /TODO

  // TODO: fill out with identify linx md5 tracks, dedupe, etc
  identify: function() {
  },

  // figure out which track this is in echonest
  fetchEchonestTrack() {
    return this.get('echonest').fetchTrack(this)
      .then((echonestTrack) => {
        return this.save().then(() => {
          return echonestTrack;
        });
      });
  },

  // analyze echonest track, then parse into new audio meta
  fetchAudioMeta() {
    return this.get('echonestTrack').then((echonestTrack) => {
        // console.log("got echonest track");
      return echonestTrack.get('analysis').then((analysis) => {
        // console.log("got analysis");
        return this.get('_audioMeta').then((audioMeta) => {
          // console.log("got audioMeta");
          if (!audioMeta) {
            audioMeta = this.get('store').createRecord('audio-meta', {
              track: this
            });
          }

          return audioMeta.processAnalysis(analysis).then(() => {
            // console.log("process analysis");
            return this.save().then(() => {
              // console.log("process save track");
              return audioMeta;
            });
          });
        });
      });
    });
  },
});
