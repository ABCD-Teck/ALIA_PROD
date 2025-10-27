import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Edit, Eye, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Language } from '../../App';
import { contactsApi } from '../../services/api';

interface ContactsProps {
  searchQuery: string;
  language: Language;
}

interface Contact {
  contact_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  job_title?: string;
  department?: string;
}

export function Contacts({ searchQuery, language }: ContactsProps) {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  const content = {
    zh: {
      title: '联系人',
      search: '搜索',
      send: '发送',
      createNew: '新建',
      name: '姓名',
      email: '邮箱',
      phone: '电话',
      company: '客户名称（所属公司）',
      actions: '操作',
      showsResults: '显示结果',
      of: '共',
      contacts: '联系人',
      loading: '加载中...',
      error: '加载失败',
      noData: '暂无数据'
    },
    en: {
      title: 'Contacts',
      search: 'Search',
      send: 'Send',
      createNew: 'Create New',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company Name',
      actions: 'Actions',
      showsResults: 'Shows',
      of: 'of',
      contacts: 'contacts',
      loading: 'Loading...',
      error: 'Failed to load',
      noData: 'No data available'
    }
  };

  const t = content[language];

  // Fetch contacts from API
  useEffect(() => {
    fetchContacts();
  }, [currentPage, searchQuery, localSearchQuery]);

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);

    try {
      const searchTerm = searchQuery || localSearchQuery;
      const response = await contactsApi.getAll({
        search: searchTerm || undefined,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      });

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setContacts(response.data.contacts);
        setTotalContacts(response.data.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm(language === 'zh' ? '确定要删除这个联系人吗？' : 'Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      const response = await contactsApi.delete(contactId);
      if (response.error) {
        alert(response.error);
      } else {
        // Refresh the list
        fetchContacts();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  // Pagination
  const totalPages = Math.ceil(totalContacts / itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-medium">{t.title}</h1>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
            {totalContacts} {t.contacts}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Input
              type="text"
              placeholder={t.search}
              value={localSearchQuery}
              onChange={(e) => {
                setLocalSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="w-64 pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <Button variant="outline" className="bg-[#009699] text-white border-[#009699] hover:bg-[#007a7d]">
            {t.send}
          </Button>
          <Button
            className="bg-[#009699] text-white hover:bg-[#007a7d]"
            onClick={() => navigate('/contacts/create')}
          >
            {t.createNew}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#009699]" />
            <span className="ml-3 text-gray-600">{t.loading}</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-red-600">
            {t.error}: {error}
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-600">
            {t.noData}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>{t.name}</TableHead>
                <TableHead>{t.email}</TableHead>
                <TableHead>{t.phone}</TableHead>
                <TableHead>{t.company}</TableHead>
                <TableHead className="text-center">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact, index) => (
                <TableRow key={contact.contact_id} className="hover:bg-gray-50">
                  <TableCell className="text-center text-sm font-medium">
                    {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {contact.first_name} {contact.last_name}
                  </TableCell>
                  <TableCell className="text-gray-600">{contact.email || '-'}</TableCell>
                  <TableCell className="text-gray-600">{contact.phone || '-'}</TableCell>
                  <TableCell className="text-gray-600">{contact.company_name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-50"
                        title={language === 'zh' ? '编辑' : 'Edit'}
                      >
                        <Edit className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50"
                        title={language === 'zh' ? '删除' : 'Delete'}
                        onClick={() => handleDelete(contact.contact_id)}
                      >
                        <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-green-50"
                        title={language === 'zh' ? '查看详情' : 'View Details'}
                        onClick={() => navigate(`/contacts/${contact.contact_id}`)}
                      >
                        <Eye className="h-4 w-4 text-gray-500 hover:text-green-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && contacts.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {t.showsResults} {contacts.length} {t.of} {totalContacts}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (pageNumber <= totalPages) {
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageClick(pageNumber)}
                    className="h-8 w-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                );
              }
              return null;
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
