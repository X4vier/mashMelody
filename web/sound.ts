import { keyHorizontalPositions } from "./keyPositions.js";

const CHORD_FADE_DURATION_MS = 500;
const MIN_CHORD_DURATION_MS = 500;

// Define all possible notes in A minor pentatonic scale
const ALL_NOTES = [
  "A4",
  "G4",
  "C5",
  "D5",
  "E5",
  "G5",
  "A5",
  "C6",
  "D6",
  "E6",
  "G6",
  "A6",
  "C7",
  "D7",
  "E7",
  "G7",
].map((note) => `note_${note}.wav`);

// Define chord progressions
const CHORD_PROGRESSIONS = [
  // I-V-vi-IV progression
  [
    "C2_C3_G3_E3", // I
    "G2_G3_B3_D3", // V
    "A2_C4_E3_G3", // vi
    "F2_F3_A3_C3", // IV
  ],
  [
    "C2_C3_G3_E3", // i
    "F2_F3_A3_C3", // iv
    "A2_C4_E3_G3", // vi
    "G2_G3_C4_D3", // v4
  ],
].map((progression) => progression.map((chord) => `chord_${chord}.wav`));

const PAD_CHORDS = ["A4_C5", "C4_E4", "F4_A4", "G4_B4"].map(
  (chord) => `pad_pad_chord_${chord}.wav`
);

const allSounds: { type: "chord" | "pad" | "note"; sound: string }[] = [
  ...ALL_NOTES.map((note): { type: "note"; sound: string } => ({
    type: "note",
    sound: note,
  })),
  ...PAD_CHORDS.map((chord): { type: "pad"; sound: string } => ({
    type: "pad",
    sound: chord,
  })),
];

// Comprehensive key mapping - array index maps to index in allSounds
const KEY_SOUND_MAPPING = [
  " ",
  "Enter",
  "Tab",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "q",
  "w",
  "e",
  "r",
  "t",
  "y",
  "u",
  "i",
  "o",
  "p",
  "a",
  "s",
  "d",
  "f",
  "g",
  "h",
  "j",
  "k",
  "l",
  "z",
  "x",
  "c",
  "v",
  "b",
  "n",
  "m",
  "-",
  "=",
  "[",
  "]",
  "\\",
  ";",
  "'",
  ",",
  ".",
  "/",
  "NumPad0",
  "NumPad1",
  "NumPad2",
  "NumPad3",
  "NumPad4",
  "NumPad5",
  "NumPad6",
  "NumPad7",
  "NumPad8",
  "NumPad9",
  "NumPadDivide",
  "NumPadMultiply",
  "NumPadSubtract",
  "NumPadAdd",
  "NumPadDecimal",
  "Control",
  "Alt",
  "Shift",
  "CapsLock",
  "Backspace",
  "Delete",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Escape",
];

function getStableMapping(key: string): {
  type: "note" | "chord" | "pad";
  sound: string;
} {
  // Make spacebar, tab, enter and backspace play chords
  if (key === " " || key === "Tab" || key === "Enter" || key === "Backspace") {
    return { type: "chord", sound: CHORD_PROGRESSIONS[0][0] };
  }

  const index = KEY_SOUND_MAPPING.findIndex(
    (k) => k.toLowerCase() === key.toLowerCase()
  );
  if (index === -1) {
    return { type: "note", sound: ALL_NOTES[0] };
  }
  return allSounds[index % allSounds.length];
}

export class SoundEffect {
  private audioContext: AudioContext | undefined;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private activeChords: Array<{
    source: AudioBufferSourceNode;
    gain: GainNode;
    fadingOut: boolean;
    startTime: number;
  }> = [];
  private currentProgression: number = Math.floor(
    Math.random() * CHORD_PROGRESSIONS.length
  );
  private currentChordIndex: number = 0;

  constructor() {}

