import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Activity, CreditCard, DollarSign, Users, Package, TrendingUp } from 'lucide-react'

export function Dashboard({ systemStatus }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your FMAA dashboard. Here's an overview of your system.
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+2350</div>
                <p className="text-xs text-muted-foreground">
                  +180.1% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12,234</div>
                <p className="text-xs text-muted-foreground">
                  +19% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">
                  +201 since last hour
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        System Status
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {systemStatus?.status || 'Unknown'}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {systemStatus?.uptime || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Backend Connection
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {systemStatus?.backendConnected ? 'Connected' : 'Disconnected'}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {systemStatus?.backendUrl || 'N/A'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  You made 265 sales this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Olivia Martin
                      </p>
                      <p className="text-sm text-muted-foreground">
                        olivia.martin@email.com
                      </p>
                    </div>
                    <div className="ml-auto font-medium">+$1,999.00</div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Jackson Lee
                      </p>
                      <p className="text-sm text-muted-foreground">
                        jackson.lee@email.com
                      </p>
                    </div>
                    <div className="ml-auto font-medium">+$39.00</div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Isabella Nguyen
                      </p>
                      <p className="text-sm text-muted-foreground">
                        isabella.nguyen@email.com
                      </p>
                    </div>
                    <div className="ml-auto font-medium">+$299.00</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                View detailed analytics and insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Analytics content will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Generate and view reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Reports content will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

