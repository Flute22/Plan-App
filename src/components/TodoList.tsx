import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle, ArrowUp, ArrowDown, ArrowUpDown, ListTodo, ChevronDown } from 'lucide-react';
import { usePersistedState } from '../hooks/usePersistedState';
import { useAutoResize } from '../hooks/useAutoResize';

type Priority = 'low' | 'medium' | 'high';
type SortOrder = 'asc' | 'desc' | 'none';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
}

const DEFAULT_SLOTS = 5;

const PRIORITY_CONFIG = {
  high: { label: 'High', textColor: 'text-rose-300', bg: 'bg-rose-500/15', border: 'border-rose-500/20', borderL: 'border-l-rose-500', dotColor: 'bg-rose-500', icon: <AlertCircle size={12} /> },
  medium: { label: 'Medium', textColor: 'text-amber-300', bg: 'bg-amber-500/15', border: 'border-amber-500/20', borderL: 'border-l-amber-400', dotColor: 'bg-amber-500', icon: <ArrowUp size={12} className="rotate-45" /> },
  low: { label: 'Low', textColor: 'text-teal-300', bg: 'bg-teal-500/15', border: 'border-teal-500/20', borderL: 'border-l-teal-400', dotColor: 'bg-teal-500', icon: <ArrowDown size={12} /> },
};

function createDefaultTodos(): Todo[] {
  return Array.from({ length: DEFAULT_SLOTS }, () => ({
    id: crypto.randomUUID(),
    text: '',
    completed: false,
    priority: 'medium' as Priority,
  }));
}

