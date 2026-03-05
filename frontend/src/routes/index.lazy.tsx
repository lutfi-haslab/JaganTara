import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import reactLogo from '../assets/react.svg'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  const [count, setCount] = useState(0)

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="flex gap-4 mb-8">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="w-24 h-24 p-6 hover:drop-shadow-[0_0_2em_#646cffaa] transition-all" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="w-24 h-24 p-6 hover:drop-shadow-[0_0_2em_#61dafbaa] transition-all" alt="React logo" />
        </a>
      </div>
      <h1 className="text-5xl font-bold mb-8">Vite + React</h1>
      <div className="p-8 border rounded-lg bg-zinc-900/50 backdrop-blur-sm border-zinc-800">
        <button 
          onClick={() => setCount((count) => count + 1)}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors font-medium mb-4"
        >
          count is {count}
        </button>
        <p className="text-zinc-400">
          Edit <code>src/routes/index.lazy.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="mt-8 text-zinc-500">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}
