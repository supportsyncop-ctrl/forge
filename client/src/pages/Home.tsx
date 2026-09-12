import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import {
  ArrowUp,
  Bot,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  FileText,
  FolderKanban,
  Globe2,
  Image,
  LayoutGrid,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  Sparkles,
  SquarePen,
  TerminalSquare,
  X,
  Zap,
} from "lucide-react";

const modules = [
  { name: "Chat", icon: Bot, active: true, note: "Ask anything" },
  { name: "Projects", icon: FolderKanban, note: "Workspaces & context" },
  { name: "Research", icon: Search, note: "Deep + wide research" },
  { name: "Artifacts", icon: FileText, note: "Docs, slides & files" },
  { name: "Build", icon: Code2, note: "Websites & apps" },
];

const prompts = [
  { label: "Research a market", icon: Search, text: "Research the current market for AI developer tools and make a sourced brief" },
  { label: "Build a website", icon: Globe2, text: "Help me plan and build a beautiful landing page for my product" },
  { label: "Create a deck", icon: LayoutGrid, text: "Create a concise investor deck structure for my startup" },
  { label: "Analyze files", icon: FileText, text: "Analyze the files in my project and explain the most important findings" },
];

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [active, setActive] = useState("Chat");
  const [prompt, setPrompt] = useState("");
  const [toast, setToast] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [daytona, setDaytona] = useState(true);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const chooseModule = (name: string) => {
    setActive(name);
    if (name !== "Chat") notify(`${name} is staged for the next Forge release`);
    setMobileOpen(false);
  };

  const sendPrompt = () => {
    if (!prompt.trim()) return;
    notify("Your task is ready for the Forge runtime");
    setPrompt("");
  };

  const displayName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="forge-app">
      <aside className={`forge-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="forge-brand"><div className="forge-logo"><Sparkles size={17} /></div><div><b>forge</b><small>personal intelligence</small></div><button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={17} /></button></div>
        <button className="forge-new" onClick={() => { setPrompt(""); notify("New thread started"); }}><Plus size={17} /> New thread <kbd>⌘ K</kbd></button>
        <div className="forge-section-label">WORKSPACE</div>
        <nav className="forge-nav">
          {modules.map(({ name, icon: Icon, note, active: defaultActive }) => <button key={name} onClick={() => chooseModule(name)} className={`forge-nav-item ${active === name || (defaultActive && active === "Chat") ? "active" : ""}`}><Icon size={17} /><span>{name}<small>{note}</small></span>{name === "Chat" && <i>1</i>}</button>)}
        </nav>
        <div className="forge-sidebar-spacer" />
        <div className="forge-runtime"><div><span className="live-dot" /> Runtime online</div><small>Oracle control plane <em>·</em> Daytona ready</small></div>
        <div className="forge-user">
          <div className="forge-avatar">{user?.name?.charAt(0) ?? "S"}</div><div className="forge-user-copy"><b>{user?.name ?? "your workspace"}</b><small>{isAuthenticated ? user?.email ?? "private instance" : "private instance"}</small></div><button onClick={() => isAuthenticated ? logout() : startLogin()} aria-label={isAuthenticated ? "Log out" : "Sign in"}><MoreHorizontal size={17} /></button>
        </div>
      </aside>
      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
      <main className="forge-main">
        <header className="forge-topbar"><div className="forge-crumb"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={18} /></button><span>Workspace</span><b>/</b><strong>{active}</strong></div><div className="forge-top-actions"><div className="forge-model"><span className="live-dot" /> Forge model <ChevronDown size={12} /></div><button className="forge-icon-button" onClick={() => notify("Forge is tuned for focused work")}><Clock3 size={17} /></button><div className="forge-mini-avatar">{user?.name?.charAt(0) ?? "S"}</div></div></header>
        <div className="forge-content">
          <div className="forge-hero"><div className="forge-eyebrow"><Sparkles size={14} /> {active === "Chat" ? "FORGE IS READY" : `${active.toUpperCase()} MODULE`}</div><h1>Make something<br /><em>worth keeping.</em></h1><p>Good work starts with a blank canvas. Forge brings your model, context, tools, and safe execution into one calm workspace.</p></div>
          <section className="forge-command-grid"><div className="forge-command-head"><div><span className="forge-kicker">START WITH A DIRECTION</span><h2>What are we making today?</h2></div><span className="forge-task-count">04 AVAILABLE</span></div><div className="forge-prompt-grid">{prompts.map(({ label, icon: Icon, text }) => <button key={label} className="forge-prompt-card" onClick={() => setPrompt(text)}><span className="forge-prompt-icon"><Icon size={18} /></span><span><b>{label}</b><small>{text}</small></span><ArrowUp size={15} /></button>)}</div></section>
          <section className="forge-status-strip"><div><span className="forge-status-icon lime"><Zap size={16} /></span><span><b>Agent runtime</b><small>Ready for your next task</small></span></div><div><span className="forge-status-icon purple"><TerminalSquare size={16} /></span><span><b>Daytona sandbox</b><small>Isolated code execution</small></span><button className={`forge-toggle ${daytona ? "on" : ""}`} onClick={() => { setDaytona(!daytona); notify(daytona ? "Daytona paused for this thread" : "Daytona enabled for this thread"); }}><i /></button></div><div><span className="forge-status-icon gold"><Check size={16} /></span><span><b>Workspace memory</b><small>Context stays with your project</small></span></div></section>
          <section className="forge-upcoming"><div><span className="forge-kicker">THE FORGE SURFACE</span><h2>From first thought to finished artifact.</h2></div><div className="forge-upcoming-copy"><p>Research, build, design, and deliver without switching context. Every module is designed to become a real capability in your private workspace.</p><button onClick={() => notify("Capability map saved to your workspace")}>Explore the capability map <ArrowUp size={14} /></button></div></section>
          <div className="forge-capability-row"><div><Image size={15} /><span>Image & video creation</span><small>Planned</small></div><div><Globe2 size={15} /><span>Browser operator</span><small>Planned</small></div><div><SquarePen size={15} /><span>Slides & documents</span><small>Planned</small></div><div><Settings2 size={15} /><span>Automations & connectors</span><small>Planned</small></div></div>
        </div>
        <div className="forge-composer-wrap"><div className="forge-composer"><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendPrompt(); } }} placeholder={`Message Forge, ${displayName}…`} rows={1} /><div className="forge-composer-bottom"><div className="forge-compose-tools"><button className="forge-tool"><TerminalSquare size={16} /> Daytona <span className={`forge-toggle tiny ${daytona ? "on" : ""}`}><i /></span></button><span>Enter to send · Shift + Enter for newline</span></div><button className="forge-send" onClick={sendPrompt} aria-label="Send message"><ArrowUp size={18} /></button></div></div><div className="forge-disclaimer">Forge can make mistakes. Check important work before you ship it.</div></div>
      </main>
      <aside className="forge-inspector"><div className="forge-inspector-head"><span>Workspace pulse</span><button onClick={() => notify("Inspector refreshed")}><MoreHorizontal size={17} /></button></div><div className="forge-pulse-card"><div className="forge-pulse-orbit"><div className="forge-pulse-core"><Sparkles size={21} /></div></div><b>Everything is connected.</b><p>Your model, context, and execution layer are online and ready to turn a prompt into progress.</p></div><div className="forge-inspector-section"><span className="forge-kicker">RUNTIME</span><div className="forge-detail"><span className="forge-status-icon lime"><Bot size={15} /></span><span><b>Forge model</b><small>OpenAI-compatible endpoint</small></span><i>LIVE</i></div><div className="forge-detail"><span className="forge-status-icon purple"><TerminalSquare size={15} /></span><span><b>Daytona sandbox</b><small>Isolated execution layer</small></span><i>READY</i></div></div><div className="forge-inspector-section"><span className="forge-kicker">SHORTCUTS</span><div className="forge-shortcut"><kbd>⌘</kbd><kbd>K</kbd><span>new thread</span></div><div className="forge-shortcut"><kbd>⌘</kbd><kbd>↵</kbd><span>send message</span></div></div></aside>
      {toast && <div className="forge-toast"><Check size={14} /> {toast}</div>}
    </div>
  );
}
