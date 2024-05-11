// ------------- UI

/**
 * @type {Player[]}
 */
let players = [];

function reorderPlayers() {
  const types = ["left", "right", "top", "bottom"];

  players.forEach((p, i) => {
    p.setType(types[i]);
  });
}

/**
 * @type {Player[]}
 */
let allPlayers = [];

let paddleSpeed = 440;
let ballSpeed = 400;

function init() {
  ui.showMenu();
  ui.addPlayer();
  ui.addPlayer();
  ui.hideGame();
  if (mobileButtons.isMobile)
    document.getElementById("title").classList.add("hidden");
}

const timeout = (ms) => new Promise((res) => setTimeout(res, ms));

const translations = {
  startGame: {
    en: "Start Game",
    tr: "Oyuna Başla",
    it: "Start Game",
  },
  startTournament: {
    en: "Start Tournament",
    tr: "Turnuvaya Başla",
    it: "Inizio Torneo",
  },
  dead: {
    en: "Dead",
    tr: "Öldü",
    it: "Morto",
  },
  logout: {
    en: "Logout",
    tr: "Oturumu kapat",
    it: "Disconnettersi",
  },
  login: {
    en: "Login",
    tr: "Oturum aç",
    it: "Login",
  },
  settings: {
    en: "Settings",
    tr: "Ayarlar",
    it: "Impostazioni",
  },
  pcolor: {
    en: "Paddle Color",
    tr: "Raket Rengi",
    it: "Colore della pagaia",
  },
  bspeed: {
    en: "Ball Speed",
    tr: "Top Hızı",
    it: "Velocità della palla",
  },
  pspeed: {
    en: "Paddle Speed",
    tr: "Raket Hızı",
    it: "Velocità della pagaia",
  },
  fontsize: {
    en: "Font Size",
    tr: "Yazı Boyutu",
    it: "Dimensione del font",
  },
  upArrow: {
    en: "Arrow up",
    tr: "Yukarı Ok",
    it: "Freccia su",
  },
  downArrow: {
    en: "Arrow down",
    tr: "Aşağı Ok",
    it: "Freccia giù",
  },

  stats: {
    en: "Stats",
    tr: "İstatistikler",
    it: "Statistiche",
  },

  winner: {
    en: "Winner",
    tr: "Kazanan",
    it: "Vincitrice",
  },

  players: {
    en: "Players",
    tr: "Oyuncular",
    it: "Giocatrici",
  },

  mostWins: {
    en: "Most Winning",
    tr: "En Çok Kazananlar",
    it: "Il più vincente",
  },
  oldGames: {
    en: "Old Games",
    tr: "Eski Oyunlar",
    it: "Vecchi giochi",
  },

  wins: {
    en: "Wins",
    tr: "Kazanma",
    it: "Vince",
  },

  upArrow: {
    en: "Arrow up",
    tr: "Yukarı Ok",
    it: "Freccia su",
  },
  downArrow: {
    en: "Arrow down",
    tr: "Aşağı Ok",
    it: "Freccia giù",
  },
  background: {
    en: "Background color",
    tr: "Arkaplan rengi",
    it: "Colore di sfondo",
  },
  rectangularArena: {
    en: "Rectangular Arena",
    tr: "Dikdörtgen Arena",
    it: "Arena rettangolare",
  },
};

function translate(key) {
  try {
    const language = localStorage.getItem("language") ?? "en";
    if (key in translations === false)
      throw new Error("No translation for " + key);

    if (language in translations[key] === false)
      throw new Error("No translation for " + key + ":" + language);

    return translations[key][language];
  } catch (e) {
    console.error(e);
    return 'NOTRANSLATIONFOR: "' + key + '"';
  }
}

class Requester {
  async postGameResult(winner) {
    const body = {
      players: allPlayers.map((p) => p.name),
      winning_player: winner.name,
      isTournamet: tournament.isTournament,
    };

    const req = await fetch("/stats", {
      body: JSON.stringify(body),
      method: "POST",
    });

    const data = await req.json();

    console.log("Post result: ", data);

    stats.updateStats();
  }

  async fetchGameResults() {
    const req = await fetch("/stats");
    const data = await req.json();

    return data;
  }
}

const requester = new Requester();

class UI {
  user = null;

