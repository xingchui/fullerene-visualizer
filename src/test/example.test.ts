import { describe, it, expect } from 'vitest'

describe('Example Test', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle array operations', () => {
    const arr = [1, 2, 3]
    expect(arr.length).toBe(3)
    expect(arr.push(4)).toBe(4)
    expect(arr).toContain(4)
  })
})
