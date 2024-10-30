export const createSaturationEffect = (audioContext) => {
  if (!audioContext) return null;

  try {
    // Create audio nodes
    const inputGain = audioContext.createGain();
    const outputGain = audioContext.createGain();
    const wetGain = audioContext.createGain();
    const dryGain = audioContext.createGain();
    const waveshaper = audioContext.createWaveShaper();

    // Set initial values
    wetGain.gain.value = 0.5;
    dryGain.gain.value = 0.5;
    outputGain.gain.value = 1.0;
    inputGain.gain.value = 1.0;

    // Create initial curve
    updateCurve(waveshaper, 50); // Default drive value

    // Connect nodes for parallel processing
    inputGain.connect(waveshaper);
    waveshaper.connect(wetGain);
    inputGain.connect(dryGain);
    wetGain.connect(outputGain);
    dryGain.connect(outputGain);

    return {
      input: inputGain,
      output: outputGain,
      wetGain,
      dryGain,
      waveshaper,
      drive: inputGain,
      updateCurve: (amount) => updateCurve(waveshaper, amount),
    };
  } catch (err) {
    console.warn("Error creating saturation effect:", err);
    return null;
  }
};

// Helper function to create the distortion curve
const updateCurve = (waveshaper, amount) => {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;

  for (let i = 0; i < samples; ++i) {
    const x = (i * 2) / samples - 1;
    // Sigmoid-like soft clipping function
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }

  waveshaper.curve = curve;
  waveshaper.oversample = "4x";
};
