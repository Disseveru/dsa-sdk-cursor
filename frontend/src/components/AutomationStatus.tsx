import { useState } from 'react'

export function AutomationStatus() {
  const [isActive, setIsActive] = useState(false)

  return (
    <div className="bg-surface-elevated border border-border rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-2">AI Agent</h3>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${isActive ? 'text-accent' : 'text-gray-500'}`}>
          {isActive ? 'Monitoring' : 'Paused'}
        </span>
        <button
          onClick={() => setIsActive(!isActive)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isActive ? 'bg-accent' : 'bg-surface-muted'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
              isActive ? 'left-7' : 'left-1'
            }`}
          />
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {isActive ? 'Scanning for opportunities' : 'Toggle to start'}
      </p>
    </div>
  )
}
