export class Direction {
  constructor({ isNext }) {
    this.isNext = isNext
  }

  get isPrevious() {
    return !this.isNext
  }

  siblingOf(node) {
    return this.isNext ? node.getNextSibling() : node.getPreviousSibling()
  }

  edgeChildOf(block) {
    return this.isNext ? block.getFirstChild() : block.getLastChild()
  }

  enterEdgeOf(node) {
    if (this.isNext) {
      node.selectStart()
    } else {
      node.selectEnd()
    }
  }

  insertBeside(reference, node) {
    if (this.isNext) {
      reference.insertAfter(node)
    } else {
      reference.insertBefore(node)
    }
  }
}

Direction.next = new Direction({ isNext: true })
Direction.previous = new Direction({ isNext: false })
