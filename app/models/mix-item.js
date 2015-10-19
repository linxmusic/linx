import Ember from 'ember';
import DS from 'ember-data';

import OrderedHasManyItemMixin from 'linx/mixins/models/ordered-has-many-item';
import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';

export default DS.Model.extend(
  OrderedHasManyItemMixin('mix'),
  DependentRelationshipMixin('clip'), {

  mix: DS.belongsTo('mix', { async: true }),

  // TODO(POLYMORPHISM)
  clip: function() {
    if (this.get('trackClip.content')) {
      return this.get('trackClip');
    } else {
      return this.get('mixClip');
    }
  }.property('trackClip.content', 'mixClip.content'),

  hasClip: Ember.computed.bool('clip.content'),
  model: Ember.computed.reads('clip.model'),
  isTrack: Ember.computed.equal('modelName', 'track'),
  isMix: Ember.computed.equal('modelName', 'mix'),

  modelName: function() {
    let content = this.get('model.content');
    return content && content.constructor.modelName;
  }.property('model.content'),

  clipIsReady: Ember.computed.reads('clip.isReady'),
  transitionClipIsReady: Ember.computed.reads('transitionClip.isReady'),

  trackClip: DS.belongsTo('track-clip', { async: true }),
  transitionClip: DS.belongsTo('transition-clip', { async: true }),
  mixClip: DS.belongsTo('mix-clip', { async: true }),

  hasValidTransition: Ember.computed.reads('transitionClip.isValid'),

  setModel(model) {
    return this.destroyClip().then(() => {
      return this.createClipForModel(model);
    });
  },

  setTransition(transition) {
    return this.destroyClip('transitionClip').then(() => {
      return this.createClipForModel(transition);
    });
  },

  createClipForModel(model) {
    return this.get('mix.arrangement').then((arrangement) => {
      let modelName = model.constructor.modelName;
      let clipModelName = `${modelName}-clip`;
      let clipModelPath = Ember.String.camelize(clipModelName);

      let clip = this.get('store').createRecord(clipModelName, {
        mixItem: this,
        model,
        arrangement
      });

      // add clip to item
      this.set(clipModelPath, clip);

      // add clip to arrangement
      arrangement.get(`${clipModelPath}s`).addObject(clip);

      return this;
    });
  },

  destroyClip(clipPath = 'clip') {
    return this.get(clipPath).then((clip) => {
      return clip && clip.destroyRecord();
    });
  },

  destroyClips() {
    return this.destroyClip().then(() => {
      return this.destroyClip('transitionClip');
    });
  },

  destroyRecord(options = {}) {
    let { skipClips } = options;

    if (!skipClips) {
      return this.destroyClips().then(() => {
        options.skipClips = true;
        return this.destroyRecord(options);
      });
    } else {
      return this._super.apply(this, arguments);
    }
  },

  //
  // Transition generation
  //

  // generates and returns valid transition, if possible
  generateTransition(options) {
    return this.get('listReadyPromise').then(() => {
      let model = this.get('model.content');
      let nextItem = this.get('nextItem')
      let nextModel = nextItem && nextItem.get('model.content');

      Ember.assert('Cannot make transition without model and nextModel', model && nextModel);

      if (this.get('hasValidTransition')) {
        console.log("generateTransition: replacing a valid transition");
      }

      return this.generateTransitionFromClips(this.get('clip'), nextItem.get('clip'), options).then((transition) => {
        return this.createClip(transition).then(() => {
          return transition;
        })
      });
    });
  },

  // returns a new transition model between two given clips, with options
  generateTransitionFromClips(fromClip, toClip, options = {}) {
    Ember.assert('Must have fromClip and toClip to generateTransitionFromClips', Ember.isPresent(fromClip) && Ember.isPresent(toClip));

    return this.get('readyPromise').then(() => {
      let {
        lastTrack: fromTrack,
        clipEndBeat: minFromTrackEndBeat
      } = fromClip.getProperties('lastTrack', 'clipEndBeat');

      let {
        firstTrack: toTrack,
        clipStartBeat: maxToTrackStartBeat
      } = toClip.getProperties('firstTrack', 'clipStartBeat');

      return this.generateTransitionFromTracks(fromTrack, toTrack, _.defaults({}, options, {
        minFromTrackEndBeat,
        maxToTrackStartBeat
      }));
    });
  },

  // returns a new transition model between two given tracks, with options
  generateTransitionFromTracks(fromTrack, toTrack, options = {}) {
    Ember.assert('Must have fromTrack and toTrack to generateTransitionFromTracks', Ember.isPresent(fromTrack) && Ember.isPresent(toTrack));

    console.log("generateTransitionFromTracks", fromTrack, toTrack);

    return Ember.RSVP.all([
      this.get('readyPromise'),
      fromTrack.get('readyPromise'),
      toTrack.get('readyPromise'),
    ]).then(() => {

      let {
        preset,
        minFromTrackEndBeat,
        maxToTrackStartBeat,
        fromTrackEnd,
        toTrackStart,
      } = options;

      // TODO(TRANSITION): improve this algorithm, add options and presets
      let transition = this.get('store').createRecord('transition', {
        fromTrack,
        toTrack,
      });

      return Ember.RSVP.all([
        transition.setFromTrackEnd(fromTrack.get('audioMeta.lastBeatMarker.start')),
        transition.setToTrackStart(toTrack.get('audioMeta.firstBeatMarker.start')),
        transition.get('arrangement').then((arrangement) => {
          let automationClip = this.get('store').createRecord('automation-clip', {
            numBeats: 16,
          });
          arrangement.get('automationClips').addObject(automationClip);
          return arrangement.save().then(() => {
            return automationClip.save();
          });
        })
      ]).then(() => {
        return transition;
      });
    });
  },

});
