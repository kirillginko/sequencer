import React from "react";
import styles from "../audiosequencer.module.css";
import RotaryDial from "./RotaryDial";

const ReverbEffect = ({
  wetLevel,
  setWetLevel,
  dryLevel,
  setDryLevel,
  outputLevel,
  setOutputLevel,
  reverbEffectRef,
  audioContext,
}) => {
  const handleWetLevelChange = (value) => {
    setWetLevel(value);
    if (reverbEffectRef.current && audioContext) {
      try {
        reverbEffectRef.current.wetGain.gain.setValueAtTime(
          value * 1.2, // Boost the wet signal
          audioContext.currentTime
        );
      } catch (err) {
        console.warn("Error updating wet level:", err);
      }
    }
  };

  const handleDryLevelChange = (value) => {
    setDryLevel(value);
    if (reverbEffectRef.current && audioContext) {
      try {
        reverbEffectRef.current.dryGain.gain.setValueAtTime(
          value * 0.8, // Slightly reduce dry signal
          audioContext.currentTime
        );
      } catch (err) {
        console.warn("Error updating dry level:", err);
      }
    }
  };

  const handleOutputLevelChange = (value) => {
    setOutputLevel(value);
    if (reverbEffectRef.current && audioContext) {
      try {
        reverbEffectRef.current.outputGain.gain.setValueAtTime(
          value * 0.8, // Prevent clipping
          audioContext.currentTime
        );
      } catch (err) {
        console.warn("Error updating output level:", err);
      }
    }
  };

  return (
    <div className={styles.effectSection}>
      <h3 className={styles.effectTitle}>Reverb</h3>
      <div className={styles.reverbControls}>
        <RotaryDial
          value={wetLevel}
          onChange={handleWetLevelChange}
          min={0}
          max={1}
          label="Reverb Amount"
        />
        <RotaryDial
          value={dryLevel}
          onChange={handleDryLevelChange}
          min={0}
          max={1}
          label="Direct Signal"
        />
        <RotaryDial
          value={outputLevel}
          onChange={handleOutputLevelChange}
          min={0}
          max={1}
          label="Master Level"
        />
      </div>
    </div>
  );
};

export default ReverbEffect;
