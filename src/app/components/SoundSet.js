const SOUND_SETS = {
  classic: {
    name: "Classic",
    urls: (i) => [
      `https://s3-us-west-2.amazonaws.com/s.cdpn.io/380275/${i}.mp3`,
      `https://s3-us-west-2.amazonaws.com/s.cdpn.io/380275/${i}.ogg`,
    ],
  },
  sine: {
    name: "Sine Wave",
    urls: async (i) => {
      const generator = new SoundGenerator();
      const sounds = await generator.generateSoundSet("sine");
      return [sounds[NOTES[i]]];
    },
  },
  square: {
    name: "Square Wave",
    urls: async (i) => {
      const generator = new SoundGenerator();
      const sounds = await generator.generateSoundSet("square");
      return [sounds[NOTES[i]]];
    },
  },
  sawtooth: {
    name: "Sawtooth",
    urls: async (i) => {
      const generator = new SoundGenerator();
      const sounds = await generator.generateSoundSet("sawtooth");
      return [sounds[NOTES[i]]];
    },
  },
};
