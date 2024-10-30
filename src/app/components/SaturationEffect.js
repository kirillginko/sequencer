import React from "react";
import styles from "../audiosequencer.module.css";
import RotaryDial from "./RotaryDial";

const SaturationEffect = ({
  drive,
  setDrive,
  wetLevel,
  setWetLevel,
  outputLevel,
  setOutputLevel,
  saturationRef,
  audioContext,
}) => {
  const handleDriveChange = (value) => {
    setDrive(value);
    if (saturationRef.current && audioContext) {
      try {
        saturationRef.current.updateCurve(value);
        saturationRef.current.drive.gain.setValueAtTime(
          1 + value / 100, // Scale the drive
          audioContext.currentTime
        );
      } catch (err) {
        console.warn("Error updating drive:", err);
      }
    }
  };

  const handleWetLevelChange = (value) => {
    setWetLevel(value);
    if (saturationRef.current && audioContext) {
      try {
        saturationRef.current.wetGain.gain.setValueAtTime(
          value,
          audioContext.currentTime
        );
        saturationRef.current.dryGain.gain.setValueAtTime(
          1 - value,
          audioContext.currentTime
        );
      } catch (err) {
        console.warn("Error updating wet level:", err);
      }
    }
  };

  const handleOutputLevelChange = (value) => {
    setOutputLevel(value);
    if (saturationRef.current && audioContext) {
      try {
        saturationRef.current.output.gain.setValueAtTime(
          value,
          audioContext.currentTime
        );
      } catch (err) {
        console.warn("Error updating output level:", err);
      }
    }
  };

  return (
    <div className={styles.effectSection}>
      <h3 className={styles.effectTitle}>Saturation</h3>
      <div className={styles.delayControls}>
        <RotaryDial
          value={drive}
          onChange={handleDriveChange}
          min={0}
          max={100}
          label="Drive"
        />
        <RotaryDial
          value={wetLevel}
          onChange={handleWetLevelChange}
          min={0}
          max={1}
          label="Mix"
        />
        <RotaryDial
          value={outputLevel}
          onChange={handleOutputLevelChange}
          min={0}
          max={1}
          label="Output"
        />
      </div>
    </div>
  );
};

export default SaturationEffect;
