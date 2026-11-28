import { useEffect, useState, useSyncExternalStore } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { api, login, logout, loadTasks, added, toggled, removed, filterChanged, traceObserver } from './store';

const concepts = [
  ['State', 'The current data', 'auth + tasks'],
  ['Store', 'One source of truth', 'configureStore()'],
  ['Reducer', 'Calculates next state', 'createSlice()'],
  ['Action', 'Describes an event', 'tasks/added'],
  ['Dispatch', 'Sends an action', 'dispatch(added())'],
  ['Subscribe', 'Listens for changes', 'store.subscribe()'],
];

function decodePart(part) {
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(base64), char => char.charCodeAt(0))));
}

function Login() {
  const dispatch = useDispatch();
  const { status, error, notice } = useSelector(state => state.auth);
  const [email, setEmail] = useState('demo@studyboard.dev');
  const [password, setPassword] = useState('ReduxJWT10!');
  const [shortLived, setShortLived] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const result = await dispatch(login({ email, password, shortLived }));
    if (login.fulfilled.match(result)) dispatch(loadTasks());
  }
  return <section className="card login-card">
    <div className="eyebrow"><span className="step">01</span> AUTHENTICATE</div>
    <h2>Your study session starts here.</h2>
    <p className="muted">Sign in to receive a signed JWT and unlock your study board.</p>
    <form onSubmit={submit}>
      <label htmlFor="email">Email address</label>
      <input id="email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} />
      <label htmlFor="password">Password</label>
      <input id="password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} />
      <label className="check-option"><input type="checkbox" checked={shortLived} onChange={event => setShortLived(event.target.checked)} /> Use a 10-second token to test expiry</label>
      <button className="primary wide" disabled={status === 'loading'}>{status === 'loading' ? 'Signing in…' : 'Sign in to StudyBoard'} <span aria-hidden="true">↗</span></button>
    </form>
    {error && <p role="alert" className="message error">{error}</p>}
    {notice && <p role="status" className="message">{notice}</p>}
    <div className="demo-note"><strong>Demo account included</strong><span>demo@studyboard.dev · ReduxJWT10!</span><small>Educational credentials. No registration needed.</small></div>
  </section>;
}

