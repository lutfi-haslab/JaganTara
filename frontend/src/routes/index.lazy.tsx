import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { Activity, Wifi, Zap, Layout, Smartphone, ArrowRight } from 'lucide-react'

export const Route = createLazyFileRoute('/')({
  component: Home,
})

const features = [
  {
    icon: <Wifi size={22} />,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    title: 'Multi-Protocol Ingestion',
    desc: 'Connect devices over MQTT (port 1883), REST API, or WebSocket. Real-time telemetry via in-memory ring buffer.',
  },
  {
    icon: <Layout size={22} />,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    title: 'Web Analytics Dashboard',
    desc: 'High-density 12-column grid dashboards. Gauge, Chart, Switch and Value widgets — all live-updated.',
  },
  {
    icon: <Smartphone size={22} />,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20',
    title: 'Mobile App Builder',
    desc: 'No-code vertical block builder creates app-like control panels shareable over mobile.',
  },
  {
    icon: <Zap size={22} />,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    title: 'Flow Engine',
    desc: 'Graph-based automation. Conditions, transforms, and webhook/notification outputs — coming soon.',
  },
  {
    icon: <Activity size={22} />,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    title: 'Zero External Dependencies',
    desc: 'Bun + SQLite (WAL). Single binary, single node. No Redis, no Kafka, no Docker required.',
  },
]

function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient gradient blobs */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #a21caf 0%, transparent 70%)' }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex justify-between items-center px-10 py-6 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.5)]">
            <Activity size={16} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-tight">Jagantara</span>
          <span className="text-[10px] font-mono text-zinc-600 mt-0.5">v0.1</span>
        </div>
        <Link
          to="/projects"
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-full text-sm font-bold text-white transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]"
        >
          Open Projects
          <ArrowRight size={15} />
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 py-28">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-mono text-purple-300 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          Phase 1 MVP · In Progress
        </div>

        <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-none mb-6 max-w-3xl">
          One Platform.<br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 text-transparent bg-clip-text">
            All Your IoT.
          </span>
        </h1>

        <p className="text-lg text-zinc-400 max-w-xl leading-relaxed mb-10">
          Jagantara is a self-contained IoT platform built on a single node.
          Connect devices, visualise telemetry, build custom dashboards, and automate with flows — all without external infrastructure.
        </p>

        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-pink-500 rounded-2xl text-base font-bold text-white transition-all duration-300 shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:shadow-[0_0_50px_rgba(147,51,234,0.6)] hover:scale-105"
        >
          Get Started
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Stack badges */}
      <div className="relative z-10 flex justify-center gap-3 flex-wrap px-6 mb-20">
        {['Bun', 'Hono', 'SQLite WAL', 'React', 'TanStack Router', 'TailwindCSS 4', 'MQTT Aedes'].map(s => (
          <span key={s} className="px-3 py-1.5 bg-zinc-900/80 border border-white/5 rounded-lg text-xs font-mono text-zinc-500">
            {s}
          </span>
        ))}
      </div>

      {/* Feature grid */}
      <section className="relative z-10 px-10 pb-24">
        <h2 className="text-2xl font-bold text-center mb-10">Core Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {features.map(f => (
            <div
              key={f.title}
              className={`p-6 rounded-2xl border bg-zinc-900/30 hover:bg-zinc-900/60 transition-all duration-300 group`}
            >
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl border mb-5 ${f.bg} ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="text-base font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
