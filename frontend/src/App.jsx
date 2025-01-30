import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.PROD 
  ? 'https://fastapi-backend-je9z.onrender.com'  // URL de produção
  : 'http://localhost:5009'                 // URL de desenvolvimento

function App() {
  const [tasks, setTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks`)
      console.log('Tasks carregadas:', response.data)
      setTasks(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Erro ao carregar tasks:', err)
      setError('Erro ao conectar com o servidor. ' + err.message)
      setLoading(false)
    }
  }

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    try {
      const newTask = {
        id: Date.now(),
        title: newTaskTitle,
        completed: false
      }
      await axios.post(`${API_URL}/api/tasks`, newTask)
      setNewTaskTitle('')
      fetchTasks()
    } catch (err) {
      setError('Erro ao adicionar task: ' + err.message)
    }
  }

  const toggleTask = async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed }
      await axios.put(`${API_URL}/api/tasks/${task.id}`, updatedTask)
      fetchTasks()
    } catch (err) {
      setError('Erro ao atualizar task: ' + err.message)
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/${taskId}`)
      fetchTasks()
    } catch (err) {
      setError('Erro ao deletar task: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loader"></div>
        <p>Carregando tarefas...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <h1>FastAPI + React Todo App</h1>
      
      {error && (
        <div className="error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <form onSubmit={addTask} className="task-form">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Nova tarefa..."
          className="task-input"
        />
        <button type="submit" className="add-button">Adicionar</button>
      </form>

      <div className="tasks">
        {tasks.map((task) => (
          <div key={task.id} className="task">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task)}
            />
            <span className={task.completed ? 'completed' : ''}>
              {task.title}
            </span>
            <button onClick={() => deleteTask(task.id)} className="delete-button">
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="info">
        <p>Total de tarefas: {tasks.length}</p>
        <p>Concluídas: {tasks.filter(t => t.completed).length}</p>
      </div>
    </div>
  )
}

export default App