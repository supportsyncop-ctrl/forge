import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowUp, Bot, Check, ChevronDown, Clock3, Code2, FileText, FolderKanban, Globe2, Image, LayoutGrid, Menu, MoreHorizontal, Paperclip, Plus, Search, Settings2, ShieldCheck, Sparkles, SquarePen, TerminalSquare, X, Zap } from "lucide-react";

type Message = { id: number; role: "user" | "assistant"; text: string; time: string };
type Step = { label: string; status: "done" | "active" | "queued" };

const modules = [
  { name: "Chat", icon: Bot, note: "Agent workspace" },
  { name: "Projects", icon: FolderKanban, note: "Context & files" },
  { name: "Research", icon: Search, note: "Deep research" },
  { name: "Artifacts", icon: FileText, note: "Results & files" },
  { name: "Build", icon: Code2, note: "Websites & apps" },
];

const prompts = [
  { label: "Research a market", icon: Search, text: "Research the current market for AI developer tools and make a sourced brief" },
  { label: "Build a website", icon: Globe2, text: "Plan and build a beautiful landing page for my product" },
  { label: "Create a deck", icon: LayoutGrid, text: "Create a concise investor deck structure for my startup" },
  { label: "Analyze files", icon: FileText, text: "Analyze the files in my project and explain the most important findings" },
];

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const runAgent = trpc.agent.run.useMutation();
  const createTask = trpc.workspace.createTask.useMutation();
  const [active, setActive] = useState("Chat");
  const [prompt, setPrompt] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [planMode, setPlanMode] = useState(true);
  const [plan, setPlan] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState("");

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2400); };
  const displayName = user?.name?.split(" ")[0] ?? "there";

  const startTask = async (text: string) => {
    const clean = text.trim();
    if (!clean || running) return;
    setPrompt("");
    setMessages((current) => [...current, { id: Date.now(), role: "user", text: clean, time: "now" }]);
    if (planMode) {
      setPlan(`I’ll break this into a focused workflow, gather the right context, and return a usable result for: “${clean}”`);
      setSteps([{ label: "Understand the request", status: "active" }, { label: "Plan the work", status: "queued" }, { label: "Execute in Daytona", status: "queued" }, { label: "Package the result", status: "queued" }]);
      await createTask.mutateAsync({ title: clean, kind: "plan" });
      return;
    }
    await executeTask(clean);
  };

  const executeTask = async (clean: string) => {
    setPlan(null); setRunning(true);
    setSteps([{ label: "Understand the request", status: "done" }, { label: "Plan the work", status: "done" }, { label: "Execute in Daytona", status: "active" }, { label: "Package the result", status: "queued" }]);
    try {
      const result = await runAgent.mutateAsync({ prompt: clean, context: active });
      setMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", text: result.text, time: "just now" }]);
      setSteps([{ label: "Understand the request", status: "done" }, { label: "Plan the work", status: "done" }, { label: "Execute in Daytona", status: "done" }, { label: "Package the result", status: "done" }]);
    } catch { notify("The runtime needs a model connection before it can execute"); }
    finally { setRunning(false); }
  };

  const approvePlan = async () => {
    const userMessage = [...messages].reverse().find((message) => message.role === "user");
    if (!userMessage) return;
    await executeTask(userMessage.text);
  };

  return <div className="forge-app">
    <aside className={`forge-sidebar ${mobileOpen ? "open" : ""}`}>
      <div className="forge-brand"><div className="forge-logo"><Sparkles size={17} /></div><div><b>forge</b><small>personal intelligence</small></div><button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={17} /></button></div>
      <button className="forge-new" onClick={() => { setMessages([]); setPlan(null); notify("New thread started"); }}><Plus size={17} /> New thread <kbd>⌘ K</kbd></button>
      <div className="forge-section-label">WORKSPACE</div><nav className="forge-nav">{modules.map(({ name, icon: Icon, note }) => <button key={name} onClick={() => { setActive(name); setMobileOpen(false); }} className={`forge-nav-item ${active === name ? "active" : ""}`}><Icon size={17} /><span>{name}<small>{note}</small></span>{name === "Chat" && <i>{messages.length}</i>}</button>)}</nav>
      <div className="forge-sidebar-spacer" /><div className="forge-runtime"><div><span className="live-dot" /> Runtime online</div><small>Oracle control plane <em>·</em> Daytona ready</small></div>
      <div className="forge-user"><div className="forge-avatar">{user?.name?.charAt(0) ?? "S"}</div><div className="forge-user-copy"><b>{user?.name ?? "your workspace"}</b><small>{isAuthenticated ? user?.email ?? "private instance" : "private instance"}</small></div><button onClick={() => isAuthenticated ? logout() : startLogin()} aria-label={isAuthenticated ? "Log out" : "Sign in"}><MoreHorizontal size={17} /></button></div>
    </aside>
    {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
    <main className="forge-main"><header className="forge-topbar"><div className="forge-crumb"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={18} /></button><span>Workspace</span><b>/</b><strong>{active}</strong></div><div className="forge-top-actions"><div className="forge-model"><span className="live-dot" /> Forge model <ChevronDown size={12} /></div><button className="forge-icon-button" onClick={() => notify("Thread history is synced locally") }><Clock3 size={17} /></button><div className="forge-mini-avatar">{user?.name?.charAt(0) ?? "S"}</div></div></header>
      <div className="forge-chat-shell">
        <div className="forge-chat-head"><div><span className="forge-eyebrow"><Sparkles size={13} /> FORGE AGENT</span><h1>{messages.length ? "Working with you." : `What are we making, ${displayName}?`}</h1><p>{messages.length ? "Your thread, plan, runtime, and results stay together in one workspace." : "Give Forge a direction. It will plan the work, use your context, and return something you can keep."}</p></div><div className="forge-thread-meta"><span><ShieldCheck size={14} /> private thread</span><span><Clock3 size={14} /> saved automatically</span></div></div>
        <div className="forge-message-scroll">{!messages.length && <div className="forge-empty"><div className="forge-empty-mark"><Sparkles size={25} /></div><b>Start with a direction</b><span>Choose a task or write your own. Plan Mode is on by default.</span><div className="forge-prompt-grid">{prompts.map(({ label, icon: Icon, text }) => <button key={label} className="forge-prompt-card" onClick={() => setPrompt(text)}><span className="forge-prompt-icon"><Icon size={18} /></span><span><b>{label}</b><small>{text}</small></span><ArrowUp size={15} /></button>)}</div></div>}
          {messages.map((message) => <div key={message.id} className={`forge-message ${message.role}`}><div className="forge-message-avatar">{message.role === "assistant" ? <Sparkles size={15} /> : user?.name?.charAt(0) ?? "S"}</div><div><div className="forge-message-meta"><b>{message.role === "assistant" ? "Forge" : displayName}</b><span>{message.time}</span></div><div className="forge-message-body">{message.text}</div></div></div>)}
          {plan && <div className="forge-plan-card"><div className="forge-plan-top"><span className="forge-plan-icon"><SquarePen size={16} /></span><div><b>Plan ready for review</b><small>Forge will not execute until you approve</small></div><span className="forge-plan-badge">PLAN MODE</span></div><p>{plan}</p><div className="forge-plan-actions"><button className="forge-secondary" onClick={() => setPlan(null)}>Edit request</button><button className="forge-primary" onClick={approvePlan}><Check size={15} /> Approve & run</button></div></div>}
          {running && <div className="forge-running"><span className="forge-spinner" /><span>Forge is working in Daytona…</span></div>}
        </div>
        <div className="forge-composer-wrap"><div className="forge-composer"><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); startTask(prompt); } }} placeholder={`Message Forge, ${displayName}…`} rows={1} /><div className="forge-composer-bottom"><div className="forge-compose-tools"><button className="forge-tool"><Paperclip size={15} /> Attach</button><button className={`forge-tool ${planMode ? "selected" : ""}`} onClick={() => setPlanMode(!planMode)}><SquarePen size={15} /> Plan Mode <span className={`forge-toggle tiny ${planMode ? "on" : ""}`}><i /></span></button><span>{planMode ? "Review before building" : "Direct execution"}</span></div><button className="forge-send" onClick={() => startTask(prompt)} aria-label="Send message"><ArrowUp size={18} /></button></div></div><div className="forge-disclaimer">Forge can make mistakes. Check important work before you ship it.</div></div>
      </div>
    </main>
    <aside className="forge-inspector"><div className="forge-inspector-head"><span>Thread activity</span><button onClick={() => notify("Activity refreshed")}><MoreHorizontal size={17} /></button></div><div className="forge-pulse-card"><div className="forge-pulse-orbit"><div className="forge-pulse-core"><Zap size={21} /></div></div><b>{running ? "Agent is working" : plan ? "Awaiting approval" : "Everything is connected."}</b><p>{plan ? "Review the plan in the thread before Forge starts execution." : "Model, context, and execution layer are ready for your next task."}</p></div><div className="forge-inspector-section"><span className="forge-kicker">RUN STEPS</span>{(steps.length ? steps : [{ label: "Understand the request", status: "queued" as const }, { label: "Plan the work", status: "queued" as const }, { label: "Execute in Daytona", status: "queued" as const }]).map((step) => <div className="forge-detail" key={step.label}><span className={`forge-step-dot ${step.status}`} /> <span><b>{step.label}</b><small>{step.status === "done" ? "Complete" : step.status === "active" ? "In progress" : "Waiting"}</small></span><i>{step.status === "done" ? "DONE" : step.status === "active" ? "LIVE" : "—"}</i></div>)}</div><div className="forge-inspector-section"><span className="forge-kicker">RUNTIME</span><div className="forge-detail"><span className="forge-status-icon lime"><Bot size={15} /></span><span><b>Forge model</b><small>OpenAI-compatible endpoint</small></span><i>LIVE</i></div><div className="forge-detail"><span className="forge-status-icon purple"><TerminalSquare size={15} /></span><span><b>Daytona sandbox</b><small>Isolated execution layer</small></span><i>READY</i></div></div></aside>
    {toast && <div className="forge-toast"><Check size={14} /> {toast}</div>}
  </div>;
}
