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
  Sparkles
} from 'lucide-react';
import Chat from './components/Chat';

const API_URL = import.meta.env.PROD 
  ? 'https://fastapi-backend-je9z.onrender.com'
  : 'http://localhost:5009';

function App() {
  // Definindo todos os estados necessários
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Efeito para carregar as tarefas iniciais
  useEffect(() => {
    fetchTasks();
  }, []);

  // Função para buscar tarefas
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

  // Função para adicionar tarefa
  const addTask = async (title) => {
    if (!title.trim()) return;

    setIsAdding(true);
    try {
      const newTask = {
        id: Date.now(),
        title: title,
        completed: false
      };
      await axios.post(`${API_URL}/api/tasks`, newTask);
      setTasks(prevTasks => [...prevTasks, newTask]);
      setNewTaskTitle('');
    } catch (err) {
      setError('Erro ao adicionar tarefa: ' + err.message);
    } finally {
      setIsAdding(false);
    }
  };

  // Função para lidar com tarefas vindas do chat
  const handleTaskFromChat = (taskTitle) => {
    addTask(taskTitle);
  };

  // Função para alternar o estado da tarefa
  const toggleTask = async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await axios.put(`${API_URL}/api/tasks/${task.id}`, updatedTask);
      fetchTasks();
    } catch (err) {
      setError('Erro ao atualizar tarefa: ' + err.message);
    }
  };

  // Função para deletar tarefa
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      setError('Erro ao deletar tarefa: ' + err.message);
    }
  };

  // Estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Carregando suas tarefas...</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">Ops! Algo deu errado</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              fetchTasks();
            }}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Cálculos para o progresso
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  // Interface principal
  return (
<div className="min-h-screen bg-gradient-to-br from-[#BA4949]/10 via-[#FFF1F1] to-[#FFE9E9]">      {/* Header - Altura fixa */}
      <div className="h-16 px-4">
        <div className="max-w-7xl mx-auto h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[#BA4949] to-[#D47676] rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#BA4949] to-[#D47676] text-transparent bg-clip-text">
                Taskis
              </h1>
            </div>
            <p className="text-sm text-[#BA4949] font-medium bg-white px-3 py-1.5 rounded-xl shadow-sm border border-[#BA4949]/10">
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

      {/* Conteúdo Principal - Altura calculada */}
      <div className="h-[calc(100vh-4rem)] px-4 py-4">
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Coluna da Esquerda */}
            <div className="flex flex-col gap-4 h-full">
              {/* Input de Tarefa - Altura fixa */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-4 border border-[#BA4949]/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-[#BA4949] to-[#D47676] rounded-xl">
                    <ClipboardList className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-[#BA4949]">Minhas Tarefas</h2>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); addTask(newTaskTitle); }} className="relative">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Adicionar nova tarefa..."
                    className="w-full px-4 py-2 pr-20 bg-white border border-[#BA4949]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BA4949]/50 focus:border-[#BA4949] transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={isAdding || !newTaskTitle.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1 bg-gradient-to-r from-[#BA4949] to-[#D47676] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 text-sm"
                  >
                    {isAdding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>Adicionar</span>
                  </button>
                </form>
              </div>

              {/* Barra de Progresso - Altura fixa */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-4 border border-[#BA4949]/10">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-sm font-semibold text-[#BA4949]">Seu Progresso</h2>
                  <span className="text-lg font-bold bg-gradient-to-r from-[#BA4949] to-[#D47676] text-transparent bg-clip-text">
                    {completionPercentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#BA4949]/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#BA4949] to-[#D47676] transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  {completedTasks} de {totalTasks} tarefas completas
                </div>
              </div>

              {/* Lista de Tarefas - Altura flexível com scroll */}
              <div className="flex-1 bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-[#BA4949]/10 overflow-hidden">
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-[#BA4949]/10">
                    <h2 className="text-lg font-semibold text-[#BA4949]">Lista de Tarefas</h2>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    {tasks.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="p-3 bg-[#BA4949]/5 rounded-xl inline-block mb-3">
                          <ClipboardList className="w-8 h-8 text-[#BA4949]" />
                        </div>
                        <h3 className="text-base font-medium text-[#BA4949] mb-1">Nenhuma tarefa ainda</h3>
                        <p className="text-sm text-gray-500">
                          Adicione sua primeira tarefa usando o campo acima
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tasks.map((task) => (
                          <div 
                            key={task.id}
                            className={`p-3 flex items-center gap-3 group bg-white rounded-xl hover:shadow-md transition-all duration-200 ${
                              task.completed ? 'opacity-75' : ''
                            }`}
                          >
                            <button
                              onClick={() => toggleTask(task)}
                              className="focus:outline-none transform transition-all duration-200 hover:scale-110"
                            >
                              {task.completed ? (
                                <div className="p-0.5 rounded-full bg-[#BA4949]/10">
                                  <CheckCircle2 className="w-5 h-5 text-[#BA4949]" />
                                </div>
                              ) : (
                                <div className="p-0.5 rounded-full hover:bg-[#BA4949]/10">
                                  <Circle className="w-5 h-5 text-gray-400 group-hover:text-[#BA4949] transition-colors" />
                                </div>
                              )}
                            </button>
                            <span className={`flex-1 text-sm transition-all duration-200 ${
                              task.completed ? 'text-gray-500 line-through' : 'text-gray-800'
                            }`}>
                              {task.title}
                            </span>
                            <button 
                              onClick={() => deleteTask(task.id)}
                              className="p-1.5 text-gray-400 hover:text-[#BA4949] focus:outline-none transition-all opacity-0 group-hover:opacity-100 hover:bg-[#BA4949]/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat - Altura fixa igual à coluna da esquerda */}
            <div className="h-full">
              <Chat onTaskCreated={handleTaskFromChat} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;