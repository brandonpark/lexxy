import { $setSelection, COMMAND_PRIORITY_HIGH, KEY_DOWN_COMMAND } from "lexical"

import { $isActionTextAttachmentNode } from "../../nodes/action_text_attachment_node"
import { $findOrCreateGalleryForImage, $isImageGalleryNode, ImageGalleryNode } from "../../nodes/image_gallery_node"
import { $isProvisionalParagraphNode } from "../../nodes/provisional_paragraph_node"
import { Direction } from "../../helpers/direction"
import { $createNodeSelectionWith, $singleSelectedNode, announceFromEditor } from "../../helpers/lexical_helper"
import { ListenerBin } from "../../helpers/listener_helper"

export class AttachmentKeyboardMove {
  #editor
  #listeners = new ListenerBin()

  constructor(editor) {
    this.#editor = editor

    this.#listeners.track(
      editor.registerCommand(KEY_DOWN_COMMAND, this.#tryReorder, COMMAND_PRIORITY_HIGH)
    )
  }

  destroy() {
    this.#listeners.dispose()
  }

  #tryReorder = (event) => {
    if (event.altKey && event.shiftKey && event.key.startsWith("Arrow")) {
      const node = $singleSelectedNode()
      if ($isActionTextAttachmentNode(node)) {
        event.preventDefault()
        const message = this.#executeMove(event.key, node)
        $setSelection($createNodeSelectionWith(node))
        announceFromEditor(this.#editor, message)
        return true
      }
    }
    return false
  }

  #executeMove(key, node) {
    switch (key) {
      case "ArrowUp": return new AttachmentReorder(node, Direction.previous).moveVertically()
      case "ArrowDown": return new AttachmentReorder(node, Direction.next).moveVertically()
      case "ArrowLeft": return new AttachmentReorder(node, Direction.previous).reorderInGallery()
      case "ArrowRight": return new AttachmentReorder(node, Direction.next).reorderInGallery()
      default: return null
    }
  }
}

class AttachmentReorder {
  constructor(node, direction) {
    this.node = node
    this.direction = direction
  }

  moveVertically() {
    if ($isImageGalleryNode(this.node.getParent())) {
      return this.#extractFromGallery()
    } else {
      return this.#moveBlock() || this.#blockedMessage
    }
  }

  reorderInGallery() {
    if ($isImageGalleryNode(this.node.getParent())) {
      const sibling = this.direction.siblingOf(this.node)
      if (sibling) {
        this.direction.insertBeside(sibling, this.node)
        return "Image reordered in gallery"
      }
    }
    return this.#blockedMessage
  }

  #extractFromGallery() {
    const gallery = this.node.getParent()
    this.direction.insertBeside(gallery, this.node)
    return "Image removed from gallery"
  }

  #moveBlock() {
    const target = this.#skipProvisional(this.direction.siblingOf(this.node))
    if (this.#canJoinGallery(target)) {
      return this.#joinGallery(target)
    } else if (this.#canFormGalleryWith(target)) {
      return this.#formGalleryWith(target)
    } else if (target) {
      return this.#swapWith(target)
    } else {
      return null
    }
  }

  #skipProvisional(node) {
    let current = node
    while (current && $isProvisionalParagraphNode(current)) {
      current = this.direction.siblingOf(current)
    }
    return current
  }

  #canJoinGallery(target) {
    return $isImageGalleryNode(target) && ImageGalleryNode.isValidChild(this.node)
  }

  #joinGallery(gallery) {
    if (this.direction.isNext && gallery.getFirstChild()) {
      gallery.getFirstChild().insertBefore(this.node)
    } else {
      gallery.append(this.node)
    }
    return "Image added to gallery"
  }

  #canFormGalleryWith(target) {
    return $isActionTextAttachmentNode(target)
      && target.isPreviewableImage
      && this.node.isPreviewableImage
  }

  #formGalleryWith(target) {
    if ($findOrCreateGalleryForImage(target)) {
      if (this.direction.isNext) {
        target.insertBefore(this.node)
      } else {
        target.insertAfter(this.node)
      }
      return "Gallery created"
    } else {
      return null
    }
  }

  #swapWith(target) {
    this.direction.insertBeside(target, this.node)
    return this.direction.isNext ? "Attachment moved down" : "Attachment moved up"
  }

  get #blockedMessage() {
    return this.direction.isNext ? "Already at the end" : "Already at the start"
  }
}
