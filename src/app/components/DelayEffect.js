// DelayEffect.js
import React, { useRef, useEffect } from "react";
import styles from "../audiosequencer.module.css";

const RotaryDial = ({ value, onChange, min, max, label }) => {
  const dialRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startValue = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;

      const deltaY = startY.current - e.clientY;
      const range = max - min;
      const deltaValue = (deltaY / 200) * range; // Adjust sensitivity

      let newValue = startValue.current + deltaValue;
      newValue = Math.max(min, Math.min(max, newValue));

      onChange(newValue);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "default";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [min, max, onChange]);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startValue.current = value;
    document.body.style.cursor = "ns-resize";
  };

  const rotation = ((value - min) / (max - min)) * 270 - 135; // -135 to 135 degrees

  return (
    <div className={styles.dialContainer}>
      <div
        ref={dialRef}
        className={styles.dial}
        onMouseDown={handleMouseDown}
        style={{
          "--rotation": `${rotation}deg`,
        }}
      >
        <div className={styles.dialMarker} />
      </div>
      <div className={styles.dialLabel}>{label}</div>
      <div className={styles.dialValue}>{value.toFixed(2)}</div>
    </div>
  );
};

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
      <RotaryDial
        value={delayTime}
        onChange={handleDelayTimeChange}
        min={0}
        max={1}
        label="Delay Time"
      />
      <RotaryDial
        value={feedback}
        onChange={handleFeedbackChange}
        min={0}
        max={1}
        label="Feedback"
      />
      <RotaryDial
        value={wetLevel}
        onChange={handleWetLevelChange}
        min={0}
        max={1}
        label="Effect Level"
      />
    </div>
  );
};

export default DelayEffect;
