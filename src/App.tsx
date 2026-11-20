import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  FileText,
  Flag,
  LayoutDashboard,
  Menu,
  Moon,
  MoreHorizontal,
  NotebookPen,
  Plus,
  Search,
  Settings,
  Sun,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'

type TaskStatus = 'todo' | 'in_progress' | 'completed'
type Priority = 'high' | 'medium' | 'low'
type View = 'dashboard' | 'tasks' | 'calendar' | 'notes' | 'settings'
type ThemeMode = 'light' | 'dark'
type VisualStyle = 'classic' | 'glass'
type Wallpaper = 'abstract' | 'skull' | 'orb'
type WallpaperShade = 'clear' | 'shaded'
type PaletteName = 'sage' | 'lavender' | 'ocean' | 'creamNavy' | 'aquaMint' | 'purpleMauve' | 'indigo'

type Task = {
  id: string
  title: string
  description: string
  dueDate: string
  dueTime?: string
  category: string
  priority: Priority
  status: TaskStatus
  memo: string
}

type Note = { id: string; title: string; content: string; updatedAt: string; pinned: boolean }

const today = new Date().toISOString().slice(0, 10)
const initialTasks: Task[] = [
  { id: '1', title: 'Review the product brief', description: 'Capture the essential decisions for the next sprint.', dueDate: today, dueTime: '09:30', category: 'Work', priority: 'high', status: 'completed', memo: 'Focus on the navigation and offline-first sections.' },
  { id: '2', title: 'Plan tomorrow’s priorities', description: 'Choose three meaningful outcomes for the morning.', dueDate: today, dueTime: '14:00', category: 'Personal', priority: 'medium', status: 'in_progress', memo: '' },
  { id: '3', title: 'Book a Sunday hike', description: 'Find a route that works for everyone.', dueDate: today, dueTime: '17:30', category: 'Health', priority: 'low', status: 'todo', memo: 'Check the weather before confirming.' },
  { id: '4', title: 'Send the project update', description: 'A short, clear update with the current blockers.', dueDate: today, dueTime: '18:00', category: 'Work', priority: 'medium', status: 'todo', memo: '' },
]
const initialNotes: Note[] = [
  { id: 'n1', title: 'A calmer week', content: 'Leave room between commitments. A spacious plan is still a plan.', updatedAt: 'Just now', pinned: true },
  { id: 'n2', title: 'Ideas to explore', content: 'A little list of things worth returning to when the week is quieter.', updatedAt: 'Yesterday', pinned: false },
]

