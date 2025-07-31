import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Bot, Play, Pause, Settings, RefreshCw, Plus, CheckCircle, XCircle, Clock } from 'lucide-react'

// Mock agents data
const mockAgents = [
  {
    id: '1',
    name: 'Sentiment Analyzer Pro',
    type: 'sentiment_analysis',
    status: 'active',
    description: 'Advanced sentiment analysis using Hugging Face models',
    version: '2.1.0',
    uptime: '99.9%',
    tasks_completed: 1247,
    avg_response_time: 145,
    last_activity: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    name: 'Product Recommender',
    type: 'recommendation',
    status: 'active',
    description: 'Intelligent product recommendation system',
    version: '1.8.2',
    uptime: '98.7%',
    tasks_completed: 892,
    avg_response_time: 220,
    last_activity: '2024-01-20T14:25:00Z'
  },
  {
    id: '3',
    name: 'Performance Monitor',
    type: 'monitoring',
    status: 'inactive',
    description: 'System performance monitoring and alerting',
    version: '1.5.1',
    uptime: '100%',
    tasks_completed: 456,
    avg_response_time: 89,
    last_activity: '2024-01-20T14:20:00Z'
  }
]

function AgentStatusIcon({ status }) {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'inactive':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'starting':
      return <Clock className="h-4 w-4 text-yellow-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

function AgentDetailDialog({ agent, open, onOpenChange }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agent Details</DialogTitle>
          <DialogDescription>
            Detailed information about {agent?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Basic Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>ID:</span>
                <span>{agent?.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Name:</span>
                <span>{agent?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="capitalize">{agent?.type?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="flex items-center gap-1">
                  <AgentStatusIcon status={agent?.status} />
                  {agent?.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Version:</span>
                <span>{agent?.version}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold">Performance</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span>{agent?.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span>Tasks Completed:</span>
                <span>{agent?.tasks_completed?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Response Time:</span>
                <span>{agent?.avg_response_time}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Last Activity:</span>
                <span>{agent?.last_activity ? formatDate(agent.last_activity) : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold">Description</h4>
            <p className="text-sm text-muted-foreground">{agent?.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AgentsPage() {
  const [agents, setAgents] = useState(mockAgents)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleToggleAgent = (agentId) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' }
        : agent
    ))
  }

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusCounts = () => {
    return agents.reduce((acc, agent) => {
      acc[agent.status] = (acc[agent.status] || 0) + 1
      return acc
    }, {})
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agents</h2>
          <p className="text-muted-foreground">
            Manage and monitor your AI agents
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{agents.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statusCounts.active || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statusCounts.inactive || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agents.reduce((sum, agent) => sum + agent.tasks_completed, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Agent Summary</CardTitle>
              <CardDescription>
                Overview of all agents and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <AgentStatusIcon status={agent.status} />
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {agent.tasks_completed.toLocaleString()} tasks • {agent.avg_response_time}ms avg
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {agent.uptime} uptime
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAgent(agent.id)}
                      >
                        {agent.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search agents..."
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
                    variant={statusFilter === 'active' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('active')}
                  >
                    Active
                  </Button>
                  <Button
                    variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('inactive')}
                  >
                    Inactive
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent List</CardTitle>
              <CardDescription>
                {filteredAgents.length} agents found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <AgentStatusIcon status={agent.status} />
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {agent.description}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs bg-secondary px-2 py-1 rounded">
                            {agent.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            v{agent.version}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {agent.tasks_completed.toLocaleString()} tasks
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {agent.avg_response_time}ms avg
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAgent(agent)
                          setDetailOpen(true)
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAgent(agent.id)}
                      >
                        {agent.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AgentDetailDialog
        agent={selectedAgent}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}

