import type { Difficulty } from '../types';

let audioContext: AudioContext | null = null;

// Initialize the AudioContext. Must be called after a user interaction.
export const initAudio = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume context if it was suspended
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
};

const playSound = (
    type: OscillatorType, 
    frequency: number, 
    duration: number, 
    volume: number, 
    pan: number = 0,
    rampToFrequency?: number,
    startTimeOffset: number = 0
) => {
    if (!audioContext) return;
    const time = audioContext.currentTime + startTimeOffset;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const pannerNode = audioContext.createStereoPanner();

    oscillator.connect(pannerNode);
    pannerNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = type;
    pannerNode.pan.setValueAtTime(pan, time);
    gainNode.gain.setValueAtTime(volume, time);
    oscillator.frequency.setValueAtTime(frequency, time);
    
    if (rampToFrequency) {
        oscillator.frequency.linearRampToValueAtTime(rampToFrequency, time + duration * 0.8);
    }
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

    oscillator.start(time);
    oscillator.stop(time + duration);
};

// A sound for when an asteroid appears, adapted to difficulty
export const playSpawnSound = (xPosition: number, screenWidth: number, difficulty: Difficulty = 'normal') => {
    const pan = (xPosition / screenWidth) * 2 - 1; // Pan sound based on spawn location
    
    let type: OscillatorType = 'triangle';
    let freq = 150;
    let duration = 0.2;
    let volume = 0.3;

    switch (difficulty) {
        case 'hard':
            type = 'sawtooth'; // Aggressive, buzzing sound
            freq = 120; // Lower, menacing base tone
            duration = 0.15; // Shorter, punchier
            volume = 0.2; 
            break;
        case 'easy':
            type = 'sine'; // Gentle sound
            freq = 180; 
            duration = 0.25; 
            break;
        case 'normal':
        default:
            type = 'triangle'; 
            freq = 150;
            duration = 0.2;
            break;
    }

    playSound(type, freq, duration, volume, pan);
};

// A "whoosh" for a close call, adapted to difficulty
export const playNearMissSound = (xPosition: number, screenWidth: number, difficulty: Difficulty = 'normal') => {
    const pan = (xPosition / screenWidth) * 2 - 1; 
    
    let freq = 800;
    let rampTo = 1200;
    let duration = 0.1;

    if (difficulty === 'hard') {
        freq = 1000;
        rampTo = 1500; // Sharper rise
        duration = 0.08; // Faster whoosh
    } else if (difficulty === 'easy') {
        freq = 600;
        rampTo = 900; // Slower rise
        duration = 0.15;
    }

    playSound('sine', freq, duration, 0.2, pan, rampTo);
};

// An explosive "crunch" for moon collision
export const playCollisionSound = () => {
    if (!audioContext) return;
    const time = audioContext.currentTime;

    // White noise for the "explosion" part
    const bufferSize = audioContext.sampleRate * 0.2; // 0.2 seconds of noise
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = buffer;
    
    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.4, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    noiseSource.connect(noiseGain);
    noiseGain.connect(audioContext.destination);

    // Low frequency thud
    const osc = audioContext.createOscillator();
    const oscGain = audioContext.createGain();
    osc.connect(oscGain);
    oscGain.connect(audioContext.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.2);
    oscGain.gain.setValueAtTime(0.6, time);
    oscGain.gain.linearRampToValueAtTime(0, time + 0.2);
    
    noiseSource.start(time);
    osc.start(time);

    noiseSource.stop(time + 0.2);
    osc.stop(time + 0.2);
};

// A dramatic, descending tone for game over
export const playGameOverSound = () => {
    if (!audioContext) return;
    const time = audioContext.currentTime;
    
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.5, time);
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(50, time + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    osc.start(time);
    osc.stop(time + 0.5);
};

// An uplifting, ascending tone for leveling up
export const playLevelUpSound = () => {
    if (!audioContext) return;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((note, i) => {
        playSound('triangle', note, 0.1, 0.2, 0, undefined, i * 0.07);
    });
};

// A positive, shimmering sound for collecting a power-up
export const playPowerUpCollectSound = () => {
    if (!audioContext) return;
    playSound('triangle', 880, 0.1, 0.3, 0, 1200, 0);
    playSound('triangle', 1108, 0.1, 0.3, 0, 1400, 0.05);
};

// A deep boom for the bomb power-up
export const playBombSound = () => {
    if (!audioContext) return;
    const time = audioContext.currentTime;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.type = 'sine';
    gain.gain.setValueAtTime(0.8, time);
    osc.frequency.setValueAtTime(100, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    osc.start(time);
    osc.stop(time + 0.5);
};

// A sharp "zap" sound when the shield blocks an asteroid
export const playShieldBlockSound = () => {
    if (!audioContext) return;
    playSound('square', 400, 0.1, 0.4, 0, 200);
    
    // add a little noise burst
    const time = audioContext.currentTime;
    const bufferSize = audioContext.sampleRate * 0.05;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = buffer;
    
    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.3, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    noiseSource.connect(noiseGain);
    noiseGain.connect(audioContext.destination);
    noiseSource.start(time);
    noiseSource.stop(time + 0.05);
};