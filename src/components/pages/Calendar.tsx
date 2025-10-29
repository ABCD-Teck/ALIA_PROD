import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ChevronLeft, ChevronRight, Clock, MapPin, User, Building } from 'lucide-react';
import { Language } from '../../App';
import { calendarApi } from '../../services/api';

interface CalendarProps {
  searchQuery: string;
  language: Language;
}

type ViewType = 'month' | 'week' | 'day';

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  location?: string;
  type?: string;
  medium?: string;
  outcome?: string;
  sentiment?: string;
  importance?: number;
  priority?: string;
  status?: string;
  customer?: {
    id: string;
    name: string;
  };
  contact?: {
    id: string;
    name: string;
  };
  sourceType: string;
  relatedId: string;
  relatedTable: string;
}

export function Calendar({ searchQuery, language }: CalendarProps) {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [userFilter, setUserFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const content = {
    zh: {
      selectUser: '选择用户',
      allUsers: '全部用户',
      activityType: '活动类型',
      allActivities: '全部',
      currentUser: '当前用户:',
      activityScope: '活动类型:',
      today: '今天',
      month: '月',
      week: '周',
      day: '日',
      months: [
        '1月', '2月', '3月', '4月', '5月', '6月',
        '7月', '8月', '9月', '10月', '11月', '12月'
      ],
      weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      weekdaysShort: ['日', '一', '二', '三', '四', '五', '六'],
      noEvents: '暂无活动',
      loading: '加载中...'
    },
    en: {
      selectUser: 'Select User',
      allUsers: 'All Users',
      activityType: 'Activity Type',
      allActivities: 'All',
      currentUser: 'Current User:',
      activityScope: 'Activity Type:',
      today: 'Today',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      months: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      noEvents: 'No events',
      loading: 'Loading...'
    }
  };

  const t = content[language];

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, [currentDate, viewType]);

  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewType === 'month') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    } else if (viewType === 'week') {
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  };

  const fetchEvents = async () => {
    setLoading(true);

    try {
      const { start, end } = getDateRange();
      const { data, error } = await calendarApi.getEvents({
        start,
        end,
        view: viewType,
      });

      if (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
        return;
      }

      setEvents(data?.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

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
    setCurrentDate(new Date());
  };

  const getHeaderTitle = () => {
    if (viewType === 'month') {
      if (language === 'zh') {
        return `${currentDate.getFullYear()}年 ${t.months[currentDate.getMonth()]}`;
      } else {
        return `${t.months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      }
    } else if (viewType === 'week') {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - day);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      if (language === 'zh') {
        return `${startOfWeek.getFullYear()}年${startOfWeek.getMonth() + 1}月${startOfWeek.getDate()}日 - ${endOfWeek.getMonth() + 1}月${endOfWeek.getDate()}日`;
      } else {
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
    } else {
      if (language === 'zh') {
        return `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;
      } else {
        return currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      }
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM
  };

  const getEventColor = (event: Event) => {
    // Tasks have a distinct visual style
    if (event.sourceType === 'task') {
      switch (event.priority?.toLowerCase()) {
        case 'high':
          return 'bg-orange-100 border-l-4 border-orange-500 text-orange-900';
        case 'medium':
          return 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900';
        case 'low':
          return 'bg-green-100 border-l-4 border-green-500 text-green-900';
        default:
          return 'bg-gray-100 border-l-4 border-gray-400 text-gray-900';
      }
    }

    // Interactions: Color code by outcome/status first, then by importance
    if (event.outcome) {
      switch (event.outcome.toLowerCase()) {
        case '已完成':
        case 'completed':
          return 'bg-green-100 border-l-4 border-green-500 text-green-900';
        case '已计划':
        case 'scheduled':
        case 'planned':
          return 'bg-blue-100 border-l-4 border-blue-500 text-blue-900';
        case '已取消':
        case 'cancelled':
          return 'bg-gray-100 border-l-4 border-gray-400 text-gray-600 line-through';
        case '进行中':
        case 'in progress':
          return 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900';
      }
    }

    // Fallback to importance-based coloring for interactions
    switch (event.importance) {
      case 3: return 'bg-red-100 border-l-4 border-red-500 text-red-900';
      case 2: return 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900';
      case 1: return 'bg-blue-100 border-l-4 border-blue-500 text-blue-900';
      default: return 'bg-gray-100 border-l-4 border-gray-400 text-gray-900';
    }
  };

  const getOutcomeBadge = (event: Event) => {
    // For tasks, show status badge
    if (event.sourceType === 'task' && event.status) {
      const statusColors: Record<string, string> = {
        'not started': 'bg-gray-500 text-white',
        'in progress': 'bg-blue-500 text-white',
        'completed': 'bg-green-500 text-white',
        'cancelled': 'bg-red-500 text-white',
        'on hold': 'bg-yellow-500 text-white'
      };

      const colorClass = statusColors[event.status.toLowerCase()] || 'bg-gray-400 text-white';

      return (
        <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>
          {event.status}
        </span>
      );
    }

    // For interactions, show outcome badge
    if (!event.outcome) return null;

    const badgeColors: Record<string, string> = {
      '已完成': 'bg-green-500 text-white',
      'completed': 'bg-green-500 text-white',
      '已计划': 'bg-blue-500 text-white',
      'scheduled': 'bg-blue-500 text-white',
      'planned': 'bg-blue-500 text-white',
      '已取消': 'bg-gray-500 text-white',
      'cancelled': 'bg-gray-500 text-white',
      '进行中': 'bg-yellow-500 text-white',
      'in progress': 'bg-yellow-500 text-white',
    };

    const colorClass = badgeColors[event.outcome.toLowerCase()] || 'bg-gray-400 text-white';

    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>
        {event.outcome}
      </span>
    );
  };

  const handleEventClick = (event: Event) => {
    // Navigate to detail page based on event type
    if (event.relatedTable === 'interaction') {
      navigate(`/interactions/${event.relatedId}`);
    } else if (event.relatedTable === 'task') {
      navigate(`/tasks/${event.relatedId}`);
    }
  };

  const renderEventCard = (event: Event, compact = false) => {
    const isTask = event.sourceType === 'task';
    const displayTime = event.startTime ? formatTime(event.startTime) : (isTask ? language === 'zh' ? '任务' : 'Task' : '');

    if (compact) {
      return (
        <div
          key={event.id}
          onClick={() => handleEventClick(event)}
          className={`text-xs px-2 py-1 rounded mb-1 truncate cursor-pointer hover:shadow-md hover:scale-105 transition-all ${getEventColor(event)}`}
          title={`${event.title}\n${event.customer?.name || ''}\n${displayTime}\nType: ${isTask ? 'Task' : 'Interaction'}\nStatus: ${event.status || event.outcome || 'N/A'}`}
        >
          <div className="font-medium truncate">{event.title}</div>
          {displayTime && (
            <div className="text-xs opacity-75">{displayTime}</div>
          )}
        </div>
      );
    }

    return (
      <div
        key={event.id}
        onClick={() => handleEventClick(event)}
        className={`p-3 rounded-lg mb-2 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all ${getEventColor(event)}`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="font-semibold truncate flex-1">{event.title}</div>
          {getOutcomeBadge(event)}
        </div>
        <div className="space-y-1 text-xs">
          {event.startTime && event.endTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
            </div>
          )}
          {isTask && (
            <div className="flex items-center gap-1">
              <span className="font-medium">{language === 'zh' ? '截止日期' : 'Due Date'}</span>
            </div>
          )}
          {event.customer?.name && (
            <div className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              <span>{event.customer.name}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      </div>
    );
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
        const dayEvents = events.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.toDateString() === currentDateForLoop.toDateString();
        });

        days.push({
          date: new Date(currentDateForLoop),
          isCurrentMonth: currentDateForLoop.getMonth() === month,
          isToday: currentDateForLoop.toDateString() === new Date().toDateString(),
          events: dayEvents
        });

        currentDateForLoop.setDate(currentDateForLoop.getDate() + 1);
      }
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header with weekdays */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100">
          {t.weekdaysShort.map((day, index) => (
            <div key={index} className="p-3 text-center text-sm font-semibold text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-[120px] p-2 border-r border-b border-gray-100 transition-colors ${
                !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
              } ${day.isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
            >
              <div className={`text-sm mb-1 font-medium ${
                !day.isCurrentMonth ? 'text-gray-400' : day.isToday ? 'text-blue-600 font-bold' : 'text-gray-900'
              }`}>
                {day.date.getDate()}
              </div>

              <div className="space-y-1">
                {day.events.slice(0, 3).map((event) => renderEventCard(event, true))}
                {day.events.length > 3 && (
                  <div className="text-xs text-gray-500 pl-2">
                    +{day.events.length - 3} more
                  </div>
                )}
              </div>
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
    const businessHours = hours.slice(6, 22); // 6 AM to 10 PM

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-8 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 sticky top-0 z-10">
          <div className="p-4 bg-gray-50 border-r border-gray-200 font-semibold text-gray-700">
            {language === 'zh' ? '时间' : 'Time'}
          </div>
          {weekDays.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <div key={index} className={`p-3 text-center border-r border-gray-200 ${isToday ? 'bg-blue-50' : ''}`}>
                <div className={`text-xs ${isToday ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
                  {t.weekdaysShort[date.getDay()]}
                </div>
                <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {date.getDate()}
                </div>
                <div className="text-xs text-gray-500">
                  {language === 'zh' ? `${date.getMonth() + 1}月` : t.months[date.getMonth()].substring(0, 3)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="overflow-y-auto max-h-[600px]">
          <div className="grid grid-cols-8">
            {businessHours.map((hour) => (
              <React.Fragment key={hour}>
                <div className="p-3 text-xs text-gray-600 bg-gray-50 border-r border-b border-gray-200 font-medium">
                  {`${hour.toString().padStart(2, '0')}:00`}
                </div>
                {weekDays.map((date, dayIndex) => {
                  const dayEvents = events.filter(event => {
                    const eventDate = new Date(event.date);
                    if (eventDate.toDateString() !== date.toDateString()) return false;

                    if (event.startTime) {
                      const eventHour = parseInt(event.startTime.split(':')[0]);
                      return eventHour === hour;
                    }
                    return false;
                  });

                  return (
                    <div key={dayIndex} className="min-h-[80px] p-2 border-r border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                      {dayEvents.map((event) => renderEventCard(event, false))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const businessHours = hours.slice(6, 22); // 6 AM to 10 PM

    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === currentDate.toDateString();
    });

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-2 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 sticky top-0 z-10">
          <div className="p-4 bg-gray-50 border-r border-gray-200 font-semibold text-gray-700">
            {language === 'zh' ? '时间' : 'Time'}
          </div>
          <div className="p-3 text-center">
            <div className="text-sm font-semibold text-blue-600">
              {language === 'zh'
                ? `${currentDate.getMonth() + 1}月${currentDate.getDate()}日 ${t.weekdays[currentDate.getDay()]}`
                : currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
              }
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {dayEvents.length} {language === 'zh' ? '个活动' : 'events'}
            </div>
          </div>
        </div>

        {/* Time grid */}
        <div className="overflow-y-auto max-h-[600px]">
          <div className="grid grid-cols-2">
            {businessHours.map((hour) => {
              const hourEvents = dayEvents.filter(event => {
                if (event.startTime) {
                  const eventHour = parseInt(event.startTime.split(':')[0]);
                  return eventHour === hour;
                }
                return false;
              });

              return (
                <React.Fragment key={hour}>
                  <div className="p-3 text-sm text-gray-600 bg-gray-50 border-r border-b border-gray-200 font-medium">
                    {`${hour.toString().padStart(2, '0')}:00`}
                  </div>
                  <div className="min-h-[100px] p-3 border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                    {hourEvents.map((event) => renderEventCard(event, false))}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
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
          {t.currentUser} {t.allUsers} • {t.activityScope} {t.allActivities}
        </div>
      </div>

      {/* Navigation and View Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* View Type Buttons - Left Side */}
        <div className="flex items-center space-x-2">
          <Button
            variant={viewType === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('month')}
            disabled={loading}
          >
            {t.month}
          </Button>
          <Button
            variant={viewType === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('week')}
            disabled={loading}
          >
            {t.week}
          </Button>
          <Button
            variant={viewType === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('day')}
            disabled={loading}
          >
            {t.day}
          </Button>
        </div>

        {/* Navigation Controls - Center */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={goToPrevious} disabled={loading}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday} disabled={loading}>
            {t.today}
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext} disabled={loading}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Date Title - Right Side */}
        <div className="text-lg font-semibold text-gray-900">
          {getHeaderTitle()}
        </div>
      </div>

      {/* Calendar Content */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center h-96 text-gray-500">
            {t.loading}
          </div>
        ) : (
          <>
            {viewType === 'month' && renderMonthView()}
            {viewType === 'week' && renderWeekView()}
            {viewType === 'day' && renderDayView()}
          </>
        )}
      </div>
    </div>
  );
}
