const BACKGROUND_MUSIC_URL = "Dandelions.mp3"; // Путь к локальному MP3 файлу (файл должен быть в корне проекта)

document.addEventListener("DOMContentLoaded", () => {
  const launchFirework = initFireworks();
  initLeaves();
  initReveal();
  initFoxCompanion(launchFirework);
  initFoxRunner(launchFirework);
  initFoxFlight(launchFirework);
  initFoxSequence(launchFirework);
  initGamesCarousel();
  initLetterToggle();
  initHeroEffects();
  initBackgroundMusic();
  initHeroCelebration();
});

function initReveal() {
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (!revealEls.length) return;

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.2 }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }
}

function initLeaves() {
  const canvas = document.getElementById("leaf-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const leaves = [];
  const colors = ["#ffb48a", "#ff9f57", "#f3999f", "#ffd5a8", "#ffb879"];
  let leafCount = Math.min(24, Math.round(window.innerWidth / 55));

  let width = window.innerWidth;
  let height = window.innerHeight;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  };

  resize();

  class Leaf {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * -height;
      this.size = 18 + Math.random() * 24;
      this.speedY = 0.35 + Math.random() * 0.65;
      this.speedX = -0.35 + Math.random() * 0.7;
      this.swing = 0.15 + Math.random() * 0.25;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = -0.008 + Math.random() * 0.016;
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.speedX + Math.sin(this.rotation * 2) * this.swing;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;

      if (this.y > height + this.size) {
        this.reset();
        this.y = -this.size;
      }

      if (this.x > width + this.size) this.x = -this.size;
      if (this.x < -this.size) this.x = width + this.size;
    }

    draw(context) {
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.rotation);

      const gradient = context.createLinearGradient(-this.size, 0, this.size, 0);
      gradient.addColorStop(0, `${this.color}f0`);
      gradient.addColorStop(0.5, `${this.color}dd`);
      gradient.addColorStop(1, `${this.color}a6`);

      context.fillStyle = gradient;
      context.beginPath();
      context.moveTo(0, -this.size);
      context.bezierCurveTo(
        this.size * 0.75,
        -this.size * 0.8,
        this.size * 0.95,
        -this.size * 0.2,
        this.size * 0.2,
        this.size * 0.6
      );
      context.quadraticCurveTo(0, this.size * 1.05, -this.size * 0.2, this.size * 0.6);
      context.bezierCurveTo(
        -this.size * 0.95,
        -this.size * 0.2,
        -this.size * 0.75,
        -this.size * 0.8,
        0,
        -this.size
      );
      context.closePath();
      context.fill();

      context.strokeStyle = "rgba(255,255,255,0.25)";
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(0, -this.size * 0.95);
      context.lineTo(0, this.size * 0.7);
      context.stroke();

      context.lineWidth = 1;
      context.strokeStyle = "rgba(255,255,255,0.18)";
      context.beginPath();
      context.moveTo(0, -this.size * 0.2);
      context.lineTo(this.size * 0.28, this.size * 0.2);
      context.moveTo(0, -this.size * 0.1);
      context.lineTo(-this.size * 0.28, this.size * 0.2);
      context.stroke();

      context.restore();
    }
  }

  const resetLeaves = () => {
    leaves.length = 0;
    for (let i = 0; i < leafCount; i += 1) {
      leaves.push(new Leaf());
    }
  };

  resetLeaves();

  const render = () => {
    ctx.clearRect(0, 0, width, height);
    leaves.forEach((leaf) => {
      leaf.update();
      leaf.draw(ctx);
    });
    requestAnimationFrame(render);
  };

  window.addEventListener("resize", () => {
    resize();
    leafCount = Math.min(36, Math.round(window.innerWidth / 40));
    resetLeaves();
  });

  render();
}

function initFoxCompanion(launchFirework) {
  const wrapper = document.querySelector("[data-fox]");
  if (!wrapper) return;

  const avatar = wrapper.querySelector(".fox-avatar");
  const speech = wrapper.querySelector(".fox-speech");
  const shadow = wrapper.querySelector(".fox-shadow");

  const messages = [
    "Я Нори. С днём рождения!",
    "Где-то тут было письмо...",
    "Так много листьев.",
    "Откуда здесь цветы?",
    "Что за кнопка в углу?",
    "Устроим салют!",
    "Сыграем в игру?",
  ];

  const state = {
    x: window.innerWidth * 0.2,
    y: window.innerHeight * 0.65,
    vx: 0,
    vy: 0,
    targetX: null,
    targetY: null,
    idle: 0,
    isLocked: false,
    lockedX: null,
    lockedY: null,
    lastMusicMessageTime: 0, // Время последнего показа сообщения о музыке
  };

  let lastTime = performance.now();
  let speechTimer = null;

  // Проверка, запущена ли игра
  const checkGamesRunning = () => {
    const runnerCanvas = document.querySelector("#fox-runner-canvas");
    const flightCanvas = document.querySelector("#fox-flight-canvas");
    
    // Простая проверка - если есть canvas, проверяем по другому способу
    // Используем глобальные флаги из игр
    return window.gameRunnerActive || window.gameFlightActive || false;
  };

  // Функции блокировки/разблокировки
  const lockNori = (x, y) => {
    state.isLocked = true;
    state.lockedX = x;
    state.lockedY = y;
    state.targetX = null;
    state.targetY = null;
    state.vx = 0;
    state.vy = 0;
    if (speech) speech.hidden = true;
    clearTimeout(speechTimer);
  };

  const unlockNori = () => {
    state.isLocked = false;
    state.lockedX = null;
    state.lockedY = null;
  };

  // Экспортируем API для игр
  window.foxCompanionControl = {
    lock: () => {
      const { width, height } = bounds();
      lockNori(width * 0.08, height * 0.88);
    },
    unlock: unlockNori,
  };

  const say = (text, duration = 2200) => {
    if (!speech || state.isLocked) return; // Не говорим когда заблокирован
    clearTimeout(speechTimer);
    speech.textContent = text;
    speech.hidden = false;
    speechTimer = setTimeout(() => {
      speech.hidden = true;
    }, duration);
  };

  const updateTransform = () => {
    wrapper.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
    const tilt = Math.max(-6, Math.min(6, state.vx / 12));
    avatar.style.transform = `rotate(${tilt}deg)`;
    const stretch = Math.max(0.82, Math.min(1.1, 1 - Math.abs(state.vx) / 320));
    shadow.style.transform = `scaleX(${stretch})`;
  };

  const bounds = () => ({ width: window.innerWidth, height: window.innerHeight });

  const pickRandomTarget = () => {
    if (state.isLocked) return;
    const { width, height } = bounds();
    // Нори может свободно гулять по всему экрану когда игры не запущены
    state.targetX = width * (0.1 + Math.random() * 0.8);
    state.targetY = height * (0.2 + Math.random() * 0.6);
  };

  const step = (time) => {
    const delta = Math.min(0.06, (time - lastTime) / 1000);
    lastTime = time;

    const { width, height } = bounds();
    const margin = 60;

    // Если заблокирован, перемещаем к закрепленной позиции
    if (state.isLocked && state.lockedX !== null && state.lockedY !== null) {
      const dx = state.lockedX - state.x;
      const dy = state.lockedY - state.y;
      state.x += dx * 0.1;
      state.y += dy * 0.1;
      if (Math.hypot(dx, dy) < 2) {
        state.x = state.lockedX;
        state.y = state.lockedY;
      }
      updateTransform();
      requestAnimationFrame(step);
      return;
    }

    // Обычное движение (только если не заблокирован)
    if (state.targetX !== null && state.targetY !== null) {
      const dx = state.targetX - state.x;
      const dy = state.targetY - state.y;
      state.vx += dx * 3 * delta;
      state.vy += dy * 3 * delta;
      if (Math.hypot(dx, dy) < 12) {
        state.targetX = null;
        state.targetY = null;
      }
    } else {
      state.vx += (Math.random() - 0.5) * 20 * delta;
      state.vy += (Math.random() - 0.5) * 16 * delta;
    }

    state.vx *= 0.9;
    state.vy *= 0.9;

    state.x += state.vx * delta;
    state.y += state.vy * delta;

    // Границы экрана
    if (state.x < margin) {
      state.x = margin;
      state.vx = Math.abs(state.vx);
      say("Край! Вернусь обратно", 1600);
    } else if (state.x > width - margin) {
      state.x = width - margin;
      state.vx = -Math.abs(state.vx);
      say("Там слишком далеко", 1600);
    }

    if (state.y < margin) {
      state.y = margin;
      state.vy = Math.abs(state.vy) * 0.6;
    } else if (state.y > height - margin) {
      state.y = height - margin;
      state.vy = -Math.abs(state.vy) * 0.6;
    }

    if (state.targetX === null && state.targetY === null && !state.isLocked) {
      state.idle += delta;
      if (state.idle > 6) {
        pickRandomTarget();
        state.idle = 0;
      }
    } else {
      state.idle = 0;
    }

    if (Math.random() < 0.002 && typeof launchFirework === "function" && !state.isLocked) {
      launchFirework(state.x + 20, state.y - 60, { size: 0.8, hueShift: (Math.random() - 0.5) * 80 });
    }

    updateTransform();
    requestAnimationFrame(step);
  };

  // Блокируем Нори при клике на любую кнопку
  const handleButtonClick = (event) => {
    const target = event.target;
    // Проверяем, является ли клик на кнопку или внутри кнопки
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      if (!state.isLocked) {
        const { width, height } = bounds();
        lockNori(width * 0.08, height * 0.88);
        // Разблокируем через 2 секунды после клика
        setTimeout(() => {
          unlockNori();
        }, 2000);
      }
    }
  };

  // Отслеживаем клики на кнопки
  document.addEventListener("click", handleButtonClick, true);
  document.addEventListener("pointerdown", handleButtonClick, true);

  document.addEventListener("pointerdown", (event) => {
    // Пропускаем клики на кнопки
    if (event.target.tagName === 'BUTTON' || event.target.closest('button')) {
      return;
    }
    
    if (state.isLocked) return; // Не реагируем на клики если заблокирован
    const { width, height } = bounds();
    // Нори может идти куда угодно
    state.targetX = Math.max(60, Math.min(event.clientX, width - 60));
    state.targetY = Math.max(60, Math.min(event.clientY, height - 60));
    state.idle = 0;
    if (Math.random() < 0.4) {
      say(messages[Math.floor(Math.random() * messages.length)], 2200);
    }
    if (typeof launchFirework === "function" && Math.random() < 0.35) {
      launchFirework(event.clientX, event.clientY - 60, { size: 0.9, hueShift: (Math.random() - 0.5) * 90 });
    }
  });

  avatar.addEventListener("click", (event) => {
    event.stopPropagation();
    if (state.isLocked) return; // Не реагируем если заблокирован
    
    // Показываем сообщение о музыке только с вероятностью 20% и не чаще раза в 30 секунд
    const now = Date.now();
    const timeSinceLastMusicMessage = now - state.lastMusicMessageTime;
    const shouldShowMusicMessage = Math.random() < 0.2 && timeSinceLastMusicMessage > 10000;
    
    if (shouldShowMusicMessage) {
      say("Не забыли включить музыку?", 2400);
      state.lastMusicMessageTime = now;
    } else {
      // Показываем обычные случайные сообщения
      say(messages[Math.floor(Math.random() * messages.length)], 2200);
    }
    
    if (typeof launchFirework === "function") {
      launchFirework(state.x, state.y - 80, { size: 1.2, hueShift: 20 });
    }
    state.targetX = null;
    state.targetY = null;
  });

  window.addEventListener("resize", () => {
    state.x = Math.min(state.x, window.innerWidth - 60);
    state.y = Math.min(state.y, window.innerHeight - 60);
    updateTransform();
  });

  setTimeout(() => {
    say("Я Нори. С днём рождения!", 2600);
    if (typeof launchFirework === "function") {
      launchFirework(state.x + 30, state.y - 80, { size: 1.1, hueShift: 15 });
    }
  }, 700);

  updateTransform();
  requestAnimationFrame(step);
}

