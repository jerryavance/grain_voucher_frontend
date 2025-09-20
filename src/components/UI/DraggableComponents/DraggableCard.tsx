

import React from 'react'
import { useDrag } from 'react-dnd'


const DraggableCard = ({ children, isDragging, id, item }: {children?: React.ReactNode, id: string | number, isDragging: boolean, item: any}) => {

    const [{ opacity }, dragRef] = useDrag(
        () => ({
          type: 'CARD',
          item: { parent: id, item },
          collect: (monitor) => ({
            opacity: monitor.isDragging() ? 0.5 : 1
          })
        }),
        [id, item]
      )

    return <div ref={dragRef} style={{ opacity, cursor: 'move', padding: 5, border: '2px dashed #ccc', margin: 5 }}>
        {children}
        </div>
}


export default DraggableCard;