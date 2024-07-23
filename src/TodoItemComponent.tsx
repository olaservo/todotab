import React, { useState } from 'react';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import { TodoItemProps } from './todo';
import { StrictModeDroppable } from './StrictModeDroppable';

const TodoItemComponent: React.FC<TodoItemProps> = ({ item, depth = 0, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getBackgroundColor = () => {
    const colors = ['bg-blue-800', 'bg-slate-700', 'bg-gray-600', 'bg-indigo-800', 'bg-slate-800'];
    return colors[depth % colors.length];
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided: DraggableProvided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`mb-2 ${getBackgroundColor()} p-2 transition-all duration-300 hover:brightness-110 flex items-center`}
        >
          <div
            {...provided.dragHandleProps}
            className="mr-2 cursor-move"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 15V13H5V15H3ZM3 11V9H5V11H3ZM7 15V13H9V15H7ZM7 11V9H9V11H7ZM11 15V13H13V15H11ZM11 11V9H13V11H11ZM15 15V13H17V15H15ZM15 11V9H17V11H15ZM19 15V13H21V15H19ZM19 11V9H21V11H19Z" />
            </svg>
          </div>
          <div className="flex-grow flex items-center">
            {item.children && item.children.length > 0 && (
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="mr-2 text-center rounded-full bg-blue-200 text-blue-800 font-bold w-6 h-6 flex items-center justify-center"
              >
                {isOpen ? '−' : '+'}
              </button>
            )}
            <span className={`${item.type === 'category' ? 'font-bold text-lg text-blue-200' : 'text-gray-200'}`}>{item.name}</span>
          </div>
          {isOpen && item.children && item.children.length > 0 && (
            <StrictModeDroppable droppableId={item.id} type={`list-${depth + 1}`}>
              {(droppableProvided) => (
                <div 
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                  className="ml-6 mt-2 w-full"
                >
                  {item.children.map((child, childIndex) => (
                    <TodoItemComponent 
                      key={child.id}
                      item={child} 
                      depth={depth + 1} 
                      index={childIndex}
                    />
                  ))}
                  {droppableProvided.placeholder}
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
