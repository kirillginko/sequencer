// pages/index.js
"use client"; // Ensure this is a client component
import React from "react";
import AudioSequencer from "./components/Sequencer/AudioSequencer";

export default function Home() {
  return (
    <>
      <AudioSequencer />
    </>
  );
}
