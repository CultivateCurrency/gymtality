'use client'

import { useState } from 'react'
import { useApi, useMutation, apiFetch } from '@/hooks/use-api'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Users, DollarSign, Activity, Search, TrendingUp, Loader2 } from 'lucide-react'

interface UserReportData {
  monthly: { label: string; count: number }[]
  total: number
}

interface EarningsData {
  monthly: { label: string; amount: number }[]
  totalRevenue: number
  monthRevenue: number
}

interface ActivityData {
  recentUsers: { id: string; fullName: string; email: string; role: string; createdAt: string }[]
  recentOrders: { id: string; total: number; status: string; createdAt: string; user: { fullName: string; email: string } }[]
  recentSubs: { id: string; plan: string; status: string; createdAt: string; user: { fullName: string; email: string } }[]
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminReportsPage() {
  const [subEmail, setSubEmail] = useState('')
  const [subResult, setSubResult] = useState<{ id: string; plan: string; status: string } | null>(null)
  const [subSearchLoading, setSubSearchLoading] = useState(false)
  const [newPlan, setNewPlan] = useState('')

  const { data: userData, loading: userLoading } = useApi<UserReportData>('/api/admin/reports?type=users')
  const { data: earningsData, loading: earningsLoading } = useApi<EarningsData>('/api/admin/reports?type=earnings')
  const { data: activityData, loading: activityLoading } = useApi<ActivityData>('/api/admin/reports?type=activity')

  async function searchSubscription() {
    if (!subEmail) return
    setSubSearchLoading(true)
    try {
      const data = await apiFetch<{ users: { subscription?: { id: string; plan: string } }[] }>(`/api/admin/users?search=${encodeURIComponent(subEmail)}`)
      const user = (data as any)?.users?.[0] ?? (data as any)?.[0]
      setSubResult(user?.subscription ?? null)
    } catch (err: any) {
      setSubResult(null)
      toast.error(err?.message || 'Failed to search subscription')
    } finally {
      setSubSearchLoading(false)
    }
  }

  async function updatePlan() {
    if (!subResult || !newPlan) return
    await apiFetch(`/api/admin/subscriptions`, {
      method: 'PUT',
      body: JSON.stringify({ subscriptionId: subResult.id, plan: newPlan }),
    })
    setSubResult({ ...subResult, plan: newPlan })
    setNewPlan('')
  }

  const maxUserCount = Math.max(...(userData?.monthly?.map(m => m.count) || [1]), 1)
  const maxEarnings = Math.max(...(earningsData?.monthly?.map(m => m.amount) || [1]), 1)

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-gray-400 mt-1">Platform-wide analytics and reporting</p>
      </div>

      {/* Section 1: Users Registered */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            No. of Users Who Have Registered
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userLoading ? (
            <div className="flex items-center gap-2 text-gray-400 py-6">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-white mb-6">
                {userData?.total?.toLocaleString() || 0}
                <span className="text-sm text-gray-400 font-normal ml-2">total registered users</span>
              </p>
              <div className="space-y-2">
                {userData?.monthly?.map((m) => (
                  <div key={m.label} className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs w-20 shrink-0">{m.label}</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.max((m.count / maxUserCount) * 100, 2)}%` }}
                      />
                    </div>
                    <span className="text-white text-xs w-8 text-right">{m.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Edit Subscription */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            Edit Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-400 text-sm">Search for a user by email to view and update their subscription plan.</p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                className="bg-gray-700 border-gray-600 text-white pl-10"
                placeholder="Enter user email..."
                value={subEmail}
                onChange={e => setSubEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchSubscription()}
              />
            </div>
            <Button onClick={searchSubscription} disabled={subSearchLoading} className="bg-orange-500 hover:bg-orange-600 text-white">
              {subSearchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </Button>
          </div>
          {subResult && (
            <div className="p-4 bg-gray-750 border border-gray-600 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <Badge className="bg-orange-500/20 text-orange-400">{subResult.plan}</Badge>
                <Badge className={subResult.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                  {subResult.status}
                </Badge>
              </div>
              <div className="flex gap-3">
                <select
                  className="bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-sm"
                  value={newPlan}
                  onChange={e => setNewPlan(e.target.value)}
                >
                  <option value="">Select new plan...</option>
                  <option value="BASIC">BASIC</option>
                  <option value="PREMIUM">PREMIUM</option>
                  <option value="ELITE">ELITE</option>
                </select>
                <Button onClick={updatePlan} disabled={!newPlan} className="bg-orange-500 hover:bg-orange-600 text-white">
                  Update Plan
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Total Earnings */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            General Reports for Total Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {earningsLoading ? (
            <div className="flex items-center gap-2 text-gray-400 py-6">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Revenue (All Time)</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(earningsData?.totalRevenue || 0)}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <p className="text-gray-400 text-sm">Revenue This Month</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(earningsData?.monthRevenue || 0)}</p>
                </div>
              </div>
              <div className="space-y-2">
                {earningsData?.monthly?.map((m) => (
                  <div key={m.label} className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs w-20 shrink-0">{m.label}</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.max((m.amount / maxEarnings) * 100, 2)}%` }}
                      />
                    </div>
                    <span className="text-white text-xs w-20 text-right">{formatCurrency(m.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Monitor System Activities */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Monitor System Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="flex items-center gap-2 text-gray-400 py-6">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Recent Signups */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">Recent Signups</h3>
                <div className="space-y-2">
                  {activityData?.recentUsers?.slice(0, 8).map(u => (
                    <div key={u.id} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-bold">
                        {u.fullName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{u.fullName}</p>
                        <p className="text-gray-500 text-xs">{formatDate(u.createdAt)}</p>
                      </div>
                      <Badge className="text-xs bg-gray-600 text-gray-300">{u.role}</Badge>
                    </div>
                  ))}
                  {!activityData?.recentUsers?.length && <p className="text-gray-500 text-sm">No recent signups</p>}
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">Recent Orders</h3>
                <div className="space-y-2">
                  {activityData?.recentOrders?.slice(0, 8).map(o => (
                    <div key={o.id} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                      <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center text-xs text-green-400 font-bold">
                        $
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{o.user.fullName}</p>
                        <p className="text-gray-500 text-xs">{formatDate(o.createdAt)}</p>
                      </div>
                      <span className="text-green-400 text-xs font-medium">{formatCurrency(o.total)}</span>
                    </div>
                  ))}
                  {!activityData?.recentOrders?.length && <p className="text-gray-500 text-sm">No recent orders</p>}
                </div>
              </div>

              {/* Recent Subscriptions */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">Recent Subscriptions</h3>
                <div className="space-y-2">
                  {activityData?.recentSubs?.slice(0, 8).map(s => (
                    <div key={s.id} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                      <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-xs text-orange-400 font-bold">
                        ★
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{s.user.fullName}</p>
                        <p className="text-gray-500 text-xs">{formatDate(s.createdAt)}</p>
                      </div>
                      <Badge className="text-xs bg-orange-500/20 text-orange-400">{s.plan}</Badge>
                    </div>
                  ))}
                  {!activityData?.recentSubs?.length && <p className="text-gray-500 text-sm">No recent subscriptions</p>}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
