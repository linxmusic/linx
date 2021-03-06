import Ember from 'ember';

import BufferSourceNode from './buffer-source-node';
import RequireAttributes from 'linx/lib/require-attributes';

// TODO(REFACTOR): create base track FX chain + audio source node + soundtouch node
export default BufferSourceNode.extend({

  // params
  track: null,

  // implement audio-source-node
  audioBinary: Ember.computed.reads('track.audioBinary'),
  audioBuffer: Ember.computed.reads('audioBinary.audioBuffer'),

  toString() {
    return '<linx@object-proxy:web-audio/track-source-node>';
  },
});


/* global SimpleFilter:true */

// import SoundTouch from 'linx/lib/soundtouch';
// import { WebAudioBufferSource, getWebAudioNode } from 'linx/lib/soundtouch';

  // TODO(REFACTOR) move into fx chain
  // updateTempo: function() {
  //   var wavesurfer = this.get('wavesurfer');
  //   var tempo = this.get('tempo');
  //   if (wavesurfer) {
  //     wavesurfer.setTempo(tempo);
  //   }
  // }.observes('wavesurfer', 'tempo'),

  // updatePitch: function() {
  //   var wavesurfer = this.get('wavesurfer');
  //   var pitch = this.get('pitch');
  //   if (wavesurfer) {
  //     wavesurfer.setPitch(pitch);
  //   }
  // }.observes('wavesurfer', 'pitch'),

  // updateVolume: function() {
  //   var wavesurfer = this.get('wavesurfer');
  //   var volume = this.get('volume');
  //   if (wavesurfer) {

  //     // TODO(EASY): remove this check, only for two-way binding to input
  //     try {
  //       volume = parseFloat(volume);
  //     } catch(e) {}

  //     if (typeof volume !== 'number' || !volume) {
  //       volume = 0;
  //     }

  //     wavesurfer.setVolume(volume);
  //   }
  // }.observes('wavesurfer', 'volume'),


// TODO(REFACTOR): figure this out
//
// Wavesurfer + SoundTouch Integration
//

// Wavesurfer.setTempo = function(tempo) {
//   this.backend.setTempo(tempo);
// };

// Wavesurfer.setPitch = function(pitch) {
//   this.backend.setPitch(pitch);
// };

// Wavesurfer.WebAudio.setTempo = function(tempo) {
//   // Ember.Logger.log("setting tempo", tempo);
//   if (typeof tempo !== 'number' || !tempo) {
//     tempo = 1;
//   }

//   // update startPosition and lastPlay for new tempo
//   this.startPosition += this.getPlayedTime();
//   this.lastPlay = this.ac.currentTime;

//   this.linxTempo = this.playbackRate = tempo;

//   // update soundtouch tempo
//   var soundtouch = this.soundtouch;
//   if (soundtouch) {
//     soundtouch.tempo = tempo;
//   }
// };

// Wavesurfer.WebAudio.setPitch = function(pitch) {
//   // Ember.Logger.log("setting pitch", pitch);

//   // TODO: remove this check, only for two-way binding to input
//   try {
//     pitch = parseFloat(pitch);
//   } catch(e) {

//   }
//   if (typeof pitch !== 'number') {
//     pitch = 0;
//   }

//   this.linxPitch = pitch;

//   // update soundtouch pitch
//   var soundtouch = this.soundtouch;
//   if (soundtouch) {
//     soundtouch.pitchSemitones = pitch;
//   }
// };

// // 'play' is equivalent to 'create and connect soundtouch source'
// Wavesurfer.WebAudio.play = function(start, end) {
//   if (!this.isPaused()) {
//     this.pause();
//   }

//   var adjustedTime = this.seekTo(start, end);
//   start = adjustedTime.start;
//   end = adjustedTime.end;
//   this.scheduledPause = end;
//   var startSample = ~~(start * this.ac.sampleRate);

//   // init soundtouch
//   this.soundtouch = new SoundTouch();
//   this.setPitch(this.linxPitch);
//   this.setTempo(this.linxTempo);

//   // hook up soundtouch node
//   this.soundtouchSource = new WebAudioBufferSource(this.buffer);
//   this.soundtouchFilter = new SimpleFilter(this.soundtouchSource, this.soundtouch);
//   this.soundtouchFilter.sourcePosition = startSample;
//   this.soundtouchNode = getWebAudioNode(this.ac, this.soundtouchFilter);
//   this.soundtouchNode.connect(this.analyser);

//   this.setState(this.PLAYING_STATE);
//   this.fireEvent('play');
// };

// // 'pause' is equivalent to 'disconnect soundtouch source'
// Wavesurfer.WebAudio.pause = function() {
//   this.scheduledPause = null;
//   this.startPosition += this.getPlayedTime();

//   this.soundtouchNode && this.soundtouchNode.disconnect();

//   this.setState(this.PAUSED_STATE);
// };

// // turn into no-op
// Wavesurfer.WebAudio.createSource = function() {};

// export default Wavesurfer;
