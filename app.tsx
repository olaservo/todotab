import React, { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { GripVertical } from 'lucide-react';

const initialData = `
Kitchen Renovation
    Replace countertops
        Get quotes from three contractors
        Choose between granite and quartz
    Paint cabinets
        Buy sandpaper and primer
        Select color: thinking about light gray

Backyard Landscaping
    Plant new flower bed
        Research native plants
        Buy soil and mulch
    Install irrigation system
        Get professional consultation
        Compare drip vs. sprinkler systems
`;

const TodoItem = React.memo(({ item, depth = 0, onDragStart, onDragOver, onDrop, isDragging, draggedOverPosition }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getBackgroundColor = () => {
    const colors = ['bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-pink-100', 'bg-purple-100'];
    return colors[depth % colors.length];
  };

  const renderPlaceholder = (position) => {
    if (draggedOverPosition === position) {
      return <div className="h-1 bg-blue-500 my-1"></div>;
    }
    return null;
  };

  return (
    <>
      {renderPlaceholder('before')}
      <div 
        className={`mb-2 rounded-lg ${getBackgroundColor()} p-2 ${isDragging ? 'opacity-50' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          if (e.clientY < midY) {
            onDragOver(item.id, 'before');
          } else {
            onDragOver(item.id, 'after');
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          onDrop(item.id);
        }}
      >
        <div className="flex items-center">
          <div
            draggable
            onDragStart={() => onDragStart(item.id)}
            className="cursor-move mr-2"
          >
            <GripVertical size={16} />
          </div>
          {item.children && item.children.length > 0 && (
            <button onClick={() => setIsOpen(!isOpen)} className="mr-2 w-6 h-6 text-center rounded-full bg-white">
              {isOpen ? '−' : '+'}
            </button>
          )}
          <span className={item.type === 'category' ? 'font-semibold' : ''}>{item.name}</span>
        </div>
        {isOpen && item.children && (
          <div className="ml-4 mt-2">
            {item.children.map((child) => (
              <TodoItem 
                key={child.id} 
                item={child} 
                depth={depth + 1}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                isDragging={isDragging === child.id}
                draggedOverPosition={draggedOverPosition && draggedOverPosition.startsWith(child.id) ? draggedOverPosition.split(':')[1] : null}
              />
            ))}
          </div>
        )}
      </div>
      {renderPlaceholder('after')}
    </>
  );
});

const parseIndentedInput = (text) => {
  const lines = text.split('\n').map(line => line.trimEnd());
  const root = { children: [] };
  const stack = [{ node: root, level: -1 }];
  let id = 0;

  lines.forEach(line => {
    if (line.trim() === '') return;

    const level = line.search(/\S/);
    const name = line.trim();

    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    const newNode = {
      id: `item-${id++}`,
      name,
      type: stack.length === 1 ? 'category' : 'task',
      children: []
    };

    stack[stack.length - 1].node.children.push(newNode);
    stack.push({ node: newNode, level });
  });

  return root.children;
};

const convertTreeToText = (tree, depth = 0) => {
  let result = '';
  tree.forEach(item => {
    result += '    '.repeat(depth) + item.name + '\n';
    if (item.children && item.children.length > 0) {
      result += convertTreeToText(item.children, depth + 1);
    }
  });
  return result;
};

const TodoList = () => {
  const [todoData, setTodoData] = useState([]);
  const [inputText, setInputText] = useState(initialData);
  const [error, setError] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOverPosition, setDraggedOverPosition] = useState(null);

  useEffect(() => {
    try {
      const parsedData = parseIndentedInput(inputText);
      setTodoData(parsedData);
      setError(null);
    } catch (error) {
      console.error('Error parsing input:', error);
      setError('Error parsing data. Please check your input.');
    }
  }, [inputText]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInputText(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleFileSave = () => {
    const element = document.createElement("a");
    const file = new Blob([inputText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "todo_list.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const onDragStart = useCallback((id) => {
    setDraggedItem(id);
  }, []);

  const onDragOver = useCallback((id, position) => {
    setDraggedOverPosition(`${id}:${position}`);
  }, []);

  const findItemById = useCallback((items, id) => {
    for (const item of items) {
      if (item.id === id) {
        return { item, parent: items };
      }
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }, []);

  const removeItemById = useCallback((items, id) => {
    return items.filter(item => {
      if (item.id === id) {
        return false;
      }
      if (item.children) {
        item.children = removeItemById(item.children, id);
      }
      return true;
    });
  }, []);

  const onDrop = useCallback((targetId) => {
    if (!draggedItem || draggedItem === targetId) {
      return;
    }

    setTodoData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData)); // Deep copy
      const { item: draggedItemData } = findItemById(newData, draggedItem);
      const { item: targetItem, parent: targetParent } = findItemById(newData, targetId) || { item: null, parent: newData };
      
      // Remove the dragged item from its original position
      const updatedData = removeItemById(newData, draggedItem);

      if (targetItem) {
        // If dropping onto another item
        const targetIndex = targetParent.indexOf(targetItem);
        const [, position] = (draggedOverPosition || '').split(':');
        
        if (position === 'before') {
          targetParent.splice(targetIndex, 0, draggedItemData);
        } else if (position === 'after') {
          if (draggedItemData.type === 'category' && targetItem.type !== 'category') {
            targetParent.splice(targetIndex + 1, 0, draggedItemData);
          } else {
            if (!targetItem.children) targetItem.children = [];
            targetItem.children.unshift(draggedItemData);
          }
        }
      } else {
        // If dropping at the root level
        updatedData.push(draggedItemData);
      }

      // Update the input text
      const updatedText = convertTreeToText(updatedData);
      setInputText(updatedText);

      return updatedData;
    });

    setDraggedItem(null);
    setDraggedOverPosition(null);
  }, [draggedItem, draggedOverPosition, findItemById, removeItemById]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Home Improvement TODO List</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="mb-4">
        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <Button onClick={() => document.getElementById('file-upload').click()} className="mr-2">
          Load File
        </Button>
        <Button onClick={handleFileSave}>Save File</Button>
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 pr-0 md:pr-4 mb-4 md:mb-0">
          <h2 className="text-xl font-semibold mb-2">TODO Items</h2>
          <div className="space-y-2">
            {todoData.map((item) => (
              <TodoItem 
                key={item.id} 
                item={item}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                isDragging={draggedItem === item.id}
                draggedOverPosition={draggedOverPosition && draggedOverPosition.startsWith(item.id) ? draggedOverPosition.split(':')[1] : null}
              />
            ))}
          </div>
        </div>
        <div className="w-full md:w-1/2 pl-0 md:pl-4">
          <h2 className="text-xl font-semibold mb-2">Input Editor</h2>
          <textarea
            className="w-full h-[400px] p-2 border rounded font-mono text-sm"
            value={inputText}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
};

export default TodoList;
