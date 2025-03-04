export class Zombie {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = 2;
    this.gravity = 0.8;
    this.health = 100;
    this.isAlive = true;
    
    // Load zombie (alien cat) image
    this.image = new Image();
    this.image.src = '/glorp.png';
  }

  update(player, platforms) {
    if (!this.isAlive) return;

    // Basic AI - move towards player
    const direction = player.x > this.x ? 1 : -1;
    this.velocityX = direction * this.speed;

    // Apply gravity
    this.velocityY += this.gravity;
    
    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Check platform collisions
    platforms.forEach(platform => {
      if (this.checkCollision(platform)) {
        this.handleCollision(platform);
      }
    });
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
    if (this.y + this.height > platform.y && this.velocityY > 0) {
      this.y = platform.y - this.height;
      this.velocityY = 0;
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.isAlive = false;
    }
  }

  draw(ctx) {
    if (!this.isAlive) return;

    // Draw the zombie
    if (this.image.complete) {
      const direction = this.velocityX < 0 ? -1 : 1;
      ctx.save();
      if (direction < 0) {
        ctx.scale(-1, 1);
        ctx.drawImage(this.image, -(this.x + this.width), this.y, this.width, this.height);
      } else {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      }
      ctx.restore();
    }
  }
}