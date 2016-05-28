import Ember from 'ember';
import DS from 'ember-data';

import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';
import ReadinessMixin from 'linx/mixins/readiness';

import withDefaultModel from 'linx/lib/computed/with-default-model';
import AudioBinary from './track/audio-binary';

export default DS.Model.extend(
  ReadinessMixin('isTrackReady'),
  DependentRelationshipMixin('audioMeta'), {

  title: DS.attr('string'),
  artist: DS.attr('string'),
  length: DS.attr('number'),

  md5: DS.attr('string'),
  s3StreamUrl: DS.attr('string'),
  scStreamUrl: DS.attr('string'),

  _echonestTrack: DS.belongsTo('echonest/track', { async: true }),
  echonestTrack: withDefaultModel('_echonestTrack', function() {
    return this.fetchEchonestTrack();
  }),

  soundcloudTrack: DS.belongsTo('soundcloud/track', { async: true }),

  createFromSoundcloudTrack(soundcloudTrack) {
    this.setProperties({
      soundcloudTrack,
      title: soundcloudTrack.get('title'),
      scStreamUrl: soundcloudTrack.get('streamUrl'),
    });
  },

  _audioMeta: DS.belongsTo('track/audio-meta', { async: true }),
  audioMeta: withDefaultModel('_audioMeta', function() {
    return this.fetchAudioMeta();
  }),

  audioBinary: Ember.computed(function() {
    return AudioBinary.create({
      track: this,
    });
  }),

  // implement readiness
  isTrackReady: Ember.computed.reads('audioMeta.isReady'),

  // injected by app
  echonest: null,
  session: Ember.inject.service(),

  // figure out which track this is in echonest
  fetchEchonestTrack() {
    const webStreamUrl = this.get('audioBinary.webStreamUrl');

    return this.get('echonest').fetchTrack(webStreamUrl)
      .then((echonestTrack) => {
        return this.save().then(() => {
          return echonestTrack;
        });
      });
  },

  // analyze echonest track, then parse into new audio meta
  fetchAudioMeta() {
    return this.get('_audioMeta').then((audioMeta) => {
      // Ember.Logger.log("got audioMeta");
      if (!audioMeta) {
        audioMeta = this.get('store').createRecord('track/audio-meta', {
          track: this
        });
      }

      return this.get('echonestTrack').then((echonestTrack) => {
        return !echonestTrack ? audioMeta : echonestTrack.get('analysis').then((analysis) => {
          return audioMeta.processAnalysis(analysis).then(() => {
            return this.save().then(() => {
              return audioMeta;
            });
          });
        });
      });
    });
  },
});