function initFoxRunner(launchFirework) {
  const section = document.querySelector("[data-fox-runner]");
  if (!section) return;

  const canvas = section.querySelector("#fox-runner-canvas");
  const startButton = section.querySelector("[data-runner-start]");
  const scoreEl = section.querySelector("[data-runner-score]");
  const bestEl = section.querySelector("[data-runner-best]");
  const messageEl = section.querySelector("[data-runner-message]");

  if (!canvas || !startButton || !scoreEl || !bestEl) return;

  const ctx = canvas.getContext("2d");
  const stage = canvas.parentElement;
  const ui = { scoreEl, bestEl, messageEl };
  
  // Локальная переменная для обработчиков
  let localHandleKeyUp = null;

  let backgroundGradient = null;

  const state = {
    running: false,
    obstacles: [],
    bonuses: [],
    clouds: [],
    lastTime: 0,
    score: 0,
    best: parseInt(localStorage.getItem("foxRunnerBest") || "0", 10),
    speed: 180,
    baseSpeed: 180,
    spawnTimer: 0,
    bonusSpawnTimer: 0,
    ground: 0,
    fox: {
      x: 80,
      y: 0,
      width: 50,
      height: 42,
      vy: 0,
      jumps: 0,
      glow: 0,
      ducking: false,
      frame: 0,
    },
    nextFirework: 250,
    invincible: 0,
  };

  const metrics = {
    width: canvas.width,
    height: canvas.height,
    dpr: 1,
  };

  const GRAVITY = 1400;
  const JUMP_FORCE = 520;
  const DUCK_FORCE = 380;

  const pad = (value) => String(Math.floor(value)).padStart(3, "0");

  const updateScoreUI = () => {
    ui.scoreEl.textContent = pad(state.score);
    ui.bestEl.textContent = pad(state.best);
  };

  updateScoreUI();

  const resizeCanvas = () => {
    // Увеличиваем размер для телефонов
    const stageRect = stage.getBoundingClientRect();
    const hostWidth = Math.max(380, Math.min(900, Math.floor(stageRect.width - 32)));
    const hostHeight = Math.max(240, Math.round(hostWidth * 0.36));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = hostWidth * dpr;
    canvas.height = hostHeight * dpr;
    canvas.style.width = `${hostWidth}px`;
    canvas.style.height = `${hostHeight}px`;

    metrics.width = hostWidth;
    metrics.height = hostHeight;
    metrics.dpr = dpr;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    state.ground = hostHeight - 52;
    state.fox.x = hostWidth * 0.18;
    if (!state.running) {
      state.fox.y = state.ground - state.fox.height;
    }

    backgroundGradient = ctx.createLinearGradient(0, 0, 0, metrics.height);
    backgroundGradient.addColorStop(0, "#fef5f9");
    backgroundGradient.addColorStop(1, "#fef6fa");
  };

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const resetGame = () => {
    state.running = true;
    state.obstacles.length = 0;
    state.bonuses.length = 0;
    state.clouds.length = 0;
    state.lastTime = performance.now();
    state.score = 0;
    state.speed = 180;
    state.baseSpeed = 180;
    state.spawnTimer = 0.8;
    state.bonusSpawnTimer = 3.5;
    state.nextFirework = 250;
    state.fox.vy = 0;
    state.fox.jumps = 0;
    state.fox.glow = 0;
    state.fox.ducking = false;
    state.fox.frame = 0;
    state.fox.y = state.ground - state.fox.height;
    state.invincible = 0;
    updateScoreUI();
    if (ui.messageEl) {
      ui.messageEl.textContent = "";
    }
  };

  const stopGame = (reason) => {
    state.running = false;
    cancelAnimationFrame(state.frameId);
    state.frameId = null;
    state.best = Math.max(state.best, Math.floor(state.score));
    localStorage.setItem("foxRunnerBest", String(state.best));
    updateScoreUI();
    if (ui.messageEl) {
      ui.messageEl.textContent = reason || "Давай попробуем ещё раз";
    }
    // Разблокируем основную Нори
    window.gameRunnerActive = false;
    if (window.foxCompanionControl && typeof window.foxCompanionControl.unlock === "function") {
      window.foxCompanionControl.unlock();
    }
  };

  const jump = () => {
    if (!state.running) {
      // Запуск игры через jump - автоматически
      resetGame();
      state.frameId = requestAnimationFrame(step);
      window.gameRunnerActive = true;
      if (window.foxCompanionControl && typeof window.foxCompanionControl.lock === "function") {
        window.foxCompanionControl.lock();
      }
      return;
    }

    const isOnGround = state.fox.y >= state.ground - state.fox.height - 2;
    if (isOnGround) {
      state.fox.vy = -JUMP_FORCE;
      state.fox.jumps = 1;
      state.fox.glow = 1;
      state.fox.ducking = false;
    } else if (state.fox.jumps < 2) {
      state.fox.vy = -JUMP_FORCE * 0.82;
      state.fox.jumps += 1;
      state.fox.glow = 1;
    }
  };

  const duck = (isDucking) => {
    if (!state.running) return;
    state.fox.ducking = isDucking;
    if (isDucking && state.fox.y >= state.ground - state.fox.height - 2) {
      state.fox.height = 28;
    } else if (!isDucking) {
      state.fox.height = 42;
    }
  };

  // Типы препятствий в стиле динозаврика
  const obstacleTypes = ['cactus', 'stone', 'bush', 'log'];
  
  const spawnObstacle = () => {
    const difficulty = Math.min(1.5, 1 + state.score / 600);
    // Увеличиваем расстояние между препятствиями
    const baseGap = 320 + Math.random() * 280;
    const gap = Math.max(280, baseGap / difficulty);
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    
    let width, height;
    switch(type) {
      case 'cactus':
        width = 24 + Math.random() * 12;
        height = 32 + Math.random() * 24;
        break;
      case 'stone':
        width = 32 + Math.random() * 16;
        height = 24 + Math.random() * 16;
        break;
      case 'bush':
        width = 40 + Math.random() * 20;
        height = 22 + Math.random() * 14;
        break;
      case 'log':
        width = 38 + Math.random() * 18;
        height = 28 + Math.random() * 12;
        break;
      default:
        width = 30;
        height = 30;
    }
    
    state.obstacles.push({
      x: metrics.width + width,
      y: state.ground - height,
      width,
      height,
      type,
      scored: false,
    });
    state.spawnTimer = Math.max(1.0, gap / state.speed);
  };

  const spawnBonus = () => {
    if (Math.random() < 0.3) { // 30% шанс появления бонуса
      const bonusTypes = ['star', 'coin', 'shield'];
      const type = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
      state.bonuses.push({
        x: metrics.width + 30,
        y: state.ground - 40 - Math.random() * 20,
        radius: 12,
        type,
        rotation: 0,
        collected: false,
      });
    }
    state.bonusSpawnTimer = 4 + Math.random() * 3;
  };

  const spawnCloud = () => {
    if (Math.random() < 0.4) {
      state.clouds.push({
        x: metrics.width + 40,
        y: 30 + Math.random() * 40,
        width: 50 + Math.random() * 30,
        height: 20 + Math.random() * 15,
        speed: 0.3 + Math.random() * 0.2,
      });
    }
  };

  const drawBackground = () => {
    // Небо
    ctx.fillStyle = backgroundGradient || "#fef5f9";
    ctx.fillRect(0, 0, metrics.width, metrics.height);

    // Облака
    state.clouds.forEach((cloud) => {
      ctx.fillStyle = "rgba(245, 182, 193, 0.2)";
      ctx.beginPath();
      ctx.ellipse(cloud.x, cloud.y, cloud.width * 0.4, cloud.height * 0.6, 0, 0, Math.PI * 2);
      ctx.ellipse(cloud.x + cloud.width * 0.3, cloud.y, cloud.width * 0.5, cloud.height * 0.7, 0, 0, Math.PI * 2);
      ctx.ellipse(cloud.x + cloud.width * 0.6, cloud.y, cloud.width * 0.4, cloud.height * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Земля
    ctx.fillStyle = "rgba(254, 245, 250, 0.9)";
    ctx.fillRect(0, state.ground, metrics.width, metrics.height - state.ground);

    // Трава
    ctx.fillStyle = "rgba(245, 168, 201, 0.4)";
    ctx.fillRect(0, state.ground, metrics.width, 3);

    // Линия горизонта
    ctx.strokeStyle = "rgba(232, 90, 138, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, state.ground);
    ctx.lineTo(metrics.width, state.ground);
    ctx.stroke();
  };

  const roundedRect = (x, y, width, height, radius) => {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const drawFox = () => {
    const fox = state.fox;
    fox.frame += 0.15;
    
    if (fox.glow > 0) {
      fox.glow = Math.max(0, fox.glow - 0.04);
    }
    const glowAlpha = 0.35 * fox.glow;
    if (glowAlpha > 0) {
      const glowGrad = ctx.createRadialGradient(
        fox.x + fox.width / 2,
        fox.y + fox.height / 2,
        8,
        fox.x + fox.width / 2,
        fox.y + fox.height / 2,
        90
      );
      glowGrad.addColorStop(0, `rgba(255, 214, 190, ${glowAlpha})`);
      glowGrad.addColorStop(1, "rgba(255, 214, 190, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(fox.x - 40, fox.y - 40, fox.width + 80, fox.height + 80);
    }

    // Эффект неуязвимости
    if (state.invincible > 0) {
      ctx.globalAlpha = Math.sin(state.invincible * 20) * 0.3 + 0.7;
    }

    if (fox.ducking) {
      // Присевшая поза - минималистично
      ctx.fillStyle = "#ff9d5c";
      roundedRect(fox.x, fox.y + fox.height - 28, fox.width, 28, 8);
      ctx.fill();

      // Голова
      ctx.fillStyle = "#ffb87a";
      ctx.beginPath();
      ctx.arc(fox.x + fox.width * 0.5, fox.y + fox.height - 28, fox.width * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Глаз
      ctx.fillStyle = "#1a1230";
      ctx.beginPath();
      ctx.arc(fox.x + fox.width * 0.55, fox.y + fox.height - 30, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Обычная поза бега - минималистично
      const runPhase = Math.sin(fox.frame);
      const isJumping = fox.y < state.ground - fox.height - 10;
      
      // Тело (более теплый оранжевый)
      ctx.fillStyle = "#ff9d5c";
      roundedRect(fox.x, fox.y, fox.width, fox.height, 10);
      ctx.fill();

      // Голова
      ctx.fillStyle = "#ffb87a";
      ctx.beginPath();
      ctx.arc(fox.x + fox.width * 0.62, fox.y + fox.height * 0.3, fox.width * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Глаз
      ctx.fillStyle = "#1a1230";
      ctx.beginPath();
      ctx.arc(fox.x + fox.width * 0.64, fox.y + fox.height * 0.32, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Лапки (минималистично, более темный оттенок)
      ctx.fillStyle = "#ff7a2e";
      if (isJumping) {
        roundedRect(fox.x + fox.width * 0.2, fox.y + fox.height - 5, 6, 5, 2);
        roundedRect(fox.x + fox.width * 0.7, fox.y + fox.height - 5, 6, 5, 2);
      } else if (runPhase > 0) {
        roundedRect(fox.x + fox.width * 0.2, fox.y + fox.height - 7, 7, 7, 2);
        roundedRect(fox.x + fox.width * 0.7, fox.y + fox.height - 3, 7, 7, 2);
      } else {
        roundedRect(fox.x + fox.width * 0.2, fox.y + fox.height - 3, 7, 7, 2);
        roundedRect(fox.x + fox.width * 0.7, fox.y + fox.height - 7, 7, 7, 2);
      }
    }

    ctx.globalAlpha = 1.0;
  };

  const drawObstacles = () => {
    state.obstacles.forEach((obs) => {
      switch(obs.type) {
        case 'cactus':
          drawCactus(ctx, obs);
          break;
        case 'stone':
          drawStone(ctx, obs);
          break;
        case 'bush':
          drawBush(ctx, obs);
          break;
        case 'log':
          drawLog(ctx, obs);
          break;
      }
    });
  };

  const drawCactus = (ctx, obj) => {
    // Кактус
    ctx.fillStyle = "#4a8c5a";
    roundedRect(obj.x, obj.y, obj.width, obj.height, 4);
    ctx.fill();
    
    // Колючки
    ctx.strokeStyle = "#3a6b48";
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const y = obj.y + (obj.height / 4) * (i + 1);
      ctx.beginPath();
      ctx.moveTo(obj.x + obj.width * 0.2, y);
      ctx.lineTo(obj.x + obj.width * 0.15, y - 3);
      ctx.moveTo(obj.x + obj.width * 0.8, y);
      ctx.lineTo(obj.x + obj.width * 0.85, y - 3);
      ctx.stroke();
    }
  };

  const drawStone = (ctx, obj) => {
    // Камень
    const grad = ctx.createRadialGradient(obj.x + obj.width * 0.3, obj.y + obj.height * 0.3, 0, obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width);
    grad.addColorStop(0, "#7a7568");
    grad.addColorStop(1, "#5a5548");
    ctx.fillStyle = grad;
    roundedRect(obj.x, obj.y, obj.width, obj.height, obj.width * 0.3);
    ctx.fill();
  };

  const drawBush = (ctx, obj) => {
    // Куст
    ctx.fillStyle = "#6a9a7a";
    ctx.beginPath();
    ctx.ellipse(obj.x + obj.width * 0.3, obj.y + obj.height * 0.6, obj.width * 0.35, obj.height * 0.5, 0, 0, Math.PI * 2);
    ctx.ellipse(obj.x + obj.width * 0.7, obj.y + obj.height * 0.6, obj.width * 0.35, obj.height * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5a8a6a";
    ctx.beginPath();
    ctx.ellipse(obj.x + obj.width * 0.5, obj.y + obj.height * 0.4, obj.width * 0.4, obj.height * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawLog = (ctx, obj) => {
    // Бревно
    const grad = ctx.createLinearGradient(obj.x, obj.y, obj.x + obj.width, obj.y);
    grad.addColorStop(0, "#8b6f47");
    grad.addColorStop(1, "#6b4f27");
    ctx.fillStyle = grad;
    roundedRect(obj.x, obj.y, obj.width, obj.height, obj.height * 0.4);
    ctx.fill();
    // Кольца
    ctx.strokeStyle = "#5a3f17";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(obj.x + (obj.width / 4) * i, obj.y + obj.height / 2, obj.height * 0.4, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const drawBonuses = () => {
    const time = performance.now() * 0.005;
    state.bonuses.forEach((bonus) => {
      if (bonus.collected) return;
      
      bonus.rotation += 0.1;
      const pulse = Math.sin(time * 2 + bonus.x * 0.05) * 0.2 + 0.8;

      ctx.save();
      ctx.translate(bonus.x, bonus.y);
      ctx.rotate(bonus.rotation);

      if (bonus.type === 'star') {
        ctx.fillStyle = `rgba(255, 215, 0, ${0.9 * pulse})`;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const x = Math.cos(angle) * bonus.radius;
          const y = Math.sin(angle) * bonus.radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      } else if (bonus.type === 'coin') {
        ctx.fillStyle = `rgba(255, 193, 7, ${0.9 * pulse})`;
        ctx.beginPath();
        ctx.arc(0, 0, bonus.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (bonus.type === 'shield') {
        ctx.fillStyle = `rgba(100, 180, 255, ${0.9 * pulse})`;
        ctx.beginPath();
        ctx.arc(0, 0, bonus.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(0, 0, bonus.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  };

  const detectCollision = (obs) => {
    if (state.invincible > 0) return false;
    
    const fox = state.fox;
    const foxLeft = fox.x + 8;
    const foxRight = fox.x + fox.width - 8;
    const foxTop = fox.y + 4;
    const foxBottom = fox.y + fox.height;

    const obsLeft = obs.x + 4;
    const obsRight = obs.x + obs.width - 4;
    const obsTop = obs.y;
    const obsBottom = obs.y + obs.height;

    return !(
      foxRight < obsLeft ||
      foxLeft > obsRight ||
      foxBottom < obsTop ||
      foxTop > obsBottom
    );
  };

  const detectBonusCollision = (bonus) => {
    const fox = state.fox;
    const foxCenterX = fox.x + fox.width / 2;
    const foxCenterY = fox.y + fox.height / 2;
    const dist = Math.hypot(bonus.x - foxCenterX, bonus.y - foxCenterY);
    return dist < bonus.radius + fox.width * 0.4;
  };

  const render = () => {
    drawBackground();
    drawObstacles();
    drawBonuses();
    drawFox();

    ctx.fillStyle = "rgba(45, 27, 61, 0.8)";
    ctx.font = "600 20px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Очки: ${pad(state.score)}`, 18, 32);
    
    if (state.invincible > 0) {
      ctx.fillStyle = "rgba(184, 113, 230, 0.8)";
      ctx.font = "600 14px Inter, sans-serif";
      ctx.fillText("Щит активен!", 18, 52);
    }
  };

  const step = (time) => {
    if (!state.running) return;

    const delta = Math.min((time - state.lastTime) / 1000, 0.05);
    state.lastTime = time;

    // Увеличение скорости со временем
    const difficultyBoost = 1 + state.score / 500;
    state.baseSpeed = 180 + state.score / 20;
    state.speed = state.baseSpeed * Math.min(1.8, difficultyBoost);

    // Спавн препятствий
    state.spawnTimer -= delta;
    if (state.spawnTimer <= 0) {
      spawnObstacle();
    }

    // Спавн бонусов
    state.bonusSpawnTimer -= delta;
    if (state.bonusSpawnTimer <= 0) {
      spawnBonus();
    }

    // Спавн облаков
    if (Math.random() < 0.01) {
      spawnCloud();
    }

    // Движение препятствий
    state.obstacles.forEach((obs) => {
      obs.x -= state.speed * delta;
      if (!obs.scored && obs.x + obs.width < state.fox.x) {
        obs.scored = true;
        state.score += 10;
        if (state.score >= state.nextFirework && typeof launchFirework === "function") {
          launchFirework(state.fox.x + 120, state.fox.y - 120, { size: 0.9, hueShift: 30 });
          state.nextFirework += 200;
        }
      }
    });

    state.obstacles = state.obstacles.filter((obs) => obs.x + obs.width > -60);

    // Движение бонусов
    state.bonuses.forEach((bonus) => {
      bonus.x -= state.speed * delta;
      if (!bonus.collected && detectBonusCollision(bonus)) {
        bonus.collected = true;
        if (bonus.type === 'star') {
          state.score += 50;
        } else if (bonus.type === 'coin') {
          state.score += 25;
        } else if (bonus.type === 'shield') {
          state.invincible = 3; // 3 секунды неуязвимости
        }
        if (typeof launchFirework === "function") {
          launchFirework(bonus.x, bonus.y, { size: 0.7, hueShift: 40 });
        }
      }
    });

    state.bonuses = state.bonuses.filter((bonus) => !bonus.collected && bonus.x + bonus.radius > -40);

    // Движение облаков
    state.clouds.forEach((cloud) => {
      cloud.x -= cloud.speed * state.speed * delta;
    });
    state.clouds = state.clouds.filter((cloud) => cloud.x + cloud.width > -100);

    // Физика Нори
    state.fox.vy += GRAVITY * delta;
    state.fox.y += state.fox.vy * delta;

    if (state.fox.y >= state.ground - state.fox.height) {
      state.fox.y = state.ground - state.fox.height;
      state.fox.vy = 0;
      state.fox.jumps = 0;
    }

    // Обновление неуязвимости
    if (state.invincible > 0) {
      state.invincible -= delta;
    }

    // Проверка столкновений
    for (let i = 0; i < state.obstacles.length; i += 1) {
      if (detectCollision(state.obstacles[i])) {
        const obsName = state.obstacles[i].type === 'cactus' ? 'кактус' :
                       state.obstacles[i].type === 'stone' ? 'камень' :
                       state.obstacles[i].type === 'bush' ? 'куст' : 'бревно';
        stopGame(`${obsName} остановил Нори — попробуем снова?`);
        return;
      }
    }

    // Очки за выживание
    state.score += delta * (5 + difficultyBoost * 2);
    updateScoreUI();

    render();
    state.frameId = requestAnimationFrame(step);
  };

  const startGame = () => {
    resetGame();
    state.frameId = requestAnimationFrame(step);
    // Блокируем основную Нори
    window.gameRunnerActive = true;
    if (window.foxCompanionControl && typeof window.foxCompanionControl.lock === "function") {
      window.foxCompanionControl.lock();
    }
  };

  startButton.addEventListener("click", () => {
    if (state.running) return;
    startGame();
  });

  const handleKey = (event) => {
    if (event.repeat) return;
    const key = event.key?.toLowerCase();
    if (key === " " || key === "arrowup" || key === "w") {
      event.preventDefault();
      jump();
    } else if (key === "arrowdown" || key === "s") {
      event.preventDefault();
      duck(true);
    } else if (key === "enter" && !state.running) {
      startGame();
    }
  };

  localHandleKeyUp = (event) => {
    const key = event.key?.toLowerCase();
    if (key === "arrowdown" || key === "s") {
      event.preventDefault();
      duck(false);
    }
  };

  document.addEventListener("keydown", handleKey);
  document.addEventListener("keyup", localHandleKeyUp);

  const handlePointer = (event) => {
    event.preventDefault();
    jump();
  };

  // На телефоне делаем весь stage кликабельным для большей области
  if (window.innerWidth <= 720) {
    stage.addEventListener("pointerdown", handlePointer);
    stage.addEventListener("touchstart", handlePointer, { passive: false });
  } else {
    canvas.addEventListener("pointerdown", handlePointer);
    canvas.addEventListener("touchstart", handlePointer, { passive: false });
  }

  if (ui.messageEl) {
    ui.messageEl.textContent = "Нажми старт или коснись поля, чтобы побежать";
  }

  render();
}

function initFoxFlight(launchFirework) {
  const section = document.querySelector("[data-fox-flight]");
  if (!section) return;

  const canvas = section.querySelector("#fox-flight-canvas");
  const startButton = section.querySelector("[data-flight-start]");
  const scoreEl = section.querySelector("[data-flight-score]");
  const bestEl = section.querySelector("[data-flight-best]");
  const messageEl = section.querySelector("[data-flight-message]");

  if (!canvas || !scoreEl || !bestEl) return;

  const ctx = canvas.getContext("2d");
  const stage = canvas.parentElement;
  const ui = { scoreEl, bestEl, messageEl };

  const state = {
    running: false,
    pipes: [],
    coins: [],
    lastTime: 0,
    score: 0,
    best: parseInt(localStorage.getItem("foxFlightBest") || "0", 10),
    speed: 160,
    spawnTimer: 0,
    coinSpawnTimer: 0,
    gap: 200,
    fox: {
      x: 0,
      y: 0,
      vy: 0,
      radius: 22,
      wing: 0,
      angle: 0,
    },
  };

  const metrics = {
    width: canvas.width,
    height: canvas.height,
    dpr: 1,
  };

  let backgroundGradient = null;

  const GRAVITY = 820;
  const FLAP_FORCE = 320;

  const pad = (value) => String(Math.floor(value)).padStart(3, "0");

  const updateScoreUI = () => {
    ui.scoreEl.textContent = pad(state.score);
    ui.bestEl.textContent = pad(state.best);
  };

  const resizeCanvas = () => {
    // Увеличиваем размер для телефонов - еще больше для второй игры
    const stageRect = stage.getBoundingClientRect();
    const hostWidth = Math.max(420, Math.min(900, Math.floor(stageRect.width - 32)));
    const hostHeight = Math.round(hostWidth * (9 / 16));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = hostWidth * dpr;
    canvas.height = hostHeight * dpr;
    canvas.style.width = `${hostWidth}px`;
    canvas.style.height = `${hostHeight}px`;

    metrics.width = hostWidth;
    metrics.height = hostHeight;
    metrics.dpr = dpr;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    backgroundGradient = ctx.createLinearGradient(0, 0, 0, metrics.height);
    backgroundGradient.addColorStop(0, "#fef5f9");
    backgroundGradient.addColorStop(1, "#fef6fa");

    state.fox.x = metrics.width * 0.26;
    if (!state.running) {
      state.fox.y = metrics.height * 0.5;
      state.fox.vy = 0;
    }
  };

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const resetGame = () => {
    state.running = true;
    state.pipes.length = 0;
    state.coins.length = 0;
    state.lastTime = performance.now();
    state.score = 0;
    state.speed = 160;
    state.spawnTimer = 1.4;
    state.coinSpawnTimer = 0.8;
    state.gap = Math.max(150, metrics.height * 0.42);
    state.fox.y = metrics.height * 0.5;
    state.fox.vy = 0;
    state.fox.wing = 0;
    state.fox.angle = 0;
    updateScoreUI();
    if (ui.messageEl) {
      ui.messageEl.textContent = "Поддерживай Нори в воздухе — кликай по небу";
    }
  };

  const stopGame = (reason) => {
    state.running = false;
    cancelAnimationFrame(state.frameId);
    state.frameId = null;
    state.best = Math.max(state.best, Math.floor(state.score));
    localStorage.setItem("foxFlightBest", String(state.best));
    updateScoreUI();
    if (ui.messageEl) {
      ui.messageEl.textContent = reason || "Ещё попытка?";
    }
    // Разблокируем основную Нори
    window.gameFlightActive = false;
    if (window.foxCompanionControl && typeof window.foxCompanionControl.unlock === "function") {
      window.foxCompanionControl.unlock();
    }
  };

  const flap = () => {
    if (!state.running) {
      // Запуск игры через flap - автоматически
      resetGame();
      state.frameId = requestAnimationFrame(step);
      window.gameFlightActive = true;
      if (window.foxCompanionControl && typeof window.foxCompanionControl.lock === "function") {
        window.foxCompanionControl.lock();
      }
      return;
    }
    state.fox.vy = -FLAP_FORCE;
    state.fox.wing = 1;
  };

  const spawnPipe = () => {
    const difficulty = Math.min(0.5, state.score / 400);
    const gapSize = Math.max(120, state.gap - difficulty * 90);
    const margin = 40;
    const gapCenter = margin + gapSize / 2 + Math.random() * (metrics.height - margin * 2 - gapSize);
    const width = 70;

    state.pipes.push({
      x: metrics.width + width,
      width,
      gapCenter,
      gapSize,
      scored: false,
    });

    const baseSpawn = 1.6 - difficulty * 0.5;
    state.spawnTimer = Math.max(1.1, baseSpawn);
  };

  const spawnCoin = () => {
    const margin = 60;
    const y = margin + Math.random() * (metrics.height - margin * 2);
    state.coins.push({
      x: metrics.width + 30,
      y,
      radius: 12,
      rotation: 0,
      collected: false,
      glow: 0.5 + Math.random() * 0.5,
    });
    state.coinSpawnTimer = 0.9 + Math.random() * 0.6;
  };

  const drawBackground = () => {
    ctx.fillStyle = backgroundGradient || "#fef5f9";
    ctx.fillRect(0, 0, metrics.width, metrics.height);

    ctx.fillStyle = "rgba(245, 168, 201, 0.15)";
    for (let i = 0; i < 6; i += 1) {
      const offset = (performance.now() / 80 + i * 160) % metrics.width;
      ctx.fillRect(metrics.width - offset, metrics.height * 0.72 + i * 4, 120, 2);
    }
  };

  const drawFox = () => {
    const fox = state.fox;
    const wingPhase = Math.sin(performance.now() / 160) * 0.3 + fox.wing * 0.5;
    fox.wing = Math.max(0, fox.wing - 0.04);
    
    // Плавный угол наклона
    fox.angle = Math.max(-0.35, Math.min(0.35, fox.vy * 0.0025));
    ctx.save();
    ctx.translate(fox.x, fox.y);
    ctx.rotate(fox.angle);

    // Тело Нори (более теплый оранжевый)
    ctx.fillStyle = "#ff9d5c";
    ctx.beginPath();
    ctx.ellipse(0, 0, fox.radius + 5, fox.radius * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();

    // Голова (простой круг, более светлый)
    ctx.fillStyle = "#ffb87a";
    ctx.beginPath();
    ctx.arc(fox.radius * 0.58, -fox.radius * 0.25, fox.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Глаз (просто черная точка)
    ctx.fillStyle = "#1a1230";
    ctx.beginPath();
    ctx.arc(fox.radius * 0.5, -fox.radius * 0.15, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawCoins = () => {
    const time = performance.now() * 0.004;
    state.coins.forEach((coin) => {
      if (coin.collected) return;
      
      coin.rotation += 0.08;
      const pulse = Math.sin(time * 2 + coin.x * 0.05) * 0.3 + 0.7;

      // Эффект свечения
      const glowGradient = ctx.createRadialGradient(coin.x, coin.y, 0, coin.x, coin.y, coin.radius * 3);
      glowGradient.addColorStop(0, `rgba(255, 215, 0, ${0.5 * coin.glow * pulse})`);
      glowGradient.addColorStop(1, "rgba(255, 215, 0, 0)");
      ctx.fillStyle = glowGradient;
      ctx.fillRect(coin.x - coin.radius * 3, coin.y - coin.radius * 3, coin.radius * 6, coin.radius * 6);

      ctx.save();
      ctx.translate(coin.x, coin.y);
      ctx.rotate(coin.rotation);

      // Основная монета
      const coinGradient = ctx.createRadialGradient(-coin.radius * 0.3, -coin.radius * 0.3, 0, 0, 0, coin.radius);
      coinGradient.addColorStop(0, "rgba(255, 223, 0, 0.95)");
      coinGradient.addColorStop(0.6, "rgba(255, 193, 7, 0.92)");
      coinGradient.addColorStop(1, "rgba(255, 152, 0, 0.88)");
      ctx.fillStyle = coinGradient;
      ctx.beginPath();
      ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
      ctx.fill();

      // Блеск на монете
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.beginPath();
      ctx.arc(-coin.radius * 0.3, -coin.radius * 0.3, coin.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Ободок
      ctx.strokeStyle = "rgba(255, 193, 7, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    });
  };

  const drawPipes = () => {
    ctx.fillStyle = "rgba(245, 168, 201, 0.15)";
    ctx.beginPath();
    ctx.moveTo(0, metrics.height * 0.85);
    ctx.lineTo(metrics.width, metrics.height * 0.92);
    ctx.lineTo(metrics.width, metrics.height);
    ctx.lineTo(0, metrics.height);
    ctx.closePath();
    ctx.fill();

    state.pipes.forEach((pipe) => {
      const topHeight = pipe.gapCenter - pipe.gapSize / 2;
      const bottomY = pipe.gapCenter + pipe.gapSize / 2;

      const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
      gradient.addColorStop(0, "rgba(245, 168, 201, 0.6)");
      gradient.addColorStop(1, "rgba(240, 136, 174, 0.65)");

      ctx.fillStyle = gradient;
      ctx.fillRect(pipe.x, 0, pipe.width, topHeight);
      ctx.fillRect(pipe.x, bottomY, pipe.width, metrics.height - bottomY);

      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillRect(pipe.x + 6, 6, 6, topHeight - 12);
      ctx.fillRect(pipe.x + 6, bottomY + 6, 6, metrics.height - bottomY - 12);

      ctx.strokeStyle = "rgba(232, 90, 138, 0.3)";
      ctx.lineWidth = 2;
      ctx.strokeRect(pipe.x, topHeight - 8, pipe.width, 8);
      ctx.strokeRect(pipe.x, bottomY, pipe.width, 8);

      ctx.fillStyle = "rgba(245, 168, 201, 0.3)";
      ctx.beginPath();
      ctx.arc(pipe.x + pipe.width / 2, pipe.gapCenter, 14, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const detectCollision = (pipe) => {
    const fox = state.fox;
    const topHeight = pipe.gapCenter - pipe.gapSize / 2;
    const bottomY = pipe.gapCenter + pipe.gapSize / 2;
    const foxTop = fox.y - fox.radius * 0.8;
    const foxBottom = fox.y + fox.radius * 0.8;
    const foxLeft = fox.x - fox.radius * 0.6;
    const foxRight = fox.x + fox.radius * 0.6;

    const hitsTop = foxTop < topHeight && foxRight > pipe.x && foxLeft < pipe.x + pipe.width;
    const hitsBottom = foxBottom > bottomY && foxRight > pipe.x && foxLeft < pipe.x + pipe.width;
    return hitsTop || hitsBottom;
  };

  const render = () => {
    drawBackground();
    drawPipes();
    drawCoins();
    drawFox();

    ctx.fillStyle = "rgba(45, 27, 61, 0.8)";
    ctx.font = "600 20px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Очки: ${pad(state.score)}`, 18, 32);
  };

  const step = (time) => {
    if (!state.running) return;

    const delta = Math.min((time - state.lastTime) / 1000, 0.05);
    state.lastTime = time;

    const difficulty = Math.min(0.6, state.score / 280);
    state.speed += delta * (5 + difficulty * 12);
    state.spawnTimer -= delta;
    state.coinSpawnTimer -= delta;
    
    if (state.spawnTimer <= 0) {
      spawnPipe();
    }
    
    if (state.coinSpawnTimer <= 0) {
      spawnCoin();
    }

    state.pipes.forEach((pipe) => {
      pipe.x -= state.speed * delta;
      if (!pipe.scored && pipe.x + pipe.width < state.fox.x) {
        pipe.scored = true;
        state.score += 5;
        if (typeof launchFirework === "function" && state.score % 25 === 0) {
          launchFirework(state.fox.x + 60, state.fox.y - 120, { size: 0.85, hueShift: 45 });
        }
      }
    });

    state.pipes = state.pipes.filter((pipe) => pipe.x + pipe.width > -100);

    // Обновление монет
    state.coins.forEach((coin) => {
      coin.x -= state.speed * delta;
      const dist = Math.hypot(coin.x - state.fox.x, coin.y - state.fox.y);
      if (!coin.collected && dist < coin.radius + state.fox.radius) {
        coin.collected = true;
        state.score += 15;
        if (typeof launchFirework === "function") {
          launchFirework(coin.x, coin.y, { size: 0.6, hueShift: 30 });
        }
      }
    });

    state.coins = state.coins.filter((coin) => !coin.collected && coin.x + coin.radius > -50);

    state.fox.vy += GRAVITY * delta;
    state.fox.y += state.fox.vy * delta;

    if (state.fox.y - state.fox.radius < 0 || state.fox.y + state.fox.radius > metrics.height) {
      stopGame("Нори задела край неба — попробуем ещё раз");
      return;
    }

    for (let i = 0; i < state.pipes.length; i += 1) {
      if (detectCollision(state.pipes[i])) {
        stopGame("Арка была слишком близко — ещё попытка?");
        return;
      }
    }

    updateScoreUI();
    render();
    state.frameId = requestAnimationFrame(step);
  };

  const startGame = () => {
    resetGame();
    state.frameId = requestAnimationFrame(step);
    // Блокируем основную Нори
    window.gameFlightActive = true;
    if (window.foxCompanionControl && typeof window.foxCompanionControl.lock === "function") {
      window.foxCompanionControl.lock();
    }
  };

  if (startButton) {
    startButton.addEventListener("click", () => {
      if (state.running) return;
      startGame();
    });
  }

  const handleKey = (event) => {
    if (event.repeat) return;
    const key = event.key?.toLowerCase();
    if (key === " " || key === "arrowup" || key === "w") {
      event.preventDefault();
      flap();
    } else if (key === "enter" && !state.running) {
      startGame();
    }
  };

  document.addEventListener("keydown", handleKey);

  const handlePointer = (event) => {
    event.preventDefault();
    flap();
  };

  // На телефоне делаем весь stage кликабельным для большей области
  if (window.innerWidth <= 720) {
    const handleStagePointer = (event) => {
      // Проверяем, что клик не на других элементах (например, текст подсказки)
      const target = event.target;
      if (target === stage || target === canvas || target.closest("#fox-flight-canvas") || target.closest(".fox-flight__stage")) {
        event.preventDefault();
        flap();
      }
    };
    stage.addEventListener("pointerdown", handleStagePointer);
    stage.addEventListener("touchstart", handleStagePointer, { passive: false });
  } else {
    canvas.addEventListener("pointerdown", handlePointer);
    canvas.addEventListener("touchstart", handlePointer, { passive: false });
  }
  
  // Обработчик изменения размера окна для обновления обработчиков
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Перезагружаем обработчики при изменении размера (для ротации устройства)
      if (window.innerWidth <= 720) {
        stage.removeEventListener("pointerdown", handlePointer);
        stage.removeEventListener("touchstart", handlePointer);
        const handleStagePointer = (event) => {
          const target = event.target;
          if (target === stage || target === canvas || target.closest("#fox-flight-canvas") || target.closest(".fox-flight__stage")) {
            event.preventDefault();
            flap();
          }
        };
        stage.addEventListener("pointerdown", handleStagePointer);
        stage.addEventListener("touchstart", handleStagePointer, { passive: false });
      }
    }, 250);
  });

  updateScoreUI();
  if (ui.messageEl) {
    ui.messageEl.textContent = "Нажми старт, чтобы Нори полетела";
  }
  render();
}

function initFoxSequence(launchFirework) {
  const section = document.querySelector("[data-fox-sequence]");
  if (!section) return;

  const lanterns = section.querySelectorAll(".lantern-button");
  const startButton = section.querySelector("[data-sequence-start]");
  const roundEl = section.querySelector("[data-sequence-round]");
  const bestEl = section.querySelector("[data-sequence-best]");
  const messageEl = section.querySelector("[data-sequence-message]");

  if (!lanterns.length || !startButton || !roundEl || !bestEl || !messageEl) return;

  const state = {
    sequence: [],
    playerSequence: [],
    isShowing: false,
    isWaiting: false,
    round: 1,
    best: parseInt(localStorage.getItem("sequenceBest") || "0", 10),
  };

  const colors = [
    { light: "rgba(255, 122, 159, 0.95)", glass: "rgba(255, 122, 159, 0.45)" }, // розовый
    { light: "rgba(159, 114, 255, 0.95)", glass: "rgba(159, 114, 255, 0.45)" }, // фиолетовый
    { light: "rgba(255, 214, 102, 0.95)", glass: "rgba(255, 214, 102, 0.45)" }, // желтый
    { light: "rgba(102, 204, 255, 0.95)", glass: "rgba(102, 204, 255, 0.45)" }, // голубой
    { light: "rgba(255, 159, 87, 0.95)", glass: "rgba(255, 159, 87, 0.45)" }, // оранжевый
    { light: "rgba(159, 255, 159, 0.95)", glass: "rgba(159, 255, 159, 0.45)" }, // зеленый
    { light: "rgba(255, 159, 204, 0.95)", glass: "rgba(255, 159, 204, 0.45)" }, // светло-розовый
    { light: "rgba(204, 159, 255, 0.95)", glass: "rgba(204, 159, 255, 0.45)" }, // светло-фиолетовый
    { light: "rgba(255, 234, 159, 0.95)", glass: "rgba(255, 234, 159, 0.45)" }, // светло-желтый
  ];

  const updateUI = () => {
    roundEl.textContent = state.round;
    bestEl.textContent = state.best;
  };

  const lightLantern = (index, duration = 600) => {
    const lantern = lanterns[index];
    if (!lantern) return;

    const light = lantern.querySelector(".lantern-button__light");
    const glass = lantern.querySelector(".lantern-button__glass");

    if (light && glass) {
      light.style.opacity = "1";
      light.style.background = `radial-gradient(circle, ${colors[index].light}, transparent 70%)`;
      glass.style.transform = "translateY(-6px)";
      glass.style.boxShadow = `inset 0 0 30px ${colors[index].glass}`;

      setTimeout(() => {
        light.style.opacity = "0.6";
        glass.style.transform = "translateY(0)";
        glass.style.boxShadow = "inset 0 0 25px rgba(255, 255, 255, 0.22)";
      }, duration);
    }
  };

  const showSequence = async () => {
    state.isShowing = true;
    state.playerSequence = [];
    messageEl.textContent = "Смотри внимательно...";

    // Ускоряем показ с каждым раундом
    const baseDelay = Math.max(300, 700 - state.round * 30);
    const lightDuration = Math.max(500, 800 - state.round * 20);

    for (let i = 0; i < state.sequence.length; i++) {
      await new Promise((resolve) => {
        setTimeout(() => {
          lightLantern(state.sequence[i], lightDuration);
          resolve();
        }, i === 0 ? 400 : baseDelay);
      });
    }

    state.isShowing = false;
    state.isWaiting = true;
    messageEl.textContent = "Твоя очередь! Повтори последовательность";
  };

  const addToSequence = () => {
    const newIndex = Math.floor(Math.random() * lanterns.length);
    state.sequence.push(newIndex);
  };

  const handleLanternClick = (index) => {
    if (state.isShowing || !state.isWaiting) return;

    lightLantern(index, 400);

    state.playerSequence.push(index);

    const expectedIndex = state.playerSequence.length - 1;
    if (state.playerSequence[expectedIndex] !== state.sequence[expectedIndex]) {
      // Неправильно
      state.isWaiting = false;
      state.sequence = [];
      state.playerSequence = [];
      state.round = 1;
      updateUI();
      messageEl.textContent = `Неверно! Рекорд: ${state.best}. Нажми старт, чтобы попробовать снова`;
      startButton.style.display = "block";

      if (typeof launchFirework === "function") {
        launchFirework(
          window.innerWidth / 2,
          window.innerHeight / 2,
          { size: 0.8, hueShift: 0 }
        );
      }
      return;
    }

    if (state.playerSequence.length === state.sequence.length) {
      // Правильно, следующий раунд - эффект успеха
      state.round++;
      if (state.round > state.best) {
        state.best = state.round;
        localStorage.setItem("sequenceBest", String(state.best));
        updateUI();
        if (typeof launchFirework === "function") {
          launchFirework(
            window.innerWidth / 2,
            window.innerHeight / 2,
            { size: 1.2, hueShift: 20 }
          );
        }
      } else {
        if (typeof launchFirework === "function") {
          launchFirework(
            window.innerWidth / 2,
            window.innerHeight / 2,
            { size: 0.9, hueShift: 10 }
          );
        }
      }
      
      // Эффект мигания всех фонариков
      const allLanterns = Array.from(lanterns);
      allLanterns.forEach((lantern, idx) => {
        setTimeout(() => {
          lightLantern(idx, 300);
        }, idx * 80);
      });
      
      updateUI();
      messageEl.textContent = `Раунд ${state.round} пройден! Отлично!`;
      
      addToSequence();
      setTimeout(() => {
        showSequence();
      }, 1500);
    }
  };

  const startGame = () => {
    state.sequence = [];
    state.playerSequence = [];
    state.round = 1;
    state.isWaiting = false;
    state.isShowing = false;
    updateUI();
    startButton.style.display = "none";
    messageEl.textContent = "Начинаем...";

    addToSequence();
    setTimeout(() => {
      showSequence();
    }, 800);
  };

  lanterns.forEach((lantern, index) => {
    const color = colors[index];
    const light = lantern.querySelector(".lantern-button__light");
    const glass = lantern.querySelector(".lantern-button__glass");

    if (light && glass) {
      light.style.background = `radial-gradient(circle, ${color.light.replace("0.85", "0.42")}, transparent 70%)`;
      glass.style.border = `1px solid ${color.glass}`;
    }

    lantern.addEventListener("click", () => handleLanternClick(index));
  });

  startButton.addEventListener("click", startGame);
  updateUI();
}

function initGamesCarousel() {
  const carousel = document.querySelector(".games-carousel");
  if (!carousel) return;

  const track = carousel.querySelector(".games-carousel__track");
  const slides = carousel.querySelectorAll(".game-slide");
  const prevBtn = carousel.querySelector(".games-carousel__nav--prev");
  const nextBtn = carousel.querySelector(".games-carousel__nav--next");
  const indicators = carousel.querySelectorAll(".games-carousel__indicator");

  if (!track || !slides.length) {
    console.warn("Games carousel: track or slides not found");
    return;
  }

  let currentSlide = 0;
  const totalSlides = slides.length;
  let isTransitioning = false;

  const goToSlide = (index) => {
    if (isTransitioning) return;
    
    // Корректируем индекс для бесконечной прокрутки
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;

    if (index === currentSlide) return;

    isTransitioning = true;
    currentSlide = index;

    // Обновляем видимость слайдов
    slides.forEach((slide, idx) => {
      if (idx === currentSlide) {
        slide.classList.add("game-slide--active");
      } else {
        slide.classList.remove("game-slide--active");
      }
    });

    // Обновляем индикаторы
    indicators.forEach((indicator, idx) => {
      if (idx === currentSlide) {
        indicator.classList.add("games-carousel__indicator--active");
      } else {
        indicator.classList.remove("games-carousel__indicator--active");
      }
    });

    // Разрешаем следующее переключение после завершения анимации
    setTimeout(() => {
      isTransitioning = false;
    }, 400);
  };

  const nextSlide = () => {
    goToSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    goToSlide(currentSlide - 1);
  };

  // Навигация кнопками
  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      prevSlide();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      nextSlide();
    });
  }

  // Индикаторы
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      goToSlide(index);
    });
  });

  // Поддержка свайпов на мобильных
  let startX = 0;
  let isDragging = false;

  const handleTouchStart = (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) return;
    isDragging = false;
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  if (track) {
    track.addEventListener("touchstart", handleTouchStart, { passive: true });
    track.addEventListener("touchend", handleTouchEnd, { passive: true });
  }

  // Инициализация - показываем первый слайд
  goToSlide(0);
  
  console.log("Games carousel initialized:", totalSlides, "slides");
}

function initHeroEffects() {
  const particlesContainer = document.querySelector(".hero-particles");
  if (!particlesContainer) return;

  const particleCount = 25;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "hero-particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 5 + "s";
    particle.style.animationDuration = (10 + Math.random() * 10) + "s";
    particlesContainer.appendChild(particle);
  }
}

function initHeroCelebration() {
  // Анимация появления элементов поздравления
  const dateEl = document.querySelector(".hero-date--animated");
  const titleEl = document.querySelector(".hero-title--animated");
  const leadEl = document.querySelector(".lead--animated");
  const noteEl = document.querySelector(".hero-note--animated");
  const celebrationEl = document.querySelector(".hero-celebration");

  // Последовательное появление с задержками
  if (dateEl) {
    setTimeout(() => {
      dateEl.classList.add("is-visible");
    }, 300);
  }

  if (titleEl) {
    setTimeout(() => {
      titleEl.classList.add("is-visible");
      // Запускаем фейерверки при появлении заголовка
      if (typeof window.BACKGROUND_MUSIC === "object" && window.BACKGROUND_MUSIC !== null) {
        // Фейерверки уже должны быть инициализированы
      }
    }, 800);
  }

  if (leadEl) {
    setTimeout(() => {
      leadEl.classList.add("is-visible");
    }, 1300);
  }

  if (noteEl) {
    setTimeout(() => {
      noteEl.classList.add("is-visible");
    }, 1800);
  }

  if (celebrationEl) {
    setTimeout(() => {
      celebrationEl.classList.add("is-visible");
    }, 600);
  }
}

function initBackgroundMusic() {
  const toggleBtn = document.getElementById("music-toggle");
  const audio = document.getElementById("background-music");
  if (!toggleBtn || !audio) return;

  // Проверяем, не инициализирована ли уже музыка
  if (window.BACKGROUND_MUSIC && window.BACKGROUND_MUSIC.audio) {
    // Если музыка уже инициализирована, используем существующий экземпляр
    const iconOn = toggleBtn.querySelector(".music-toggle__icon--on");
    const iconOff = toggleBtn.querySelector(".music-toggle__icon--off");
    
    const toggleMusic = () => {
      if (window.BACKGROUND_MUSIC.isPlaying) {
        window.BACKGROUND_MUSIC.pause();
        if (iconOn) iconOn.style.display = "none";
        if (iconOff) iconOff.style.display = "block";
        toggleBtn.classList.remove("music-toggle--active");
      } else {
        window.BACKGROUND_MUSIC.play();
        if (iconOn) iconOn.style.display = "block";
        if (iconOff) iconOff.style.display = "none";
        toggleBtn.classList.add("music-toggle--active");
      }
    };

    toggleBtn.addEventListener("click", toggleMusic);
    
    // Обновляем состояние кнопки
    if (window.BACKGROUND_MUSIC.isPlaying) {
      if (iconOn) iconOn.style.display = "block";
      if (iconOff) iconOff.style.display = "none";
      toggleBtn.classList.add("music-toggle--active");
    } else {
      if (iconOn) iconOn.style.display = "none";
      if (iconOff) iconOff.style.display = "block";
    }
    
    return;
  }

  const iconOn = toggleBtn.querySelector(".music-toggle__icon--on");
  const iconOff = toggleBtn.querySelector(".music-toggle__icon--off");

  // Проверяем, есть ли URL музыки
  if (!BACKGROUND_MUSIC_URL) {
    console.info("🎵 Укажи путь к MP3 файлу в BACKGROUND_MUSIC_URL");
    toggleBtn.style.display = "none";
    return;
  }

  // Используем локальный MP3 файл
  audio.src = BACKGROUND_MUSIC_URL;
  audio.volume = 0.5;
  audio.loop = true;

  const savedState = localStorage.getItem("backgroundMusicEnabled");
  const shouldAutoPlay = savedState !== "false"; // По умолчанию включаем

  const toggleMusic = () => {
    if (audio.paused) {
      audio.play().catch((err) => {
        console.warn("Не удалось воспроизвести музыку:", err);
      });
      if (iconOn) iconOn.style.display = "block";
      if (iconOff) iconOff.style.display = "none";
      toggleBtn.classList.add("music-toggle--active");
      localStorage.setItem("backgroundMusicEnabled", "true");
    } else {
      audio.pause();
      if (iconOn) iconOn.style.display = "none";
      if (iconOff) iconOff.style.display = "block";
      toggleBtn.classList.remove("music-toggle--active");
      localStorage.setItem("backgroundMusicEnabled", "false");
    }
  };

  toggleBtn.addEventListener("click", toggleMusic);

  // Автоматически запускаем музыку при загрузке
  if (shouldAutoPlay) {
    audio.play().catch(() => {
      console.info("Автовоспроизведение заблокировано. Нажми на кнопку музыки, чтобы включить.");
    });
    if (iconOn) iconOn.style.display = "block";
    if (iconOff) iconOff.style.display = "none";
    toggleBtn.classList.add("music-toggle--active");
  } else {
    if (iconOn) iconOn.style.display = "none";
    if (iconOff) iconOff.style.display = "block";
  }

  // Сохраняем ссылку на audio для предотвращения дублирования
  window.BACKGROUND_MUSIC = {
    audio: audio,
    play: () => audio.play().catch(() => {}),
    pause: () => audio.pause(),
    get isPlaying() {
      return !audio.paused;
    }
  };

  audio.addEventListener("error", () => {
    console.warn("Ошибка загрузки музыки. Убедись, что файл music.mp3 находится в корне проекта.");
    toggleBtn.style.display = "none";
  });
}

function initLetterToggle() {
  const shell = document.querySelector("[data-letter]");
  if (!shell) return;
  const toggle = shell.querySelector(".letter-toggle");
  if (!toggle) return;

  const openLetter = (forceOpen) => {
    const willOpen = forceOpen !== undefined ? forceOpen : !shell.classList.contains("is-open");
    shell.classList.toggle("is-open", willOpen);
    shell.classList.toggle("is-closed", !willOpen);
    toggle.setAttribute("aria-expanded", willOpen);
  };

  toggle.addEventListener("click", () => {
    openLetter();
  });

  shell.classList.add("is-closed");
}

function initFireworks() {
  const canvas = document.getElementById("fireworks-canvas");
  if (!canvas) return () => {};

  const ctx = canvas.getContext("2d");
  const rockets = [];
  const particles = [];
  const colors = ["#ff9f57", "#ff7a9f", "#9f72ff", "#7ef0ff", "#ffd5a8"];

  let width = window.innerWidth;
  let height = window.innerHeight;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  };

  resize();
  window.addEventListener("resize", resize);

  const withAlpha = (hex, alpha) => {
    const clamped = Math.max(0, Math.min(1, alpha));
    const value = Math.round(clamped * 255);
    return `${hex}${value.toString(16).padStart(2, "0")}`;
  };

  const hexToRgb = (hex) => {
    const normalized = hex.replace("#", "");
    const bigint = parseInt(normalized, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h;
    let s;
    const l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        default:
          h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return [h, s, l];
  };

  const hslToHex = (h, s, l) => {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r;
    let g;
    let b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (value) => {
      const hex = Math.round(value * 255).toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const shiftHue = (hex, deg) => {
    const [r, g, b] = hexToRgb(hex);
    const [h, s, l] = rgbToHsl(r, g, b);
    const shifted = ((h * 360 + deg) % 360 + 360) % 360;
    return hslToHex(shifted / 360, s, l);
  };

  const createFirework = (targetX, targetY, options = {}) => {
    if (document.hidden) return;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const hueShift = options.hueShift || 0;
    const size = options.size || 1;

    targetX = targetX ?? width * (0.3 + Math.random() * 0.4);
    targetY = targetY ?? height * (0.2 + Math.random() * 0.25);

    const startX = targetX + (Math.random() - 0.5) * 140;
    const startY = height + 20;
    const speed = 260 + Math.random() * 80;
    const angle = Math.atan2(targetY - startY, targetX - startX);

    rockets.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      hueShift,
      targetY,
      life: 0,
      size,
      gravity: 140,
      trail: [],
    });
  };

  const explode = (rocket) => {
    const count = 36 + Math.floor(Math.random() * 20);
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = (120 + Math.random() * 90) * rocket.size;
      particles.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: 0.014 + Math.random() * 0.012,
        drag: 0.9 + Math.random() * 0.07,
        gravity: 180 + Math.random() * 40,
        color: shiftHue(rocket.color, rocket.hueShift + Math.random() * 40 - 20),
        size: 1.6 + Math.random() * 1.4,
      });
    }
  };

  let lastTime = performance.now();

  const render = (time) => {
    const delta = Math.min(0.06, (time - lastTime) / 1000);
    lastTime = time;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = Math.min(0.5, delta * 8);
    ctx.fillStyle = "rgba(10, 12, 28, 0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.globalCompositeOperation = "lighter";

    for (let i = rockets.length - 1; i >= 0; i -= 1) {
      const rocket = rockets[i];
      rocket.life += delta;
      rocket.trail.unshift({ x: rocket.x, y: rocket.y });
      rocket.trail = rocket.trail.slice(0, 12);

      rocket.x += rocket.vx * delta;
      rocket.y += rocket.vy * delta;
      rocket.vy += rocket.gravity * delta * 0.4;

      ctx.beginPath();
      ctx.strokeStyle = withAlpha(rocket.color, 0.35);
      ctx.lineWidth = 2;
      for (let t = 0; t < rocket.trail.length - 1; t += 1) {
        const p1 = rocket.trail[t];
        const p2 = rocket.trail[t + 1];
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = withAlpha(rocket.color, 0.9);
      ctx.arc(rocket.x, rocket.y, 2.4 * rocket.size, 0, Math.PI * 2);
      ctx.fill();

      if (rocket.y <= rocket.targetY || rocket.vy >= -60 || rocket.life > 3) {
        explode(rocket);
        rockets.splice(i, 1);
      }
    }

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const spark = particles[i];
      spark.vx *= spark.drag;
      spark.vy = spark.vy * spark.drag + spark.gravity * delta * 0.4;
      spark.x += spark.vx * delta;
      spark.y += spark.vy * delta;
      spark.alpha -= spark.decay;

      if (spark.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.fillStyle = withAlpha(spark.color, spark.alpha);
      ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);

  setInterval(() => {
    if (!document.hidden) {
      createFirework();
    }
  }, 7500);

  return createFirework;
}


