"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, DollarSign, RefreshCw, Users, ArrowRightLeft } from "lucide-react"

interface VaultStatus {
  balance: {
    usdc: number
    native: number
  }
  activeCollaborations: number
  totalRevenue: number
  pendingSplits: number
}

export function VaultsTerminal() {
  const [isWalletCreated, setIsWalletCreated] = useState(false)
  const [vaultStatus, setVaultStatus] = useState<VaultStatus>({
    balance: { usdc: 0, native: 0 },
    activeCollaborations: 0,
    totalRevenue: 0,
    pendingSplits: 0
  })

  const handleCreateWallet = async () => {
    // TODO: Implement wallet creation with CDP API
    setIsWalletCreated(true)
    // Simulate initial balance
    setVaultStatus((prev) => ({
      ...prev,
      balance: { usdc: 1000, native: 2.5 },
      activeCollaborations: 2,
      totalRevenue: 5000,
      pendingSplits: 1
    }))
  }

  const handleSwap = async () => {
    // TODO: Implement swap functionality with Swap API
    alert("Swap functionality coming soon")
  }

  return (
    <div className="relative bg-black text-green-400 p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-mono font-bold">VAULTS_TERMINAL</h2>
        <Badge variant="secondary" className="bg-green-400/10 border-green-400">
          BETA
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Wallet Status */}
        {!isWalletCreated ? (
          <Card className="bg-black/80 border-green-400/20">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-mono font-bold">CREATE_CDP_WALLET</h3>
                <p className="text-sm text-green-400/80">
                  Initialize your programmable CDP wallet for automated revenue flows
                </p>
                <Button
                  onClick={handleCreateWallet}
                  className="bg-green-400 hover:bg-green-500 text-black w-full"
                >
                  INITIATE_WALLET <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Vault Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-black/80 border-green-400/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-400/80">USDC BALANCE</p>
                      <p className="text-2xl font-mono">${vaultStatus.balance.usdc.toFixed(2)}</p>
                    </div>
                    <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-black/80 border-green-400/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-400/80">ACTIVE COLLABS</p>
                      <p className="text-2xl font-mono">{vaultStatus.activeCollaborations}</p>
                    </div>
                    <Users className="h-6 w-6 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-black/80 border-green-400/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-400/80">TOTAL REVENUE</p>
                      <p className="text-2xl font-mono">${vaultStatus.totalRevenue.toFixed(2)}</p>
                    </div>
                    <RefreshCw className="h-6 w-6 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-black/80 border-green-400/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-400/80">PENDING SPLITS</p>
                      <p className="text-2xl font-mono">{vaultStatus.pendingSplits}</p>
                    </div>
                    <ArrowRightLeft className="h-6 w-6 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleSwap}
                className="flex-1 bg-green-400 hover:bg-green-500 text-black"
              >
                CONVERT_EARNINGS <ArrowRightLeft className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-black/80 border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
              >
                VIEW_SPLIT_ENGINE <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Onramp Section */}
            <Card className="bg-black/80 border-green-400/20">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-mono font-bold">FIAT_ONRAMP</h3>
                  <p className="text-sm text-green-400/80">
                    Embeddable payment gateway for fans and clients
                  </p>
                  <div className="flex flex-col gap-2">
                    <Input placeholder="Enter amount..." className="bg-black/80 border-green-400/20" />
                    <Button
                      className="bg-green-400 hover:bg-green-500 text-black w-full"
                    >
                      GENERATE_PAYMENT_LINK
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
