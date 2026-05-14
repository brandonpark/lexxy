import { describe, expect, test } from "vitest"
import { Direction } from "src/helpers/direction"

const node = (overrides = {}) => ({
  getNextSibling: () => "next-sibling",
  getPreviousSibling: () => "prev-sibling",
  getFirstChild: () => "first-child",
  getLastChild: () => "last-child",
  selectStart: () => "select-start",
  selectEnd: () => "select-end",
  insertBefore: (...args) => [ "insert-before", ...args ],
  insertAfter: (...args) => [ "insert-after", ...args ],
  ...overrides
})

describe("Direction.next", () => {
  test("isNext is true and isPrevious is false", () => {
    expect(Direction.next.isNext).toBe(true)
    expect(Direction.next.isPrevious).toBe(false)
  })

  test("siblingOf returns the next sibling", () => {
    expect(Direction.next.siblingOf(node())).toBe("next-sibling")
  })

  test("edgeChildOf returns the first child", () => {
    expect(Direction.next.edgeChildOf(node())).toBe("first-child")
  })

  test("enterEdgeOf calls selectStart", () => {
    const calls = []
    Direction.next.enterEdgeOf({ selectStart: () => calls.push("start"), selectEnd: () => calls.push("end") })
    expect(calls).toEqual([ "start" ])
  })

  test("insertBeside calls insertAfter on the reference", () => {
    const calls = []
    Direction.next.insertBeside({ insertBefore: () => calls.push("before"), insertAfter: () => calls.push("after") }, "node")
    expect(calls).toEqual([ "after" ])
  })
})

describe("Direction.previous", () => {
  test("isNext is false and isPrevious is true", () => {
    expect(Direction.previous.isNext).toBe(false)
    expect(Direction.previous.isPrevious).toBe(true)
  })

  test("siblingOf returns the previous sibling", () => {
    expect(Direction.previous.siblingOf(node())).toBe("prev-sibling")
  })

  test("edgeChildOf returns the last child", () => {
    expect(Direction.previous.edgeChildOf(node())).toBe("last-child")
  })

  test("enterEdgeOf calls selectEnd", () => {
    const calls = []
    Direction.previous.enterEdgeOf({ selectStart: () => calls.push("start"), selectEnd: () => calls.push("end") })
    expect(calls).toEqual([ "end" ])
  })

  test("insertBeside calls insertBefore on the reference", () => {
    const calls = []
    Direction.previous.insertBeside({ insertBefore: () => calls.push("before"), insertAfter: () => calls.push("after") }, "node")
    expect(calls).toEqual([ "before" ])
  })
})
