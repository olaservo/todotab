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
    const colors = ['bg-orange-400', 'bg-pink-400', 'bg-purple-400', 'bg-blue-400', 'bg-yellow-400'];
    return colors[depth % colors.length];
  };

  return (
    <div className={`mb-2 rounded-l-full rounded-r-lg ${getBackgroundColor()} p-2 transition-all duration-300 hover:brightness-110`}>
      <div className="flex items-center">
        {item.children && item.children.length > 0 && (
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="mr-2 text-center rounded-full bg-black text-white font-bold"
          >
            {isOpen ? '−' : '+'}
          </button>
        )}
        <span className={`${item.type === 'category' ? 'font-bold text-lg' : 'text-white'}`}>{item.name}</span>
      </div>
      {isOpen && item.children && (
        <div className="ml-8 mt-2">
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
    <div className="min-h-screen bg-black text-white p-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-orange-400">LCARS TODO List</h1>
        {error && (
          <div className="bg-red-800 border border-red-600 text-white px-4 py-3 rounded-l-full rounded-r-lg relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="mb-8 flex space-x-4">
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current.click()} 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-l-full rounded-r-lg transition-colors duration-300"
          >
            Load File
          </button>
          <button 
            onClick={handleFileSave}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded-l-full rounded-r-lg transition-colors duration-300"
          >
            Save File
          </button>
        </div>
        <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
          <div className="w-full lg:w-1/2">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-400">TODO Items</h2>
            <div className="space-y-4">
              {todoData.map((item, index) => (
                <TodoItem key={index} item={item} />
              ))}
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <h2 className="text-2xl font-semibold mb-4 text-purple-400">Input Editor</h2>
            <textarea
              className="w-full h-[400px] p-4 border-2 border-gray-700 rounded-lg bg-gray-900 text-white font-mono text-sm resize-none focus:outline-none focus:border-purple-500 transition-colors duration-300"
              value={inputText}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoList;