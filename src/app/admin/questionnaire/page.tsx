'use client'

import { useState } from 'react'
import { useApi, useMutation, apiFetch } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil, Trash2, HelpCircle } from 'lucide-react'

interface Question {
  id: string
  question: string
  type: string
  options: string[]
  category: string
  order: number
  active: boolean
}

const QUESTION_TYPES = ['TEXT', 'MULTIPLE_CHOICE', 'SCALE', 'YES_NO']
const CATEGORIES = ['PHYSICAL_HEALTH', 'MENTAL_HEALTH', 'GOALS', 'LIFESTYLE', 'GENERAL']

function formatLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function QuestionnairePage() {
  const { data, loading, refetch } = useApi<Question[]>('/api/admin/questionnaire')
  const createMutation = useMutation('/api/admin/questionnaire', 'POST')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Question | null>(null)
  const [form, setForm] = useState({ question: '', type: 'TEXT', options: '', category: 'GENERAL', order: 0, active: true })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const questions: Question[] = data || []

  function openCreate() {
    setEditing(null)
    setForm({ question: '', type: 'TEXT', options: '', category: 'GENERAL', order: questions.length, active: true })
    setModalOpen(true)
  }

  function openEdit(q: Question) {
    setEditing(q)
    setForm({ question: q.question, type: q.type, options: q.options.join(', '), category: q.category, order: q.order, active: q.active })
    setModalOpen(true)
  }

  async function handleSave() {
    const payload = {
      question: form.question,
      type: form.type,
      options: form.options ? form.options.split(',').map(s => s.trim()).filter(Boolean) : [],
      category: form.category,
      order: form.order,
      active: form.active,
    }

    if (editing) {
      await apiFetch(`/api/admin/questionnaire/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) })
    } else {
      await createMutation.mutate(payload)
    }
    setModalOpen(false)
    refetch()
  }

  async function handleDelete(id: string) {
    await apiFetch(`/api/admin/questionnaire/${id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    refetch()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Questionnaire</h1>
          <p className="text-gray-400 mt-1">Add and manage questions shown to users during onboarding</p>
        </div>
        <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm">Total Questions</p>
            <p className="text-2xl font-bold text-white">{questions.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm">Active</p>
            <p className="text-2xl font-bold text-green-400">{questions.filter(q => q.active).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm">Physical Health</p>
            <p className="text-2xl font-bold text-blue-400">{questions.filter(q => q.category === 'PHYSICAL_HEALTH').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm">Mental Health</p>
            <p className="text-2xl font-bold text-purple-400">{questions.filter(q => q.category === 'MENTAL_HEALTH').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Questions Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-orange-400" />
            Questions ({questions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-400 text-center py-8">Loading...</p>
          ) : questions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No questions yet. Add your first question.</p>
          ) : (
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={q.id} className="flex items-start gap-4 p-4 bg-gray-750 border border-gray-700 rounded-lg">
                  <span className="text-gray-500 text-sm font-mono w-6 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{q.question}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">{formatLabel(q.type)}</Badge>
                      <Badge variant="outline" className="text-xs border-purple-500 text-purple-400">{formatLabel(q.category)}</Badge>
                      {q.options.length > 0 && (
                        <span className="text-gray-400 text-xs">{q.options.join(' • ')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={q.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                      {q.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white" onClick={() => openEdit(q)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400" onClick={() => setDeleteConfirm(q.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Question' : 'Add Question'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Question Text *</Label>
              <Input
                className="bg-gray-700 border-gray-600 text-white mt-1"
                placeholder="e.g. What is your primary fitness goal?"
                value={form.question}
                onChange={e => setForm({ ...form, question: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Question Type</Label>
                <Select value={String(form.type || 'TEXT')} onValueChange={v => setForm({ ...form, type: v ?? form.type })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {QUESTION_TYPES.map(t => (
                      <SelectItem key={t} value={t} className="text-white">{formatLabel(t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={String(form.category || 'GENERAL')} onValueChange={v => setForm({ ...form, category: v ?? form.category })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c} className="text-white">{formatLabel(c)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(form.type === 'MULTIPLE_CHOICE') && (
              <div>
                <Label>Options (comma-separated)</Label>
                <Input
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  placeholder="e.g. Lose Weight, Build Muscle, Improve Endurance"
                  value={form.options}
                  onChange={e => setForm({ ...form, options: e.target.value })}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Order</Label>
                <Input
                  type="number"
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  value={form.order}
                  onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input type="checkbox" id="active-toggle" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-orange-500" />
                <Label htmlFor="active-toggle">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white" disabled={!form.question}>
              {editing ? 'Save Changes' : 'Add Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400">Are you sure you want to delete this question? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="text-gray-400">Cancel</Button>
            <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="bg-red-500 hover:bg-red-600 text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