const palettes: Record<PaletteName, { label: string; colors: string[] }> = {
  creamNavy: { label: 'Cream & Navy', colors: ['#fff7e7', '#173251', '#e88a3a'] },
  ocean: { label: 'Ice Blue & Ocean', colors: ['#eff7f8', '#123c4a', '#9acbd1'] },
  aquaMint: { label: 'Aqua Green & Mint', colors: ['#effaf6', '#176c5b', '#9cd7c0'] },
  purpleMauve: { label: 'Purple & Mauve', colors: ['#f8f2fb', '#65406f', '#d6add4'] },
  sage: { label: 'Charcoal & Sage', colors: ['#edf0eb', '#29352f', '#a6c4a3'] },
  lavender: { label: 'Lavender Mix', colors: ['#f7f3fa', '#3f3155', '#cab8df'] },
  indigo: { label: 'Indigo', colors: ['#f2f4ff', '#303f9f', '#aebaf2'] },
}

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Today', icon: LayoutDashboard },
  { id: 'tasks', label: 'My tasks', icon: ClipboardList },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'notes', label: 'Notepad', icon: NotebookPen },
]

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [tasks, setTasks] = useState<Task[]>(() => readStorage('daily-space-tasks', initialTasks))
  const [notes, setNotes] = useState<Note[]>(() => readStorage('daily-space-notes', initialNotes))
  const [theme, setTheme] = useState<ThemeMode>(() => readStorage('daily-space-mode', 'light'))
  const [palette, setPalette] = useState<PaletteName>(() => readStorage('daily-space-palette', 'sage'))
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(() => readStorage('daily-space-visual-style', 'classic'))
  const [wallpaper, setWallpaper] = useState<Wallpaper>(() => readStorage('daily-space-wallpaper', 'abstract'))
  const [wallpaperShade, setWallpaperShade] = useState<WallpaperShade>(() => readStorage('daily-space-wallpaper-shade', 'shaded'))
  const [mobileMenu, setMobileMenu] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [quickMenu, setQuickMenu] = useState(false)
  const [profileMenu, setProfileMenu] = useState(false)
  const [taskModal, setTaskModal] = useState<Task | 'new' | null>(null)
  const [noteModal, setNoteModal] = useState<Note | 'new' | null>(null)

  useEffect(() => { localStorage.setItem('daily-space-tasks', JSON.stringify(tasks)) }, [tasks])
  useEffect(() => { localStorage.setItem('daily-space-notes', JSON.stringify(notes)) }, [notes])
  useEffect(() => { localStorage.setItem('daily-space-mode', JSON.stringify(theme)) }, [theme])
  useEffect(() => { localStorage.setItem('daily-space-palette', JSON.stringify(palette)) }, [palette])
  useEffect(() => { localStorage.setItem('daily-space-visual-style', JSON.stringify(visualStyle)) }, [visualStyle])
  useEffect(() => { localStorage.setItem('daily-space-wallpaper', JSON.stringify(wallpaper)) }, [wallpaper])
  useEffect(() => { localStorage.setItem('daily-space-wallpaper-shade', JSON.stringify(wallpaperShade)) }, [wallpaperShade])

  const todayTasks = tasks.filter((task) => task.dueDate === today)
  const progress = todayTasks.length ? Math.round((todayTasks.filter((task) => task.status === 'completed').length / todayTasks.length) * 100) : 0
  const topbarDate = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })

  function updateTask(updatedTask: Task) {
    setTasks((current) => current.some((task) => task.id === updatedTask.id) ? current.map((task) => task.id === updatedTask.id ? updatedTask : task) : [updatedTask, ...current])
    setTaskModal(null)
  }
  function toggleTask(id: string) { setTasks((current) => current.map((task) => task.id === id ? { ...task, status: task.status === 'completed' ? 'todo' : 'completed' } : task)) }
  function deleteTask(id: string) { setTasks((current) => current.filter((task) => task.id !== id)); setTaskModal(null) }
  function updateNote(note: Note) {
    setNotes((current) => current.some((item) => item.id === note.id) ? current.map((item) => item.id === note.id ? note : item) : [note, ...current])
    setNoteModal(null)
  }
  function deleteNote(id: string) { setNotes((current) => current.filter((note) => note.id !== id)); setNoteModal(null) }
  function toggleNavigation() {
    if (window.matchMedia('(max-width: 680px)').matches) setMobileMenu(true)
    else setSidebarCollapsed((collapsed) => !collapsed)
  }

  return (
    <div className={`app-shell mode-${theme} palette-${palette} style-${visualStyle} wallpaper-${wallpaper} shade-${wallpaperShade}`}>
      <aside className={`sidebar ${mobileMenu ? 'is-open' : ''} ${sidebarCollapsed ? 'is-collapsed' : ''}`}>
        <div className="brand"><div className="brand-mark"><CalendarDays size={16} /></div><div><strong>My Daily Space</strong><span>Make room for what matters</span></div></div>
        <div className="sidebar-section-label">Workspace</div>
        <nav className="main-nav">{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? 'nav-item active' : 'nav-item'} onClick={() => { setView(id); setMobileMenu(false) }}><Icon size={18} /><span>{label}</span>{id === 'tasks' && <b>{tasks.filter((task) => task.status !== 'completed').length}</b>}</button>)}</nav>
      </aside>
      {mobileMenu && <button className="scrim" aria-label="Close menu" onClick={() => setMobileMenu(false)} />}
      <main className="main-content">
        <header className="topbar"><button className="icon-button menu-button" aria-label="Toggle navigation" onClick={toggleNavigation}><Menu size={21} /></button><div className="topbar-date"><span className="eyebrow-dot" />{topbarDate}</div><div className="topbar-actions"><div className="profile-menu"><button className="topbar-profile" aria-label="Profile account" aria-expanded={profileMenu} onClick={() => setProfileMenu((open) => !open)}><UserRound size={18} /></button>{profileMenu && <div className="profile-popover"><strong>Alex Kim</strong><span>Personal space</span><button onClick={() => { setView('settings'); setProfileMenu(false) }}><Settings size={16} /> Settings</button></div>}</div></div></header>
        <div className="page-wrap">
          {view === 'dashboard' && <Dashboard tasks={tasks} todayTasks={todayTasks} progress={progress} onToggle={toggleTask} onOpenTask={setTaskModal} onNavigate={setView} />}
          {view === 'tasks' && <TasksPage tasks={tasks} onToggle={toggleTask} onOpenTask={setTaskModal} onNewTask={() => setTaskModal('new')} />}
          {view === 'calendar' && <CalendarPage tasks={tasks} onOpenTask={setTaskModal} />}
          {view === 'notes' && <NotesPage notes={notes} onOpenNote={setNoteModal} onNewNote={() => setNoteModal('new')} />}
          {view === 'settings' && <SettingsPage theme={theme} palette={palette} visualStyle={visualStyle} wallpaper={wallpaper} wallpaperShade={wallpaperShade} onThemeChange={setTheme} onPaletteChange={setPalette} onVisualStyleChange={setVisualStyle} onWallpaperChange={setWallpaper} onWallpaperShadeChange={setWallpaperShade} />}
        </div>
      </main>
      <div className={`quick-add ${quickMenu ? 'is-open' : ''}`}><div className="quick-add-options"><button onClick={() => { setTaskModal('new'); setQuickMenu(false) }}><Plus size={17} /><span>Add task</span></button><button onClick={() => { setNoteModal('new'); setQuickMenu(false) }}><NotebookPen size={17} /><span>New note</span></button><button onClick={() => { setView('calendar'); setQuickMenu(false) }}><CalendarDays size={17} /><span>Calendar</span></button></div><button className="quick-add-button" aria-label="Quick add" onClick={() => setQuickMenu((open) => !open)}><Plus size={23} /></button></div>
      {taskModal && <TaskModal task={taskModal === 'new' ? null : taskModal} onSave={updateTask} onDelete={deleteTask} onClose={() => setTaskModal(null)} />}
      {noteModal && <NoteModal note={noteModal === 'new' ? null : noteModal} onSave={updateNote} onDelete={deleteNote} onClose={() => setNoteModal(null)} />}
    </div>
  )
}

