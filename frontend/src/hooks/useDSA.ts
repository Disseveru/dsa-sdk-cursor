import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

// Dynamic imports for DSA - these need Web3 which requires window
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let DSA: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dsa, setDsa] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const createAccount = () => dsa?.build?.({})
  const setActiveAccount = (id: number) => dsa?.setInstance?.(id)

  return { dsa, accounts, isLoading, error, createAccount, setActiveAccount }
}
