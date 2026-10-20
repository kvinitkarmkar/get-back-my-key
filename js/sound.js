
/* ============================================================
   SUCCESS SOUND
============================================================ */

function playSuccessSound() {

  try {

    const AudioCtx =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioCtx) {
      return;
    }


    if (!audioContext) {
      audioContext = new AudioCtx();
    }


    if (
      audioContext.state === "suspended"
    ) {
      audioContext.resume();
    }


    const now =
      audioContext.currentTime;


    const notes = [
      {
        frequency: 523.25,
        start: 0,
        duration: 0.18
      },
      {
        frequency: 659.25,
        start: 0.12,
        duration: 0.18
      },
      {
        frequency: 783.99,
        start: 0.24,
        duration: 0.28
      }
    ];


    notes.forEach(note => {

      const oscillator =
        audioContext.createOscillator();

      const gain =
        audioContext.createGain();


      oscillator.type =
        "sine";


      oscillator.frequency.setValueAtTime(
        note.frequency,
        now + note.start
      );


      gain.gain.setValueAtTime(
        0.0001,
        now + note.start
      );


      gain.gain.exponentialRampToValueAtTime(
        0.14,
        now + note.start + 0.025
      );


      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + note.start + note.duration
      );


      oscillator.connect(gain);
      gain.connect(audioContext.destination);


      oscillator.start(
        now + note.start
      );


      oscillator.stop(
        now +
        note.start +
        note.duration +
        0.02
      );

    });

  } catch (error) {

    console.warn(
      "Success sound unavailable:",
      error
    );

  }

}

