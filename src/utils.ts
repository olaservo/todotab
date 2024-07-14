import { TodoItem } from '../types/todo';

export const parseIndentedInput = (text: string): TodoItem[] => {
  const lines = text.split('\n').map(line => line.trimEnd());
  const root: { children: TodoItem[] } = { children: [] };
  const stack: { node: TodoItem | { children: TodoItem[] }, level: number }[] = [{ node: root, level: -1 }];
  let id = 0;

  lines.forEach(line => {
    if (line.trim() === '') return;

    const level = line.search(/\S/);
    const name = line.trim();

    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    const newNode: TodoItem = {
      id: `item-${id++}`,
      name,
      type: stack.length === 1 ? 'category' : 'task',
      children: []
    };

    (stack[stack.length - 1].node.children as TodoItem[]).push(newNode);
    stack.push({ node: newNode, level });
  });

  return root.children;
};
