import React, { useState, useEffect, useRef } from 'react';

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

const TodoItem = ({ item, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getBackgroundColor = () => {
    const colors = ['bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-pink-100', 'bg-purple-100'];
    return colors[depth % colors.length];
  };

  return (
    <div className={`mb-2 rounded-lg ${getBackgroundColor()} p-2`}>
      <div className="flex items-center">
        {item.children && item.children.length > 0 && (
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="mr-2 text-center rounded-full bg-white"
          >
            {isOpen ? '−' : '+'}
          </button>
        )}
        <span className={item.type === 'category' ? 'font-semibold' : ''}>{item.name}</span>
      </div>
      {isOpen && item.children && (
        <div className="ml-4 mt-2">
          {item.children.map((child, index) => (
            <TodoItem key={index} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const parseIndentedInput = (text) => {
  const lines = text.split('\n').map(line => line.trimEnd());
  const root = { children: [] };
  const stack = [{ node: root, level: -1 }];

  lines.forEach(line => {
    if (line.trim() === '') return;

    const level = line.search(/\S/);
    const name = line.trim();

    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    const newNode = {
      name,
      type: stack.length === 1 ? 'category' : 'task',
      children: []
    };

    stack[stack.length - 1].node.children.push(newNode);
    stack.push({ node: newNode, level });
  });

  return root.children;
};

const TodoList = () => {
  const [todoData, setTodoData] = useState([]);
  const [inputText, setInputText] = useState(initialData);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const parsedData = parseIndentedInput(inputText);
    setTodoData(parsedData);
  }, [inputText]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          setInputText(content);
          setError(null);
        } catch (error) {
          setError("Error reading file. Please ensure it's a valid text file.");
        }
      };
      reader.onerror = (error) => {
        setError("Error reading file: " + error.message);
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">TODO List</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="mb-4">
        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          ref={fileInputRef}
          className="hidden"
        />
        <button 
          onClick={() => fileInputRef.current.click()} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
        >
          Load File
        </button>
        <button 
          onClick={handleFileSave}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Save File
        </button>
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 pr-0 md:pr-4 mb-4 md:mb-0">
          <h2 className="text-xl font-semibold mb-2">TODO Items</h2>
          <div className="space-y-2">
            {todoData.map((item, index) => (
              <TodoItem key={index} item={item} />
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