interface TodoInputProps {
  index: number;
  todo: Todo;
  cfg: any;
  isFilled: boolean;
  inputRef: (el: HTMLTextAreaElement | null) => void;
  onChange: (text: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
}

function TodoInput({ index, todo, cfg, isFilled, inputRef, onChange, onKeyDown }: TodoInputProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useAutoResize(ref, todo.text);

  return (
    <textarea
      ref={(el) => {
        ref.current = el;
        inputRef(el);
      }}
      rows={1}
      value={todo.text}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      disabled={todo.completed}
      placeholder={`Task ${index + 1}...`}
      className={`add-task-input flex-1 bg-transparent border-none outline-none text-sm min-w-0 placeholder-white/10 resize-none overflow-hidden py-0 ${todo.completed ? 'text-white/20 line-through' : isFilled ? cfg.textColor : 'text-white/50'
        }`}
    />
  );
}

export default function TodoList() {
  const [todos, setTodos] = usePersistedState<Todo[]>('todos', createDefaultTodos());
  const [slotCount, setSlotCount] = useState(todos.length || DEFAULT_SLOTS);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const updateTodoText = (id: string, text: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, text } : t));
  };

  const updateTodoPriority = (id: string, priority: Priority) => {
    setTodos(todos.map(t => t.id === id ? { ...t, priority } : t));
    setOpenDropdown(null);
  };

  const toggleTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo && todo.text.trim()) {
      setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    }
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
    setSlotCount(s => Math.max(s - 1, 1));
  };

  const addSlot = () => {
    const newTodo: Todo = { id: crypto.randomUUID(), text: '', completed: false, priority: 'medium' };
    setTodos([...todos, newTodo]);
    setSlotCount(s => s + 1);
  };

  const clearCompleted = () => {
    setTodos(todos.filter(t => !t.completed));
    setShowClearConfirm(false);
  };

  const toggleSort = () => {
    setSortOrder(c => c === 'none' ? 'desc' : c === 'desc' ? 'asc' : 'none');
  };

  const getPriorityValue = (p: Priority) => ({ high: 3, medium: 2, low: 1 }[p]);

  const filledTodos = todos.filter(t => t.text.trim());
  const sortedTodos = sortOrder === 'none' ? todos : [...todos].sort((a, b) => {
    if (!a.text.trim() && !b.text.trim()) return 0;
    if (!a.text.trim()) return 1;
    if (!b.text.trim()) return -1;
    return sortOrder === 'asc' ? getPriorityValue(a.priority) - getPriorityValue(b.priority) : getPriorityValue(b.priority) - getPriorityValue(a.priority);
  });

  const hasCompleted = todos.some(t => t.completed);
  const completedCount = todos.filter(t => t.completed).length;
  const totalFilled = filledTodos.length;
  const progressPercent = totalFilled > 0 ? (completedCount / totalFilled) * 100 : 0;

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextIndex = index + 1;
      if (nextIndex < sortedTodos.length) {
        // Focus the next slot
        inputRefs.current[nextIndex]?.focus();
      } else {
        // Last slot — add a new one and focus it after render
        addSlot();
        setTimeout(() => {
          inputRefs.current[nextIndex]?.focus();
        }, 50);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6 flex flex-col relative overflow-hidden"
    >
      <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-gradient-to-br from-orange-500/8 to-rose-500/8 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col h-full" ref={dropdownRef}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20">
              <ListTodo size={18} className="text-orange-400" />
            </div>
            <h2 className="font-heading text-lg font-bold text-white/90">To-Do List</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleSort}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-medium
                ${sortOrder !== 'none' ? 'bg-orange-500/20 text-orange-300' : 'text-white/25 hover:bg-white/5 hover:text-white/40'}`}>
              <ArrowUpDown size={13} />
              {sortOrder === 'desc' && 'High'}
              {sortOrder === 'asc' && 'Low'}
            </button>
            {hasCompleted && (
              <button onClick={() => setShowClearConfirm(true)}
                className="text-xs text-white/25 hover:text-red-400 transition-colors font-medium px-2 py-1 rounded-lg hover:bg-red-500/10">
                Clear Done
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {totalFilled > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-[10px] text-white/30 mb-1.5 font-medium">
              <span>{completedCount}/{totalFilled} done</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }}
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500"
                style={{ boxShadow: '0 0 10px rgba(245,158,11,0.4)' }} />
            </div>
          </div>
        )}

        {/* Clear confirm overlay */}
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center rounded-3xl">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card p-6 text-center max-w-[80%]">
                <p className="text-white/80 font-medium mb-4 text-sm">Delete all completed tasks?</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 rounded-xl bg-white/10 text-white/60 hover:bg-white/15 text-sm font-medium transition-colors">Cancel</button>
                  <button onClick={clearCompleted} className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-medium transition-colors shadow-lg">Delete</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task Slots */}
        <div className="space-y-4 overflow-y-auto max-h-[320px] pr-1 custom-scrollbar flex-1">
          <AnimatePresence initial={false} mode='popLayout'>
            {sortedTodos.map((todo, index) => {
              const cfg = PRIORITY_CONFIG[todo.priority];
              const isFilled = todo.text.trim().length > 0;
              return (
                <motion.div layout key={todo.id}
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className={`todo-item group flex items-center gap-2 p-1.5 rounded-xl transition-all border-l-[3px] ${todo.completed
                    ? 'bg-white/3 border-l-white/10'
                    : isFilled
                      ? `bg-white/5 hover:bg-white/8 ${cfg.borderL}`
                      : 'bg-white/[0.02] border-l-white/5 hover:bg-white/5'
                    }`}>
                  {/* Checkbox */}
                  <button onClick={() => toggleTodo(todo.id)}
                    className={`todo-checkbox transition-colors flex-shrink-0 ${!isFilled ? 'text-white/8 cursor-default' : todo.completed ? 'text-amber-400' : 'text-white/15 hover:text-amber-400'}`}>
                    <motion.div animate={{ scale: todo.completed ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.3 }}>
                      {todo.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </motion.div>
                  </button>

                  {/* Text input */}
                  <TodoInput
                    index={index}
                    todo={todo}
                    cfg={cfg}
                    isFilled={isFilled}
                    inputRef={(el) => { inputRefs.current[index] = el; }}
                    onChange={(text) => updateTodoText(todo.id, text)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />

                  {/* Priority dropdown per slot */}
                  {isFilled && !todo.completed && (
                    <div className="relative flex-shrink-0">
                      <button onClick={() => setOpenDropdown(openDropdown === todo.id ? null : todo.id)}
                        className={`flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${cfg.textColor} ${cfg.bg} ${cfg.border} transition-all hover:opacity-80`}>
                        {cfg.icon}<span>{todo.priority}</span>
                        <ChevronDown size={9} className={`transition-transform ${openDropdown === todo.id ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {openDropdown === todo.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.95 }}
                            transition={{ duration: 0.12 }}
                            className="absolute top-full mt-1 right-0 w-28 rounded-xl overflow-hidden z-30"
                            style={{ background: 'rgba(20,15,35,0.96)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
                            {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                              <button key={p} onClick={() => updateTodoPriority(todo.id, p)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-all hover:bg-white/8 ${todo.priority === p ? 'bg-white/5' : ''}`}>
                                <div className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[p].dotColor}`} />
                                <span className={`font-medium ${PRIORITY_CONFIG[p].textColor}`}>{PRIORITY_CONFIG[p].label}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Delete */}
                  {isFilled && (
                    <button onClick={() => deleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/10 hover:text-red-400 transition-all flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* + Add Task button */}
        <button onClick={addSlot}
          className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-white/25 hover:text-amber-400/60 transition-colors py-2.5 rounded-xl hover:bg-white/5 w-full border border-dashed border-white/8 hover:border-amber-500/20">
          <Plus size={14} />
          Add Task
        </button>
      </div>
    </motion.div>
  );
}
