export type InputCallback = () => void;

export class InputHandler {
  private leftCallbacks: InputCallback[] = [];
  private rightCallbacks: InputCallback[] = [];
  private pauseCallbacks: InputCallback[] = [];
  private touchStartX: number | null = null;
  private touchStartY: number | null = null;
  private swipeThreshold = 50; // Increased for better swipe detection
  private isSwiping = false;

  constructor(canvas: HTMLCanvasElement) {
    this.setupKeyboardInput();
    this.setupTouchInput(canvas);
    this.setupMouseInput(canvas);
  }

  private setupKeyboardInput(): void {
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          this.triggerLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          this.triggerRight();
          break;
        case 'Escape':
        case 'p':
        case 'P':
          e.preventDefault();
          this.triggerPause();
          break;
      }
    });
  }

  private setupTouchInput(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.isSwiping = false;
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.touchStartX !== null && e.touches.length > 0) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = Math.abs(touch.clientY - this.touchStartY!);

        // Detect horizontal swipe (not vertical)
        if (
          !this.isSwiping &&
          Math.abs(deltaX) > this.swipeThreshold &&
          deltaY < this.swipeThreshold * 2
        ) {
          this.isSwiping = true;
          if (deltaX < 0) {
            this.triggerLeft();
          } else {
            this.triggerRight();
          }
        }
      }
    });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.touchStartX = null;
      this.touchStartY = null;
      this.isSwiping = false;
    });
  }

  private setupMouseInput(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const canvasWidth = rect.width;

      if (x < canvasWidth / 2) {
        this.triggerLeft();
      } else {
        this.triggerRight();
      }
    });
  }

  onLeft(callback: InputCallback): void {
    this.leftCallbacks.push(callback);
  }

  onRight(callback: InputCallback): void {
    this.rightCallbacks.push(callback);
  }

  onPause(callback: InputCallback): void {
    this.pauseCallbacks.push(callback);
  }

  private triggerLeft(): void {
    this.leftCallbacks.forEach((cb) => cb());
  }

  private triggerRight(): void {
    this.rightCallbacks.forEach((cb) => cb());
  }

  private triggerPause(): void {
    this.pauseCallbacks.forEach((cb) => cb());
  }

  cleanup(): void {
    this.leftCallbacks = [];
    this.rightCallbacks = [];
    this.pauseCallbacks = [];
  }
}