function Dashboard({ tasks, todayTasks, progress, onToggle, onOpenTask, onNavigate }: { tasks: Task[]; todayTasks: Task[]; progress: number; onToggle: (id: string) => void; onOpenTask: (task: Task) => void; onNavigate: (view: View) => void }) {
  const upcoming = tasks.filter((task) => task.status !== 'completed').slice(0, 3)
  return <>
    <section className="dashboard-grid">
      <div className="progress-card"><div className="card-heading"><div><span className="section-kicker">Today’s rhythm</span><h2>{progress}% <small>complete</small></h2></div><div className="progress-ring" style={{ '--progress': `${progress * 3.6}deg` } as CSSProperties}><span>{todayTasks.filter((task) => task.status === 'completed').length}<small>/{todayTasks.length}</small></span></div></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><p>{progress === 100 ? 'Everything is wrapped for today.' : `${todayTasks.filter((task) => task.status !== 'completed').length} things still have your attention.`}</p></div>
      <div className="stat-card"><div className="stat-icon blue"><ClipboardList size={18} /></div><span className="section-kicker">Open tasks</span><strong>{tasks.filter((task) => task.status !== 'completed').length}</strong><p>Across your space <ArrowUpRight size={14} /></p></div>
      <div className="stat-card"><div className="stat-icon amber"><Clock3 size={18} /></div><span className="section-kicker">Next up</span><strong>{upcoming[0]?.dueTime ?? '—'}</strong><p>{upcoming[0]?.title ?? 'No tasks waiting'}</p></div>
    </section>
    <section className="content-grid"><div className="panel task-panel"><div className="panel-header"><div><span className="section-kicker">Your focus</span><h2>Today’s tasks</h2></div><button className="text-button" onClick={() => onNavigate('tasks')}>View all <ArrowUpRight size={15} /></button></div><div className="task-list">{todayTasks.map((task) => <TaskRow key={task.id} task={task} onToggle={onToggle} onOpen={onOpenTask} />)}{todayTasks.length === 0 && <EmptyState icon={<CheckCircle2 />} title="A clear day" text="Add a task when something needs your attention." />}</div></div><div className="panel upcoming-panel"><div className="panel-header"><div><span className="section-kicker">Coming up</span><h2>Next on your mind</h2></div><button className="icon-button subtle"><MoreHorizontal size={18} /></button></div><div className="upcoming-list">{upcoming.map((task) => <button className="upcoming-item" key={task.id} onClick={() => onOpenTask(task)}><div className={`priority-line ${task.priority}`} /><div><strong>{task.title}</strong><span>{task.dueTime} · {task.category}</span></div><ChevronDown size={16} /></button>)}</div><div className="note-callout"><div className="note-callout-icon"><FileText size={17} /></div><div><span className="section-kicker">Pinned note</span><strong>Remember to leave some breathing room.</strong></div></div></div></section>
  </>
}

