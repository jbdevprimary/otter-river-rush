/**
 * Physics system for game objects
 */

import type { Transform, Vector2D } from '@/types/Game.types';
import { CONFIG } from '@/utils/Config';
import { vec2, clamp } from '@/utils/MathUtils';

export class PhysicsSystem {
  private gravity: Vector2D;
  private friction: number;
  private maxVelocity: number;

  constructor() {
    this.gravity = { x: 0, y: CONFIG.physics.gravity };
    this.friction = CONFIG.physics.friction;
    this.maxVelocity = CONFIG.physics.maxVelocity;
  }

  /**
   * Apply gravity to transform
   */
  public applyGravity(transform: Transform, deltaTime: number): void {
    const gravityForce = vec2.multiply(this.gravity, deltaTime);
    transform.velocity = vec2.add(transform.velocity, gravityForce);
  }

  /**
   * Apply friction to transform
   */
  public applyFriction(transform: Transform): void {
    transform.velocity.x *= this.friction;
    transform.velocity.y *= this.friction;
  }

  /**
   * Apply force to transform
   */
  public applyForce(
    transform: Transform,
    force: Vector2D,
    deltaTime: number
  ): void {
    const acceleration = vec2.multiply(force, deltaTime);
    transform.velocity = vec2.add(transform.velocity, acceleration);
  }

  /**
   * Apply impulse (instant force)
   */
  public applyImpulse(transform: Transform, impulse: Vector2D): void {
    transform.velocity = vec2.add(transform.velocity, impulse);
  }

  /**
   * Clamp velocity to maximum
   */
  public clampVelocity(transform: Transform): void {
    const magnitude = vec2.magnitude(transform.velocity);
    if (magnitude > this.maxVelocity) {
      const normalized = vec2.normalize(transform.velocity);
      transform.velocity = vec2.multiply(normalized, this.maxVelocity);
    }
  }

  /**
   * Update position based on velocity
   */
  public updatePosition(transform: Transform, deltaTime: number): void {
    const displacement = vec2.multiply(transform.velocity, deltaTime);
    transform.position = vec2.add(transform.position, displacement);
  }

  /**
   * Update rotation based on angular velocity
   */
  public updateRotation(
    transform: Transform,
    angularVelocity: number,
    deltaTime: number
  ): void {
    transform.rotation += angularVelocity * deltaTime;
  }

  /**
   * Resolve collision between two objects
   */
  public resolveCollision(
    transformA: Transform,
    transformB: Transform,
    normal: Vector2D
  ): void {
    // Calculate relative velocity
    const relativeVelocity = vec2.subtract(
      transformA.velocity,
      transformB.velocity
    );

    // Calculate relative velocity in terms of the normal direction
    const velAlongNormal = vec2.dot(relativeVelocity, normal);

    // Do not resolve if velocities are separating
    if (velAlongNormal > 0) return;

    // Calculate restitution (bounciness)
    const restitution = CONFIG.physics.collisionDamping;

    // Calculate impulse scalar
    const j = -(1 + restitution) * velAlongNormal;
    const impulse = vec2.multiply(normal, j / 2);

    // Apply impulse
    transformA.velocity = vec2.add(transformA.velocity, impulse);
    transformB.velocity = vec2.subtract(transformB.velocity, impulse);
  }

  /**
   * Check if object is at rest
   */
  public isAtRest(transform: Transform, threshold = 0.1): boolean {
    return vec2.magnitude(transform.velocity) < threshold;
  }

  /**
   * Stop object completely
   */
  public stop(transform: Transform): void {
    transform.velocity.x = 0;
    transform.velocity.y = 0;
  }

  /**
   * Move object towards target position
   */
  public moveTowards(
    transform: Transform,
    target: Vector2D,
    speed: number,
    deltaTime: number
  ): void {
    const direction = vec2.normalize(vec2.subtract(target, transform.position));
    const velocity = vec2.multiply(direction, speed);
    const displacement = vec2.multiply(velocity, deltaTime);
    transform.position = vec2.add(transform.position, displacement);
  }

  /**
   * Smooth damp (spring-like movement)
   */
  public smoothDamp(
    current: number,
    target: number,
    currentVelocity: { value: number },
    smoothTime: number,
    maxSpeed: number,
    deltaTime: number
  ): number {
    smoothTime = Math.max(0.0001, smoothTime);
    const omega = 2 / smoothTime;
    const x = omega * deltaTime;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

    let change = current - target;
    const originalTo = target;

    const maxChange = maxSpeed * smoothTime;
    change = clamp(change, -maxChange, maxChange);
    const newTarget = current - change;

    const temp = (currentVelocity.value + omega * change) * deltaTime;
    currentVelocity.value = (currentVelocity.value - omega * temp) * exp;

    let output = newTarget + (change + temp) * exp;

    if (originalTo - current > 0 === output > originalTo) {
      output = originalTo;
      currentVelocity.value = (output - originalTo) / deltaTime;
    }

    return output;
  }

  /**
   * Raycast (line intersection with objects)
   */
  public raycast(
    origin: Vector2D,
    direction: Vector2D,
    maxDistance: number
  ): { hit: boolean; distance: number; point: Vector2D } {
    // Simplified raycast - to be implemented with actual objects
    const normalized = vec2.normalize(direction);
    const endPoint = vec2.add(origin, vec2.multiply(normalized, maxDistance));

    return {
      hit: false,
      distance: maxDistance,
      point: endPoint,
    };
  }

  /**
   * Set gravity
   */
  public setGravity(gravity: Vector2D): void {
    this.gravity = gravity;
  }

  /**
   * Set friction
   */
  public setFriction(friction: number): void {
    this.friction = clamp(friction, 0, 1);
  }

  /**
   * Set max velocity
   */
  public setMaxVelocity(maxVelocity: number): void {
    this.maxVelocity = Math.max(0, maxVelocity);
  }
}
