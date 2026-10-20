
/* ============================================================
   CELEBRATION
============================================================ */

function showCelebration() {

  celebration.classList.add(
    "show"
  );


  startParticles();

}


function closeCelebrationScreen() {

  celebration.classList.remove(
    "show"
  );


  stopParticles();

}


closeCelebration.addEventListener(
  "click",
  closeCelebrationScreen
);


celebration.addEventListener(
  "click",
  event => {

    if (
      event.target === celebration
    ) {
      closeCelebrationScreen();
    }

  }
);


/* ============================================================
   PARTICLES
============================================================ */

function startParticles() {

  stopParticles();


  const canvas =
    particlesCanvas;

  const ctx =
    canvas.getContext("2d");


  let width =
    window.innerWidth;

  let height =
    window.innerHeight;


  canvas.width =
    width *
    window.devicePixelRatio;

  canvas.height =
    height *
    window.devicePixelRatio;


  ctx.setTransform(
    window.devicePixelRatio,
    0,
    0,
    window.devicePixelRatio,
    0,
    0
  );


  const particles =
    [];


  const particleCount =
    Math.min(
      150,
      Math.max(
        80,
        Math.floor(
          width / 4
        )
      )
    );


  for (
    let i = 0;
    i < particleCount;
    i++
  ) {

    particles.push({

      x:
        width / 2 +
        (Math.random() - 0.5) *
        90,

      y:
        height / 2 +
        (Math.random() - 0.5) *
        60,

      vx:
        (Math.random() - 0.5) *
        7,

      vy:
        (Math.random() - 0.5) *
        7 -
        2,

      size:
        Math.random() * 3 +
        1.5,

      rotation:
        Math.random() *
        Math.PI,

      rotationSpeed:
        (Math.random() - 0.5) *
        0.15,

      life:
        1,

      decay:
        Math.random() *
          0.012 +
        0.006

    });

  }


  function resize() {

    width =
      window.innerWidth;

    height =
      window.innerHeight;


    canvas.width =
      width *
      window.devicePixelRatio;

    canvas.height =
      height *
      window.devicePixelRatio;


    ctx.setTransform(
      window.devicePixelRatio,
      0,
      0,
      window.devicePixelRatio,
      0,
      0
    );

  }


  window.addEventListener(
    "resize",
    resize
  );


  function animate() {

    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    let alive =
      false;


    particles.forEach(p => {

      if (p.life <= 0) {
        return;
      }


      alive = true;


      p.x += p.vx;
      p.y += p.vy;

      p.vy += 0.055;

      p.rotation +=
        p.rotationSpeed;

      p.life -=
        p.decay;


      ctx.save();

      ctx.translate(
        p.x,
        p.y
      );

      ctx.rotate(
        p.rotation
      );


      ctx.globalAlpha =
        Math.max(
          0,
          p.life
        );


      ctx.fillStyle =
        p.life > 0.55
          ? "#60a5fa"
          : "#ffffff";


      ctx.fillRect(
        -p.size / 2,
        -p.size / 2,
        p.size,
        p.size * 1.8
      );


      ctx.restore();

    });


    if (alive) {

      particleAnimation =
        requestAnimationFrame(
          animate
        );

    }

  }


  animate();


  canvas._cleanup =
    () => {

      window.removeEventListener(
        "resize",
        resize
      );

    };

}


function stopParticles() {

  if (particleAnimation) {

    cancelAnimationFrame(
      particleAnimation
    );

    particleAnimation =
      null;

  }


  if (
    particlesCanvas._cleanup
  ) {

    particlesCanvas._cleanup();

    particlesCanvas._cleanup =
      null;

  }


  const ctx =
    particlesCanvas.getContext(
      "2d"
    );


  if (ctx) {

    ctx.clearRect(
      0,
      0,
      particlesCanvas.width,
      particlesCanvas.height
    );

  }

}

