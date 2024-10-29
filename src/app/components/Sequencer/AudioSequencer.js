// AudioSequencer.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, VolumeX, RotateCcw, Save, Upload } from "lucide-react";
import { Howl, Howler } from "howler";
import DelayEffect from "../DelayEffect";
import { createDelayEffect } from "../delayEffectUtils";
import styles from "../../audiosequencer.module.css";

const Dialog = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h2>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.dialogContent}>{children}</div>
      </div>
    </>
  );
};

const GRID_SIZE = 16;
const TOTAL_STEPS = GRID_SIZE * GRID_SIZE;
const ANIMATION_DURATION = 3000;

const NOTES = [
  "C5",
  "A#4",
  "G#4",
  "F#4",
  "E4",
  "D4",
  "C4",
  "A#3",
  "G#3",
  "F#3",
  "E3",
  "D3",
  "C3",
  "A#2",
  "G#2",
  "F#2",
];

const AudioSequencer = () => {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [savedPattern, setSavedPattern] = useState("");
  const [loadPattern, setLoadPattern] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [delayTime, setDelayTime] = useState(0.3);
  const [feedback, setFeedback] = useState(0.4);
  const [wetLevel, setWetLevel] = useState(0.3);

  const notesRef = useRef([]);
  const loadedCountRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStateRef = useRef(null);
  const activeNotesRef = useRef(activeNotes);
  const delayEffectRef = useRef(null);

  useEffect(() => {
    activeNotesRef.current = activeNotes;
  }, [activeNotes]);

  // Initialize audio and delay effect
  useEffect(() => {
    loadedCountRef.current = 0;

    // Create a dummy sound to initialize Howler's audio context
    const initSound = new Howl({
      src: [
        "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA",
      ],
      onload: () => {
        const audioContext = Howler.ctx;

        if (audioContext) {
          delayEffectRef.current = createDelayEffect(audioContext);

          // Initialize Howl instances for each note
          for (let i = 0; i < GRID_SIZE; i++) {
            notesRef.current[i] = new Howl({
              src: [
                `https://s3-us-west-2.amazonaws.com/s.cdpn.io/380275/${i}.mp3`,
                `https://s3-us-west-2.amazonaws.com/s.cdpn.io/380275/${i}.ogg`,
              ],
              onload: () => {
                loadedCountRef.current += 1;
                if (loadedCountRef.current === GRID_SIZE) {
                  setIsLoaded(true);
                }
              },
              onplay: function () {
                const sound = this._sounds[0];
                if (sound && sound._node && delayEffectRef.current) {
                  try {
                    sound._node.connect(delayEffectRef.current.input);
                    delayEffectRef.current.output.connect(
                      audioContext.destination
                    );
                  } catch (err) {
                    console.warn("Error connecting audio nodes:", err);
                  }
                }
              },
            });
          }
        }
      },
    });

    return () => {
      notesRef.current.forEach((note) => {
        if (note) note.unload();
      });
      if (delayEffectRef.current && delayEffectRef.current.output) {
        try {
          delayEffectRef.current.output.disconnect();
        } catch (err) {
          console.warn("Error disconnecting audio nodes:", err);
        }
      }
    };
  }, []);

  const handleMouseDown = useCallback((index) => {
    isDraggingRef.current = true;
    dragStateRef.current = !activeNotesRef.current.has(index);

    setActiveNotes((prev) => {
      const newSet = new Set(prev);
      if (dragStateRef.current) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
  }, []);

  const handleMouseEnter = useCallback((index) => {
    if (isDraggingRef.current) {
      setActiveNotes((prev) => {
        const newSet = new Set(prev);
        if (dragStateRef.current) {
          newSet.add(index);
        } else {
          newSet.delete(index);
        }
        return newSet;
      });
    }
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      dragStateRef.current = null;
    };

    const handleMouseLeave = () => {
      isDraggingRef.current = false;
      dragStateRef.current = null;
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || !isLoaded) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const newStep = (prev + 1) % GRID_SIZE;

        if (!isMuted && notesRef.current) {
          for (let row = 0; row < GRID_SIZE; row++) {
            const noteIndex = row * GRID_SIZE + newStep;
            if (
              activeNotesRef.current.has(noteIndex) &&
              notesRef.current[row]
            ) {
              try {
                notesRef.current[row].play();

                const cell = document.querySelector(
                  `[data-index="${noteIndex}"]`
                );
                const ripple = cell?.querySelector(`.${styles.ripple}`);
                if (ripple) {
                  ripple.classList.add(styles.animate);
                  setTimeout(() => {
                    ripple.classList.remove(styles.animate);
                  }, 500);
                }
              } catch (err) {
                console.warn("Error playing note:", err);
              }
            }
          }
        }

        return newStep;
      });
    }, ANIMATION_DURATION / GRID_SIZE);

    return () => clearInterval(interval);
  }, [isPlaying, isLoaded, isMuted]);

  const toggleMute = useCallback(() => {
    try {
      if (isMuted) {
        Howler.volume(1);
      } else {
        Howler.volume(0);
      }
      setIsMuted(!isMuted);
    } catch (err) {
      console.warn("Error toggling mute:", err);
    }
  }, [isMuted]);

  const exportPattern = useCallback(() => {
    let noteCode = "";
    let offCount = 0;
    let onCount = 0;

    for (let i = 0; i < TOTAL_STEPS; i++) {
      if (activeNotes.has(i)) {
        if (offCount > 0) noteCode += `;${offCount}`;
        onCount++;
        offCount = 0;
      } else {
        if (onCount > 0) noteCode += `:${onCount} `;
        offCount++;
        onCount = 0;
      }
    }

    if (offCount > 0) noteCode += `;${offCount}`;
    else if (onCount > 0) noteCode += `:${onCount}`;

    setSavedPattern(`[${noteCode}]`);
    setShowSaveDialog(true);
    if (Howler.ctx) {
      Howler.volume(0.5);
    }
  }, [activeNotes]);

  const importPattern = useCallback(() => {
    try {
      let noteCode = loadPattern.replace("[", "").replace("]", "");
      const noteState = noteCode.charAt(0) === ":" ? 1 : 0;

      if (noteCode.charAt(0) !== ":" && noteCode.charAt(0) !== ";") {
        throw new Error("Invalid pattern format");
      }

      const newActiveNotes = new Set();
      noteCode = noteCode.substr(1);
      const splitCode = noteCode.split(/:|;/g);
      let noteCounter = 0;
      let currentState = noteState;

      for (const num of splitCode) {
        const count = parseInt(num);
        if (currentState) {
          for (let i = 0; i < count; i++) {
            newActiveNotes.add(noteCounter++);
          }
        } else {
          noteCounter += count;
        }
        currentState = !currentState;
      }

      setActiveNotes(newActiveNotes);
      setShowLoadDialog(false);
      setLoadPattern("");
      if (Howler.ctx) {
        Howler.volume(isMuted ? 0 : 1);
      }
    } catch (error) {
      alert("Invalid pattern format");
    }
  }, [loadPattern, isMuted]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sequencer</h1>

      <DelayEffect
        delayTime={delayTime}
        setDelayTime={setDelayTime}
        feedback={feedback}
        setFeedback={setFeedback}
        wetLevel={wetLevel}
        setWetLevel={setWetLevel}
        delayEffectRef={delayEffectRef}
        audioContext={Howler.ctx}
      />

      <div className={styles.sequencerContainer}>
        <div className={styles.noteLabels}>
          {NOTES.map((note, index) => (
            <div key={note} className={styles.noteLabel}>
              {note}
            </div>
          ))}
        </div>

        <div
          className={`${styles.board} ${
            !isLoaded ? styles.loading : styles.forward
          }`}
        >
          <div className={styles.grid}>
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
              const isActive = activeNotes.has(index);
              const isCurrentColumn =
                Math.floor(index % GRID_SIZE) === currentStep;

              return (
                <button
                  key={index}
                  data-index={index}
                  onMouseDown={() => handleMouseDown(index)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  className={`${styles.holder} ${
                    isActive ? styles.active : ""
                  } ${isCurrentColumn ? styles.current : ""}`}
                  data-note={Math.floor(index / GRID_SIZE)}
                >
                  <div
                    className={`${styles.note} ${
                      isActive ? styles.noteActive : ""
                    }`}
                  >
                    <div className={styles.ripple} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.markerContainer}>
        <div className={styles.noteLabelsPlaceholder} />
        <div className={styles.markers}>
          {Array.from({ length: GRID_SIZE }).map((_, i) => (
            <div key={i} className={styles.marker}>
              {i % 4 === 0 ? "•" : "·"}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.controls}>
        <button onClick={toggleMute} className={styles.button}>
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button
          onClick={() => setActiveNotes(new Set())}
          className={styles.button}
        >
          <RotateCcw size={20} />
        </button>
        <button onClick={exportPattern} className={styles.button}>
          <Save size={20} />
        </button>
        <button
          onClick={() => setShowLoadDialog(true)}
          className={styles.button}
        >
          <Upload size={20} />
        </button>
      </div>

      <Dialog
        isOpen={showSaveDialog}
        onClose={() => {
          setShowSaveDialog(false);
          if (Howler.ctx) {
            Howler.volume(isMuted ? 0 : 1);
          }
        }}
        title="Save or share your loop"
      >
        <textarea
          readOnly
          value={savedPattern}
          onClick={(e) => e.target.select()}
          className={styles.textarea}
        />
      </Dialog>

      <Dialog
        isOpen={showLoadDialog}
        onClose={() => {
          setShowLoadDialog(false);
          if (Howler.ctx) {
            Howler.volume(isMuted ? 0 : 1);
          }
        }}
        title="Load pattern"
      >
        <p className={styles.dialogText}>
          Pattern format example:
          <br />
          [;24:1 ;37:1 ;80:1 ;84:1 ;7:1 ;3:1 ;15]
        </p>
        <textarea
          value={loadPattern}
          onChange={(e) => setLoadPattern(e.target.value)}
          className={styles.textarea}
        />
        <button onClick={importPattern} className={styles.loadButton}>
          Load Pattern
        </button>
      </Dialog>
    </div>
  );
};

export default AudioSequencer;
