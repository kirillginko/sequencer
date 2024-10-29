import React from "react";
import styles from "../audiosequencer.module.css";
import RotaryDial from "./RotaryDial";

const DelayEffect = ({
  delayTime,
  setDelayTime,
  feedback,
  setFeedback,
  wetLevel,
  setWetLevel,
  delayEffectRef,
  audioContext,
}) => {
  const handleDelayTimeChange = (value) => {
    setDelayTime(value);
    if (delayEffectRef.current && audioContext) {
      try {
        delayEffectRef.current.delay.delayTime.setValueAtTime(
          value,
          audioContext.currentTime
        );
      } catch (err) {
        console.warn("Error updating delay time:", err);
      }
    }
  };

  const handleFeedbackChange = (value) => {
    setFeedback(value);
    if (delayEffectRef.current && audioContext) {
      try {
        delayEffectRef.current.feedback.gain.setValueAtTime(
          value,
          audioContext.currentTime
        );
      } catch (err) {
        console.warn("Error updating feedback:", err);
      }
    }
  };

  const handleWetLevelChange = (value) => {
    setWetLevel(value);
    if (delayEffectRef.current && audioContext) {
      try {
        // Update wet and dry levels inversely
        delayEffectRef.current.wetGain.gain.setValueAtTime(
          value,
          audioContext.currentTime
        );
        delayEffectRef.current.dryGain.gain.setValueAtTime(
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
      <h3 className={styles.effectTitle}>Delay</h3>
      <div className={styles.delayControls}>
        <RotaryDial
          value={delayTime}
          onChange={handleDelayTimeChange}
          min={0}
          max={1}
          label="Time"
        />
        <RotaryDial
          value={feedback}
          onChange={handleFeedbackChange}
          min={0}
          max={0.9}
          label="Feedback"
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

export default DelayEffect;