function TasksPage({ tasks, onToggle, onOpenTask, onNewTask }: { tasks: Task[]; onToggle: (id: string) => void; onOpenTask: (task: Task) => void; onNewTask: () => void }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | TaskStatus>('all')
  const filtered = tasks.filter((task) => (filter === 'all' || task.status === filter) && `${task.title} ${task.category}`.toLowerCase().includes(query.toLowerCase()))
  return <><section className="page-heading"><div><span className="eyebrow"><span className="eyebrow-dot" /> Task space</span><h1>Make it manageable.</h1><p className="page-intro">Everything you need to do, in one calm place.</p></div><button className="primary-button" onClick={onNewTask}><Plus size={18} /> Add task</button></section><div className="toolbar"><div className="search-box"><Search size={17} /><input placeholder="Search tasks" value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="filter-tabs"><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All <span>{tasks.length}</span></button><button className={filter === 'todo' ? 'active' : ''} onClick={() => setFilter('todo')}>To do</button><button className={filter === 'in_progress' ? 'active' : ''} onClick={() => setFilter('in_progress')}>In progress</button><button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>Done</button></div></div><div className="panel all-tasks-panel"><div className="task-table-header"><span>Task</span><span>Category</span><span>Priority</span><span>Status</span><span /></div>{filtered.map((task) => <TaskRow key={task.id} task={task} onToggle={onToggle} onOpen={onOpenTask} detailed />)}{filtered.length === 0 && <EmptyState icon={<Search />} title="Nothing matches" text="Try a different search or filter." />}</div></>
}

function TaskRow({ task, onToggle, onOpen, detailed = false }: { task: Task; onToggle: (id: string) => void; onOpen: (task: Task) => void; detailed?: boolean }) {
  return <div className={`task-row ${task.status === 'completed' ? 'is-complete' : ''} ${detailed ? 'detailed' : ''}`}><button className={`check-button ${task.status === 'completed' ? 'checked' : ''}`} aria-label={`Mark ${task.title} complete`} onClick={() => onToggle(task.id)}>{task.status === 'completed' && <Check size={14} />}</button><button className="task-main" onClick={() => onOpen(task)}><strong>{task.title}</strong><span>{task.description}</span></button>{detailed && <span className="table-category">{task.category}</span>}<span className={`priority-tag ${task.priority}`}><Flag size={12} /> {task.priority}</span>{detailed && <span className={`status-tag ${task.status}`}>{task.status.replace('_', ' ')}</span>}<span className="task-time">{task.dueTime ?? 'Anytime'}</span><button className="row-more" aria-label="Edit task" onClick={() => onOpen(task)}><MoreHorizontal size={17} /></button></div>
}

