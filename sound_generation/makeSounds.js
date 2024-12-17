const calculateVolume = (index, totalNotes) => {
  // Linear interpolation from 0 to -28 based on position in scale
  return -(28 * index) / (totalNotes - 1);
};

const notes = [
  "G4",
  "A4",
  "B4",
  "C5",
  "D5",
  "E5",
  "F5",
  "G5",
  "A5",
  "B5",
  "C6",
  "D6",
  "E6",
  "F6",
  "G6",
  "A6",
  "B6",
  "C7",
  "D7",
  "E7",
  "F7",
  "G7",
];

const cMajorScale = Object.fromEntries(
  notes.map((note, index) => [
    note,
    {
      note: note,
      volume: calculateVolume(index, notes.length),
    },
  ])
);

// Define chords in C major
const chords = {
  I: ["C2", "C3", "G3", "E3"], // C (I) - first inversion with lower third
  IV: ["F2", "F3", "A3", "C3"], // F (IV) - root position with lower root
  V4: ["G2", "G3", "C4", "D3"], // G (V) - root position with lower root
  V: ["G2", "G3", "B3", "D3"], // G (V) - root position with lower root
  vi: ["A2", "C4", "E3", "G3"], // Am7 (vi) - root position with lower root and seventh
};

// Create separate settings for notes and chords
const noteSynthSettings = {
  envelope: {
    attack: 0.001, // Very fast attack for that immediate hit
    decay: 0.3, // Quick decay
    sustain: 0.02, // Very little sustain
    release: 0.4, // Quick release
  },
  oscillator: {
    type: "sine", // Base tone
    partials: [1, 0.7, 0.3, 0.2], // Add overtones for metallic character
  },
};

const chordSynthSettings = {
  envelope: {
    attack: 0.02,
    decay: 0.1,
    sustain: 0.3,
    release: 1,
  },
  oscillator: {
    type: "triangle",
  },
};

// Create two separate synthesizers with reduced volume
const noteSynth = new Tone.PolySynth(Tone.Synth).toDestination();
noteSynth.volume.value = -12; // Adjust volume for xylophone

const chordSynth = new Tone.PolySynth(Tone.Synth).toDestination();
chordSynth.volume.value = -20; // Keep chord volume the same

// Configure the synths with their respective settings
noteSynth.set(noteSynthSettings);
chordSynth.set(chordSynthSettings);

// Add a bandpass filter specifically for the xylophone sound
const xyloFilter = new Tone.Filter({
  frequency: 2000,
  type: "bandpass",
  Q: 2,
}).toDestination();

// Modify reverb for xylophone character
const xyloReverb = new Tone.Reverb({
  decay: 1.5,
  wet: 0.3,
  preDelay: 0.01,
}).toDestination();

// Keep original effects for chords
const chordReverb = new Tone.Reverb({
  decay: 2,
  wet: 0.2,
}).toDestination();

const delay = new Tone.FeedbackDelay({
  delayTime: 0.3,
  feedback: 0.2,
  wet: 0.1,
}).toDestination();

// Add limiters to prevent clipping
const noteLimiter = new Tone.Limiter(-3).toDestination();
const chordLimiter = new Tone.Limiter(-3).toDestination();

// Connect the synths through their respective effect chains
noteSynth.connect(noteLimiter);
noteLimiter.connect(xyloFilter);
xyloFilter.connect(xyloReverb);

chordSynth.connect(chordLimiter);
chordLimiter.connect(chordReverb);
chordLimiter.connect(delay);

// Function to play chord with staggered notes
async function playChord(chord, duration) {
  // Release any currently playing notes
  chordSynth.releaseAll();

  // Play each note with a slight delay
  chord.forEach((note, index) => {
    setTimeout(() => {
      chordSynth.triggerAttackRelease(note, duration);
    }, index * 5); // 5ms stagger between notes
  });
}

