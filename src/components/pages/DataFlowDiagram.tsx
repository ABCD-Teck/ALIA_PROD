import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Database, 
  ArrowRight, 
  ArrowDown, 
  Search, 
  Globe, 
  User, 
  BarChart3,
  TrendingUp,
  Users,
  Target,
  MessageSquare,
  CheckSquare,
  Calendar as CalendarIcon,
  Phone,
  Settings as SettingsIcon
} from 'lucide-react';
import { Language } from '../../App';

interface DataFlowDiagramProps {
  searchQuery: string;
  language: Language;
}

export function DataFlowDiagram({ searchQuery, language }: DataFlowDiagramProps) {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const content = {
    fr: {
      title: 'Diagrammes de Flux de Données',
      architecture: 'Architecture Globale',
      modules: 'Flux par Module',
      search: 'Flux de Recherche',
      state: 'Gestion d\'État',
      database: 'Schéma Base de Données',
      mainContainer: 'Conteneur Principal',
      sidebar: 'Barre Latérale',
      navbar: 'Barre de Navigation',
      pageRouter: 'Routeur de Pages',
      clickToExplore: 'Cliquez pour explorer',
      dataFlow: 'Flux de Données',
      userInput: 'Saisie Utilisateur',
      processing: 'Traitement',
      filtering: 'Filtrage',
      results: 'Résultats'
    },
    en: {
      title: 'Data Flow Diagrams',
      architecture: 'Global Architecture',
      modules: 'Module Flow',
      search: 'Search Flow',
      state: 'State Management',
      database: 'Database Schema',
      mainContainer: 'Main Container',
      sidebar: 'Sidebar',
      navbar: 'Navbar',
      pageRouter: 'Page Router',
      clickToExplore: 'Click to explore',
      dataFlow: 'Data Flow',
      userInput: 'User Input',
      processing: 'Processing',
      filtering: 'Filtering',
      results: 'Results'
    }
  };

  const t = content[language];

  const modules = [
    { id: 'dashboard', icon: BarChart3, name: 'Dashboard', color: 'bg-blue-100 text-blue-800' },
    { id: 'market-insights', icon: TrendingUp, name: 'Market Insights', color: 'bg-green-100 text-green-800' },
    { id: 'customer-insights', icon: Users, name: 'Customer Insights', color: 'bg-purple-100 text-purple-800' },
    { id: 'opportunities', icon: Target, name: 'Opportunities', color: 'bg-orange-100 text-orange-800' },
    { id: 'interactions', icon: MessageSquare, name: 'Interactions', color: 'bg-pink-100 text-pink-800' },
    { id: 'task-manager', icon: CheckSquare, name: 'Task Manager', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'calendar', icon: CalendarIcon, name: 'Calendar', color: 'bg-red-100 text-red-800' },
    { id: 'contacts', icon: Phone, name: 'Contacts', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'settings', icon: SettingsIcon, name: 'Settings', color: 'bg-gray-100 text-gray-800' }
  ];

  const moduleDetails = {
    'dashboard': {
      inputs: ['searchQuery', 'language'],
      dataSources: ['KPI Metrics', 'Sales Trend Data', 'Opportunity Pipeline', 'Recent Activities'],
      features: ['Real-time KPI cards', 'Interactive charts', 'Activity timeline', 'Search filtering'],
      outputs: ['Visual dashboards', 'Metrics overview']
    },
    'customer-insights': {
      inputs: ['searchQuery', 'language'],
      dataSources: ['Customer Profiles', 'Contact Information', 'Revenue Data', 'Customer Scores'],
      features: ['Customer cards', 'Industry categorization', 'Tag filtering', 'Advanced search'],
      outputs: ['Customer relationship overview', 'Insights reports']
    },
    'opportunities': {
      inputs: ['searchQuery', 'language'],
      dataSources: ['Deal Information', 'Customer Association', 'Sales Rep Assignment', 'Stage Tracking'],
      features: ['Pipeline visualization', 'Probability coloring', 'Stage management', 'Multi-field search'],
      outputs: ['Sales pipeline management', 'Deal tracking']
    }
  };

  const ArchitectureFlow = () => (
    <div className="space-y-8">
      {/* Main Container */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-blue-800">App.tsx - {t.mainContainer}</CardTitle>
          <div className="flex justify-center space-x-4 mt-4">
            <Badge variant="secondary">currentPage: PageType</Badge>
            <Badge variant="secondary">language: Language</Badge>
            <Badge variant="secondary">searchQuery: string</Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="flex justify-center">
        <ArrowDown className="h-8 w-8 text-gray-400" />
      </div>

      {/* Component Layer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedComponent('sidebar')}>
          <CardHeader className="text-center">
            <CardTitle className="text-lg">{t.sidebar}</CardTitle>
            <div className="text-sm text-muted-foreground">
              Navigation & Page Control
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge className="bg-green-100 text-green-800">Props: currentPage, onPageChange, language</Badge>
              <Badge className="bg-blue-100 text-blue-800">Events: Page changes</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedComponent('navbar')}>
          <CardHeader className="text-center">
            <CardTitle className="text-lg">{t.navbar}</CardTitle>
            <div className="text-sm text-muted-foreground">
              Search & Language Control
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge className="bg-green-100 text-green-800">Props: searchQuery, language</Badge>
              <Badge className="bg-blue-100 text-blue-800">Features: Search, Lang toggle, User info</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedComponent('router')}>
          <CardHeader className="text-center">
            <CardTitle className="text-lg">{t.pageRouter}</CardTitle>
            <div className="text-sm text-muted-foreground">
              Content Rendering
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge className="bg-green-100 text-green-800">Props: searchQuery, language</Badge>
              <Badge className="bg-purple-100 text-purple-800">Renders: 9 page components</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedComponent && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Component Details: {selectedComponent}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t.clickToExplore}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const ModuleFlow = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => {
          const Icon = module.icon;
          const details = moduleDetails[module.id as keyof typeof moduleDetails];
          
          return (
            <Card 
              key={module.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedComponent(module.id)}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5" />
                  <CardTitle className="text-sm">{module.name}</CardTitle>
                </div>
                <Badge className={module.color}>{module.name}</Badge>
              </CardHeader>
              {details && (
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Inputs:</p>
                    <div className="flex flex-wrap gap-1">
                      {details.inputs.map((input, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{input}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Data Sources:</p>
                    <div className="text-xs space-y-1">
                      {details.dataSources.slice(0, 2).map((source, index) => (
                        <div key={index} className="text-muted-foreground">• {source}</div>
                      ))}
                      {details.dataSources.length > 2 && (
                        <div className="text-muted-foreground">... +{details.dataSources.length - 2} more</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {selectedComponent && moduleDetails[selectedComponent as keyof typeof moduleDetails] && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>
              {modules.find(m => m.id === selectedComponent)?.name} - Detailed Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const details = moduleDetails[selectedComponent as keyof typeof moduleDetails];
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Inputs</h4>
                    {details.inputs.map((input, index) => (
                      <Badge key={index} variant="secondary" className="block mb-1 text-xs">{input}</Badge>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Data Sources</h4>
                    {details.dataSources.map((source, index) => (
                      <div key={index} className="text-sm text-muted-foreground mb-1">• {source}</div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    {details.features.map((feature, index) => (
                      <div key={index} className="text-sm text-muted-foreground mb-1">• {feature}</div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Outputs</h4>
                    {details.outputs.map((output, index) => (
                      <div key={index} className="text-sm text-muted-foreground mb-1">• {output}</div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const SearchFlow = () => (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          <Card className="p-4 bg-blue-50">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">{t.userInput}</span>
            </div>
          </Card>
          <ArrowRight className="h-6 w-6 text-gray-400" />
          <Card className="p-4 bg-green-50">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">{t.processing}</span>
            </div>
          </Card>
          <ArrowRight className="h-6 w-6 text-gray-400" />
          <Card className="p-4 bg-purple-50">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">{t.filtering}</span>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contextual Search by Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Dashboard</h4>
              <div className="text-sm text-muted-foreground">KPIs, customer names</div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Customer Insights</h4>
              <div className="text-sm text-muted-foreground">Names, industries, tags</div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Opportunities</h4>
              <div className="text-sm text-muted-foreground">Names, customers, sales reps, statuses</div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Interactions</h4>
              <div className="text-sm text-muted-foreground">Customers, dates, types</div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Tasks</h4>
              <div className="text-sm text-muted-foreground">Subjects, statuses, due dates</div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Calendar</h4>
              <div className="text-sm text-muted-foreground">Event titles, dates, types</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const StateManagement = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader className="text-center">
          <CardTitle>Central State in App.tsx</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-4">
            <Badge className="bg-indigo-100 text-indigo-800">currentPage</Badge>
            <Badge className="bg-purple-100 text-purple-800">language</Badge>
            <Badge className="bg-pink-100 text-pink-800">searchQuery</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <ArrowDown className="h-8 w-8 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sidebar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Receives: currentPage, language<br/>
              Controls: Page navigation
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Navbar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Receives: all state<br/>
              Controls: Search & language
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Page Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Receives: searchQuery, language<br/>
              Renders: Filtered content
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const DatabaseSchema = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Suggested Database Schema for Supabase</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { table: 'users', fields: ['id', 'name', 'email', 'role', 'settings'] },
              { table: 'customers', fields: ['id', 'name', 'industry', 'score', 'revenue', 'tags'] },
              { table: 'contacts', fields: ['id', 'customer_id', 'name', 'email', 'phone', 'position'] },
              { table: 'opportunities', fields: ['id', 'customer_id', 'name', 'value', 'stage', 'probability'] },
              { table: 'interactions', fields: ['id', 'customer_id', 'contact_id', 'type', 'subject', 'date'] },
              { table: 'tasks', fields: ['id', 'assigned_to', 'customer_id', 'title', 'status', 'priority'] },
              { table: 'calendar_events', fields: ['id', 'title', 'type', 'date', 'time', 'location'] },
              { table: 'market_data', fields: ['id', 'segment', 'growth_rate', 'market_size'] }
            ].map((schema, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{schema.table}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {schema.fields.map((field, fieldIndex) => (
                      <Badge key={fieldIndex} variant="outline" className="text-xs mr-1 mb-1">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1>{t.title}</h1>
      
      <Tabs defaultValue="architecture" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="architecture">{t.architecture}</TabsTrigger>
          <TabsTrigger value="modules">{t.modules}</TabsTrigger>
          <TabsTrigger value="search">{t.search}</TabsTrigger>
          <TabsTrigger value="state">{t.state}</TabsTrigger>
          <TabsTrigger value="database">{t.database}</TabsTrigger>
        </TabsList>

        <TabsContent value="architecture">
          <ArchitectureFlow />
        </TabsContent>

        <TabsContent value="modules">
          <ModuleFlow />
        </TabsContent>

        <TabsContent value="search">
          <SearchFlow />
        </TabsContent>

        <TabsContent value="state">
          <StateManagement />
        </TabsContent>

        <TabsContent value="database">
          <DatabaseSchema />
        </TabsContent>
      </Tabs>

      {selectedComponent && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Selected: <strong>{selectedComponent}</strong></span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedComponent(null)}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}