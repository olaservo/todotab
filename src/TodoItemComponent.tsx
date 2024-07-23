import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { TodoItem } from './todo';
import { StrictModeDroppable } from './StrictModeDroppable';

interface TodoItemProps {
  item: TodoItem;
  index: number;
  depth: number;
}

const TodoItemComponent: React.FC<TodoItemProps> = ({ item, index, depth }) => {
  const [isExpanded, setIsExpanded] = useState(depth === 0);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const getBackgroundColor = (depth: number) => {
    const colors = [
      'bg-gray-900',  // Deepest space black
      'bg-gray-800',  // Dark space gray
      'bg-gray-700',  // Lighter space gray
      'bg-blue-900',  // Deep space blue
      'bg-indigo-900' // Deep space indigo
    ];
    return colors[depth % colors.length];
  };

  const getBorderColor = (depth: number) => {
    const colors = [
      'border-blue-500',   // Bright blue
      'border-indigo-500', // Bright indigo
      'border-purple-500', // Bright purple
      'border-pink-500',   // Bright pink
      'border-red-500'     // Bright red
    ];
    return colors[depth % colors.length];
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${getBackgroundColor(depth)} p-3 mb-2 rounded-md border-l-4 ${getBorderColor(depth)} transition-colors duration-200`}
        >
          <div className="flex items-center">
            {item.children && item.children.length > 0 && (
              <button
                onClick={toggleExpand}
                className="mr-2 text-gray-400 hover:text-gray-200 focus:outline-none transition-colors duration-200"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            <span className="text-gray-200 flex-grow">{item.name}</span>
          </div>
          {item.children && item.children.length > 0 && isExpanded && (
            <StrictModeDroppable droppableId={item.id} type={`list-${depth + 1}`}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="mt-2 pl-4">
                  {item.children.map((child, childIndex) => (
                    <TodoItemComponent key={child.id} item={child} index={childIndex} depth={depth + 1} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </StrictModeDroppable>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default TodoItemComponent;