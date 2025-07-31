import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { ListTodo, Search, RefreshCw, Clock, CheckCircle, XCircle, Play, Pause, Eye } from 'lucide-react'

// Mock tasks data
const mockTasks = [
  {
    id: 'task_001',
    agent_name: 'Sentiment Analyzer Pro',
    task_type: 'sentiment_analysis',
    status: 'completed',
    priority: 5,
    created_at: '2024-01-20T14:30:00Z',
    completed_at: '2024-01-20T14:30:08Z',
    duration: 3000,
    error_message: null
  },
  {
    id: 'task_002',
    agent_name: 'Product Recommender',
    task_type: 'recommendation',
    status: 'running',
    priority: 3,
    created_at: '2024-01-20T14:25:00Z',
    completed_at: null,
    duration: null,
    error_message: null
  },
  {
    id: 'task_003',
    agent_name: 'Sentiment Analyzer Pro',
    task_type: 'sentiment_analysis',
    status: 'failed',
    priority: 2,
    created_at: '2024-01-20T14:20:00Z',
    completed_at: '2024-01-20T14:20:07Z',
    duration: 2000,
    error_message: 'Text too long. Maximum 5000 characters allowed.'
  }
]

function TaskStatusIcon({ status }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'running':
      return <Play className="h-4 w-4 text-blue-500" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

function TaskDetailDialog({ task, open, onOpenChange }) {
  const formatDuration = (ms) => {
    if (!ms) return 'N/A'
    return `${ms}ms`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>
            Detailed information about task {task?.id}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Task Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>ID:</span>
                <span>{task?.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Agent:</span>
                <span>{task?.agent_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span>{task?.task_type}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="flex items-center gap-1">
                  <TaskStatusIcon status={task?.status} />
                  {task?.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Priority:</span>
                <span>{task?.priority}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold">Timing</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{task?.created_at ? formatDate(task.created_at) : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed:</span>
                <span>{task?.completed_at ? formatDate(task.completed_at) : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{formatDuration(task?.duration)}</span>
              </div>
            </div>
          </div>

          {task?.error_message && (
            <div>
              <h4 className="font-semibold text-red-600">Error</h4>
              <p className="text-sm text-red-600">{task.error_message}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function TasksPage() {
  const [tasks, setTasks] = useState(mockTasks)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getStatusCounts = () => {
    return tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {})
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.task_type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">
            Monitor and manage all agent tasks
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.completed || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Play className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.running || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.failed || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('completed')}
              >
                Completed
              </Button>
              <Button
                variant={statusFilter === 'running' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('running')}
              >
                Running
              </Button>
              <Button
                variant={statusFilter === 'failed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('failed')}
              >
                Failed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
          <CardDescription>
            {filteredTasks.length} tasks found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <TaskStatusIcon status={task.status} />
                  <div>
                    <p className="font-medium">{task.agent_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.task_type} • Priority {task.priority}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {task.duration ? `${task.duration}ms` : 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(task.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTask(task)
                      setDetailOpen(true)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <TaskDetailDialog
        task={selectedTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}

