import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import TaskModal from '../components/TaskModal';
import SessionLedger from '../components/SessionLedger';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const statusStyles = {
  todo: 'text-muted bg-canvas border-line',
  'in-progress': 'text-amber bg-amber-soft border-amber/25',
  done: 'text-mint bg-mint-soft border-mint/25',
};
const priorityDot = { low: 'bg-slate-400', medium: 'bg-amber', high: 'bg-coral' };

const DAY_MS = 24 * 60 * 60 * 1000;

const getDueUrgency = (task) => {
  if (!task.dueDate || task.status === 'done') return null;
  const daysLeft = (new Date(task.dueDate).getTime() - Date.now()) / DAY_MS;
  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 3) return 'soon';
  return null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ todo: 0, 'in-progress': 0, done: 0, overdue: 0 });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 6 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await api.get('/tasks', { params });
      setTasks(data.tasks);
      setPages(data.pages || 1);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  const fetchStats = useCallback(async () => {
    const { data } = await api.get('/tasks/stats');
    setStats(data.stats);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, tasks.length]);

  const handleSave = async (form) => {
    if (editingTask) {
      await api.put(`/tasks/${editingTask._id}`, form);
    } else {
      await api.post('/tasks', form);
    }
    setModalOpen(false);
    setEditingTask(null);
    await fetchTasks();
    await fetchStats();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task permanently?')) return;
    await api.delete(`/tasks/${id}`);
    await fetchTasks();
    await fetchStats();
  };

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };
  const openEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6 animate-fadeUp">
          <p className="text-xs font-medium text-violet tracking-widest uppercase mb-1">Welcome back</p>
          <h1 className="font-display text-3xl font-semibold text-ink">{user?.name}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-1 space-y-4">
            <SessionLedger />
            <div
              className="bg-surface border border-line rounded-xl2 p-5 space-y-2.5 shadow-soft animate-fadeUp"
              style={{ animationDelay: '80ms' }}
            >
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted mb-1">
                Task summary
              </p>
              {Object.entries(stats).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className={key === 'overdue' && val > 0 ? 'text-coral font-medium' : 'text-muted capitalize'}>
                    {key.replace('-', ' ')}
                  </span>
                  <span
                    className={`font-display font-semibold text-base ${
                      key === 'overdue' && val > 0 ? 'text-coral' : 'text-ink'
                    }`}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="flex flex-wrap gap-3 mb-4 items-center animate-fadeUp" style={{ animationDelay: '40ms' }}>
              <input
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Search tasks…"
                className="flex-1 min-w-[160px] bg-surface border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink focus-ring focus:border-violet outline-none transition-colors"
              />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setPage(1);
                  setStatusFilter(e.target.value);
                }}
                className="bg-surface border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink focus-ring focus:border-violet outline-none transition-colors"
              >
                <option value="">All statuses</option>
                <option value="todo">Todo</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
                <option value="overdue">Overdue</option>
              </select>
              <button
                onClick={openCreate}
                className="bg-violet text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-violet-dark hover:shadow-lift transition-all focus-ring"
              >
                + New task
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-20 rounded-xl2 shimmer-bg animate-shimmer" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="bg-surface border border-dashed border-line rounded-xl2 p-10 text-center animate-fadeUp">
                <p className="text-sm text-muted">No tasks yet — create one to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, i) => {
                  const urgency = getDueUrgency(task);
                  return (
                  <div
                    key={task._id}
                    className={`bg-surface rounded-xl2 p-4 flex items-start justify-between gap-4 card-hover animate-fadeUp border ${
                      urgency === 'overdue'
                        ? 'border-coral/40 bg-coral-soft/40'
                        : urgency === 'soon'
                        ? 'border-amber/40'
                        : 'border-line'
                    }`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${priorityDot[task.priority]}`} />
                        <h3 className="font-medium text-ink truncate">{task.title}</h3>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        <span
                          className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${statusStyles[task.status]}`}
                        >
                          {task.status}
                        </span>
                        {urgency === 'overdue' && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-coral/30 bg-coral text-white">
                            overdue
                          </span>
                        )}
                        {urgency === 'soon' && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-amber/30 bg-amber-soft text-amber">
                            due soon
                          </span>
                        )}
                        {task.dueDate && (
                          <span
                            className={`text-[11px] ${
                              urgency === 'overdue' ? 'text-coral font-medium' : 'text-muted'
                            }`}
                          >
                            due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(task)}
                        className="text-xs font-medium px-3 py-1.5 rounded-full border border-line text-muted hover:border-violet hover:text-violet hover:bg-violet-soft transition-colors focus-ring"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="text-xs font-medium px-3 py-1.5 rounded-full border border-line text-muted hover:border-coral hover:text-coral hover:bg-coral-soft transition-colors focus-ring"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-6 text-xs">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-full border transition-colors ${
                      p === page
                        ? 'bg-violet text-white border-violet'
                        : 'border-line text-muted hover:border-violet hover:text-violet'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Dashboard;
