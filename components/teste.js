let canvas = new fabric.Canvas('c', {
  preserveObjectStacking: true
})

canvas.on('mouse:down', function(options) {
  if (options.target) {
    var thisTarget = options.target
    var mousePos = canvas.getPointer(options.e)
    if (thisTarget.isType('group')) {
      let groupPos = {
        x: thisTarget.left,
        y: thisTarget.top
      }
      var currentGroup = []
      let groupItems = []
      groupItems = thisTarget._objects
      thisTarget.forEachObject(function(object, i) {
        currentGroup[i] = object
        currentGroup.push(object)
      })
      thisTarget.forEachObject(function(object, i) {
        if (object.type == 'textbox') {
          console.log('Start for statement that finds the x and y for each object')
          let matrix = thisTarget.calcTransformMatrix()
          let newPoint = fabric.util.transformPoint({y: object.top, x: object.left}, matrix)
          )
          let objectPos = {
            xStart: newPoint.x,
            xEnd: newPoint.x + object.width,
            yStart: newPoint.y,
            yEnd: newPoint.y + object.height
          }
          if (mousePos.x >= objectPos.xStart && mousePos.x <= objectPos.xEnd) {
            if (
              mousePos.y >= objectPos.yStart &&
              mousePos.y <= objectPos.yEnd
            ) {
              function ungroup(group) {
                groupItems = group._objects
                group._restoreObjectsState()
                canvas.remove(group)
                for (let i = 0; i < groupItems.length; i++) {
                  canvas.add(groupItems[i])
                }
                canvas.renderAll()
              }
              ungroup(thisTarget)
              canvas.setActiveObject(object)
              object.enterEditing()
              object.selectAll()
              object.on('editing:exited', function(options) {
              let items = [];
                groupItems.forEach(function(obj) {
                  items.push(obj)
                  canvas.remove(obj)
                })
                console.log(JSON.stringify(groupItems))
                let grp = new fabric.Group(items, {});
                canvas.add(grp)
              })
            }
          }
        }
      })
    }
  }
})

document.getElementById('group').addEventListener('click', function(event) {
  console.log('in group function')
  if (!canvas.getActiveObject()) {
    return
  }
  if (canvas.getActiveObject().type !== 'activeSelection') {
    return
  }
  canvas.getActiveObject().toGroup()
  canvas.requestRenderAll()
  console.log(canvas.getActiveObject())
})

document
  .getElementById('addInputField')
  .addEventListener('click', function(event) {
    let inputField = new fabric.Textbox('Some text', {
      left: 10,
      top: 10,
      fill: 'black',
      width: 200,
      fontSize: 12,
      fontcolor: 'black',
      backgroundColor: '#EDEAFF'
    })
    canvas.add(inputField)
  })
