import React from "react";
import styles from "../audiosequencer.module.css";
import RotaryDial from "./RotaryDial";

const BitCrusherEffect = ({
  bitDepth,
  setBitDepth,
  sampleRateReduction,
  setSampleRateReduction,
  wetLevel,
  setWetLevel,
  bitCrusherRef,
  audioContext,
}) => {
  const handleBitDepthChange = (value) => {
    setBitDepth(value);
    if (bitCrusherRef.current && audioContext) {
      try {
        bitCrusherRef.current.setBitDepth(value);
      } catch (err) {
        console.warn("Error updating bit depth:", err);
      }
    }
  };

  const handleSampleRateChange = (value) => {
    setSampleRateReduction(value);
    if (bitCrusherRef.current && audioContext) {
      try {
        bitCrusherRef.current.setSampleRateReduction(value);
      } catch (err) {
        console.warn("Error updating sample rate reduction:", err);
      }
    }
  };

  const handleWetLevelChange = (value) => {
    setWetLevel(value);
    if (bitCrusherRef.current && audioContext) {
      try {
        bitCrusherRef.current.wetGain.gain.setValueAtTime(
          value,
          audioContext.currentTime
        );
        bitCrusherRef.current.dryGain.gain.setValueAtTime(
          1 - value,
          audioContext.currentTime
        );
      } catch (err) {
        console.warn("Error updating wet level:", err);
      }
    }
  };

  return (
    <div className={styles.effectSection}>
      <h3 className={styles.effectTitle}>Bit Crusher</h3>
      <div className={styles.delayControls}>
        <RotaryDial
          value={bitDepth}
          onChange={handleBitDepthChange}
          min={1}
          max={16}
          label="Bits"
        />
        <RotaryDial
          value={sampleRateReduction}
          onChange={handleSampleRateChange}
          min={0}
          max={1}
          label="Rate"
        />
        <RotaryDial
          value={wetLevel}
          onChange={handleWetLevelChange}
          min={0}
          max={1}
          label="Mix"
        />
      </div>
    </div>
  );
};

export default BitCrusherEffect;