  updateTranslations() {
    document.querySelectorAll("[t]").forEach((el) => {
      const key = el.getAttribute("t");
      el.textContent = translate(key);
    });
  }

  login() {
    const url = new URL("https://api.intra.42.fr/oauth/authorize");

    url.searchParams.append(
      "client_id",
      "u-s4t2ud-4dc974719746974d72ff315f8fbcea6e431143cf4b959f77e647fe635206ca6e"
    );
    url.searchParams.append("redirect_uri", "https://localhost/login");
    url.searchParams.append("response_type", "code");

    localStorage.setItem("redirect_in_progress", true);

    window.location.href = url;
  }

  logout() {
    localStorage.removeItem("user");
    this.user = null;
    window.location.href = "/logout";
  }

  checkRedirect() {
    try {
      this.user = JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      console.error("error while parsing stored user data", e);
      localStorage.removeItem("user");
    }

    // For security reasons, we should only do this if we are currently in a redirect
    if (!localStorage.getItem("redirect_in_progress")) return;

    localStorage.removeItem("redirect_in_progress");

    try {
      const url = new URL(window.location.href);

      const userBase64 = url.searchParams.get("user");

      // b64 decode
      const decoded = atob(userBase64);

      const user = JSON.parse(decoded);

      this.user = user;

      localStorage.setItem("user", JSON.stringify(user));

      window.location.href = "/";
    } catch (e) {
      console.error("error while checking redirect", e);
    }
  }

  constructor() {
    this.checkRedirect();

    this.menuEl = document.getElementById("menu");
    this.gameEl = document.getElementById("game");
    this.settingsEl = document.getElementById("setting");
    this.playersContainerEl = document.getElementById("players-container");
    this.loginBtn = document.getElementById("login-btn");
    this.userImage = document.getElementById("user-image");
    this.usernameEl = document.getElementById("user-name");
    this.navbarEl = document.getElementById("navbar");
    this.rectangularArenaEl = document.getElementById("rectangular-arena");

    this.rectangularArenaEl.onchange = (e) => {
      const value = e.target.checked;
      localStorage.setItem("rectangular-arena", value);
      window.location.reload();
    };

    this.rectangularArenaEl.checked =
      localStorage.getItem("rectangular-arena") === "true";

    this.startGameBtn = document.getElementById("start-game-btn");
    this.startTournamentBtn = document.getElementById("start-tournament-btn");

    // settings
    this.paddleSpeedEl = document.getElementById("paddle-speed");
    this.paddleSpeedEl.onchange = (e) => {
      const value = Number(e.target.value);
      paddleSpeed = value;
      console.log(value);
      allPlayers.forEach((p) => (p.speed = value));
      localStorage.setItem("paddle-speed", value);
    };
    paddleSpeed = Number(localStorage.getItem("paddle-speed")) || 440;
    this.paddleSpeedEl.value = paddleSpeed;

    this.ballSpeedEl = document.getElementById("ball-speed");
    this.ballSpeedEl.onchange = (e) => {
      const value = e.target.value;
      ballSpeed = Number(value);
      localStorage.setItem("ball-speed", value);
    };
    ballSpeed = Number(localStorage.getItem("ball-speed")) || 400;
    this.ballSpeedEl.value = ballSpeed;

    this.fontSizeEl = document.getElementById("font-size");
    const root = document.querySelector(":root");
    this.fontSizeEl.onchange = (e) => {
      root.style.fontSize = e.target.value + "px";
      localStorage.setItem("font-size", e.target.value);
    };
    this.fontSizeEl.value = localStorage.getItem("font-size") ?? 16;
    root.style.fontSize = this.fontSizeEl.value + "px";

    this.backgroundColorEl = document.getElementById("background-color");

    this.backgroundColorEl.oninput = (e) => {
      const value = e.target.value;

      document.body.style.backgroundColor = value;
      localStorage.setItem("background-color", value);
    };
    this.backgroundColorEl.value =
      localStorage.getItem("background-color") ?? "#FFFFFF";
    document.body.style.backgroundColor = this.backgroundColorEl.value;

    this.usernameEl.textContent = this.user ? this.user.username : "";

    if (mobileButtons.isMobile) {
      this.gameEl.classList.add("mobile");

      // Disabled
      this.startTournamentBtn.disabled = true;
    }

    this.loginBtn.onclick = () => {
      if (this.user) this.logout();
      else this.login();
    };

    if (this.user) this.userImage.src = this.user.image;
    else this.userImage.remove();

    this.loginBtn.textContent = this.user
      ? translate("logout")
      : translate("login");

    this.startTournamentBtn.onclick = () => {
      tournament.startTournament();
    };

    const requestFullscreen = () => {
      var el = document.documentElement,
        rfs =
          el.requestFullscreen ||
          el.webkitRequestFullScreen ||
          el.mozRequestFullScreen ||
          el.msRequestFullscreen;
      rfs.call(el);
    };
    this.startGameBtn.onclick = () => {
      this.hideMenu();

      if (mobileButtons.isMobile) requestFullscreen();
      onGameStart();
    };

    this.playerSettingsTemplate = document.getElementById(
      "player-settings-template"
    );

    this.addPlayerEl = document.getElementById("add-player");
    this.removePlayerEl = document.getElementById("remove-player");

    this.addPlayerEl.onclick = () => this.addPlayer();
    this.removePlayerEl.onclick = () => this.removePlayer();

    this.languageDropdown = document.getElementById("language");

    this.languageDropdown.value = localStorage.getItem("language") ?? "en";
    this.languageDropdown.onchange = (e) => {
      const value = e.target.value;
      localStorage.setItem("language", value);
      this.updateTranslations();
      window.location.reload();
    };

    this.updateTranslations();
  }

