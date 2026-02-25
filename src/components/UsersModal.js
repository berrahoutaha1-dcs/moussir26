import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Settings, Plus, Edit, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import CreateUserModal from './CreateUserModal';
import { toast } from 'sonner';

export default function UsersModal({ isOpen, onClose }) {
  const { direction, t, language } = useLanguage();
  const [users, setUsers] = useState([
    { id: 1, username: 'admin', fullName: '', function: '', type: 'Administrateur' }
  ]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sortField, setSortField] = useState('username');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleNewUser = () => {
    setIsCreateUserModalOpen(true);
  };

  const handleCreateUser = (userData) => {
    const newUser = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      username: userData.username,
      fullName: userData.fullName,
      function: userData.function,
      type: userData.type
    };
    
    setUsers(prev => [...prev, newUser]);
    setIsCreateUserModalOpen(false);
    toast.success(t('users.success.created'));
  };

  const handleEditUser = () => {
    if (selectedUsers.length === 1) {
      toast.info(t('users.info.editComingSoon'));
    }
  };

  const handleDeleteUsers = () => {
    if (selectedUsers.length > 0) {
      setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
      toast.success(t('users.success.deleted'));
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    const comparison = aValue.localeCompare(bValue);
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 text-blue-200" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3 h-3 text-white" />
      : <ChevronDown className="w-3 h-3 text-white" />;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`max-w-md ${direction === 'rtl' ? 'rtl' : ''}`} onClose={onClose}>
          <div className="modal-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="modal-header-icon">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="modal-header-title">
                    {t('users.title')}
                  </DialogTitle>
                  <DialogDescription className="modal-header-subtitle mt-1">
                    {t('users.subtitle')}
                  </DialogDescription>
                </div>
              </div>
              <button
                onClick={onClose}
                className="modal-close-button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleDeleteUsers}
                disabled={selectedUsers.length === 0}
                className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded disabled:opacity-50 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                {t('users.delete')}
              </Button>
              <Button
                onClick={handleEditUser}
                disabled={selectedUsers.length !== 1}
                className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50 flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                {t('users.edit')}
              </Button>
              <Button
                onClick={handleNewUser}
                className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {t('users.new')}
              </Button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-blue-500">
                  <TableRow className="border-0">
                    <TableHead className="w-12 text-center py-3 border-0">
                      <input
                        type="checkbox"
                        className="rounded border-white bg-white"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(users.map(u => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        checked={selectedUsers.length === users.length && users.length > 0}
                      />
                    </TableHead>
                    <TableHead 
                      className="text-white cursor-pointer hover:bg-blue-600 transition-colors py-3 border-0"
                      onClick={() => handleSort('username')}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{t('users.username')}</span>
                        <SortIcon field="username" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-white cursor-pointer hover:bg-blue-600 transition-colors py-3 border-0"
                      onClick={() => handleSort('fullName')}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{t('users.fullName')}</span>
                        <SortIcon field="fullName" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                        {t('users.noUsers')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        className={`hover:bg-slate-50 cursor-pointer border-0 ${
                          selectedUsers.includes(user.id) ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleUserSelect(user.id)}
                      >
                        <TableCell className="text-center py-3">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserSelect(user.id)}
                          />
                        </TableCell>
                        <TableCell className="py-3">
                          {user.username}
                        </TableCell>
                        <TableCell className="text-slate-600 py-3">
                          {user.fullName || ''}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

          </div>
          
          <div className="modal-footer">
            <Button
              onClick={onClose}
              className="modal-button-primary"
            >
              {t('users.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onCreateUser={handleCreateUser}
      />
    </>
  );
}

