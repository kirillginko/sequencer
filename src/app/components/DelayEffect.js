// DelayEffect.js
import React from "react";
import styles from "../audiosequencer.module.css";

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
  const handleDelayTimeChange = (e) => {
    const value = parseFloat(e.target.value);
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

  const handleFeedbackChange = (e) => {
    const value = parseFloat(e.target.value);
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

  const handleWetLevelChange = (e) => {
    const value = parseFloat(e.target.value);
    setWetLevel(value);
    if (delayEffectRef.current && audioContext) {
      try {
        delayEffectRef.current.wetGain.gain.setValueAtTime(
          value,
          audioContext.currentTime
        );
      } catch (err) {
        console.warn("Error updating wet level:", err);
      }
    }
  };

  return (
    <div className={styles.delayControls}>
      <div className={styles.delayControl}>
        <label>Delay Time</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={delayTime}
          onChange={handleDelayTimeChange}
          className={styles.slider}
        />
      </div>
      <div className={styles.delayControl}>
        <label>Feedback</label>
        <input
          type="range"
          min="0"
          max="0.9"
          step="0.01"
          value={feedback}
          onChange={handleFeedbackChange}
          className={styles.slider}
        />
      </div>
      <div className={styles.delayControl}>
        <label>Effect Level</label>
        <input
          type="range"
          min="0"
          max="0.8"
          step="0.01"
          value={wetLevel}
          onChange={handleWetLevelChange}
          className={styles.slider}
        />
      </div>
    </div>
  );
};

export default DelayEffect;
