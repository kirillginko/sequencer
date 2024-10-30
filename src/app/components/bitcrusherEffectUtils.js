export const createBitCrusherEffect = (audioContext) => {
  if (!audioContext) return null;

  try {
    // Create nodes
    const inputGain = audioContext.createGain();
    const wetGain = audioContext.createGain();
    const dryGain = audioContext.createGain();
    const outputGain = audioContext.createGain();

    // Create ScriptProcessor for bit crushing
    // Buffer size of 4096 provides good balance between latency and performance
    const crusher = audioContext.createScriptProcessor(4096, 1, 1);

    // Default values
    let bits = 8; // Bit depth
    let normFreq = 0.5; // Sample rate reduction
    let phaser = 0; // Used for sample rate reduction

    // Bit crushing function
    crusher.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const output = e.outputBuffer.getChannelData(0);

      for (let i = 0; i < input.length; i++) {
        // Sample rate reduction
        phaser += normFreq;
        if (phaser >= 1.0) {
          phaser -= 1.0;
          // Bit depth reduction
          const step = Math.pow(0.5, bits);
          output[i] = step * Math.floor(input[i] / step + 0.5);
        } else {
          output[i] = output[i - 1];
        }
      }
    };

    // Set initial values
    wetGain.gain.value = 0.8;
    dryGain.gain.value = 0.8;
    outputGain.gain.value = 1.0;

    // Connect nodes
    inputGain.connect(crusher);
    crusher.connect(wetGain);
    inputGain.connect(dryGain);
    wetGain.connect(outputGain);
    dryGain.connect(outputGain);

    // Create interface
    return {
      input: inputGain,
      output: outputGain,
      wetGain,
      dryGain,
      crusher,
      setBitDepth: (newBits) => {
        bits = Math.max(1, Math.min(16, newBits));
      },
      setSampleRateReduction: (normalization) => {
        normFreq = Math.max(0, Math.min(1, normalization));
      },
    };
  } catch (err) {
    console.warn("Error creating bit crusher effect:", err);
    return null;
  }
};