  addPlayer() {
    const cardEl =
      this.playerSettingsTemplate.content.cloneNode(true).children[0];

    this.playersContainerEl.appendChild(cardEl);

    const types = ["left", "right", "top", "bottom"];

    const player = new Player({
      type: types[allPlayers.length],
      element: cardEl,
    });

    allPlayers.push(player);
    players = [...allPlayers];

    cardEl.querySelector("input").value = player.name;
    cardEl.querySelector("input").oninput = (e) => {
      const value = e.target.value.trim();

      const conflict = allPlayers.find((p) => p.name === value);

      if (conflict) {
        alert("Name already taken");
        e.target.value = player.name;
        e.preventDefault();
        return;
      }

      player.name = value;

      if (value === "") {
        player.name = "p" + (player.config.index + 1);
      }

      e.target.style.backgroundColor = value ? "" : "#A33";
    };

    cardEl.querySelector(".player-color").value = player.color;
    cardEl.querySelector(".player-color").oninput = (e) => {
      const value = e.target.value.trim();

      console.log(value);
      player.color = value;
    };

    const leftLabel =
      player.config.keys[0] === "ArrowUp"
        ? translate("upArrow")
        : player.config.keys[0];
    const rightLabel =
      player.config.keys[1] === "ArrowDown"
        ? translate("downArrow")
        : player.config.keys[1];

    cardEl.querySelector(".left-key").innerHTML = leftLabel;
    cardEl.querySelector(".right-key").innerHTML = rightLabel;

    this.onPlayerUpdate();
    this.updateTranslations();
  }

  removePlayer() {
    const player = allPlayers.pop();
    players = [...allPlayers];

    if (!player) throw new Error("Can't remove more players");

    player.element.remove();
    this.onPlayerUpdate();
  }

  onPlayerUpdate() {
    this.addPlayerEl.disabled = allPlayers.length >= 4;

    this.removePlayerEl.disabled = allPlayers.length <= 2;
  }

  renderPlayerSettings() {
    this.playersContainerEl.innerHTML = "";
    allPlayers.forEach(() => {
      const card = this.playerSettingsTemplate.cloneNode(true);

      this.playersContainerEl.appendChild(card);
    });
  }

  toggleSettings() {
    this.settingsEl.classList.toggle("hidden");
  }

  showMenu() {
    this.menuEl.classList.remove("hidden");
  }

  hideMenu() {
    this.menuEl.classList.add("hidden");
  }

  showGame() {
    this.gameEl.classList.remove("hidden");
    this.hideNavbar();
  }

  hideGame() {
    this.gameEl.classList.add("hidden");
    this.showNavbar();
  }

  hideNavbar() {
    this.navbarEl.classList.add("hidden");
  }

  showNavbar() {
    this.navbarEl.classList.remove("hidden");
  }
}

