import { useState, useEffect } from 'react';

const empty = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' };

const TaskModal = ({ task, onClose, onSave }) => {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
      });
    } else {
      setForm(empty);
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save task.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center px-4 z-20 animate-pop"
      style={{ animationDuration: '0.18s' }}
    >
      <div className="w-full max-w-md bg-surface border border-line rounded-xl2 p-7 shadow-lift animate-fadeUp">
        <h2 className="font-display font-semibold text-xl text-ink mb-5">
          {task ? 'Edit task' : 'New task'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="text-sm text-coral bg-coral-soft border border-coral/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-canvas border border-line rounded-lg px-3.5 py-2.5 text-ink text-sm focus-ring focus:border-violet outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-canvas border border-line rounded-lg px-3.5 py-2.5 text-ink text-sm focus-ring focus:border-violet outline-none resize-none transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-canvas border border-line rounded-lg px-3.5 py-2.5 text-ink text-sm focus-ring focus:border-violet outline-none transition-colors"
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-canvas border border-line rounded-lg px-3.5 py-2.5 text-ink text-sm focus-ring focus:border-violet outline-none transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Due date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full bg-canvas border border-line rounded-lg px-3.5 py-2.5 text-ink text-sm focus-ring focus:border-violet outline-none transition-colors"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-line text-muted text-sm py-2.5 rounded-lg hover:border-ink/30 hover:text-ink transition-colors focus-ring"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-violet text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-violet-dark transition-colors disabled:opacity-50 focus-ring"
            >
              {saving ? 'Saving…' : 'Save task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
