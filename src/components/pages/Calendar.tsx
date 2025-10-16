import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Language } from '../../App';

interface CalendarProps {
  searchQuery: string;
  language: Language;
}

type ViewType = 'month' | 'week' | 'day';

const sampleEvents = [
  {
    id: 1,
    title: '销售BYU系统4公司（展）',
    date: '2025-09-11',
    time: '14:00',
    duration: 120, // minutes
    type: 'meeting'
  },
  {
    id: 2,
    title: '客户会议',
    date: '2025-09-23',
    time: '09:00',
    duration: 90,
    type: 'meeting'
  }
];

export function Calendar({ searchQuery, language }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 23)); // September 23, 2025
  const [viewType, setViewType] = useState<ViewType>('month');
  const [userFilter, setUserFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');

  const content = {
    zh: {
      selectUser: '选择用户',
      allUsers: '全部用户',
      activityType: '活动类型',
      allActivities: '全部',
      currentUser: '当前用户:',
      activityScope: '活动类型:',
      today: 'today',
      month: 'month',
      week: 'week',
      day: 'day',
      months: [
        '1月', '2月', '3月', '4月', '5月', '6月',
        '7月', '8月', '9月', '10月', '11月', '12月'
      ],
      weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      weekdaysShort: ['日', '一', '二', '三', '四', '五', '六']
    },
    en: {
      selectUser: 'Select User',
      allUsers: 'All Users',
      activityType: 'Activity Type',
      allActivities: 'All',
      currentUser: 'Current User:',
      activityScope: 'Activity Type:',
      today: 'today',
      month: 'month',
      week: 'week',
      day: 'day',
      months: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }
  };

  const t = content[language];

  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date(2025, 8, 23)); // Reset to September 23, 2025
  };

  const getHeaderTitle = () => {
    if (viewType === 'month') {
      return `${currentDate.getFullYear()}年${t.months[currentDate.getMonth()]}`;
    } else if (viewType === 'week') {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - day);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      
      if (language === 'zh') {
        return `${startOfWeek.getFullYear()}年${startOfWeek.getMonth() + 1}月${startOfWeek.getDate()}日 - ${endOfWeek.getDate()}日`;
      } else {
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
      }
    } else {
      if (language === 'zh') {
        return `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;
      } else {
        return currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      }
    }
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDateForLoop = new Date(startDate);
    
    // Generate 6 weeks of days
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const dayEvents = sampleEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.toDateString() === currentDateForLoop.toDateString();
        });
        
        days.push({
          date: new Date(currentDateForLoop),
          isCurrentMonth: currentDateForLoop.getMonth() === month,
          events: dayEvents
        });
        
        currentDateForLoop.setDate(currentDateForLoop.getDate() + 1);
      }
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Header with weekdays */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {t.weekdaysShort.map((day, index) => (
            <div key={index} className="p-3 text-center text-sm font-medium text-gray-700 bg-gray-50">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-[100px] p-2 border-r border-b border-gray-100 ${
                !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <div className={`text-sm mb-1 ${
                !day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
              }`}>
                {day.date.getDate()}
              </div>
              
              {day.events.map((event) => (
                <div
                  key={event.id}
                  className="text-xs bg-[#CCFFFF]/60 text-gray-800 px-2 py-1 rounded mb-1 truncate font-medium"
                >
                  {event.title}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      weekDays.push(date);
    }

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const timeSlots = hours.map(h => `${h}时`);

    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Header */}
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-3 bg-gray-50 border-r border-gray-200"></div>
          {weekDays.map((date, index) => (
            <div key={index} className="p-3 text-center bg-gray-50 border-r border-gray-200">
              <div className="text-xs text-gray-600">
                {language === 'zh' 
                  ? `${date.getMonth() + 1}/${date.getDate()}${t.weekdays[date.getDay()]}`
                  : `${date.getMonth() + 1}/${date.getDate()}${t.weekdaysShort[date.getDay()]}`
                }
              </div>
            </div>
          ))}
        </div>
        
        {/* Time grid */}
        <div className="grid grid-cols-8">
          {timeSlots.slice(0, 5).map((slot, slotIndex) => (
            <React.Fragment key={slotIndex}>
              <div className="p-3 text-xs text-gray-600 bg-gray-50 border-r border-b border-gray-200">
                {slot}
              </div>
              {weekDays.map((date, dayIndex) => {
                const dayEvents = sampleEvents.filter(event => {
                  const eventDate = new Date(event.date);
                  return eventDate.toDateString() === date.toDateString();
                });
                
                return (
                  <div key={dayIndex} className="min-h-[60px] p-2 border-r border-b border-gray-100 bg-white">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="text-xs bg-[#CCFFFF]/60 text-gray-800 px-2 py-1 rounded mb-1 font-medium"
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const timeSlots = hours.slice(6, 11).map(h => `${h}时`);
    
    const dayEvents = sampleEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === currentDate.toDateString();
    });

    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Header */}
        <div className="grid grid-cols-2 border-b border-gray-200">
          <div className="p-3 bg-gray-50 border-r border-gray-200"></div>
          <div className="p-3 text-center bg-gray-50">
            <div className="text-sm font-medium">
              {language === 'zh' 
                ? `${currentDate.getMonth() + 1}/${currentDate.getDate()}${t.weekdays[currentDate.getDay()]}`
                : currentDate.toLocaleDateString('en-US', { weekday: 'long' })
              }
            </div>
          </div>
        </div>
        
        {/* Time grid */}
        <div className="grid grid-cols-2">
          {timeSlots.map((slot, index) => (
            <React.Fragment key={index}>
              <div className="p-3 text-xs text-gray-600 bg-gray-50 border-r border-b border-gray-200">
                {slot}
              </div>
              <div className="min-h-[60px] p-2 border-b border-gray-100 bg-white">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="text-xs bg-[#CCFFFF]/60 text-gray-800 px-2 py-1 rounded mb-1 font-medium"
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="pt-6 space-y-6">
      {/* Filters */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              {t.selectUser}
            </label>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t.allUsers} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allUsers}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              {t.activityType}
            </label>
            <Select value={activityFilter} onValueChange={setActivityFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t.allActivities} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allActivities}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          {t.currentUser} {t.allUsers} {t.activityScope} {t.allActivities}
        </div>
      </div>

      {/* Navigation and View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            {t.today}
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-lg font-medium">
          {getHeaderTitle()}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewType === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('month')}
          >
            {t.month}
          </Button>
          <Button
            variant={viewType === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('week')}
          >
            {t.week}
          </Button>
          <Button
            variant={viewType === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('day')}
          >
            {t.day}
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      <div>
        {viewType === 'month' && renderMonthView()}
        {viewType === 'week' && renderWeekView()}
        {viewType === 'day' && renderDayView()}
      </div>
    </div>
  );
}