class PieChart {
  constructor() {
    this.container = document.getElementById("stats-pie");
  }

  update(data) {
    // {value: 0.5, color: "red", name: "mehmet"}

    const total = data.reduce((acc, { value }) => acc + value, 0);

    let prevPercent = 0;
    const pieElements = data
      .filter(({ value }) => value / total > 0.02)
      .map(({ value, name }) => {
        const percent = value / total;

        const deg = (prevPercent + percent / 2) * 360 - 90;
        prevPercent += percent;

        return `
        <div class="cover center">
          <div
            style="width: 310px; font-size: 1rem; rotate: ${deg}deg;"
            class="d-flex flex-row-reverse text-black"
          >
            ${name} ${value} ${translate("wins")}
          </div>
        </div>
      `;
      });

    this.container.innerHTML = pieElements.join("\n");

    const gradientStyles = [];
    prevPercent = 0;

    for (const { value, color } of data) {
      const percent = value / total;
      gradientStyles.push(
        `${color} ${prevPercent * 100}%, ${color} ${
          (prevPercent + percent) * 100
        }%`
      );
      prevPercent += percent;
    }

    const gradientStylesStr = gradientStyles.join(", ");

    const pieStyle = `
      conic-gradient(${gradientStylesStr})
    `;

    this.container.style.backgroundImage = pieStyle;
  }
}

class Tournament {
  isTournament = false;

  constructor() {
    this.t1 = document.getElementById("t1");
    this.t2 = document.getElementById("t2");

    this.t3 = document.getElementById("t3");
    this.t4 = document.getElementById("t4");

    this.t5 = document.getElementById("t5");
    this.t6 = document.getElementById("t6");

    this.el = document.getElementById("tournament");

    this.hide();
  }

  show() {
    this.el.classList.remove("hidden");
  }

  hide() {
    this.el.classList.add("hidden");
  }

  async playGame(p1, p2) {
    players = [p1, p2];
    reorderPlayers();

    console.log("Playing game: ", p1.name, " vs ", p2.name);

    onGameStart();

    await this.waitUntilGameEnds();

    const winning_player = players.find((p) => !p.isDed);

    console.log("Winner: ", winning_player.name);

    return winning_player;
  }

  reset() {
    [this.t1, this.t2, this.t3, this.t4].forEach((el) => {
      el.style.backgroundColor = "";

    });
  }

  waitUntilGameEnds() {
    return new Promise((res) => {
      const interval = setInterval(() => {
        if (gameState === "gameover") {
          clearInterval(interval);
          res();
        }
      }, 100);
    });
  }

  async startTournament() {
    if (allPlayers.length !== 4) {
      alert("Tournament requires 4 players");
      return;
    }

    if (this.isTournament) {
      alert("A tournament is already in progress");
      return;
    }

    this.isTournament = true;

    const p1 = allPlayers[0];
    const p2 = allPlayers[1];
    const p3 = allPlayers[2];
    const p4 = allPlayers[3];

    this.t1.textContent = p1.name;
    this.t2.textContent = p2.name;
    this.t3.textContent = p3.name;
    this.t4.textContent = p4.name;

    this.t5.textContent = "...";
    this.t6.textContent = "...";

    const delay = 1300;

    ui.hideMenu();
    ui.hideGame();
    this.show();

    await timeout(delay);

    this.t1.style.backgroundColor = p1.color;
    this.t2.style.backgroundColor = p2.color;

    await timeout(delay);

    ui.showGame();
    this.hide();
    this.reset();

    const winner1 = await this.playGame(p1, p2);

    this.t5.textContent = winner1.name;

    // 2nd game

    this.show();
    ui.hideGame();

    await timeout(delay);

    this.t3.style.backgroundColor = p3.color;
    this.t4.style.backgroundColor = p4.color;

    await timeout(delay);

    ui.showGame();
    this.hide();
    this.reset();

    const winner2 = await this.playGame(p3, p4);

    this.t6.textContent = winner2.name;

    // 3rd game

    this.show();
    ui.hideGame();

    await timeout(delay);

    this.t5.style.backgroundColor = winner1.color;
    this.t6.style.backgroundColor = winner2.color;

    await timeout(delay);

    this.hide();
    ui.showGame();

    const winner3 = await this.playGame(winner1, winner2);

    alert("TOURNAMENT WINNER: " + winner3.name);

    // END TOURNAMENT
    this.isTournament = false;
    this.hide();
    this.reset();
    ui.showMenu();
    ui.hideGame();
  }
}

