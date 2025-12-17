"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { createContactMessage } from "@/lib/actions/contactActions";
import { getSectionsByPage } from "@/lib/api/sections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactForm() {
  const { locale, t } = useLanguage();
  const [section, setSection] = useState<any>(null);
  const [loadingSection, setLoadingSection] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  useEffect(() => {
    loadSection();
  }, [locale]);

  const loadSection = async () => {
    try {
      setLoadingSection(true);
      const data = await getSectionsByPage("contact", locale);
      const sections = Array.isArray(data) ? data : (data as any)?.data || [];
      // Get first section (order 1)
      const firstSection =
        sections.find((s: any) => s.order === 1) || sections[0];
      setSection(firstSection);
    } catch (error) {
      console.error("Error loading contact section:", error);
    } finally {
      setLoadingSection(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      await createContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        message: formData.message,
      });

      setStatus({
        type: "success",
        message:
          locale === "ar"
            ? "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً."
            : "Your message has been sent successfully! We'll contact you soon.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error: any) {
      setStatus({
        type: "error",
        message:
          error.message ||
          (locale === "ar"
            ? "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى."
            : "An error occurred while sending the message. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingSection) {
    return (
      <section className="relative bg-gradient-to-b from-white to-gray-100 py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Title and Description Skeleton */}
            <div className="text-center mb-12 space-y-4">
              <div className="h-10 md:h-12 bg-gray-200 rounded-lg w-1/3 mx-auto animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto animate-pulse" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Form Skeleton */}
              <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                    <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                ))}
                <div className="h-12 bg-primary/30 rounded-lg animate-pulse" />
              </div>
              {/* Contact Info Skeleton */}
              <div className="space-y-6 p-8 rounded-3xl bg-gray-50">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white"
                  >
                    <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const title =
    section &&
    (typeof section.title === "string"
      ? section.title
      : section.title?.[locale] || "");

  return (
    <section className="relative bg-gradient-to-b from-white to-gray-100 py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {locale === "ar" ? "تواصل معنا" : "Get In Touch"}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {locale === "ar"
                ? "نحن هنا للمساعدة. أرسل لنا رسالة وسنرد عليك في أقرب وقت ممكن."
                : "We're here to help. Send us a message and we'll respond as soon as possible."}
            </p>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-xl border border-border/60 p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <Label htmlFor="name" className="text-foreground mb-2 block">
                  {locale === "ar" ? "الاسم" : "Name"} *
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={
                    locale === "ar"
                      ? "أدخل اسمك الكامل"
                      : "Enter your full name"
                  }
                  className="h-12"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-foreground mb-2 block">
                  {locale === "ar" ? "البريد الإلكتروني" : "Email"} *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={
                      locale === "ar"
                        ? "example@email.com"
                        : "example@email.com"
                    }
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-foreground mb-2 block">
                  {locale === "ar" ? "رقم الهاتف" : "Phone"} ({" "}
                  {locale === "ar" ? "اختياري" : "Optional"})
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={
                    locale === "ar" ? "+966 50 123 4567" : "+966 50 123 4567"
                  }
                  className="h-12"
                />
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message" className="text-foreground mb-2 block">
                  {locale === "ar" ? "الرسالة" : "Message"} *
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={
                    locale === "ar"
                      ? "اكتب رسالتك هنا..."
                      : "Write your message here..."
                  }
                  rows={6}
                  className="resize-none"
                />
              </div>

              {/* Status Message */}
              {status.type && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-lg ${
                    status.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {status.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <p className="text-sm">{status.message}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {locale === "ar" ? "جاري الإرسال..." : "Sending..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    {locale === "ar" ? "إرسال الرسالة" : "Send Message"}
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
