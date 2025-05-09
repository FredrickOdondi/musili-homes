
import { Task } from '@/types';

export const tasks: Task[] = [
  {
    id: 1,
    title: "Client follow-up - Naivasha Villa",
    description: "Follow up with Mr. Johnson regarding the lakefront villa viewing",
    priority: "High",
    status: "Pending",
    dueDate: "2024-05-15",
    agentId: 1,
    createdAt: "2024-05-01",
  },
  {
    id: 2,
    title: "Property inspection - Karen Estate",
    description: "Complete inspection of the colonial estate in Karen",
    priority: "Medium",
    status: "In Progress",
    dueDate: "2024-05-20",
    agentId: 3,
    createdAt: "2024-05-03",
  },
  {
    id: 3,
    title: "Update listing photos - Westlands Penthouse",
    description: "Take new professional photos of the penthouse after renovations",
    priority: "Medium",
    status: "Pending",
    dueDate: "2024-05-25",
    agentId: 2,
    createdAt: "2024-05-05",
  }
];

export const getTasksByAgentId = (agentId: number): Task[] => {
  return tasks.filter(task => task.agentId === agentId);
};

export const addTask = (task: Omit<Task, 'id' | 'createdAt'>): Task => {
  const newTask: Task = {
    ...task,
    id: tasks.length + 1,
    createdAt: new Date().toISOString().split('T')[0]
  };
  tasks.push(newTask);
  return newTask;
};

export const updateTaskStatus = (taskId: number, status: Task['status']): Task | null => {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = status;
    return task;
  }
  return null;
};
