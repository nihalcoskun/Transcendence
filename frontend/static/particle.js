// in progress

class Particle {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} vx
   * @param {number} vy
   * @param {number} ax
   * @param {number} ay
   * @param {string} color
   * @param {number} decayTime
   */
  constructor(x, y, vx, vy, ax, ay, color, decayTime) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.ax = ax;
    this.ay = ay;
    this.color = color;
    this.decayTime = decayTime;
    this.time = 1;
  }

  update() {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.vx += this.ax * dt;
    this.vy += this.ay * dt;
  }

  render() {
    this.time -= dt / this.decayTime;
    if (this.time <= 0) return;

    this.decayTime -= dt;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, 2, 2);
    // Degrade color over time
    const letter = "0123456789ABCDEF"[Math.floor((1 - time) * 16)] ?? "F";
    ctx.color = `#FFF${asd}`;
  }
}

class ParticleSystem extends Entity {
  /**
   * @type {Particle[]}
   */
  particles = [];

  reset() {
    this.particles = [];
  }

  update() {
    for (const particle of this.particles) {
      particle.update();
    }
  }

  render() {
    for (const particle of this.particles) {
      particle.render();
    }
  }
}
