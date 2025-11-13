import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { authApi } from '../services/api';
import { Language } from '../App';

interface UserProfileEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onProfileUpdate: () => void;
}

interface UserData {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

const translations = {
  zh: {
    title: '编辑个人资料',
    description: '更新您的个人信息',
    firstName: '名字',
    lastName: '姓氏',
    email: '邮箱',
    role: '角色',
    cancel: '取消',
    save: '保存',
    saving: '保存中...',
    success: '个人资料已更新',
    error: '更新失败，请重试',
  },
  en: {
    title: 'Edit Profile',
    description: 'Update your personal information',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    role: 'Role',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    success: 'Profile updated successfully',
    error: 'Failed to update profile',
  },
};

export function UserProfileEditDialog({
  isOpen,
  onClose,
  language,
  onProfileUpdate,
}: UserProfileEditDialogProps) {
  const t = translations[language];
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UserData>({
    user_id: '',
    email: '',
    first_name: '',
    last_name: '',
    role: '',
  });

  // Load user data from localStorage when dialog opens
  useEffect(() => {
    if (isOpen) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user: UserData = JSON.parse(userStr);
          setFormData(user);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, [isOpen]);

  const handleChange = (field: keyof UserData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Call API to update user profile
      const response = await authApi.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

      if (response.data && !response.error) {
        // Update localStorage with new data
        const updatedUser = {
          ...formData,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Notify parent component
        onProfileUpdate();

        // Show success message
        alert(t.success);
        onClose();
      } else {
        alert(t.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(t.error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="first_name" className="text-right">
              {t.firstName}
            </Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="last_name" className="text-right">
              {t.lastName}
            </Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              {t.email}
            </Label>
            <Input
              id="email"
              value={formData.email}
              disabled
              className="col-span-3 bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              {t.role}
            </Label>
            <Input
              id="role"
              value={formData.role}
              disabled
              className="col-span-3 bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            {t.cancel}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? t.saving : t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