function CalendarPage({ tasks, onOpenTask }: { tasks: Task[]; onOpenTask: (task: Task) => void }) {
  const now = new Date()
  const [month, setMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(today)
  const monthLabel = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const agendaLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
  const firstWeekday = (month.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const previousMonthDays = new Date(month.getFullYear(), month.getMonth(), 0).getDate()

  function dateKey(offset: number) {
    return new Date(Date.UTC(month.getFullYear(), month.getMonth(), offset)).toISOString().slice(0, 10)
  }

  return <>
    <section className="page-heading"><div><span className="eyebrow"><span className="eyebrow-dot" /> Planning view</span><h1>Calendar, at a glance.</h1><p className="page-intro">A gentle overview of what your week is holding.</p></div><button className="outline-button" onClick={() => setMonth(new Date(now.getFullYear(), now.getMonth(), 1))}><CalendarDays size={17} /> Today</button></section>
    <div className="calendar-layout"><div className="panel calendar-panel"><div className="calendar-month"><button className="icon-button subtle" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button><strong>{monthLabel}</strong><button className="icon-button subtle" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button></div><div className="calendar-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{Array.from({ length: 42 }, (_, index) => {
      const offset = index - firstWeekday + 1
      const isCurrentMonth = offset >= 1 && offset <= daysInMonth
      const day = isCurrentMonth ? offset : offset < 1 ? previousMonthDays + offset : offset - daysInMonth
      const dayTasks = tasks.filter((task) => task.dueDate === dateKey(offset))
      const isToday = dateKey(offset) === today
      const key = dateKey(offset)
      return <div className={`calendar-cell ${isToday ? 'current' : ''} ${key === selectedDate ? 'selected' : ''} ${isCurrentMonth ? '' : 'muted'}`} key={key} role="button" tabIndex={0} aria-label={`View tasks for ${key}`} onClick={() => setSelectedDate(key)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedDate(key) }}><span>{day}</span>{dayTasks.slice(0, 2).map((task) => <button key={task.id} className={`calendar-task ${task.status}`} onClick={(event) => { event.stopPropagation(); onOpenTask(task) }}>{task.title}</button>)}</div>
    })}</div></div><div className="panel agenda-panel"><span className="section-kicker">{agendaLabel}</span><h2>{selectedDate === today ? 'Today’s agenda' : 'Selected day'}</h2>{tasks.filter((task) => task.dueDate === selectedDate).map((task) => <button className="agenda-item" key={task.id} onClick={() => onOpenTask(task)}><span>{task.dueTime}</span><div><strong>{task.title}</strong><small>{task.category}</small></div></button>)}{tasks.filter((task) => task.dueDate === selectedDate).length === 0 && <EmptyState icon={<CalendarDays />} title="Nothing planned" text="Select another date to review its activity." />}</div></div>
  </>
}

function NotesPage({ notes, onOpenNote, onNewNote }: { notes: Note[]; onOpenNote: (note: Note) => void; onNewNote: () => void }) { const [query, setQuery] = useState(''); const visible = notes.filter((note) => `${note.title} ${note.content}`.toLowerCase().includes(query.toLowerCase())); return <><section className="page-heading"><div><span className="eyebrow"><span className="eyebrow-dot" /> Your thoughts</span><h1>A place to put it down.</h1><p className="page-intro">Loose ends, bright ideas, and everything in between.</p></div><button className="primary-button" onClick={onNewNote}><Plus size={18} /> New note</button></section><div className="notes-toolbar"><div className="search-box"><Search size={17} /><input placeholder="Search notes" value={query} onChange={(event) => setQuery(event.target.value)} /></div><span>{notes.length} notes</span></div><div className="notes-grid">{visible.map((note) => <button className={`note-card ${note.pinned ? 'pinned' : ''}`} key={note.id} onClick={() => onOpenNote(note)}><div className="note-card-top"><FileText size={17} /><span>{note.updatedAt}</span>{note.pinned && <Flag size={14} className="pin-icon" />}</div><h3>{note.title}</h3><p>{note.content}</p><div className="note-card-bottom"><span>Open note</span><ArrowUpRight size={15} /></div></button>)}<button className="new-note-card" onClick={onNewNote}><div><Plus size={21} /></div><strong>Capture a thought</strong><span>Start a new note</span></button></div></> }

