"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { updateProfileApi, changePasswordApi } from "@/lib/actions/authActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Save, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { admin, setAdmin } = useAuth();
  const { locale } = useLanguage();
  const router = useRouter();
  const isArabic = locale === "ar";

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // UI state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize form with admin data
  useEffect(() => {
    if (admin) {
      setProfileForm({
        name: admin.name || "",
        email: admin.email || "",
        phone: admin.phone || "",
      });
    }
  }, [admin]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await updateProfileApi({
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
      });

      // Update auth context with new admin data
      if (setAdmin && response.admin) {
        setAdmin({
          id: response.admin.id,
          name: response.admin.name,
          email: response.admin.email,
          phone: response.admin.phone,
          role: response.admin.role as "admin" | "client" | "employee",
        });
      }

      setSuccess(
        isArabic
          ? "تم تحديث الملف الشخصي بنجاح"
          : "Profile updated successfully"
      );
    } catch (err: any) {
      setError(
        err?.message ||
          (isArabic
            ? "حدث خطأ أثناء تحديث الملف الشخصي"
            : "Failed to update profile")
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError(
        isArabic ? "كلمات المرور غير متطابقة" : "Passwords do not match"
      );
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError(
        isArabic
          ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
          : "Password must be at least 6 characters"
      );
      return;
    }

    setLoading(true);

    try {
      await changePasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setSuccess(
        isArabic
          ? "تم تغيير كلمة المرور بنجاح"
          : "Password changed successfully"
      );
      // Clear password form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setError(
        err?.message ||
          (isArabic
            ? "حدث خطأ أثناء تغيير كلمة المرور"
            : "Failed to change password")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!admin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-white/60">
          {isArabic ? "جاري التحميل..." : "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          {isArabic ? "الملف الشخصي" : "Profile"}
        </h1>
        <p className="mt-2 text-white/60">
          {isArabic
            ? "إدارة معلوماتك الشخصية وكلمة المرور"
            : "Manage your personal information and password"}
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-green-400">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Update Form */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              {isArabic ? "معلومات الملف الشخصي" : "Profile Information"}
            </h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white/80">
                {isArabic ? "الاسم" : "Name"}
              </Label>
              <Input
                id="name"
                type="text"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
                className="mt-1 border-white/10 bg-white/[0.02] text-white placeholder:text-white/40 focus:border-primary/50"
                placeholder={isArabic ? "أدخل الاسم" : "Enter name"}
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-white/80">
                {isArabic ? "البريد الإلكتروني" : "Email"}
              </Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
                className="mt-1 border-white/10 bg-white/[0.02] text-white placeholder:text-white/40 focus:border-primary/50"
                placeholder={
                  isArabic ? "أدخل البريد الإلكتروني" : "Enter email"
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-white/80">
                {isArabic ? "رقم الهاتف" : "Phone"}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phone: e.target.value })
                }
                className="mt-1 border-white/10 bg-white/[0.02] text-white placeholder:text-white/40 focus:border-primary/50"
                placeholder={isArabic ? "أدخل رقم الهاتف" : "Enter phone"}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black hover:bg-primary/90"
            >
              <Save className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {loading
                ? isArabic
                  ? "جاري الحفظ..."
                  : "Saving..."
                : isArabic
                ? "حفظ التغييرات"
                : "Save Changes"}
            </Button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              {isArabic ? "تغيير كلمة المرور" : "Change Password"}
            </h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="text-white/80">
                {isArabic ? "كلمة المرور الحالية" : "Current Password"}
              </Label>
              <div className="relative mt-1">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="border-white/10 bg-white/[0.02] text-white placeholder:text-white/40 focus:border-primary/50"
                  placeholder={
                    isArabic
                      ? "أدخل كلمة المرور الحالية"
                      : "Enter current password"
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 ltr:right-3 rtl:left-3 flex items-center text-white/60 hover:text-white"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword" className="text-white/80">
                {isArabic ? "كلمة المرور الجديدة" : "New Password"}
              </Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="border-white/10 bg-white/[0.02] text-white placeholder:text-white/40 focus:border-primary/50"
                  placeholder={
                    isArabic ? "أدخل كلمة المرور الجديدة" : "Enter new password"
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 ltr:right-3 rtl:left-3 flex items-center text-white/60 hover:text-white"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-white/80">
                {isArabic ? "تأكيد كلمة المرور" : "Confirm Password"}
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="border-white/10 bg-white/[0.02] text-white placeholder:text-white/40 focus:border-primary/50"
                  placeholder={
                    isArabic
                      ? "أكد كلمة المرور الجديدة"
                      : "Confirm new password"
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 ltr:right-3 rtl:left-3 flex items-center text-white/60 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black hover:bg-primary/90"
            >
              <Lock className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {loading
                ? isArabic
                  ? "جاري التغيير..."
                  : "Changing..."
                : isArabic
                ? "تغيير كلمة المرور"
                : "Change Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
