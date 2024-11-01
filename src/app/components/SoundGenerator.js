import { Howl } from "howler";

// Base frequencies for the notes in your sequencer
const NOTE_FREQUENCIES = {
  C5: 523.25,
  "A#4": 466.16,
  "G#4": 415.3,
  "F#4": 369.99,
  E4: 329.63,
  D4: 293.66,
  C4: 261.63,
  "A#3": 233.08,
  "G#3": 207.65,
  "F#3": 185.0,
  E3: 164.81,
  D3: 146.83,
  C3: 130.81,
  "A#2": 116.54,
  "G#2": 103.83,
  "F#2": 92.5,
};

class SoundGenerator {
  constructor() {
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
  }

  // Create a simple synthesizer tone
  createSynthTone(frequency, duration = 2, type = "sine") {
    const sampleRate = this.audioContext.sampleRate;
    const frameCount = sampleRate * duration;
    const audioBuffer = this.audioContext.createBuffer(
      1,
      frameCount,
      sampleRate
    );
    const channelData = audioBuffer.getChannelData(0);

    // Generate the waveform
    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;

      // Basic wave
      let sample = 0;
      switch (type) {
        case "sine":
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case "square":
          sample = Math.sign(Math.sin(2 * Math.PI * frequency * t));
          break;
        case "sawtooth":
          sample = 2 * ((frequency * t) % 1) - 1;
          break;
        default:
          sample = Math.sin(2 * Math.PI * frequency * t);
      }

      // Apply envelope
      const attack = 0.1;
      const decay = 0.2;
      const sustain = 0.7;
      const release = 1.5;

      let envelope = 0;
      const timeInSeconds = t;

      if (timeInSeconds < attack) {
        envelope = timeInSeconds / attack;
      } else if (timeInSeconds < attack + decay) {
        envelope = 1 - ((1 - sustain) * (timeInSeconds - attack)) / decay;
      } else if (timeInSeconds < duration - release) {
        envelope = sustain;
      } else {
        envelope =
          sustain * (1 - (timeInSeconds - (duration - release)) / release);
      }

      channelData[i] = sample * envelope * 0.5; // 0.5 to prevent clipping
    }

    return audioBuffer;
  }

  // Convert AudioBuffer to WAV format
  bufferToWav(buffer) {
    const numberOfChannels = 1;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;

    const buffer32 = new Int32Array(44 + buffer.length * bytesPerSample);
    const view = new DataView(buffer32.buffer);

    // Write WAV header
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + buffer.length * bytesPerSample, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, "data");
    view.setUint32(40, buffer.length * bytesPerSample, true);

    // Write audio data
    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true
      );
      offset += 2;
    }

    return new Blob([buffer32.buffer], { type: "audio/wav" });
  }

  // Generate sound set
  async generateSoundSet(type = "sine") {
    const sounds = {};

    for (const [note, frequency] of Object.entries(NOTE_FREQUENCIES)) {
      const buffer = this.createSynthTone(frequency, 2, type);
      const blob = this.bufferToWav(buffer);
      const url = URL.createObjectURL(blob);
      sounds[note] = url;
    }

    return sounds;
  }
}

// Helper function to write strings to DataView
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export default SoundGenerator;