function SettingsPage({ theme, palette, visualStyle, wallpaper, wallpaperShade, onThemeChange, onPaletteChange, onVisualStyleChange, onWallpaperChange, onWallpaperShadeChange }: { theme: ThemeMode; palette: PaletteName; visualStyle: VisualStyle; wallpaper: Wallpaper; wallpaperShade: WallpaperShade; onThemeChange: (mode: ThemeMode) => void; onPaletteChange: (palette: PaletteName) => void; onVisualStyleChange: (style: VisualStyle) => void; onWallpaperChange: (wallpaper: Wallpaper) => void; onWallpaperShadeChange: (shade: WallpaperShade) => void }) {
  return <><section className="page-heading"><div><span className="eyebrow"><span className="eyebrow-dot" /> Preferences</span><h1>Make it feel like yours.</h1><p className="page-intro">Your space, tuned to the way you like to work.</p></div></section><div className="settings-layout"><section className="panel settings-panel"><div className="settings-section"><div className="settings-copy"><h2>Appearance</h2><p>Choose how My Daily Space looks throughout the day.</p></div><div className="mode-picker">{(['light', 'dark'] as ThemeMode[]).map((mode) => <button key={mode} className={theme === mode ? 'selected' : ''} onClick={() => onThemeChange(mode)}>{mode === 'light' ? <Sun size={18} /> : <Moon size={18} />}<span>{mode === 'light' ? 'Light' : 'Dark'}</span>{theme === mode && <Check size={15} />}</button>)}</div></div><div className="settings-divider" /><div className="settings-section"><div className="settings-copy"><h2>Interface style</h2><p>Choose a solid classic surface or a soft liquid-glass finish.</p></div><div className="mode-picker">{(['classic', 'glass'] as VisualStyle[]).map((style) => <button key={style} className={visualStyle === style ? 'selected' : ''} onClick={() => onVisualStyleChange(style)}><span>{style === 'classic' ? 'Classic' : 'Liquid glass'}</span>{visualStyle === style && <Check size={15} />}</button>)}</div></div>{visualStyle === 'glass' && <><div className="settings-divider" /><div className="settings-section wallpaper-section"><div className="settings-copy"><h2>Glass wallpaper</h2><p>Choose the backdrop visible through your glass panels.</p></div><div className="wallpaper-options">{(['abstract', 'skull', 'orb'] as Wallpaper[]).map((item) => <button key={item} className={`wallpaper-choice ${item}-wallpaper ${wallpaper === item ? 'selected' : ''}`} onClick={() => onWallpaperChange(item)}><span>{item === 'abstract' ? 'Abstract glow' : item === 'skull' ? 'Skull wallpaper' : 'Dark orb'}</span>{wallpaper === item && <Check size={15} />}</button>)}</div></div><div className="settings-divider" /><div className="settings-section"><div className="settings-copy"><h2>Background visibility</h2><p>Show the wallpaper clearly, or add a soft shade for a quieter backdrop.</p></div><div className="mode-picker">{(['clear', 'shaded'] as WallpaperShade[]).map((shade) => <button key={shade} className={wallpaperShade === shade ? 'selected' : ''} onClick={() => onWallpaperShadeChange(shade)}><span>{shade === 'clear' ? 'Clear' : 'Shaded'}</span>{wallpaperShade === shade && <Check size={15} />}</button>)}</div></div></>}<div className="settings-divider" /><div className="settings-section palette-section"><div className="settings-copy"><h2>Colour palette</h2><p>Set the tone for your daily space. Changes save automatically.</p></div><div className="palette-options">{(Object.keys(palettes) as PaletteName[]).map((name) => <button key={name} className={palette === name ? 'palette-choice selected' : 'palette-choice'} onClick={() => onPaletteChange(name)}><div className="swatches">{palettes[name].colors.map((color) => <i key={color} style={{ backgroundColor: color }} />)}</div><span>{palettes[name].label}</span>{palette === name && <Check size={15} />}</button>)}</div></div></section><aside className="settings-preview"><span className="section-kicker">Live preview</span><div className="preview-window"><div className="preview-top"><div className="preview-dot" /><div className="preview-line short" /></div><div className="preview-body"><div className="preview-sidebar" /><div className="preview-content"><div className="preview-line" /><div className="preview-line medium" /><div className="preview-card"><CheckCircle2 size={15} /><div className="preview-line medium" /></div><div className="preview-card small"><Clock3 size={15} /><div className="preview-line short" /></div></div></div></div><p>Preferences are saved on this device.</p></aside></div></> 
}

