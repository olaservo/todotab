import React, { useState, useEffect, useRef } from 'react';

const initialData = `
Constellation Exploration
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

const TodoItem = ({ item, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getBackgroundColor = () => {
    const colors = ['bg-blue-800', 'bg-slate-700', 'bg-gray-600', 'bg-indigo-800', 'bg-slate-800'];
    return colors[depth % colors.length];
  };

  return (
    <div className={`mb-2 rounded-l-full rounded-r-lg ${getBackgroundColor()} p-2 transition-all duration-300 hover:brightness-110`}>
      <div className="flex items-center">
        {item.children && item.children.length > 0 && (
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="mr-2 text-center rounded-full bg-blue-200 text-blue-800 font-bold"
          >
            {isOpen ? '−' : '+'}
          </button>
        )}
        <span className={`${item.type === 'category' ? 'font-bold text-lg text-blue-200' : 'text-gray-200'}`}>{item.name}</span>
      </div>
      {isOpen && item.children && (
        <div className="ml-6 mt-2">
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
    element.download = "starfield_mission_log.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 p-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-blue-300">Starfield Mission Planner</h1>
        {error && (
          <div className="bg-red-900 border border-red-700 text-gray-200 px-4 py-3 rounded-l-full rounded-r-lg relative mb-4" role="alert">
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
            className="bg-blue-700 hover:bg-blue-600 text-gray-200 font-bold py-2 px-6 rounded-l-full rounded-r-lg transition-colors duration-300"
          >
            Load Mission Data
          </button>
          <button 
            onClick={handleFileSave}
            className="bg-orange-600 hover:bg-orange-500 text-gray-200 font-bold py-2 px-6 rounded-l-full rounded-r-lg transition-colors duration-300"
          >
            Save Mission Data
          </button>
        </div>
        <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
          <div className="w-full lg:w-1/2">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Mission Objectives</h2>
            <div className="space-y-4">
              {todoData.map((item, index) => (
                <TodoItem key={index} item={item} />
              ))}
            </div>
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

export default TodoList;