class MobileButtons {
  left = 0;
  right = 0;

  constructor() {
    const regex =
      /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    this.isMobile = regex.test(navigator.userAgent);

    this.mobileUpLeft = document.getElementById("left-up-btn");
    this.mobileUpRight = document.getElementById("right-up-btn");
    this.mobileDownLeft = document.getElementById("left-down-btn");
    this.mobileDownRight = document.getElementById("right-down-btn");

    // Eger mobil ise göster
    this.mobileUpLeft.ontouchstart = () => {
      this.left = 1;
    };
    this.mobileUpLeft.ontouchend = () => {
      this.left = 0;
    };

    this.mobileDownLeft.ontouchstart = () => {
      this.left = -1;
    };
    this.mobileDownLeft.ontouchend = () => {
      this.left = 0;
    };

    this.mobileUpRight.ontouchstart = () => {
      this.right = 1;
    };
    this.mobileUpRight.ontouchend = () => {
      this.right = 0;
    };

    this.mobileDownRight.ontouchstart = () => {
      this.right = -1;
    };
    this.mobileDownRight.ontouchend = () => {
      this.right = 0;
    };

    this.updateShowMobile();
  }

  updateShowMobile() {
    if (this.isMobile) {
      document.getElementById("add-remove-btns").classList.add("hidden");

      this.mobileDownLeft.classList.remove("hidden");
      this.mobileDownRight.classList.remove("hidden");
      this.mobileUpLeft.classList.remove("hidden");
      this.mobileUpRight.classList.remove("hidden");
      console.log("Mobile device detected");
    } else {
      this.mobileDownLeft.classList.add("hidden");
      this.mobileDownRight.classList.add("hidden");
      this.mobileUpLeft.classList.add("hidden");
      this.mobileUpRight.classList.add("hidden");
      console.log("Desktop device detected");
    }
  }
}

class Stats {
  constructor() {
    this.historyEl = document.getElementById("stats-games");
    this.mostEl = document.getElementById("stats-most-winning");
    this.pieChart = new PieChart();

    this.updateStats();
  }

  playerWinStats(data) {
    const winCounts = new Map();

    data.forEach(({ winning_player }) => {
      winCounts.set(winning_player, (winCounts.get(winning_player) ?? 0) + 1);
    });

    const counts = Array.from(winCounts.entries()).sort((a, b) => b[1] - a[1]);

    return counts;
  }

  updateStats() {
    requester.fetchGameResults().then((data) => {
      const colors = [
        "red",
        "green",
        "blue",
        "yellow",
        "purple",
        "orange",
        "pink",
        "cyan",
        "magenta",
        "lime",
      ];

      const getColor = (i) => colors[i % colors.length];

      const postGameElements = data
        .toReversed()
        .map(
          ({ winning_player, isTournamet, players }) => `
        <li
          class="list-group-item d-flex align-items-start"
          style="gap: 30px"
        >
          <div class="fw-bold">${translate("winner")}: ${winning_player}</div>
          ${translate("players")}: ${players.join(", ")}
          ${
            isTournamet
              ? '<span class="badge bg-primary rounded-pill">tournament</span>'
              : ""
          }
        </li>
      `
        )
        .join("\n");

      this.historyEl.innerHTML = `
        <li class="list-group-item active">${translate("oldGames")}</li>
        ${postGameElements}
      `;

      const winStats = this.playerWinStats(data);

      const winStatsElements = winStats.map(([name, score], i) => {
        return `
          <li class="list-group-item">${
            i + 1
          }. ${name} ........ ${score} ${translate("wins")}
          <span style="
          width: 15px; height: 15px;
          margin-top: 8px;
          border-radius: 50%;
          background: ${getColor(i)};
          display: inline-block;
          "></span>
          </li>
          
        `;
      });

      this.mostEl.innerHTML = `
        <li class="list-group-item active">${translate("mostWins")}</li>
        ${winStatsElements.join("\n")}
      `;

      // Update pie chart
      this.pieChart.update(
        winStats.map(([name, value], i) => ({
          name,
          value,
          color: getColor(i),
        }))
      );
    });
  }
}

