import Ember from 'ember';

import _ from 'npm:underscore';

import RequireAttributes from 'linx/lib/require-attributes';
import Clip from './clip';

import { beatToTime } from 'linx/models/audio-meta/beat-grid';
import cssStyle from 'linx/lib/computed/css-style';
import add from 'linx/lib/computed/add';
import multiply from 'linx/lib/computed/multiply';
import toPixels from 'linx/lib/computed/to-pixels';
import { variableTernary } from 'linx/lib/computed/ternary';
import { flatten } from 'linx/lib/utils';

export default Clip.extend({
  actions: {
    waveDidLoad: function() {
      this.get('clip').set('isAudioLoaded', true);
    },
  },

  // optional params
  disableMouseInteraction: true,

  classNames: ['TrackClip'],

  attributeBindings: ['componentStyle:style'],

  componentStyle: cssStyle({
    'left': 'audioOffsetStyle',
  }),

  // visually align the segment of audio represented by this clip
  audioOffset: multiply('audioStartBeat', 'pxPerBeat', -1.0),
  audioOffsetStyle: toPixels('audioOffset'),

  // params
  track: Ember.computed.reads('model'),
  audioStartBeat: Ember.computed.reads('clip.audioStartBeat'),
  audioEndBeat: Ember.computed.reads('clip.audioEndBeat'),

  audioMeta: Ember.computed.reads('track.audioMeta'),
  audioBeatGrid: Ember.computed.reads('audioMeta.beatGrid'),

  // TODO(MULTIGRID): make this depend on ex seekTime and audioBeatGrid.beatScale
  audioBpm: Ember.computed.reads('audioMeta.bpm'),

  tempo: Ember.computed('audioBpm', 'syncBpm', function() {
    let audioBpm = this.get('audioBpm');
    let syncBpm = this.get('syncBpm');
    if (Ember.isNone(syncBpm)) {
      return 1;
    } else {
      return syncBpm / audioBpm;
    }
  }),

  audioSeekBeat: variableTernary('isFinished', 'audioEndBeat', 'clipSeekBeat'),
  audioSeekTime: beatToTime('audioBeatGrid', 'audioSeekBeat'),

  markers: Ember.computed.reads('audioMeta.markers'),
  visibleMarkers: function() {
    let audioStartBeat = this.get('audioStartBeat');
    let audioEndBeat = this.get('audioEndBeat');

    return this.getWithDefault('markers', []).filter((marker) => {
      let markerStartBeat = marker.get('startBeat');
      return markerStartBeat >= audioStartBeat && markerStartBeat <= audioEndBeat;
    });
  }.property('audioStartBeat', 'audioEndBeat', 'markers.@each.startBeat'),
});
