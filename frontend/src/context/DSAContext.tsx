import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
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

async function waitForAccount(dsa: any, owner: string, attempts = 30, delayMs = 2000) {
  for (let i = 0; i < attempts; i++) {
    const accs = await dsa.getAccounts(owner)
    if (accs?.length > 0) return accs
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  throw new Error('Account setup timed out. Check MetaMask for confirmation.')
}

type DSAContextValue = {
  dsa: any
  accounts: any[]
  isLoading: boolean
  error: string | null
  createAccount: () => Promise<any>
  setActiveAccount: (id: number) => Promise<void> | void
  refreshAccounts: () => Promise<any[]>
  castSpells: (steps: Spell[]) => Promise<string>
  hasAccount: boolean
  dsaAddress: string | undefined
}

const DSAContext = createContext<DSAContextValue | null>(null)

export function DSAProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, connector } = useAccount()
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
    if (!isConnected || !address || !connector) {
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
        const provider = await connector!.getProvider()
        const web3 = new Web3Class(provider as any)
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
          setError(err?.message || 'Could not connect to your wallet')
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
  }, [isConnected, address, connector])

  const createAccount = useCallback(async () => {
    if (!dsa) throw new Error('Wallet not ready yet')
    if (!address) throw new Error('Connect your wallet first')

    await dsa.build({})
    const accs = await waitForAccount(dsa, address)
    setAccounts(accs)
    await dsa.setInstance(accs[0].id)
    return accs
  }, [dsa, address])

  const setActiveAccount = useCallback(
    (id: number) => dsa?.setInstance?.(id),
    [dsa],
  )

  const castSpells = useCallback(
    async (steps: Spell[]) => {
      if (!dsa) throw new Error('Wallet not ready yet')
      return castSpellSteps(dsa, steps)
    },
    [dsa],
  )

  const dsaAddress = accounts[0]?.address as string | undefined

  return (
    <DSAContext.Provider
      value={{
        dsa,
        accounts,
        isLoading,
        error,
        createAccount,
        setActiveAccount,
        refreshAccounts,
        castSpells,
        hasAccount: accounts.length > 0,
        dsaAddress,
      }}
    >
      {children}
    </DSAContext.Provider>
  )
}

export function useDSA() {
  const ctx = useContext(DSAContext)
  if (!ctx) throw new Error('useDSA must be used within DSAProvider')
  return ctx
}
