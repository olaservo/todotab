import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { parseIndentedInput } from './utils';
import { TodoItem, TodoListProps } from './todo';
import TodoItemComponent  from './TodoItemComponent'
import { StrictModeDroppable } from './StrictModeDroppable';
import { saveToFirebase, loadFromFirebase } from './firebaseUtils'

const initialData = `Constellation Exploration
    Scout Narion system
        Analyze atmospheric conditions
        Search for water sources
    Survey Vesta Prime
        Scan for rare minerals
        Document alien flora

Starship Upgrades
    Enhance warp drive
        Research quantum flux technology
        Acquire dilithium crystals
    Upgrade life support systems
        Install advanced air filtration
        Optimize gravity generators
`;

export default function TodoList({ userId }: TodoListProps) {
  const [todoData, setTodoData] = useState<TodoItem[]>([]);
  const [inputText, setInputText] = useState<string>(initialData);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const parsedData = parseIndentedInput(inputText);
    setTodoData(parsedData);
  }, [inputText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            setInputText(content);
            setError(null);
          }
        } catch (error) {
          setError("Error reading file. Please ensure it's a valid text file.");
        }
      };
      reader.onerror = (error: ProgressEvent<FileReader>) => {
        setError(`Error reading file: ${error}`);
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([inputText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "mission_log.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSaveToFirebase = useCallback(async () => {
    try {
      await saveToFirebase(userId, inputText);
      setError(null);
    } catch (error) {
      setError("Error saving to database. Please try again.");
    }
  }, [userId, inputText]);

  const handleLoadFromFirebase = useCallback(async () => {
    try {
      const data = await loadFromFirebase(userId);
      if (data) {
        setInputText(data);
        setError(null);
      } else {
        setError("No data found in the database.");
      }
    } catch (error) {
      setError("Error loading from database. Please try again.");
    }
  }, [userId]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceId = result.source.droppableId;
    const destId = result.destination.droppableId;

    const newTodoData = JSON.parse(JSON.stringify(todoData)) as TodoItem[];

    const findAndRemove = (items: TodoItem[], id: string, index: number): TodoItem | undefined => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          return items[i].children.splice(index, 1)[0];
        }
        if (items[i].children) {
          const result = findAndRemove(items[i].children, id, index);
          if (result) return result;
        }
      }
    };

    const findAndInsert = (items: TodoItem[], id: string, index: number, itemToInsert: TodoItem): boolean => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          items[i].children.splice(index, 0, itemToInsert);
          return true;
        }
        if (items[i].children) {
          if (findAndInsert(items[i].children, id, index, itemToInsert)) {
            return true;
          }
        }
      }
      return false;
    };

    const movedItem = sourceId === 'todo-list' 
      ? newTodoData.splice(result.source.index, 1)[0]
      : findAndRemove(newTodoData, sourceId, result.source.index);

    if (movedItem) {
      if (destId === 'todo-list') {
        newTodoData.splice(result.destination.index, 0, movedItem);
      } else {
        findAndInsert(newTodoData, destId, result.destination.index, movedItem);
      }
    }

    setTodoData(newTodoData);

    // Update the inputText to reflect the new order
    const updatedText = newTodoData.map(item => formatTodoItem(item, 0)).join('\n');
    setInputText(updatedText);
  };

  const formatTodoItem = (item: TodoItem, depth: number): string => {
    const indent = '    '.repeat(depth);
    let result = `${indent}${item.name}\n`;
    if (item.children && item.children.length > 0) {
      result += item.children.map(child => formatTodoItem(child, depth + 1)).join('');
    }
    return result;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 p-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-blue-300">Mission Planner</h1>
        {error && (
          <div className="bg-red-900 border border-red-700 text-gray-200 px-4 py-3 relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="mb-8 flex flex-wrap gap-4">
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="bg-blue-700 hover:bg-blue-600 text-gray-200 font-bold py-2 px-6 transition-colors duration-300"
          >
            Load Local File
          </button>
          <button 
            onClick={handleLoadFromFirebase}
            className="bg-green-600 hover:bg-green-500 text-gray-200 font-bold py-2 px-6 transition-colors duration-300"
          >
            Load from Database
          </button>
          <button 
            onClick={handleSaveToFirebase}
            className="bg-orange-600 hover:bg-orange-500 text-gray-200 font-bold py-2 px-6 transition-colors duration-300"
          >
            Save to Database
          </button>
          <button 
            onClick={handleDownload}
            className="bg-purple-600 hover:bg-purple-500 text-gray-200 font-bold py-2 px-6 transition-colors duration-300"
          >
            Download
          </button>
        </div>
        <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
          <div className="w-full lg:w-1/2">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Mission Objectives</h2>
            <DragDropContext onDragEnd={onDragEnd}>
              <StrictModeDroppable droppableId="todo-list" type="list-0">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {todoData.map((item: TodoItem, index: number) => (
                      <TodoItemComponent key={item.id} item={item} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </StrictModeDroppable>
            </DragDropContext>
          </div>
          <div className="w-full lg:w-1/2">
            <h2 className="text-2xl font-semibold mb-4 text-orange-400">Mission Log Editor</h2>
            <textarea
              className="w-full h-[400px] p-4 border-2 border-gray-600 bg-gray-800 text-gray-200 font-mono text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors duration-300"
              value={inputText}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};