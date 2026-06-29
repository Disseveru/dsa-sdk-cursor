import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { useDSA } from '../hooks/useDSA'
import { castSpellSteps, estimateSpellGas } from '../lib/cast-spells'
import { runFullScan, type ArbitrageOpportunity, type ScanResult } from '../lib/agent-scanner'
import type { Spell } from '../lib/dsa-spells'

export type AgentLogEntry = {
  id: string
  time: string
  level: 'info' | 'success' | 'warn' | 'error'
  message: string
}

type AgentContextValue = {
  isActive: boolean
  arbitrageEnabled: boolean
  liquidationsEnabled: boolean
  isScanning: boolean
  lastScan: ScanResult | null
  logs: AgentLogEntry[]
  setActive: (active: boolean) => void
  setArbitrageEnabled: (enabled: boolean) => void
  setLiquidationsEnabled: (enabled: boolean) => void
  scanNow: () => Promise<void>
  executeSpell: (steps: Spell[], label: string) => Promise<void>
}

const AgentContext = createContext<AgentContextValue | null>(null)

const SCAN_INTERVAL_MS = 30_000

function makeLog(level: AgentLogEntry['level'], message: string): AgentLogEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    time: new Date().toLocaleTimeString(),
    level,
    message,
  }
}

export function AgentProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount()
  const { dsa, accounts } = useDSA()

  const [isActive, setIsActive] = useState(false)
  const [arbitrageEnabled, setArbitrageEnabled] = useState(false)
  const [liquidationsEnabled, setLiquidationsEnabled] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [lastScan, setLastScan] = useState<ScanResult | null>(null)
  const [logs, setLogs] = useState<AgentLogEntry[]>([])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const addLog = useCallback((level: AgentLogEntry['level'], message: string) => {
    setLogs((prev) => [makeLog(level, message), ...prev].slice(0, 50))
  }, [])

  const scanNow = useCallback(async () => {
    if (!dsa) {
      addLog('warn', 'Connect your wallet first')
      return
    }

    setIsScanning(true)
    try {
      const result = await runFullScan(dsa, address, {
        enableArbitrage: arbitrageEnabled,
        enableLiquidations: liquidationsEnabled,
        slippagePercent: 2,
        minBorrowDai: 20,
        minProfitUsd: 5,
      })
      setLastScan(result)

      if (arbitrageEnabled) {
        if (result.arbitrage && 'error' in result.arbitrage) {
          addLog('warn', `Arbitrage scan: ${result.arbitrage.error}`)
        } else if (result.arbitrage && (result.arbitrage as ArbitrageOpportunity).profitable) {
          const opp = result.arbitrage as ArbitrageOpportunity
          addLog('success', `Found a trade worth about $${opp.estimatedProfitUsd.toFixed(2)}`)
        } else if (result.arbitrage) {
          const opp = result.arbitrage as ArbitrageOpportunity
          addLog('info', `No profitable trades right now (spread: $${opp.estimatedProfitUsd.toFixed(2)})`)
        }
      }

      if (liquidationsEnabled) {
        const actionable = result.liquidations.filter((c) => c.spellSteps)
        if (actionable.length) {
          addLog('success', `Found ${actionable.length} liquidation reward(s)`)
        } else if (result.liquidations.length) {
          addLog('info', `Watching ${result.liquidations.length} risky position(s)`)
        } else {
          addLog('info', 'No liquidation opportunities right now')
        }
      }
    } catch (err: any) {
      addLog('error', err?.message || 'Scan failed')
    } finally {
      setIsScanning(false)
    }
  }, [dsa, address, arbitrageEnabled, liquidationsEnabled, addLog])

  const executeSpell = useCallback(async (steps: Spell[], label: string) => {
    if (!dsa) {
      addLog('error', 'Wallet not ready')
      return
    }
    if (!accounts?.length) {
      addLog('error', 'Set up your earning account first')
      return
    }

    try {
      addLog('info', `Starting: ${label}`)
      const gas = await estimateSpellGas(dsa, steps)
      if (gas) addLog('info', `Estimated fee: ${gas} gas units`)

      const txHash = await castSpellSteps(dsa, steps)
      addLog('success', `Done! Transaction: ${txHash.slice(0, 10)}...`)
    } catch (err: any) {
      addLog('error', `Cast failed: ${err?.message || 'Unknown error'}`)
      throw err
    }
  }, [dsa, accounts, addLog])

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!isActive || (!arbitrageEnabled && !liquidationsEnabled) || !dsa) return

    scanNow()
    intervalRef.current = setInterval(scanNow, SCAN_INTERVAL_MS)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, arbitrageEnabled, liquidationsEnabled, dsa, scanNow])

  const setActive = useCallback((active: boolean) => {
    setIsActive(active)
    if (!active) {
      setArbitrageEnabled(false)
      setLiquidationsEnabled(false)
    }
  }, [])

  return (
    <AgentContext.Provider
      value={{
        isActive,
        arbitrageEnabled,
        liquidationsEnabled,
        isScanning,
        lastScan,
        logs,
        setActive,
        setArbitrageEnabled,
        setLiquidationsEnabled,
        scanNow,
        executeSpell,
      }}
    >
      {children}
    </AgentContext.Provider>
  )
}

export function useAgent() {
  const ctx = useContext(AgentContext)
  if (!ctx) throw new Error('useAgent must be used within AgentProvider')
  return ctx
}
