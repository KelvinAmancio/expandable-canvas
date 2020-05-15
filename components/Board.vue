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
      zoomLevel: 0,
      zoomLevelMin: -0.9,
      zoomLevelMax: 3.0,
      shiftKeyDown: false,
      ctrlKeyDown: false,
      mouseDownPoint: null,
      shapes: ['None', 'Note'],
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
      selectionKey: 'ctrlKey',
      fireRightClick: true,
      stopContextMenu: true,
      preserveObjectStacking: true
    })

    const point = new fabric.Point(this.canvasWidth / 2, this.canvasHeight / 2)
    this.canvas.zoomToPoint(point, Math.pow(2, this.zoomLevel))

    this.canvas.on('object:moved', event => {
      console.log('object moved')
    })
    this.canvas.on('object:scaled', event => {
      console.log('object scaled')
    })

    this.createNote(point)

    this.canvas.on('mouse:down', options => {
      const pointer = this.canvas.getPointer(options.e, true)

      if (this.selectedShape === 'Note') {
        this.createNote(pointer)
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
      } /* else if (key === 46) {
        // handle Delete key
        const activeObject = this.canvas.getActiveObject()
        if (activeObject) {
          console.log('object marked for removal')
          this.canvas.remove(activeObject)
        }
      } */
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
    },
    createNote(point) {
      const rectangle = new fabric.Rect({
        left: point.x,
        top: point.y,
        width: 290,
        height: 250,
        fill: 'white'
      })
      rectangle.setShadow('5px 5px 5px rgba(94, 128, 191, 0.5)')
      const textTitle = new fabric.IText('Type a title...', {
        left: point.x + 10,
        top: point.y + 10,
        fontSize: 23,
        fill: '#d4d4d4',
        textEditable: true
      })
      const textUpdated = new fabric.Text('Last update: 1 second ago', {
        left: point.x + 10,
        top: point.y + 55,
        fontSize: 14,
        fill: '#858585'
      })
      const circle = new fabric.Circle({
        radius: 15,
        fill: 'rgba(0,0,0,0)',
        left: point.x + 240,
        top: point.y + 20,
        stroke: '#1a1a1a',
        strokeWidth: 1
      })
      const textInitials = new fabric.Text('K', {
        left: point.x + 250,
        top: point.y + 28,
        fontSize: 12,
        fill: '#1a1a1a'
      })
      const line = new fabric.Line(
        [point.x + 10, point.y + 95, point.x + 280, point.y + 95],
        {
          stroke: '#d4d4d4',
          strokeWidth: 1
        }
      )
      const textArea = new fabric.Textbox('Type a title...', {
        left: point.x + 10,
        top: point.y + 110,
        width: 270,
        height: 85,
        fontSize: 16,
        fill: '#5d5d5d',
        textEditable: true
      })
      const colorIcon = document.createElement('img')
      colorIcon.setAttribute('src', '/black-palette.png')
      const colorIconFabric = new fabric.Image(colorIcon, {
        left: point.x + 100,
        top: point.y + 210,
        scaleX: 0.7,
        scaleY: 0.7
      })
      const deleteIcon = document.createElement('img')
      deleteIcon.setAttribute('src', '/black-delete.png')
      const deleteIconFabric = new fabric.Image(deleteIcon, {
        left: point.x + 165,
        top: point.y + 210,
        scaleX: 0.7,
        scaleY: 0.7
      })

      const group = new fabric.Group(
        [
          rectangle,
          textTitle,
          textUpdated,
          circle,
          textInitials,
          line,
          textArea,
          deleteIconFabric,
          colorIconFabric
        ],
        {
          subTargetCheck: true
        }
      )
      group.on('mousedown', event => {
        if (event.button === 3) {
          console.log('mouse right click')
        }

        const objectSelected = event.subTargets[0]
        console.log(objectSelected)

        if (objectSelected.textEditable) {
          group._restoreObjectsState()
          this.canvas.remove(group)
          group._objects.forEach(element => {
            this.canvas.add(element)
          })
          this.canvas.renderAll()
          this.canvas.setActiveObject(objectSelected)
          objectSelected.enterEditing()
          objectSelected.selectAll()
          objectSelected.on('editing:exited', options => {
            const items = []
            group._objects.forEach(obj => {
              items.push(obj)
              this.canvas.remove(obj)
            })
            const grp = new fabric.Group(items, {})
            this.canvas.add(grp)
          })
        }
      })
      this.canvas.add(group)
      console.log(this.canvas.indexOf(group))
      this.canvas.sendBackwards(group)
      console.log(this.canvas.indexOf(group))
      // this.canvas.bringForward(group)
      // console.log(this.canvas.getObjects().indexOf(group))
      this.canvas.setActiveObject(group)
    }
  }
}
</script>

<style>
#canvas {
  border: 1px solid #cccccc;
}
</style>
