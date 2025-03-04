import { Player } from './player.js';
import { Platform } from './platform.js';
import { Camera } from './camera.js';
import { TouchControls } from './touchControls.js';
import { Zombie } from './zombie.js';
import { Sword } from './weapon.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.setCanvasSize();
    
    // Create player with better initial spawn position
    this.player = new Player(100, 300);
    this.platforms = [
      // Base platforms with better spacing
      new Platform(0, 500, 800, 100),
      new Platform(-200, 500, 200, 100),
      new Platform(800, 500, 400, 100),
      
      // Middle platforms
      new Platform(300, 400, 200, 20),
      new Platform(600, 300, 200, 20),
      new Platform(100, 200, 200, 20),
      
      // Higher platforms
      new Platform(-100, 300, 150, 20),
      new Platform(900, 200, 150, 20),
      new Platform(400, 150, 150, 20),
      
      // Challenge platforms
      new Platform(700, 100, 80, 20),
      new Platform(900, 50, 80, 20),
      new Platform(1100, 0, 80, 20),
      
      // Floating islands
      new Platform(-300, 200, 120, 80),
      new Platform(-500, 300, 120, 80),
      new Platform(1200, 200, 120, 80),
      
      // Secret upper platforms
      new Platform(200, 0, 100, 20),
      new Platform(0, -100, 100, 20),
      new Platform(400, -150, 100, 20),
      
      // Lower platforms
      new Platform(-200, 700, 150, 20),
      new Platform(400, 650, 150, 20),
      new Platform(800, 750, 150, 20),
      
      // Far side platforms
      new Platform(-800, 400, 200, 20),
      new Platform(-600, 250, 200, 20),
      new Platform(1400, 400, 200, 20)
    ];
    
    this.zombies = [
      new Zombie(400, 0),
      new Zombie(800, 0),
      new Zombie(-200, 0),
      new Zombie(1000, 0)
    ];
    
    this.sword = new Sword();
    
    this.camera = new Camera();
    this.touchControls = new TouchControls();
    
    window.addEventListener('resize', () => this.setCanvasSize());
    this.setupControls();
  }

  setCanvasSize() {
    // Use device pixel ratio for sharp rendering on mobile
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
  }

  setupControls() {
    this.keys = {};
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyF') {
        this.sword.swing();
      } else {
        !this.keys[e.code] ? this.keys[e.code] = true : null;
      }
    });
    window.addEventListener('keyup', (e) => this.keys[e.code] = false);

    // Prevent default touch behaviors
    document.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }

  update() {
    // Handle keyboard controls
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      this.player.moveLeft();
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      this.player.moveRight(); 
    }
    if (this.keys['Space'] || this.keys['ArrowUp'] || this.keys['KeyW']) {
      this.player.jump();
    }

    // Handle attack input
    if (this.keys['KeyF'] || this.touchControls.attackPressed) {
      this.sword.swing();
    }

    // Handle touch controls
    const touchInput = this.touchControls.getInput();
    if (touchInput.left) this.player.moveLeft();
    if (touchInput.right) this.player.moveRight();
    if (touchInput.jump) this.player.jump();

    this.player.update();
    this.sword.update(this.player);

    // Update zombies
    this.zombies.forEach(zombie => {
      zombie.update(this.player, this.platforms);
      
      // Check for sword hits on zombies
      if (this.sword.isSwinging) {
        const hitbox = {
          x: this.player.x + (this.player.velocityX >= 0 ? this.player.width : -40),
          y: this.player.y,
          width: 40,
          height: this.player.height
        };
        
        if (this.checkCollision(hitbox, zombie)) {
          zombie.takeDamage(this.sword.damage);
        }
      }

      // Check for zombie collision with player
      if (zombie.isAlive && this.checkCollision(this.player, zombie)) {
        this.player.takeDamage(10);
      }
    });

    // Handle collisions after movement
    let hasCollision = false;
    this.platforms.forEach(platform => {
      if (this.player.checkCollision(platform)) {
        this.player.handleCollision(platform);
        hasCollision = true;
      }
    });

    // Set jumping state based on collisions
    if (hasCollision) {
      this.player.isJumping = false;
    }

    // Update camera position to follow player
    this.camera.update(this.player);
  }

  checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  render() {
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply camera transform
    this.ctx.save();
    this.camera.apply(this.ctx);

    // Draw platforms
    this.platforms.forEach(platform => platform.draw(this.ctx));
    
    // Draw zombies
    this.zombies.forEach(zombie => zombie.draw(this.ctx));
    
    // Draw player
    this.player.draw(this.ctx);
    
    // Draw sword
    this.sword.draw(this.ctx, this.player, Math.sign(this.player.velocityX) || 1);

    this.ctx.restore();

    // Draw HUD
    this.drawHUD();
    
    // Draw touch controls
    this.touchControls.draw(this.ctx);
  }

  drawHUD() {
    // Draw health bar
    const barWidth = 200;
    const barHeight = 20;
    const barX = 20;
    const barY = 20;
    
    // Background
    this.ctx.fillStyle = '#444';
    this.ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Health fill
    this.ctx.fillStyle = '#e53935';
    this.ctx.fillRect(barX, barY, barWidth * (this.player.health/100), barHeight);
    
    // Border
    this.ctx.strokeStyle = '#fff';
    this.ctx.strokeRect(barX, barY, barWidth, barHeight);
  }

  gameLoop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }

  start() {
    this.gameLoop();
  }
}