import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Loader2, 
  AlertCircle,
  ClipboardList,
  Sparkles,
  RefreshCw,
  Calendar,
  BarChart2,
  Filter
} from 'lucide-react';
import Chat from './components/Chat';

const API_URL = import.meta.env.PROD 
  ? 'https://fastapi-backend-je9z.onrender.com'
  : 'http://localhost:5009';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks`);
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const addBulkTasks = async (titles) => {
    if (!titles || titles.length === 0) return;

    setIsAdding(true);
    try {
      const response = await axios.post(`${API_URL}/api/tasks/bulk`, {
        tasks: titles
      });
      setTasks(prevTasks => [...prevTasks, ...response.data]);
      setNewTaskTitle('');
      setShowAddForm(false);
    } catch (err) {
      setError('Erro ao adicionar tarefas: ' + err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleTaskFromChat = (taskTitle) => {
    addBulkTasks([taskTitle]);
  };

  const toggleTask = async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await axios.put(`${API_URL}/api/tasks/${task.id}`, updatedTask);
      setTasks(prevTasks => 
        prevTasks.map(t => t.id === task.id ? updatedTask : t)
      );
    } catch (err) {
      setError('Erro ao atualizar tarefa: ' + err.message);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/${taskId}`);
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    } catch (err) {
      setError('Erro ao deletar tarefa: ' + err.message);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl animate-pulse" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-white animate-bounce" />
          </div>
          <p className="text-xl font-medium text-blue-600">Carregando suas tarefas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-blue-200">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-red-100 rounded-full mb-6">
              <AlertCircle className="w-12 h-12 text-red-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Oops! Algo deu errado</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                fetchTasks();
              }}
              className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50">
      {/* Header */}
      <div className="h-20 px-6 border-b border-blue-100 bg-white/80 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-4 group">
              <div className="p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 text-transparent bg-clip-text group-hover:bg-gradient-to-l transition-all duration-500">
                Taskis
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                <Calendar className="w-5 h-5" />
                <p className="text-sm font-medium">
                  {new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[calc(100vh-5rem)] px-6 py-8">
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="flex flex-col gap-8 h-full">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Progress Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-800">Progresso</h2>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700 ease-out"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <div className="mt-4 flex justify-between text-sm text-gray-600">
                    <span>{completedTasks} concluídas</span>
                    <span>{totalTasks - completedTasks} pendentes</span>
                  </div>
                </div>

                {/* Add Task Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Plus className="w-6 h-6 text-blue-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-800">Adicionar Tarefa</h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl border-2 border-dashed border-blue-200 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Nova Tarefa</span>
                  </button>
                </div>
              </div>

              {/* Task List */}
              <div className="flex-1 bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
                <div className="h-full flex flex-col">
                  <div className="p-6 border-b border-blue-100">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-800">Tarefas</h2>
                      <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-1">
                        <button
                          onClick={() => setFilter('all')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            filter === 'all' 
                              ? 'bg-white text-blue-600 shadow-sm' 
                              : 'text-gray-600 hover:text-blue-600'
                          }`}
                        >
                          Todas
                        </button>
                        <button
                          onClick={() => setFilter('active')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            filter === 'active' 
                              ? 'bg-white text-blue-600 shadow-sm' 
                              : 'text-gray-600 hover:text-blue-600'
                          }`}
                        >
                          Pendentes
                        </button>
                        <button
                          onClick={() => setFilter('completed')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            filter === 'completed' 
                              ? 'bg-white text-blue-600 shadow-sm' 
                              : 'text-gray-600 hover:text-blue-600'
                          }`}
                        >
                          Concluídas
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6">
                    {filteredTasks.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="p-4 bg-blue-50 rounded-2xl inline-block mb-4">
                          <ClipboardList className="w-12 h-12 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          {filter === 'all' 
                            ? 'Nenhuma tarefa encontrada'
                            : filter === 'active'
                              ? 'Nenhuma tarefa pendente'
                              : 'Nenhuma tarefa concluída'
                          }
                        </h3>
                        <p className="text-gray-600">
                          {filter === 'all' 
                            ? 'Comece adicionando sua primeira tarefa'
                            : 'As tarefas aparecerão aqui'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredTasks.map((task) => (
                          <div 
                            key={task.id}
                            className={`group p-4 flex items-center gap-4 bg-white rounded-xl border border-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 ${
                              task.completed ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            <button
                              onClick={() => toggleTask(task)}
                              className="flex-shrink-0 focus:outline-none transform transition-all duration-300 hover:scale-110"
                            >
                              {task.completed ? (
                                <div className="p-1 bg-blue-100 rounded-full">
                                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                                </div>
                              ) : (
                                <div className="p-1 rounded-full hover:bg-blue-100 transition-colors">
                                  <Circle className="w-6 h-6 text-blue-400 group-hover:text-blue-600" />
                                </div>
                              )}
                            </button>
                            <span className={`flex-1 text-base transition-all ${
                              task.completed ? 'text-gray-500 line-through' : 'text-gray-700'
                            }`}>
                              {task.title}
                            </span>
                            <button 
                              onClick={() => deleteTask(task.id)}
                              className="p-2 text-gray-400 hover:text-red-500 focus:outline-none transition-all opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Section */}
            <div className="h-full">
              <Chat onTaskCreated={handleTaskFromChat} />
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 animate-scale-up">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Nova Tarefa</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const tasks = newTaskTitle
                .split(/[\n,]/)
                .map(t => t.trim())
                .filter(t => t);
              addBulkTasks(tasks);
            }}>
              <textarea
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Digite uma tarefa por linha ou separe por vírgulas"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 placeholder:text-gray-500 resize-none min-h-[120px]"
                autoFocus
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTaskTitle('');
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isAdding || !newTaskTitle.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Adicionando...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Adicionar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes scale-up {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}

export default App;