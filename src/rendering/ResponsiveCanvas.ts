/**
 * ResponsiveCanvas - Handles responsive canvas sizing and scaling
 */

export interface ResponsiveConfig {
  targetWidth: number;
  targetHeight: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  scaleMode?: 'fit' | 'fill' | 'stretch';
}

export class ResponsiveCanvas {
  private canvas: HTMLCanvasElement;
  private container: HTMLElement;
  private config: Required<ResponsiveConfig>;
  private resizeObserver: ResizeObserver;
  private scale: { x: number; y: number } = { x: 1, y: 1 };

  constructor(canvas: HTMLCanvasElement, config: ResponsiveConfig) {
    this.canvas = canvas;
    this.container = canvas.parentElement || document.body;

    // Set default config
    this.config = {
      targetWidth: config.targetWidth,
      targetHeight: config.targetHeight,
      minWidth: config.minWidth || 320,
      minHeight: config.minHeight || 240,
      maxWidth: config.maxWidth || 1920,
      maxHeight: config.maxHeight || 1080,
      aspectRatio:
        config.aspectRatio || config.targetWidth / config.targetHeight,
      scaleMode: config.scaleMode || 'fit',
    };

    this.setupCanvas();
    this.setupResizeObserver();
    this.resize();
  }

  private setupCanvas(): void {
    // Enable high DPI rendering
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.touchAction = 'none'; // Prevent touch scrolling
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(this.container);

    // Also listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      window.setTimeout(() => this.resize(), 100);
    });
  }

  private resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;

    let canvasWidth: number;
    let canvasHeight: number;

    switch (this.config.scaleMode) {
      case 'fill':
        // Fill container, may crop
        canvasWidth = containerWidth;
        canvasHeight = containerHeight;
        break;

      case 'stretch':
        // Stretch to fill, ignores aspect ratio
        canvasWidth = containerWidth;
        canvasHeight = containerHeight;
        break;

      case 'fit':
      default:
        // Fit inside container, maintain aspect ratio
        canvasWidth = containerWidth;
        canvasHeight = canvasWidth / this.config.aspectRatio;

        if (canvasHeight > containerHeight) {
          canvasHeight = containerHeight;
          canvasWidth = canvasHeight * this.config.aspectRatio;
        }
        break;
    }

    // Apply constraints
    canvasWidth = Math.max(
      this.config.minWidth,
      Math.min(this.config.maxWidth, canvasWidth)
    );
    canvasHeight = Math.max(
      this.config.minHeight,
      Math.min(this.config.maxHeight, canvasHeight)
    );

    // Calculate scale factors
    this.scale.x = canvasWidth / this.config.targetWidth;
    this.scale.y = canvasHeight / this.config.targetHeight;

    // Set canvas size (physical pixels)
    this.canvas.width = Math.floor(canvasWidth * dpr);
    this.canvas.height = Math.floor(canvasHeight * dpr);

    // Set canvas style size (CSS pixels)
    this.canvas.style.width = `${canvasWidth}px`;
    this.canvas.style.height = `${canvasHeight}px`;

    // Scale canvas context for high DPI
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr * this.scale.x, 0, 0, dpr * this.scale.y, 0, 0);
    }

    // Dispatch resize event
    this.canvas.dispatchEvent(
      new CustomEvent('canvasresize', {
        detail: {
          width: this.canvas.width,
          height: this.canvas.height,
          scale: this.scale,
          dpr,
        },
      })
    );
  }

  /**
   * Get current scale factors
   */
  getScale(): { x: number; y: number } {
    return { ...this.scale };
  }

  /**
   * Get logical canvas dimensions
   */
  getLogicalSize(): { width: number; height: number } {
    return {
      width: this.config.targetWidth,
      height: this.config.targetHeight,
    };
  }

  /**
   * Get physical canvas dimensions
   */
  getPhysicalSize(): { width: number; height: number } {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  /**
   * Convert screen coordinates to canvas coordinates
   */
  screenToCanvas(screenX: number, screenY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((screenX - rect.left) / rect.width) * this.config.targetWidth;
    const y = ((screenY - rect.top) / rect.height) * this.config.targetHeight;
    return { x, y };
  }

  /**
   * Convert canvas coordinates to screen coordinates
   */
  canvasToScreen(canvasX: number, canvasY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const x = (canvasX / this.config.targetWidth) * rect.width + rect.left;
    const y = (canvasY / this.config.targetHeight) * rect.height + rect.top;
    return { x, y };
  }

  /**
   * Check if device is mobile
   */
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /**
   * Check if device is touch-enabled
   */
  static isTouchDevice(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).msMaxTouchPoints > 0
    );
  }

  /**
   * Get optimal resolution for device
   */
  static getOptimalResolution(): { width: number; height: number } {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Mobile devices
    if (ResponsiveCanvas.isMobile()) {
      return {
        width: Math.min(width, 800),
        height: Math.min(height, 600),
      };
    }

    // Desktop devices
    return {
      width: Math.min(width, 1920),
      height: Math.min(height, 1080),
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.resizeObserver.disconnect();
    window.removeEventListener('orientationchange', () => this.resize());
  }
}
