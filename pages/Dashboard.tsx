import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, Clock, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { Task, TaskFilter, TaskStatus } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { TaskStats } from '../components/TaskStats';

export const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>(TaskFilter.ALL);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Form Data
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: TaskStatus;
    dueDate: string;
  }>({ 
    title: '', 
    description: '', 
    status: 'pending', 
    dueDate: '' 
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getTasks();
      setTasks(data);
      setError(null);
      setIsOfflineMode(false);
    } catch (err: any) {
      // If backend is down, provide mock data matching the new Requirements
      if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
        setIsOfflineMode(true);
        const today = new Date().toISOString().split('T')[0];
        setTasks([
            { id: '1', title: 'Backend Integration', description: 'Connect to REST API endpoints.', status: 'in-progress', dueDate: today, createdAt: new Date().toISOString() },
            { id: '2', title: 'Database Schema', description: 'Design User and Task tables.', status: 'completed', dueDate: today, createdAt: new Date().toISOString() },
            { id: '3', title: 'Unit Testing', description: 'Write tests for the controllers.', status: 'pending', dueDate: today, createdAt: new Date().toISOString() }
        ]);
      } else {
        setError(err.message || 'Failed to fetch tasks');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingTask) {
        const updated = await api.updateTask(editingTask.id, formData);
        setTasks(prev => prev.map(t => t.id === editingTask.id ? updated : t));
      } else {
        const created = await api.createTask({
            ...formData,
            createdAt: new Date().toISOString()
        });
        setTasks(prev => [...prev, created]);
      }
      closeModal();
    } catch (err: any) {
      if (isOfflineMode || err.message === 'Failed to fetch') {
        const mockTask: Task = editingTask 
            ? { ...editingTask, ...formData, updatedAt: new Date().toISOString() }
            : { 
                id: Date.now().toString(), 
                ...formData, 
                createdAt: new Date().toISOString() 
              };
        
        if (editingTask) {
             setTasks(prev => prev.map(t => t.id === editingTask.id ? mockTask : t));
        } else {
             setTasks(prev => [...prev, mockTask]);
        }
        closeModal();
      } else {
        setError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    // Optimistic Update: Remove immediately from UI
    const previousTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== id));

    try {
      await api.deleteTask(id);
    } catch (err: any) {
      // Logic:
      // 1. If Offline Mode -> Keep deletion (mock success)
      // 2. If Network Error -> Keep deletion (mock success)
      // 3. If Real Backend Error (e.g. 500/403) -> Revert UI and show error
      
      const isNetworkError = err.message === 'Failed to fetch' || err.message.includes('NetworkError');
      
      if (!isOfflineMode && !isNetworkError) {
         setTasks(previousTasks); // Revert
         setError(err.message || 'Failed to delete task');
      }
      // Else: silently accept the error as a "success" in offline/demo context
    }
  };

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({ 
        title: task.title, 
        description: task.description,
        status: task.status,
        dueDate: task.dueDate
      });
    } else {
      setEditingTask(null);
      // Default due date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData({ 
        title: '', 
        description: '', 
        status: 'pending', 
        dueDate: tomorrow.toISOString().split('T')[0] 
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === TaskFilter.ALL) return true;
    return task.status === filter;
  });

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            {isOfflineMode && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200">
                    Demo Mode (Offline)
                </span>
            )}
          </div>
          <p className="text-gray-500">Manage your tasks and track progress.</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="h-5 w-5 mr-2" />
          New Task
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-sm text-red-600 hover:text-red-800 underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Task List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-semibold text-gray-700">Tasks</h2>
              <div className="flex space-x-2">
                {[
                  { label: 'All', value: TaskFilter.ALL },
                  { label: 'Pending', value: TaskFilter.PENDING },
                  { label: 'In Progress', value: TaskFilter.IN_PROGRESS },
                  { label: 'Completed', value: TaskFilter.COMPLETED }
                ].map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                            filter === f.value 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
              </div>
            </div>
            
            {isLoading ? (
               <div className="p-8 text-center text-gray-500">Loading tasks...</div>
            ) : filteredTasks.length === 0 ? (
               <div className="p-8 text-center text-gray-500">
                   No tasks found matching current filter.
               </div>
            ) : (
                <ul className="divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                    <li key={task.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center gap-4 group">
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(task.status)} capitalize`}>
                              {task.status.replace('-', ' ')}
                            </span>
                            <h3 className={`text-sm font-medium text-gray-900 ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                            {task.title}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
                          <div className="mt-2 flex items-center text-xs text-gray-400">
                            <Calendar className="h-3 w-3 mr-1" />
                            Due: {task.dueDate || 'No Date'}
                          </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-auto">
                          <button 
                              type="button"
                              onClick={() => openModal(task)}
                              className="p-1 text-gray-400 hover:text-primary"
                              title="Edit"
                          >
                              <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(task.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Delete"
                          >
                              <Trash2 className="h-4 w-4" />
                          </button>
                      </div>
                    </li>
                ))}
                </ul>
            )}
          </div>
        </div>

        {/* Stats Column */}
        <div className="lg:col-span-1">
          <TaskStats tasks={tasks} />
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Title"
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Task title"
                        required
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                          type="date"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="w-full">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            id="description"
                            rows={3}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Add details..."
                        />
                    </div>
                </form>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button 
                    type="submit" 
                    form="task-form" 
                    isLoading={isSubmitting}
                    className="w-full sm:w-auto sm:ml-3"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </Button>
                <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={closeModal}
                    className="mt-3 w-full sm:mt-0 sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};