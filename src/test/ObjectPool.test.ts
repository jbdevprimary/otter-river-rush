import { describe, it, expect, beforeEach } from 'vitest';
import { ObjectPool } from '../utils/ObjectPool';

class TestObject {
  value: number = 0;
  active: boolean = false;
}

describe('ObjectPool', () => {
  let pool: ObjectPool<TestObject>;

  beforeEach(() => {
    pool = new ObjectPool(
      () => new TestObject(),
      (obj) => {
        obj.value = 0;
        obj.active = false;
      },
      5
    );
  });

  it('should create initial pool size', () => {
    expect(pool.getPoolSize()).toBe(5);
    expect(pool.getActiveCount()).toBe(0);
  });

  it('should acquire objects from pool', () => {
    const obj = pool.acquire();
    expect(obj).toBeInstanceOf(TestObject);
    expect(pool.getActiveCount()).toBe(1);
    expect(pool.getPoolSize()).toBe(4);
  });

  it('should release objects back to pool', () => {
    const obj = pool.acquire();
    obj.value = 42;
    pool.release(obj);

    expect(pool.getActiveCount()).toBe(0);
    expect(pool.getPoolSize()).toBe(5);
    expect(obj.value).toBe(0);
  });

  it('should create new objects when pool is empty', () => {
    for (let i = 0; i < 10; i++) {
      pool.acquire();
    }
    expect(pool.getActiveCount()).toBe(10);
    expect(pool.getPoolSize()).toBe(0);
  });

  it('should release all active objects', () => {
    for (let i = 0; i < 3; i++) {
      pool.acquire();
    }
    pool.releaseAll();
    expect(pool.getActiveCount()).toBe(0);
    expect(pool.getPoolSize()).toBe(5);
  });

  it('should get active objects', () => {
    const obj1 = pool.acquire();
    const obj2 = pool.acquire();
    const active = pool.getActive();

    expect(active).toHaveLength(2);
    expect(active).toContain(obj1);
    expect(active).toContain(obj2);
  });
});
