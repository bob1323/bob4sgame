export class Player {
  constructor(x, y) {
    this.initialX = x;
    this.initialY = y;
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 60;
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = 5;
    this.jumpForce = 15;
    this.gravity = 0.8;
    this.isJumping = false;
    
    // Load the noob image
    this.image = new Image();
    this.image.src = '/noob.png';
    // Keep aspect ratio of the noob image
    this.height = 60;
    this.width = 40;
    
    this.health = 100;
    this.invulnerableFrames = 0;
  }

  respawn() {
    // Reset position to initial spawn point
    this.x = this.initialX;
    this.y = this.initialY;
    // Reset velocities
    this.velocityX = 0;
    this.velocityY = 0;
    this.isJumping = false;
    this.health = 100;
  }

  moveLeft() {
    this.velocityX = -this.speed;
  }

  moveRight() {
    this.velocityX = this.speed;
  }

  jump() {
    if (!this.isJumping) {
      this.velocityY = -this.jumpForce;
      this.isJumping = true;
    }
  }

  update() {
    // Apply gravity
    this.velocityY += this.gravity;

    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Apply friction
    this.velocityX *= 0.9;

    // Check if player fell too far - trigger respawn
    if (this.y > 1200) {
      this.respawn();
    }
    
    if (this.invulnerableFrames > 0) {
      this.invulnerableFrames--;
    }
  }

  checkCollision(platform) {
    return (
      this.x < platform.x + platform.width &&
      this.x + this.width > platform.x &&
      this.y < platform.y + platform.height &&
      this.y + this.height > platform.y
    );
  }

  handleCollision(platform) {
    // Calculate overlap on each axis
    const overlapX = Math.min(
      Math.abs((this.x + this.width) - platform.x),
      Math.abs(this.x - (platform.x + platform.width))
    );

    const overlapY = Math.min(
      Math.abs((this.y + this.height) - platform.y),
      Math.abs(this.y - (platform.y + platform.height))
    );

    // Resolve collision on axis with smallest overlap
    if (overlapX < overlapY) {
      // Horizontal collision
      if (this.x < platform.x) {
        this.x = platform.x - this.width;
      } else {
        this.x = platform.x + platform.width;
      }
      this.velocityX = 0;
    } else {
      // Vertical collision  
      if (this.y < platform.y) {
        this.y = platform.y - this.height;
        this.velocityY = 0;
        this.isJumping = false;
      } else {
        this.y = platform.y + platform.height;
        this.velocityY = 0;
      }
    }
  }

  takeDamage(amount) {
    if (this.invulnerableFrames > 0) return;
    
    this.health -= amount;
    this.invulnerableFrames = 30; // Brief invulnerability after taking damage
    
    if (this.health <= 0) {
      this.respawn();
    }
  }

  draw(ctx) {
    // Draw pseudo-3D shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(
      this.x + this.width/2,
      1000,
      this.width/2,
      this.width/4,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Flash when invulnerable
    if (this.invulnerableFrames > 0 && Math.floor(this.invulnerableFrames/3) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    
    // Draw the noob character
    if (this.image.complete) { // Only draw if image is loaded
      // Flip the image based on movement direction
      const direction = this.velocityX < -0.1 ? -1 : this.velocityX > 0.1 ? 1 : 1;
      
      ctx.save();
      if (direction < 0) {
        ctx.scale(-1, 1);
        ctx.drawImage(this.image, -(this.x + this.width), this.y, this.width, this.height);
      } else {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
}