  private async initAudio() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      await this.loadSounds();
    } else if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  private async loadSounds() {
    if (!this.audioContext) return;

    // Load single notes
    for (const note of ALL_NOTES) {
      try {
        const response = await fetch(`./sounds/${note}`);
        if (!response.ok) {
          console.warn(`Failed to load sound ${note}: ${response.statusText}`);
          continue;
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(
          arrayBuffer
        );
        this.audioBuffers.set(note, audioBuffer);
      } catch (error) {
        console.warn(`Error loading sound ${note}:`, error);
      }
    }

    // Load all chords from all progressions
    const allChords = new Set(CHORD_PROGRESSIONS.flat());
    for (const chord of allChords) {
      try {
        const response = await fetch(`./sounds/${chord}`);
        if (!response.ok) {
          console.warn(`Failed to load chord ${chord}: ${response.statusText}`);
          continue;
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(
          arrayBuffer
        );
        this.audioBuffers.set(chord, audioBuffer);
      } catch (error) {
        console.warn(`Error loading chord ${chord}:`, error);
      }
    }

    // Load pad chords
    for (const chord of PAD_CHORDS) {
      try {
        const response = await fetch(`./sounds/${chord}`);
        if (!response.ok) {
          console.warn(
            `Failed to load pad chord ${chord}: ${response.statusText}`
          );
          continue;
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(
          arrayBuffer
        );
        this.audioBuffers.set(chord, audioBuffer);
      } catch (error) {
        console.warn(`Error loading pad chord ${chord}:`, error);
      }
    }
  }

  private playSound(sound: string) {
    if (!this.audioContext || !this.audioBuffers.has(sound)) return;

    const buffer = this.audioBuffers.get(sound);
    if (buffer) {
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      // If this is a chord (but not a pad), handle the fade out of previous chords
      if (sound.startsWith("chord_")) {
        // Check if current chord has been playing for less than MIN_CHORD_DURATION_MS
        const currentTime = Date.now();
        const activeChord = this.activeChords.find((chord) => !chord.fadingOut);
        if (
          activeChord &&
          currentTime - activeChord.startTime < MIN_CHORD_DURATION_MS
        ) {
          return; // Don't play new chord yet
        }

        // Create gain node for volume control
        const gainNode = this.audioContext.createGain();
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Fade out all active chords that aren't already fading
        const activeChordsToFade = this.activeChords.filter(
          (chord) => !chord.fadingOut
        );
        activeChordsToFade.forEach((chord) => {
          chord.fadingOut = true;
          chord.gain.gain.setValueAtTime(
            chord.gain.gain.value,
            this.audioContext!.currentTime
          );
          chord.gain.gain.linearRampToValueAtTime(
            0,
            this.audioContext!.currentTime + CHORD_FADE_DURATION_MS / 1000
          );
          setTimeout(() => {
            chord.source.stop();
            this.activeChords = this.activeChords.filter((c) => c !== chord);
          }, CHORD_FADE_DURATION_MS);
        });

        // Add new chord to active chords
        this.activeChords.push({
          source,
          gain: gainNode,
          fadingOut: false,
          startTime: currentTime,
        });

        // Advance to next chord in progression
        this.currentChordIndex =
          (this.currentChordIndex + 1) %
          CHORD_PROGRESSIONS[this.currentProgression].length;

        // When we complete a progression, randomly select a new one
        if (this.currentChordIndex === 0) {
          this.currentProgression = Math.floor(
            Math.random() * CHORD_PROGRESSIONS.length
          );
        }
      } else {
        // For non-chord sounds (including pads), connect directly
        source.connect(this.audioContext.destination);
      }

      source.start();
    }
  }

  public async handleKeyPress(e: KeyboardEvent): Promise<void> {
    await this.initAudio();

    const key = e.key.toLowerCase();

    // Get the mapped sound for this key
    const mapping = getStableMapping(key);
    if (mapping.type === "note") {
      this.playSound(mapping.sound);
    } else if (mapping.type === "chord") {
      // Play next chord in current progression instead of random chord
      const nextChord =
        CHORD_PROGRESSIONS[this.currentProgression][this.currentChordIndex];
      this.playSound(nextChord);
    } else if (mapping.type === "pad") {
      // Play the pad chord directly without the "pad_" prefix
      this.playSound(mapping.sound);
    }
  }

  public async handleMouseClick(): Promise<void> {
    await this.initAudio();

    // Play next chord in progression
    const nextChord =
      CHORD_PROGRESSIONS[this.currentProgression][this.currentChordIndex];
    this.playSound(nextChord);

    // Play 3 random notes
    for (let i = 0; i < 3; i++) {
      const randomNoteIndex = Math.floor(Math.random() * ALL_NOTES.length);
      this.playSound(ALL_NOTES[randomNoteIndex]);
    }
  }

  public loop(): void {}

  public draw(): void {}
}
