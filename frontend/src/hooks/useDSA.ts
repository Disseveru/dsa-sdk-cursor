import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { castSpellSteps } from '../lib/cast-spells'
import type { Spell } from '../lib/dsa-spells'

let DSA: any = null
let Web3: any = null

async function loadDSA() {
  if (DSA && Web3) return { DSA, Web3 }
  const [dsaModule, web3Module] = await Promise.all([
    import('dsa-connect'),
    import('web3'),
  ])
  DSA = dsaModule.default ?? dsaModule
  Web3 = web3Module.default ?? web3Module
  return { DSA, Web3 }
}

export function useDSA() {
  const { address, isConnected } = useAccount()
  const [dsa, setDsa] = useState<any>(null)
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshAccounts = useCallback(async () => {
    if (!dsa || !address) return []
    const accs = await dsa.getAccounts(address)
    setAccounts(accs || [])
    if (accs?.length > 0) {
      await dsa.setInstance(accs[0].id)
    }
    return accs || []
  }, [dsa, address])

  useEffect(() => {
    if (!isConnected || !address || typeof window === 'undefined' || !(window as any).ethereum) {
      setDsa(null)
      setAccounts([])
      return
    }

    let cancelled = false

    async function init() {
      setIsLoading(true)
      setError(null)
      try {
        const { DSA: DSAClass, Web3: Web3Class } = await loadDSA()
        const web3 = new Web3Class((window as any).ethereum)
        const dsaInstance = new DSAClass(web3)
        if (cancelled) return

        setDsa(dsaInstance)

        const accs = await dsaInstance.getAccounts(address)
        if (cancelled) return
        setAccounts(accs || [])

        if (accs?.length > 0) {
          await dsaInstance.setInstance(accs[0].id)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load DSA')
          setDsa(null)
          setAccounts([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [isConnected, address])

  const createAccount = async () => {
    const tx = await dsa?.build?.({})
    await refreshAccounts()
    return tx
  }

  const setActiveAccount = (id: number) => dsa?.setInstance?.(id)

  const castSpells = async (steps: Spell[]) => {
    if (!dsa) throw new Error('DSA not initialized')
    return castSpellSteps(dsa, steps)
  }

  return {
    dsa,
    accounts,
    isLoading,
    error,
    createAccount,
    setActiveAccount,
    refreshAccounts,
    castSpells,
  }
}
