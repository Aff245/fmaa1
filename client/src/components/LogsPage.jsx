import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { FileText, Search, RefreshCw, Download, AlertTriangle, Info, CheckCircle } from 'lucide-react'

// Mock logs data
const mockLogs = [
  {
    id: 1,
    timestamp: '2024-01-20T14:30:00Z',
    level: 'info',
    message: 'System started successfully',
    source: 'system',
    details: 'All services initialized'
  },
  {
    id: 2,
    timestamp: '2024-01-20T14:30:05Z',
    level: 'info',
    message: 'Agent connected',
    source: 'agent',
    details: 'Sentiment Analyzer connected to system'
  },
  {
    id: 3,
    timestamp: '2024-01-20T14:30:10Z',
    level: 'warning',
    message: 'High response time detected',
    source: 'monitor',
    details: 'Response time exceeded 500ms threshold'
  },
  {
    id: 4,
    timestamp: '2024-01-20T14:30:15Z',
    level: 'error',
    message: 'Task failed',
    source: 'task',
    details: 'Invalid input data provided'
  },
  {
    id: 5,
    timestamp: '2024-01-20T14:30:20Z',
    level: 'info',
    message: 'Task completed successfully',
    source: 'task',
    details: 'Sentiment analysis completed in 150ms'
  }
]

function LogLevelIcon({ level }) {
  switch (level) {
    case 'error':
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    default:
      return <Info className="h-4 w-4 text-gray-500" />
  }
}

export function LogsPage() {
  const [logs, setLogs] = useState(mockLogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleExport = () => {
    // Simulate export
    console.log('Exporting logs...')
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter
    const matchesSource = sourceFilter === 'all' || log.source === sourceFilter
    return matchesSearch && matchesLevel && matchesSource
  })

  const getLevelCounts = () => {
    return logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1
      return acc
    }, {})
  }

  const getSourceCounts = () => {
    return logs.reduce((acc, log) => {
      acc[log.source] = (acc[log.source] || 0) + 1
      return acc
    }, {})
  }

  const levelCounts = getLevelCounts()
  const sourceCounts = getSourceCounts()

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Logs</h2>
          <p className="text-muted-foreground">
            System logs and monitoring information
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{logs.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Errors</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{levelCounts.error || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Warnings</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{levelCounts.warning || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Info</CardTitle>
                <Info className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{levelCounts.info || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Log Levels</CardTitle>
                <CardDescription>
                  Distribution of log levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(levelCounts).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{level}</span>
                      <span className="text-sm">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Log Sources</CardTitle>
                <CardDescription>
                  Distribution of log sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(sourceCounts).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{source}</span>
                      <span className="text-sm">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={levelFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setLevelFilter('all')}
                  >
                    All Levels
                  </Button>
                  <Button
                    variant={levelFilter === 'error' ? 'default' : 'outline'}
                    onClick={() => setLevelFilter('error')}
                  >
                    Errors
                  </Button>
                  <Button
                    variant={levelFilter === 'warning' ? 'default' : 'outline'}
                    onClick={() => setLevelFilter('warning')}
                  >
                    Warnings
                  </Button>
                  <Button
                    variant={levelFilter === 'info' ? 'default' : 'outline'}
                    onClick={() => setLevelFilter('info')}
                  >
                    Info
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Log Entries</CardTitle>
              <CardDescription>
                {filteredLogs.length} logs found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    <LogLevelIcon level={log.level} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{log.message}</p>
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.details}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs bg-secondary px-2 py-1 rounded">
                          {log.level}
                        </span>
                        <span className="text-xs bg-secondary px-2 py-1 rounded">
                          {log.source}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

