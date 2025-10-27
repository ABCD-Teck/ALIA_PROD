import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './components/pages/Dashboard';
import { MarketInsights } from './components/pages/MarketInsights';
import { CustomerInsights } from './components/pages/CustomerInsights';
import { Opportunities } from './components/pages/Opportunities';
import { Interactions } from './components/pages/Interactions';
import { InteractionDetail } from './components/pages/InteractionDetail';
import { TaskManager } from './components/pages/TaskManager';
import { TaskDetail } from './components/pages/TaskDetail';
import { Calendar } from './components/pages/Calendar';
import { Contacts } from './components/pages/Contacts';
import { Settings } from './components/pages/Settings';
import { CreateOpportunity } from './components/pages/CreateOpportunity';
import { OpportunityDetail } from './components/pages/OpportunityDetail';
import { ArchivedOpportunities } from './components/pages/ArchivedOpportunities';
import { ArchivedInteractions } from './components/pages/ArchivedInteractions';
import { ArchivedTasks } from './components/pages/ArchivedTasks';
import { CreateInteraction } from './components/pages/CreateInteraction';
import { CreateTask } from './components/pages/CreateTask';
import { CreateContact } from './components/pages/CreateContact';
import { CreateCustomer } from './components/pages/CreateCustomer';
import { CreateEvent } from './components/pages/CreateEvent';
import { ContactDetail } from './components/pages/ContactDetail';
import { Language } from './App';

interface AppRoutesProps {
  searchQuery: string;
  language: Language;
}

export function AppRoutes({ searchQuery, language }: AppRoutesProps) {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/" element={<Dashboard searchQuery={searchQuery} language={language} />} />

      {/* Market Insights */}
      <Route path="/market-insights" element={<MarketInsights searchQuery={searchQuery} language={language} />} />

      {/* Customer Insights */}
      <Route path="/customer-insights" element={<CustomerInsights searchQuery={searchQuery} language={language} />} />
      <Route path="/customer-insights/:customerId" element={<CustomerInsights searchQuery={searchQuery} language={language} />} />
      <Route path="/customer-insights/:customerId/:tab" element={<CustomerInsights searchQuery={searchQuery} language={language} />} />

      {/* Opportunities */}
      <Route path="/opportunities" element={<Opportunities searchQuery={searchQuery} language={language} />} />
      <Route path="/opportunities/create" element={<CreateOpportunity language={language} />} />
      <Route path="/opportunities/archived" element={<ArchivedOpportunities searchQuery={searchQuery} language={language} />} />
      <Route path="/opportunities/:id" element={<OpportunityDetail language={language} />} />

      {/* Interactions */}
      <Route path="/interactions" element={<Interactions searchQuery={searchQuery} language={language} />} />
      <Route path="/interactions/create" element={<CreateInteraction language={language} />} />
      <Route path="/interactions/archived" element={<ArchivedInteractions searchQuery={searchQuery} language={language} />} />
      <Route path="/interactions/:id" element={<InteractionDetail searchQuery={searchQuery} language={language} />} />

      {/* Tasks */}
      <Route path="/tasks" element={<TaskManager searchQuery={searchQuery} language={language} />} />
      <Route path="/tasks/create" element={<CreateTask language={language} />} />
      <Route path="/tasks/archived" element={<ArchivedTasks searchQuery={searchQuery} language={language} />} />
      <Route path="/tasks/:id" element={<TaskDetail language={language} />} />

      {/* Calendar */}
      <Route path="/calendar" element={<Calendar searchQuery={searchQuery} language={language} />} />
      <Route path="/calendar/create" element={<CreateEvent language={language} />} />

      {/* Contacts */}
      <Route path="/contacts" element={<Contacts searchQuery={searchQuery} language={language} />} />
      <Route path="/contacts/create" element={<CreateContact language={language} />} />
      <Route path="/contacts/:id" element={<ContactDetail searchQuery={searchQuery} language={language} />} />

      {/* Customers */}
      <Route path="/customers/create" element={<CreateCustomer language={language} />} />

      {/* Settings */}
      <Route path="/settings" element={<Settings searchQuery={searchQuery} language={language} />} />

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
