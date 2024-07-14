// Defines the structure of a single todo item
export interface TodoItem {
  id: string;
  name: string;
  type: 'category' | 'task';
  children: TodoItem[];
}

// Defines the props for the TodoItem component
export interface TodoItemProps {
  item: TodoItem;
  depth?: number;
  index: number;
}