function Board() {
  const dispatch = useDispatch();
  const { items, filter, status, error } = useSelector(state => state.tasks);
  const [title, setTitle] = useState('');
  const visible = items.filter(task => filter === 'all' || (filter === 'completed' ? task.completed : !task.completed));
  const completed = items.filter(task => task.completed).length;
  const addTask = event => {
    event.preventDefault();
    if (!title.trim()) return;
    // IDs are generated outside the reducer so reducers remain deterministic.
    dispatch(added({ id: crypto.randomUUID(), title: title.trim(), completed: false }));
    setTitle('');
  };
  return <section className="card board-card">
    <div className="eyebrow"><span className="step">01</span> YOUR WORKSPACE <span className="pill">JWT protected</span></div>
    <div className="section-title"><h2>Make a little progress.</h2><span className="completion">{completed}/{items.length} done</span></div>
    <p className="muted">Your first tasks came from the protected API. Edits live in Redux.</p>
    <div className="progress-track"><div style={{ width: `${items.length ? completed / items.length * 100 : 0}%` }} /></div>
    {status === 'loading' && <p role="status">Loading protected tasks…</p>}
    {error && <div className="message error" role="alert">{error} <button className="text-button" onClick={() => dispatch(loadTasks())}>Retry</button></div>}
    <form className="task-form" onSubmit={addTask}>
      <label className="sr-only" htmlFor="task-title">New task</label>
      <input id="task-title" placeholder="What would you like to learn?" maxLength={100} required value={title} onChange={event => setTitle(event.target.value)} />
      <button className="primary" disabled={status !== 'ready' || !title.trim()}>+ Add task</button>
    </form>
    <div className="filters" aria-label="Filter tasks">{['all', 'active', 'completed'].map(value => <button key={value} aria-pressed={filter === value} className={filter === value ? 'active' : ''} onClick={() => dispatch(filterChanged(value))}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div>
    <ul className="task-list">{visible.map(task => <li key={task.id}>
      <label className={task.completed ? 'task done' : 'task'}><input type="checkbox" checked={task.completed} onChange={() => dispatch(toggled(task.id))} /><span>{task.title}</span></label>
      <button className="delete-button" aria-label={`Delete ${task.title}`} onClick={() => dispatch(removed(task.id))}>×</button>
    </li>)}</ul>
    {!visible.length && status === 'ready' && <p className="empty">{items.length ? 'No tasks match this filter.' : 'A clean slate. Add your first task above.'}</p>}
    <p className="footnote">Session-only demo · Signing out or refreshing resets the board.</p>
  </section>;
}

function TokenPanel() {
  const { token } = useSelector(state => state.auth);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setResult(null); }, [token]);
  const parts = token?.split('.');
  const claims = token ? decodePart(parts[1]) : null;
  async function probe(kind) {
    setBusy(true);
    try {
      let candidate = token;
      if (kind === 'missing') candidate = null;
      if (kind === 'tampered') {
        // Change the signed payload but keep the original signature.
        const changed = btoa(JSON.stringify({ ...claims, sub: 'intruder' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        candidate = `${parts[0]}.${changed}.${parts[2]}`;
      }
      const response = await fetch('/api/auth/me', { headers: candidate ? { Authorization: `Bearer ${candidate}` } : {} });
      const data = await response.json();
      setResult({ ok: response.ok, text: `${response.status} ${response.ok ? 'OK — signature and claims verified. Hello, ' + data.user.name + '.' : 'Unauthorized — ' + data.message}` });
    } catch { setResult({ ok: false, text: 'Cannot reach the API. Check that the server is running.' }); }
    finally { setBusy(false); }
  }
  return <section className="card token-card">
    <div className="eyebrow"><span className="step">02</span> JWT EXPLORER <span className={`status-dot ${token ? 'on' : ''}`} /></div>
    <h2>Trust is verified on the server.</h2>
    <p className="muted">A signed token has three parts. Its payload is readable, not encrypted.</p>
    <div className="token-parts"><span>Header<small>algorithm + type</small></span><b>.</b><span>Payload<small>identity + claims</small></span><b>.</b><span>Signature<small>integrity check</small></span></div>
    {token ? <>
      <details><summary>Inspect this session’s token</summary><code className="raw-token">{token}</code><pre aria-label="Decoded JWT header">{JSON.stringify(decodePart(parts[0]), null, 2)}</pre></details>
      <pre className="claims" aria-label="Decoded JWT claims">{JSON.stringify(claims, null, 2)}</pre>
      <p className="footnote">Client decoding is for inspection. Only the API verifies authenticity.</p>
      <div className="probe-buttons"><button disabled={busy} onClick={() => probe('valid')}>Verify my token</button><button disabled={busy} onClick={() => probe('tampered')}>Test tampered token</button><button disabled={busy} onClick={() => probe('missing')}>Test without token</button></div>
    </> : <><div className="locked"><span aria-hidden="true">⌁</span><strong>No token in memory</strong><p>Sign in to inspect real claims and test the signature.</p></div><button className="secondary wide" disabled={busy} onClick={() => probe('missing')}>Request protected profile without a token <span aria-hidden="true">↗</span></button></>}
    {result && <p role="status" className={`message ${result.ok ? 'success' : 'error'}`}>{result.text}</p>}
  </section>;
}

function Inspector() {
  const trace = useSyncExternalStore(traceObserver.subscribe, traceObserver.getSnapshot);
  const auth = useSelector(state => state.auth);
  const tasks = useSelector(state => state.tasks);
  const safeState = { auth: { status: auth.status, user: auth.user?.name || null, token: auth.token ? '[held in memory]' : null }, tasks: { items: tasks.items, filter: tasks.filter } };
  return <section className="inspector" id="inspector">
    <div className="inspector-heading"><div><div className="eyebrow">UNDER THE HOOD</div><h2>Watch Redux work.</h2></div><span className="subscription-count"><span className="pulse" /> Subscriber notified <strong>{trace.count}</strong> times</span></div>
    <div className="inspector-grid"><div><h3><span className="code-dot" /> Current state <small>store.getState()</small></h3><pre aria-label="Redux state">{JSON.stringify(safeState, null, 2)}</pre></div><div><h3><span className="code-dot gold" /> Action stream <small>most recent first</small></h3>{trace.events.length ? <ol className="action-list">{trace.events.map((event, index) => <li key={`${index}-${event}`}><span>{String(trace.count - index).padStart(2, '0')}</span><code>{event}</code>{index === 0 && <small>latest</small>}</li>)}</ol> : <p className="waiting">Waiting for your first dispatch…<br />Sign in or interact with the board to start.</p>}<p className="inspector-note">dispatch(action) → reducer → state → subscribers → UI</p></div></div>
  </section>;
}

export default function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector(state => state.auth);
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!token) return;
    const expiry = decodePart(token.split('.')[1]).exp;
    const tick = () => {
      const seconds = Math.max(0, expiry - Math.floor(Date.now() / 1000));
      setRemaining(seconds);
      if (seconds === 0) dispatch(logout('Your token expired. Sign in again to start a new session.'));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [token, dispatch]);
  return <div className="app-shell">
    <aside className="sidebar"><a className="brand" href="#top"><span className="brand-mark">s<span>•</span></span>StudyBoard</a><div className="sidebar-body"><span className="sidebar-label">LEARNING SPACE</span><a className="nav-item selected" href="#top"><span>▦</span> My workspace <i>01</i></a><a className="nav-item" href="#concepts"><span>◇</span> Redux concepts</a><a className="nav-item" href="#inspector"><span>⌘</span> Live inspector</a></div><div className="sidebar-footer"><span className="avatar">JZ</span><div>Joshua Zaakir<small>101578900 · COMP3123</small></div></div></aside>
    <div className="main-shell" id="top"><header><div className="breadcrumb">COMP3123 <span>/</span> Lab Exercise 10</div><div className="header-right"><span className={`session-badge ${token ? 'signed-in' : ''}`}><span />{token ? `Session active · ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}` : 'Signed out'}</span>{token && <button className="signout" onClick={() => dispatch(logout())}>Sign out</button>}</div></header>
    <main><div className="intro"><div className="eyebrow">SELF-DIRECTED RESEARCH & INNOVATION</div><h1>A small board.<br /><span>Two powerful concepts.</span></h1><p>Manage your state with Redux. Secure your session with JWT.<br />Explore the complete flow, one interaction at a time.</p><div className="tech-tags"><span>React</span><span>Redux Toolkit</span><span>JWT · HS256</span><span>Express</span></div></div>
      {user && <div className="welcome" role="status"><span className="welcome-check">✓</span><div>Welcome back, {user.name.split(' ')[0]}.<small>Your JWT is in memory. The server verified access to your workspace.</small></div></div>}
      <div className="workspace-grid">{token ? <Board /> : <Login />}<TokenPanel /></div>
      <section id="concepts" className="concept-section"><div className="section-title"><h2>Six concepts. One predictable flow.</h2><span className="muted">THE REDUX TOOLKIT</span></div><div className="concept-grid">{concepts.map(([name, description, code], index) => <article className="concept" key={name}><span className="concept-number">0{index}</span><h3>{name}</h3><p>{description}</p><code>{code}</code></article>)}</div></section>
      <Inspector />
      <footer><span>StudyBoard <b>·</b> Lab Exercise 10</span><span>Joshua Zaakir <b>·</b> 101578900</span><a href="https://github.com/JoshuaZaakir/101578900_COMP3123/tree/main/labs/lab-exercise10-redux-jwt" target="_blank" rel="noreferrer">View source ↗</a></footer>
    </main></div>
  </div>;
}