const stats = new Stats();

const mobileButtons = new MobileButtons();

const ui = new UI();

const tournament = new Tournament();

// ------------- GAME

const canvasEl = document.getElementById("canvas");

const screenGap = 50;
const isWide = localStorage.getItem("rectangular-arena") === "true";
const screenWidth = isWide ? 800 : 500;

const screenHeight = 500;

/**
 * @type {CanvasRenderingContext2D}
 * */
const ctx = canvasEl.getContext("2d");
ctx.imageSmoothingEnabled = false;
canvasEl.width = screenGap * 2 + screenWidth;
canvasEl.height = screenGap * 2 + screenHeight;
const fonts =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

ctx.font = "16px " + fonts;

// Mono font

const keys = {};

const onKey = (e) => {
  if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
};

document.onkeydown = (e) => {
  keys[e.key] = true;

  // Debug
  if (e.key === "r") {
    // onGameStart();
  }

  onKey(e);
};

document.onkeyup = (e) => {
  keys[e.key] = false;

  onKey(e);
};

function isKeyDown(key) {
  return keys[key] === true ? 1 : 0;
}

function drawCircle(x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

class Entity {
  reset() {}
  update() {}
  render() {}
}

const playersConfig = {
  left: {
    index: 0,
    keys: ["w", "s"],
    defaultColor: "#02a1e6",
  },
  right: {
    index: 1,
    keys: ["▲", "▼"],
    defaultColor: "#eb3734",
  },
  top: {
    index: 2,
    keys: ["c", "v"],
    defaultColor: "#09bd66",
  },
  bottom: {
    index: 3,
    keys: ["n", "m"],
    defaultColor: "#f5f50a",
  },
};

class Player extends Entity {
  width = 7;
  height = 60;

  constructor({ type, element }) {
    super();
    /**
     * @type {"left" | "right" | "top" | "bottom"}
     */
    this.config = playersConfig[type];

    this.element = element;

    this.name = "p" + (this.config.index + 1);
    this.color = this.config.defaultColor;

    this.setType(type);

    this.reset();
  }

  setType(type) {
    this.type = type;
    this.isVertical = type === "left" || type === "right";
    this.isHorizontal = !this.isVertical;
  }

  reset() {
    this.hearts = 3;
    this.isDed = false;

    if (this.type === "left") {
      this.x = screenPadding + this.width / 2;
      this.y = screenHeight / 2;
    } else if (this.type === "right") {
      this.x = screenWidth - screenPadding - this.width / 2;
      this.y = screenHeight / 2;
    } else if (this.type === "top") {
      this.x = screenWidth / 2;
      this.y = screenPadding + this.width / 2;
    } else if (this.type === "bottom") {
      this.x = screenWidth / 2;
      this.y = screenHeight - screenPadding - this.width / 2;
    }

    this.vel = 0;

    this.speed = paddleSpeed;
  }

  calculateInput() {
    if (mobileButtons.isMobile) {
      return this.type === "left" ? -mobileButtons.left : -mobileButtons.right;
    }

    const [negativeKey, positiveKey] = playersConfig[this.type].keys;

    return isKeyDown(positiveKey) - isKeyDown(negativeKey);
  }

  update() {
    const input = this.calculateInput();

    this.vel = input * this.speed;

    if (this.isVertical) {
      this.y += this.vel * dt;
      if (this.y - this.height / 2 < 0) this.y = this.height / 2;
      if (this.y + this.height / 2 > screenHeight)
        this.y = screenHeight - this.height / 2;
    } else {
      this.x += this.vel * dt;
      if (this.x - this.height / 2 < 0) this.x = this.height / 2;
      if (this.x + this.height / 2 > screenWidth)
        this.x = screenWidth - this.height / 2;
    }
  }

  render() {
    ctx.save();
    ctx.fillStyle = this.color;

    ctx.translate(this.x, this.y);
    ctx.rotate(this.isHorizontal ? Math.PI / 2 : 0);

    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "red";
    ctx.translate(this.x, this.y);
    if (this.isVertical) ctx.translate(0, this.height / 2 + 10);
    if (this.isHorizontal) ctx.translate(0, this.width / 2 + 10, 0);

    ctx.translate(-(this.hearts - 1) * 5, 0);

    for (let i = 0; i < this.hearts; i++) {
      drawCircle(0, 0, 4);
      ctx.translate(10, 0);
    }
    ctx.restore();
  }

  die() {
    this.isDed = true;
  }

  onHit() {
    this.hearts--;
    if (this.hearts <= 0) {
      this.die();
    }
    onScore();
  }
}

class PlayerNames extends Entity {
  render() {
    for (const p of players) {
      ctx.save();
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      // to middle
      ctx.translate(screenWidth / 2, screenHeight / 2);

      const index = {
        left: 3,
        right: 1,
        top: 0,
        bottom: 2,
      };
      ctx.rotate(index[p.type] * (Math.PI / 2));

      ctx.translate(0, -screenHeight / 2 - 30);
      if (p.type === "bottom") {
        ctx.rotate(Math.PI);
      }

      ctx.scale(2, 2);
      ctx.fillStyle = "black";

      const text = p.isDed ? translate("dead") : p.name;
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  }
}

class Ball extends Entity {
  speedIncrease = 15;
  radius = 7;

  reset() {
    this.x = screenWidth / 2;
    this.y = screenHeight / 2;
    this.defaultSpeed = ballSpeed;
    this.speed = this.defaultSpeed;

    this.vx = this.defaultSpeed;
    this.vy = this.defaultSpeed;
    if (players.length <= 2 || Math.random() > 0.5) {
      // Horizontal throw
      this.vy *= 0.1;
      this.vx *= Math.random() > 0.5 ? 1 : -1;
    } else {
      // Vertical throw
      this.vx *= 0.1;
      this.vy *= Math.random() > 0.5 ? 1 : -1;
    }
  }

  limitSpeed() {
    // Euclidean length of the velocity vector
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

    this.vx *= this.speed / speed;
    this.vy *= this.speed / speed;
  }

  update() {
    if (gameState !== "countdown") {
      // update ball
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }

    this.speed += this.speedIncrease * dt;
    this.limitSpeed();

    const dragEffect = 0.7;

    for (let p of players) {
      // Check collisions
      if (p.type === "left") {
        if (
          this.x - this.radius < p.width + screenPadding &&
          this.y + this.radius > p.y - p.height / 2 &&
          this.y - this.radius < p.y + p.height / 2
        ) {
          this.x = p.x + p.width / 2 + this.radius;
          this.vx *= -1;
          this.vy += p.vel * dragEffect;
          this.limitSpeed();
        }
      }

      if (p.type === "right") {
        if (
          this.x + this.radius > screenWidth - p.width - screenPadding &&
          this.y + this.radius > p.y - p.height / 2 &&
          this.y - this.radius < p.y + p.height / 2
        ) {
          this.x = p.x - p.width / 2 - this.radius;
          this.vx *= -1;
          this.vy += p.vel * dragEffect;
          this.limitSpeed();
        }
      }

      if (p.type === "top") {
        if (
          this.y - this.radius < p.width + screenPadding &&
          this.x + this.radius > p.x - p.height / 2 &&
          this.x - this.radius < p.x + p.height / 2
        ) {
          this.y = p.y + p.width / 2 + this.radius;
          this.vy *= -1;
          this.vx += p.vel * dragEffect;
          this.limitSpeed();
        }
      }

      if (p.type === "bottom") {
        if (
          this.y + this.radius > screenHeight - p.width - screenPadding &&
          this.x + this.radius > p.x - p.height / 2 &&
          this.x - this.radius < p.x + p.height / 2
        ) {
          this.y = p.y - p.width / 2 - this.radius;
          this.vy *= -1;
          this.vx += p.vel * dragEffect;
          this.limitSpeed();
        }
      }
    }

    const onHit = (type) => {
      const player = players.find((p) => p.type === type && !p.isDed);
      if (player) player.onHit();

      return player !== undefined;
    };

    if (this.y < 0) {
      if (!onHit("top")) {
        this.vy *= -1;
        this.y = 0;
      }
    } else if (this.y > screenHeight) {
      if (!onHit("bottom")) {
        this.vy *= -1;
        this.y = screenHeight;
      }
    } else if (this.x < 0) {
      if (!onHit("left")) {
        this.vx *= -1;
        this.x = 0;
      }
    } else if (this.x > screenWidth) {
      if (!onHit("right")) {
        this.vx *= -1;
        this.x = screenWidth;
      }
    }
  }

  render() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}

class Countdown extends Entity {
  countdownTimer = 0;

  reset() {
    this.countdownTimer = 3;
  }

  update() {
    if (gameState !== "countdown") return;

    this.countdownTimer -= dt * 1.5;
    if (this.countdownTimer <= 0) {
      gameState = "playing";
    }
  }

  render() {
    if (gameState !== "countdown") return;

    ctx.save();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let scale = Math.abs(Math.sin(Math.PI * (this.countdownTimer + 0.5)));

    scale = 1 - Math.pow(scale, 4);

    ctx.translate(screenWidth / 2, screenHeight / 2);
    ctx.translate(0, -70);
    ctx.scale(5, 5);
    ctx.scale(scale, scale);

    ctx.fillText(Math.ceil(this.countdownTimer), 0, 0);

    ctx.restore();
  }
}

/**
 * @type {"countdown" | "playing" | "gameover"}
 */
let gameState = "countdown";

const countdown = new Countdown();

const screenPadding = 20;

const ball = new Ball();

const playerNamesLabel = new PlayerNames();

function render() {
  // BG CLEAR
  ctx.fillStyle = ui.backgroundColorEl.value;
  ctx.fillRect(0, 0, screenWidth * 2, screenHeight * 2);
  ctx.fillStyle = "orange";

  ctx.save();
  // Fix the origin to the middle
  ctx.translate(screenGap, screenGap);

  renderScene();
  ctx.restore();
}

function renderScene() {
  ctx.imageSmoothingEnabled = false;

  // Border
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, screenWidth, screenHeight);

  // Dotted middle line
  ctx.save();
  ctx.strokeStyle = "#CCCC";
  ctx.lineWidth = 2;
  ctx.setLineDash([10]);

  ctx.beginPath();
  const dashGap = 60;
  ctx.moveTo(screenWidth / 2, dashGap);
  ctx.lineTo(screenWidth / 2, screenHeight - dashGap);

  ctx.moveTo(dashGap, screenHeight / 2);
  ctx.lineTo(screenWidth - dashGap, screenHeight / 2);
  ctx.stroke();

  ctx.restore();

  // Render
  players.filter((p) => !p.isDed).forEach((p) => p.render());
  ball.render();
  playerNamesLabel.render();
  countdown.render();

  //score board
  // ctx.save();
  // ctx.textBaseline = "top";
  // ctx.textAlign = "left";

  // ctx.fillText("P1: " + p1.score, 20, 20);
  // ctx.textAlign = "right";
  // ctx.fillText("P2: " + p2.score, width - 20, 20);
  // ctx.restore();
}

function onScore() {
  const alivePlayers = players.filter((p) => !p.isDed).length;

  onRoundStart();
  if (alivePlayers === 1) {
    // Score
    const winner = players.find((p) => !p.isDed);

    console.log("Winner: ", winner.name);

    alert("Winner: " + winner.name);
    onGameEnd();
    return;
  }
}

async function startGame() {
  onGameStart();
}

function onRoundStart() {
  gameState = "countdown";

  console.log("ROUND");
  ball.reset();
  countdown.reset();
}

function onGameStart() {
  window.focus = null;
  gameState = "countdown";

  ui.showGame();

  players.forEach((p) => p.reset());
  onRoundStart();
}

function onGameEnd() {
  gameState = "gameover";

  const winner = players.find((p) => !p.isDed);

  requester.postGameResult(winner);

  if (!tournament.isTournament) {
    allPlayers.forEach((p) => p.reset());
    ui.showMenu();
  }
  ui.hideGame();
}

function updateScene() {
  if (gameState === "playing") {
    ball.update();
  }

  countdown.update();
  players.forEach((p) => p.update());
}

let lastTime = -1 / 60;
let dt = 1 / 60;

function renderLoop(now) {
  dt = (now - lastTime) / 1000;
  if (isKeyDown("q")) dt = dt * 30;
  lastTime = now;
  requestAnimationFrame(renderLoop);

  updateScene();

  render();
}

renderLoop(0);
init();
