const resumeAudio = async () => {
    try {
        await Tone.start();
        document.removeEventListener("click", resumeAudio);
        document.removeEventListener("keydown", resumeAudio);
    } catch (err) {
        console.warn("Could not start AudioContext:", err);
    }
};

let synth = new Tone.PolySynth().toDestination();

// Efx
const delay = new Tone.FeedbackDelay({
    delayTime: "16n",
    feedback: 0.5,
});
const reverb = new Tone.Reverb({
    decay: 5,
    wet: 0.5,
});
const chorus = new Tone.Chorus({
    frequency: 4,
    delayTime: 2.5,
    depth: 0.5,
    wet: 0.5,
}).start();

// Notes
const whiteNotes = ["C", "D", "E", "F", "G", "A", "B"];
const blackNotes = ["C#", "D#", "F#", "G#", "A#"];
const blackPositions = [0, 1, 3, 4, 5];

// Octaves
const baseOctave = 4;

// Efx
const fx = () => {
    synth.disconnect();

    const delayCheckbox = document.getElementById("delay");
    const reverbCheckbox = document.getElementById("reverb");
    const chorusCheckbox = document.getElementById("chorus");

    let hasEffect = false;

    if (delayCheckbox.checked) {
        synth.connect(delay);
        hasEffect = true;
    }

    if (reverbCheckbox.checked) {
        synth.connect(reverb);
        hasEffect = true;
    }

    if (chorusCheckbox.checked) {
        synth.connect(chorus);
        hasEffect = true;
    }

    if (!hasEffect) {
        synth.connect(Tone.Destination);
    } else {
        if (delayCheckbox.checked) delay.connect(Tone.Destination);
        if (reverbCheckbox.checked) reverb.connect(Tone.Destination);
        if (chorusCheckbox.checked) chorus.connect(Tone.Destination);
    }
};

document.getElementById("delay").addEventListener("change", fx);
document.getElementById("reverb").addEventListener("change", fx);
document.getElementById("chorus").addEventListener("change", fx);

let html = "";

// Octaves
for (let octave = 0; octave < 1; octave++) {
    for (let i = 0; i < whiteNotes.length; i++) {
        const allWhiteNotes = whiteNotes[i];
        const left = (i + octave * 7) * 50;
        html += `<div class="whitenote" data-note="${allWhiteNotes + (octave + 4)}" style="left:${left}px;"></div>`;
    }

    const highCLeft = whiteNotes.length * 50;
    html += `<div class="whitenote" data-note="C${baseOctave + 1}" style="left:${highCLeft}px;"></div>`;


    for (let i = 0; i < blackNotes.length; i++) {
        const allBlackNotes = blackNotes[i];
        const left = (blackPositions[i] + octave * 7) * 50 + 35;
        html += `<div class="blacknote" data-note="${allBlackNotes + (octave + 4)}" style="left:${left}px;"></div>`;
    }
}

document.getElementById("container").innerHTML = html;

// Pressed key event listeners
document.querySelectorAll(".whitenote, .blacknote").forEach((key) => {
    key.addEventListener("mousedown", async (press) => {
        const note = press.target.dataset.note;
        await Tone.start();
        synth.triggerAttackRelease(note, "8n");

        press.target.classList.add("pressed");
    });

    key.addEventListener("mouseup", (press) => {
        press.target.classList.remove("pressed");
    });

    key.addEventListener("mouseleave", (press) => {
        press.target.classList.remove("pressed");
    });
});

const mapKeyboard = {
    a: "C",
    w: "C#",
    s: "D",
    e: "D#",
    d: "E",
    f: "F",
    t: "F#",
    g: "G",
    y: "G#",
    h: "A",
    u: "A#",
    j: "B",
    k: "C"
};

document.addEventListener("keydown", async (e) => {
    if (!mapKeyboard[e.key]) return;
    if (e.repeat) return;

    await Tone.start();

    let octaveOffset = e.key === "k" ? baseOctave + 1 : baseOctave;
    const note = mapKeyboard[e.key] + octaveOffset;

    synth.triggerAttack(note, Tone.now());

    const keyDiv = document.querySelector(`[data-note='${note}']`);
    if (keyDiv) keyDiv.classList.add("pressed");
});

document.addEventListener("keyup", (e) => {
    if (!mapKeyboard[e.key]) return;

    let octaveOffset = e.key === "k" ? baseOctave + 1 : baseOctave;
    const note = mapKeyboard[e.key] + octaveOffset;

    synth.triggerRelease(note, Tone.now());

    const keyDiv = document.querySelector(`[data-note='${note}']`);
    if (keyDiv) keyDiv.classList.remove("pressed");
});