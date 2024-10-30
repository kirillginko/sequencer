export const createConvolver = async (audioContext) => {
  // Create a longer, more pronounced reverb impulse response
  const duration = 7.0; // Longer duration for more noticeable tail
  const decay = 3.0; // Slower decay for more sustain
  const sampleRate = audioContext.sampleRate;
  const length = duration * sampleRate;
  const impulse = audioContext.createBuffer(2, length, sampleRate);
  const leftChannel = impulse.getChannelData(0);
  const rightChannel = impulse.getChannelData(1);

  // Create a more complex impulse response
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    // Multiple decay curves for richer sound
    const earlyDecay = Math.exp(-t / 0.8); // Early reflections
    const lateDecay = Math.exp(-t / decay); // Late reverb tail
    const amplitude = earlyDecay * 0.4 + lateDecay * 0.6;

    // Add some random reflections
    const noise = Math.random() * 2 - 1;

    // Left channel
    leftChannel[i] = noise * amplitude;
    // Right channel slightly different for stereo spread
    rightChannel[i] = noise * amplitude * 0.95;
  }

  const convolver = audioContext.createConvolver();
  convolver.buffer = impulse;
  return convolver;
};

export const createReverbEffect = async (audioContext) => {
  if (!audioContext) return null;

  try {
    // Create nodes
    const inputGain = audioContext.createGain();
    const convolver = await createConvolver(audioContext);
    const wetGain = audioContext.createGain();
    const dryGain = audioContext.createGain();
    const outputGain = audioContext.createGain();

    // Pre-reverb filter to shape the sound
    const preFilter = audioContext.createBiquadFilter();
    preFilter.type = "lowpass";
    preFilter.frequency.value = 7000; // Cut some high frequencies

    // Post-reverb filter
    const postFilter = audioContext.createBiquadFilter();
    postFilter.type = "highpass";
    postFilter.frequency.value = 100; // Remove rumble

    // Initial values - more pronounced wet signal
    wetGain.gain.value = 0.6; // Increased from 0.3
    dryGain.gain.value = 0.6; // Allows both dry and wet to be heard clearly
    outputGain.gain.value = 1;

    // Routing
    // Dry chain
    inputGain.connect(dryGain);
    dryGain.connect(outputGain);

    // Wet chain with filtering
    inputGain.connect(preFilter);
    preFilter.connect(convolver);
    convolver.connect(postFilter);
    postFilter.connect(wetGain);
    wetGain.connect(outputGain);

    return {
      input: inputGain,
      convolver,
      preFilter,
      postFilter,
      wetGain,
      dryGain,
      output: outputGain,

      // Utility methods
      setWetLevel: (value, time) => {
        wetGain.gain.setValueAtTime(value, time);
      },
      setDryLevel: (value, time) => {
        dryGain.gain.setValueAtTime(value, time);
      },
      setOutputLevel: (value, time) => {
        outputGain.gain.setValueAtTime(value, time);
      },

      disconnect: () => {
        inputGain.disconnect();
        preFilter.disconnect();
        convolver.disconnect();
        postFilter.disconnect();
        wetGain.disconnect();
        dryGain.disconnect();
        outputGain.disconnect();
      },
    };
  } catch (err) {
    console.warn("Error creating reverb effect:", err);
    return null;
  }
};
