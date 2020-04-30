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
      canvasWidth: 1280,
      canvasHeight: 780,
      zoomLevel: 2.0,
      zoomLevelMin: -0.9,
      zoomLevelMax: 3.0,
      shiftKeyDown: false,
      ctrlKeyDown: false,
      mouseDownPoint: null,
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
      width: this.canvasWidth,
      height: this.canvasHeight,
      selectionKey: 'ctrlKey'
    })

    const point = new fabric.Point(this.canvasWidth / 2, this.canvasHeight / 2)
    this.canvas.zoomToPoint(point, Math.pow(2, this.zoomLevel))

    this.canvas.on('mouse:down', options => {
      const pointer = this.canvas.getPointer(options.e, true)

      if (this.selectedShape === 'Square') {
        const pointer = this.canvas.getPointer(options.e, false)
        const rectangle = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 25,
          height: 25,
          fill: this.selectedColor
        })
        this.canvas.add(rectangle)
        this.canvas.setActiveObject(rectangle)
        this.selectedShape = 'None'
      }

      this.mouseDownPoint = new fabric.Point(pointer.x, pointer.y)
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
    },
    zoomIn(point) {
      if (this.zoomLevel < this.zoomLevelMax) {
        this.zoomLevel += 0.1
        this.canvas.zoomToPoint(point, Math.pow(2, this.zoomLevel))
      }
    },
    zoomOut(point) {
      if (this.zoomLevel > this.zoomLevelMin) {
        this.zoomLevel -= 0.1
        this.canvas.zoomToPoint(point, Math.pow(2, this.zoomLevel))
      }
    }
  }
}
</script>

<style>
#canvas {
  border: 1px solid #cccccc;
}
</style>