function TaskModal({ task, onSave, onDelete, onClose }: { task: Task | null; onSave: (task: Task) => void; onDelete: (id: string) => void; onClose: () => void }) { const [draft, setDraft] = useState<Task>(task ?? { id: crypto.randomUUID(), title: '', description: '', dueDate: today, dueTime: '', category: 'Personal', priority: 'medium', status: 'todo', memo: '' }); const update = (key: keyof Task, value: string) => setDraft((current) => ({ ...current, [key]: value })); return <Modal title={task ? 'Edit task' : 'New task'} onClose={onClose}><div className="form-grid"><label className="full">Task title<input autoFocus value={draft.title} onChange={(event) => update('title', event.target.value)} placeholder="What needs your attention?" /></label><label className="full">Description<textarea value={draft.description} onChange={(event) => update('description', event.target.value)} placeholder="Add a little context" rows={2} /></label><label>Due date<input type="date" value={draft.dueDate} onChange={(event) => update('dueDate', event.target.value)} /></label><label>Time<input type="time" value={draft.dueTime} onChange={(event) => update('dueTime', event.target.value)} /></label><label>Category<select value={draft.category} onChange={(event) => update('category', event.target.value)}>{['Personal', 'Work', 'Health', 'Family', 'Shopping'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Priority<select value={draft.priority} onChange={(event) => update('priority', event.target.value)}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label><label className="full">Task memo<textarea value={draft.memo} onChange={(event) => update('memo', event.target.value)} placeholder="Instructions, preparation, or helpful context" rows={3} /></label></div><div className="modal-actions">{task && <button className="danger-button" onClick={() => onDelete(task.id)}><Trash2 size={16} /> Delete</button>}<span /><button className="outline-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={!draft.title.trim()} onClick={() => onSave(draft)}><Check size={16} /> Save task</button></div></Modal> }

function NoteModal({ note, onSave, onDelete, onClose }: { note: Note | null; onSave: (note: Note) => void; onDelete: (id: string) => void; onClose: () => void }) { const [draft, setDraft] = useState<Note>(note ?? { id: crypto.randomUUID(), title: '', content: '', updatedAt: 'Just now', pinned: false }); return <Modal title={note ? 'Edit note' : 'New note'} onClose={onClose}><div className="form-grid"><label className="full">Note title<input autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Give it a name" /></label><label className="full">Content<textarea className="note-editor" value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="Start writing..." rows={8} /></label><label className="pin-toggle"><input type="checkbox" checked={draft.pinned} onChange={(event) => setDraft({ ...draft, pinned: event.target.checked })} /> <Flag size={15} /> Pin this note</label></div><div className="modal-actions">{note && <button className="danger-button" onClick={() => onDelete(note.id)}><Trash2 size={16} /> Delete</button>}<span /><button className="outline-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={!draft.title.trim()} onClick={() => onSave({ ...draft, updatedAt: 'Just now' })}><Check size={16} /> Save note</button></div></Modal> }

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) { return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal" role="dialog" aria-modal="true"><div className="modal-header"><h2>{title}</h2><button className="icon-button subtle" onClick={onClose} aria-label="Close"><X size={19} /></button></div>{children}</section></div> }
function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) { return <div className="empty-state"><div>{icon}</div><strong>{title}</strong><span>{text}</span></div> }
function readStorage<T>(key: string, fallback: T): T { try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) as T : fallback } catch { return fallback } }

export default App
