<template>
  <v-layout column>
    <v-layout row>
      <canvas id="canvas" />
    </v-layout>
    <v-layout row justify-start>
      <v-flex xs12 sm5 md2 mr-4 mt-2>
        <v-select
          :items="shapes"
          v-model="selectedShape"
          label="Select Shape"
        />
      </v-flex>
      <v-flex xs12 sm5 md2 mr-4 mt-2>
        <v-select
          :items="colors"
          v-model="selectedColor"
          label="Select Color"
        />
      </v-flex>
      <v-flex xs12 sm5 md2 mr-4 mt-2>
        <v-text-field
          :value="`Zoom: ${zoom}%`"
          readonly
        />
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import { fabric } from 'fabric'

export default {
  data() {
    return {
      canvas: null,
      direction: {
        LEFT: 0,
        UP: 1,
        RIGHT: 2,
        DOWN: 3
      },
      zoomLevel: 0.0,
      zoomLevelMin: -0.5,
      zoomLevelMax: 3.0,
      shiftKeyDown: false,
      ctrlKeyDown: false,
      mouseDownPoint: null,
      cards: [
        {
          id: 'id1',
          name: 'Key partners',
          left: 100,
          top: 50,
          width: 150,
          height: 500,
          fill: '#3dd6cf'
        },
        {
          id: 'id2',
          name: 'Key activities',
          left: 300,
          top: 50,
          width: 150,
          height: 225,
          fill: '#18bdb6'
        },
        {
          id: 'id3',
          name: 'Key resources',
          left: 300,
          top: 325,
          width: 150,
          height: 225,
          fill: '#18bdb6'
        },
        {
          id: 'id4',
          name: 'Key propositions',
          left: 500,
          top: 50,
          width: 150,
          height: 500,
          fill: '#3dd6cf'
        },
        {
          id: 'id5',
          name: 'Customer relationships',
          left: 700,
          top: 50,
          width: 150,
          height: 225,
          fill: '#01aaa3'
        },
        {
          id: 'id6',
          name: 'Channels',
          left: 700,
          top: 325,
          width: 150,
          height: 225,
          fill: '#01aaa3'
        },
        {
          id: 'id7',
          name: 'Customer segments',
          left: 900,
          top: 50,
          width: 150,
          height: 500,
          fill: '#3dd6cf'
        },
        {
          id: 'id8',
          name: 'Cost structure',
          left: 100,
          top: 600,
          width: 450,
          height: 150,
          fill: '#b5b5b5'
        },
        {
          id: 'id9',
          name: 'Revenue streams',
          left: 600,
          top: 600,
          width: 450,
          height: 150,
          fill: '#b5b5b5'
        }
      ],
      shapes: ['None', 'Square'],
      selectedShape: 'None',
      colors: [
        'Black',
        'Maroon',
        'Green',
        'Olive',
        'Navy',
        'Purple',
        'Teal',
        'Silver',
        'Gray',
        'Red',
        'Lime',
        'Yellow',
        'Blue',
        'Fuchsia',
        'Aqua',
        'White'
      ],
      selectedColor: 'Black'
    }
  },
  computed: {
    zoom() {
      return ((1 + this.zoomLevel) * 100).toFixed(2)
    }
  },
  mounted() {
    this.canvas = new fabric.Canvas('canvas', {
      width: 1280,
      height: 780,
      selectionKey: 'ctrlKey'
    })

    this.cards.forEach(card => {
      const board = new fabric.Rect({
        left: card.left,
        top: card.top,
        width: card.width,
        height: card.height,
        fill: card.fill
      })

      const boardTitle = new fabric.Text(card.name, {
        left: card.left + 2,
        top: card.top + 2,
        fontSize: 10,
        stroke: '#eee',
        fontWeight: 10,
        fontFamily: 'OpenSans'
      })

      const group = new fabric.Group([board, boardTitle], {
        left: card.left,
        top: card.top
      })

      this.canvas.add(group)
    })

    this.canvas.on('mouse:down', options => {
      const pointer = this.canvas.getPointer(options.e, true)
      this.mouseDownPoint = new fabric.Point(pointer.x, pointer.y)

      if (this.selectedShape === 'Square') {
        const rectangle = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 50,
          height: 50,
          fill: this.selectedColor
        })
        this.canvas.add(rectangle)
        this.canvas.setActiveObject(rectangle)
        this.selectedShape = 'None'
      }
    })

    this.canvas.on('mouse:up', options => {
      this.mouseDownPoint = null
    })

    this.canvas.on('mouse:move', options => {
      if (this.shiftKeyDown && this.mouseDownPoint) {
        const pointer = this.canvas.getPointer(options.e, true)
        const mouseMovePoint = new fabric.Point(pointer.x, pointer.y)
        this.canvas.relativePan(mouseMovePoint.subtract(this.mouseDownPoint))
        this.mouseDownPoint = mouseMovePoint
        this.keepPositionInBounds(this.canvas)
      }
    })

    fabric.util.addListener(document.body, 'keydown', options => {
      if (options.repeat) {
        return
      }

      // key detection
      const key = options.which || options.keyCode

      if (key === 16) {
        // handle Shift key
        this.canvas.defaultCursor = 'move'
        this.canvas.selection = false
        this.shiftKeyDown = true
      } else if (key === 37) {
        // handle Left key
        this.move(this.direction.LEFT)
      } else if (key === 38) {
        // handle Up key
        this.move(this.direction.UP)
      } else if (key === 39) {
        // handle Right key
        this.move(this.direction.RIGHT)
      } else if (key === 40) {
        // handle Down key
        this.move(this.direction.DOWN)
      } else if (key === 46) {
        // handle Delete key
        const activeObject = this.canvas.getActiveObject()
        this.canvas.remove(activeObject)
      }
    })

    fabric.util.addListener(document.body, 'keyup', options => {
      // key detection
      const key = options.which || options.keyCode

      if (key === 16) {
        // handle Shift key
        this.canvas.defaultCursor = 'default'
        this.canvas.selection = true
        this.shiftKeyDown = false
      }
    })

    document
      .getElementsByClassName('canvas-container')[0]
      .addEventListener('mousewheel', options => {
        const delta = options.wheelDelta
        if (delta !== 0) {
          const pointer = this.canvas.getPointer(options, true)
          const point = new fabric.Point(pointer.x, pointer.y)
          if (delta > 0) {
            this.zoomIn(point)
          } else if (delta < 0) {
            this.zoomOut(point)
          }
        }
      })
  },
  methods: {
    /* handleMouseDown(options) {
      const pointer = this.canvas.getPointer(options.e, true)
      this.mouseDownPoint = new fabric.Point(pointer.x, pointer.y)
    },
    handleMouseUp(options) {
      this.mouseDownPoint = null
    },
    handleMouseMove(options) {
      if (this.shiftKeyDown && this.mouseDownPoint) {
        const pointer = this.canvas.getPointer(options.e, true)
        const mouseMovePoint = new fabric.Point(pointer.x, pointer.y)
        this.canvas.relativePan(mouseMovePoint.subtract(this.mouseDownPoint))
        this.mouseDownPoint = mouseMovePoint
        this.keepPositionInBounds(this.canvas)
      }
    },
    handleMouseWheel(options) {
      const delta = options.wheelDelta
      if (delta !== 0) {
        const pointer = this.canvas.getPointer(options, true)
        const point = new fabric.Point(pointer.x, pointer.y)
        if (delta > 0) {
          this.zoomIn(point)
        } else if (delta < 0) {
          this.zoomOut(point)
        }
      }
    },
    handleKeyDown(options) {
      if (options.repeat) {
        return
      }

      // key detection
      const key = options.which || options.keyCode

      if (key === 16) {
        // handle Shift key
        this.canvas.defaultCursor = 'move'
        this.canvas.selection = false
        this.shiftKeyDown = true
      } else if (key === 37) {
        // handle Left key
        this.move(this.direction.LEFT)
      } else if (key === 38) {
        // handle Up key
        this.move(this.direction.UP)
      } else if (key === 39) {
        // handle Right key
        this.move(this.direction.RIGHT)
      } else if (key === 40) {
        // handle Down key
        this.move(this.direction.DOWN)
      }
    },
    handleKeyUp(options) {
      // key detection
      const key = options.which || options.keyCode

      if (key === 16) {
        // handle Shift key
        this.canvas.defaultCursor = 'default'
        this.canvas.selection = true
        this.shiftKeyDown = false
      }
    }, */
    move(direction) {
      switch (direction) {
        case this.direction.LEFT:
          this.canvas.relativePan(
            new fabric.Point(-10 * this.canvas.getZoom(), 0)
          )
          break
        case this.direction.UP:
          this.canvas.relativePan(
            new fabric.Point(0, -10 * this.canvas.getZoom())
          )
          break
        case this.direction.RIGHT:
          this.canvas.relativePan(
            new fabric.Point(10 * this.canvas.getZoom(), 0)
          )
          break
        case this.direction.DOWN:
          this.canvas.relativePan(
            new fabric.Point(0, 10 * this.canvas.getZoom())
          )
          break
      }
      this.keepPositionInBounds(this.canvas)
    },
    zoomIn(point) {
      if (this.zoomLevel < this.zoomLevelMax) {
        this.zoomLevel += 0.1
        this.canvas.zoomToPoint(point, Math.pow(2, this.zoomLevel))
        this.keepPositionInBounds(this.canvas)
      }
    },
    zoomOut(point) {
      if (this.zoomLevel > this.zoomLevelMin) {
        this.zoomLevel -= 0.1
        this.canvas.zoomToPoint(point, Math.pow(2, this.zoomLevel))
        this.keepPositionInBounds(this.canvas)
      }
    },
    keepPositionInBounds() {
      const zoom = this.canvas.getZoom()
      const xMin = ((2 - zoom) * this.canvas.getWidth()) / 2
      const xMax = (zoom * this.canvas.getWidth()) / 2
      const yMin = ((2 - zoom) * this.canvas.getHeight()) / 2
      const yMax = (zoom * this.canvas.getHeight()) / 2

      const point = new fabric.Point(
        this.canvas.getWidth() / 2,
        this.canvas.getHeight() / 2
      )

      const center = fabric.util.transformPoint(
        point,
        this.canvas.viewportTransform
      )

      const clampedCenterX = this.clamp(center.x, xMin, xMax)
      const clampedCenterY = this.clamp(center.y, yMin, yMax)

      const diffX = clampedCenterX - center.x
      const diffY = clampedCenterY - center.y

      if (diffX !== 0 || diffY !== 0) {
        this.canvas.relativePan(new fabric.Point(diffX, diffY))
      }
    },
    clamp(value, min, max) {
      return Math.max(min, Math.min(value, max))
    }
  }
}
</script>

<style>
#canvas {
  border: 1px solid #cccccc;
}
</style>
