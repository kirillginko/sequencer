export const createDelayEffect = (audioContext) => {
  if (!audioContext) return null;

  try {
    const delayNode = audioContext.createDelay(5.0);
    const feedbackNode = audioContext.createGain();
    const filterNode = audioContext.createBiquadFilter();
    const wetGainNode = audioContext.createGain();

    // Set initial values
    delayNode.delayTime.value = 0.3;
    feedbackNode.gain.value = 0.4;
    filterNode.frequency.value = 2000;
    wetGainNode.gain.value = 0.3;

    // Connect nodes
    delayNode.connect(feedbackNode);
    feedbackNode.connect(filterNode);
    filterNode.connect(delayNode);
    delayNode.connect(wetGainNode);

    return {
      delay: delayNode,
      feedback: feedbackNode,
      filter: filterNode,
      wetGain: wetGainNode,
      input: delayNode,
      output: wetGainNode,
    };
  } catch (err) {
    console.warn("Error creating delay effect:", err);
    return null;
  }
};
