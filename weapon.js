export class Sword {
  constructor() {
    this.width = 40;
    this.height = 40;
    this.damage = 25;
    this.isSwinging = false;
    this.swingDuration = 15;
    this.swingFrame = 0;
    
    // Load sword image
    this.image = new Image();
    this.image.src = '/sword roblox.png';
  }

  swing() {
    if (!this.isSwinging) {
      this.isSwinging = true;
      this.swingFrame = 0;
    }
  }

  update(player) {
    if (this.isSwinging) {
      this.swingFrame++;
      if (this.swingFrame >= this.swingDuration) {
        this.isSwinging = false;
      }
    }
  }

  draw(ctx, player, facingDirection) {
    if (!this.image.complete) return;

    ctx.save();
    
    // Position sword relative to player
    const pivotX = player.x + player.width/2;
    const pivotY = player.y + player.height/2;
    
    ctx.translate(pivotX, pivotY);
    
    // Flip based on player direction
    if (facingDirection < 0) {
      ctx.scale(-1, 1);
    }
    
    // Rotate sword based on swing animation
    if (this.isSwinging) {
      const swingAngle = (Math.PI/2) * (this.swingFrame/this.swingDuration);
      ctx.rotate(-Math.PI/4 + swingAngle);
    } else {
      ctx.rotate(-Math.PI/4);
    }
    
    // Draw sword
    ctx.drawImage(
      this.image,
      -this.width/2,
      -this.height/2,
      this.width,
      this.height
    );
    
    ctx.restore();
  }
}