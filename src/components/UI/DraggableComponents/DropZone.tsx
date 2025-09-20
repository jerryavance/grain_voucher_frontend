import React from 'react';
import { useDrop } from 'react-dnd';


interface DropZoneProps {
  children: React.ReactNode;
  handleDrop(id: number | string, item: any, config: any): void;
  id: string | number;
  config?: any
}


const DropZone: React.FC<DropZoneProps> = (props) => {
  const { handleDrop, id, config, children } = props;
  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: 'CARD',
      drop: (item) => {        
        handleDrop(id, item, config)
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    []
  );

  return (
    <div
      ref={dropRef}
      style={{
        backgroundColor: isOver ? 'lightyellow' : 'none', minHeight: 36
      }}
    >
     {children}
    </div>
  );
};

export default DropZone;