async function recordAudio(note, duration = 1) {
  const recorder = new Tone.Recorder();

  if (Array.isArray(note)) {
    chordSynth.connect(recorder);
  } else {
    noteSynth.connect(recorder);
  }

  recorder.start();

  await Tone.start();
  if (Array.isArray(note)) {
    await playChord(note, duration);
  } else {
    const originalVolume = noteSynth.volume.value;
    noteSynth.volume.value = originalVolume + (note.volume || 0);
    noteSynth.triggerAttackRelease(note.note, duration);
    noteSynth.volume.value = originalVolume;
  }

  // Wait for the note to finish
  await new Promise((resolve) =>
    setTimeout(resolve, (duration + noteSynthSettings.envelope.release) * 1000)
  );

  const recording = await recorder.stop();
  recorder.dispose();

  return {
    blob: recording,
    filename: Array.isArray(note)
      ? `chord_${note.join("_")}.wav`
      : `note_${note.note.replace("#", "sharp")}.wav`,
  };
}

// Function to generate all notes and create ZIP
async function generateAllNotes() {
  const button = document.querySelector("#generateButton");
  button.disabled = true;
  button.textContent = "Generating...";

  try {
    await Tone.start();
    const zip = new JSZip();

    // Record notes
    for (const note of Object.values(cMajorScale)) {
      button.textContent = `Recording ${note.note}...`;
      const recording = await recordAudio(note, 1);
      zip.file(recording.filename, recording.blob);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    // Record chords
    for (const [chordName, chord] of Object.entries(chords)) {
      button.textContent = `Recording ${chordName} chord...`;
      const recording = await recordAudio(chord, 4);
      zip.file(recording.filename, recording.blob);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    // Generate and download ZIP
    button.textContent = "Creating ZIP file...";
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "synthesizer_sounds.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    button.textContent = "Download Complete!";
    setTimeout(() => {
      button.disabled = false;
      button.textContent = "Download audio files";
    }, 2000);
  } catch (error) {
    console.error("Error generating audio files:", error);
    button.textContent = "Error - Try Again";
    button.disabled = false;
  }
}

// Create UI elements
function createUI() {
  const container = document.createElement("div");
  container.style.textAlign = "center";

  // Generate button
  const generateButton = document.createElement("button");
  generateButton.id = "generateButton";
  generateButton.textContent = "Download audio files";
  generateButton.onclick = generateAllNotes;

  // Preview section
  const previewSection = document.createElement("div");
  previewSection.style.marginTop = "20px";

  // Preview buttons for single notes
  Object.entries(cMajorScale).forEach(([noteName, note]) => {
    const button = document.createElement("button");
    button.textContent = noteName;
    button.style.margin = "5px";
    button.onclick = () => {
      Tone.start();
      const originalVolume = noteSynth.volume.value;
      noteSynth.volume.value = originalVolume + note.volume;
      noteSynth.triggerAttackRelease(note.note, "0.5");
      noteSynth.volume.value = originalVolume;
    };
    previewSection.appendChild(button);
  });

  // Preview buttons for chords
  const chordSection = document.createElement("div");
  chordSection.style.marginTop = "20px";
  Object.entries(chords).forEach(([chordName, chord]) => {
    const button = document.createElement("button");
    button.textContent = chordName.toUpperCase();
    button.style.margin = "5px";
    button.onclick = () => {
      Tone.start();
      // Use the new playChord function for previews too
      playChord(chord, "4"); // 4 second chord duration
    };
    chordSection.appendChild(button);
  });
  previewSection.appendChild(chordSection);

  // Synth controls
  const controls = document.createElement("div");
  controls.style.marginTop = "20px";

  // Add oscillator type selector
  const oscSelector = document.createElement("select");
  ["sine", "triangle", "square", "sawtooth"].forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    oscSelector.appendChild(option);
  });
  oscSelector.value = "triangle";
  oscSelector.onchange = (e) => {
    noteSynth.set({
      oscillator: { type: e.target.value },
    });
    chordSynth.set({
      oscillator: { type: e.target.value },
    });
  };

  controls.appendChild(createLabel("Oscillator Type: ", oscSelector));

  container.appendChild(generateButton);
  container.appendChild(previewSection);
  container.appendChild(controls);
  document.body.appendChild(container);
}

// Helper function to create labeled controls
function createLabel(text, element) {
  const label = document.createElement("label");
  label.style.margin = "0 10px";
  label.textContent = text;
  label.appendChild(element);
  return label;
}

// Initialize UI when page loads
createUI();
