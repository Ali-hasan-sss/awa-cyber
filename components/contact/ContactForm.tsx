"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { createContactMessage } from "@/lib/actions/contactActions";
import { getSectionsByPage } from "@/lib/api/sections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
} from "lucide-react";
import {
  serviceIconComponents,
  ServiceIconKey,
} from "@/lib/serviceIconOptions";
import { socialIconComponents, SocialIconKey } from "@/lib/socialIconOptions";

// Helper function to strip HTML tags
const stripHtml = (html: string): string => {
  if (!html) return "";
  if (typeof window === "undefined") {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  }
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const getIconComponent = (iconName: string) => {
  // First try social icons
  if (socialIconComponents[iconName as SocialIconKey]) {
    return socialIconComponents[iconName as SocialIconKey];
  }
  // Then try service icons
  const IconComponent =
    serviceIconComponents[iconName as ServiceIconKey] ||
    serviceIconComponents["ShieldCheck"];
  return IconComponent;
};

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
      const data = await getSectionsByPage("contact");
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
      <section className="relative bg-white py-20 md:py-28">
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

  const description =
    section &&
    (typeof section.description === "string"
      ? section.description
      : section.description?.[locale] || "");

  const features = section?.features || [];
  const addressFeature = features[0];
  const phoneFeature = features[1];
  const socialFeatures = features.slice(2);

  const address =
    addressFeature &&
    (typeof addressFeature.name === "string"
      ? addressFeature.name
      : addressFeature.name?.[locale] || "");

  const phone =
    phoneFeature &&
    (typeof phoneFeature.name === "string"
      ? phoneFeature.name
      : phoneFeature.name?.[locale] || "");

  return (
    <section className="relative bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Form */}
            <div>
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
                  <Label
                    htmlFor="message"
                    className="text-foreground mb-2 block"
                  >
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

            {/* Contact Information */}
            <div className="flex flex-col justify-center">
              {(address || phone || socialFeatures.length > 0) && (
                <div className="relative rounded-3xl bg-gradient-to-br from-gray-50 via-white to-primary/5 border border-border/60 shadow-xl p-8 space-y-8">
                  {/* Decorative background elements */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden opacity-5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary rounded-full blur-3xl" />
                  </div>

                  <div className="relative z-10 space-y-6">
                    {/* Address Card */}
                    {address && (
                      <div className="group relative rounded-2xl bg-white/80 backdrop-blur-sm border border-border/40 p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                            <MapPin className="w-7 h-7 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                              {locale === "ar" ? "العنوان" : "Address"}
                            </h3>
                            <p className="text-base text-foreground/80 leading-relaxed font-medium">
                              {address}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Phone Card */}
                    {phone && (
                      <div className="group relative rounded-2xl bg-white/80 backdrop-blur-sm border border-border/40 p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                            <Phone className="w-7 h-7 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                              {locale === "ar" ? "الهاتف" : "Phone"}
                            </h3>
                            <a
                              href={`tel:${phone}`}
                              className="text-base text-foreground/80 hover:text-primary transition-colors font-medium block"
                            >
                              {phone}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Social Media Icons Card */}
                    {socialFeatures.length > 0 && (
                      <div className="relative rounded-2xl bg-white/80 backdrop-blur-sm border border-border/40 p-6">
                        <h3 className="font-bold text-lg text-foreground mb-6">
                          {locale === "ar" ? "تابعنا على" : "Follow Us"}
                        </h3>
                        <div className="flex items-center flex-wrap gap-3">
                          {socialFeatures.map((feature: any, index: number) => {
                            const iconName = feature.icon;
                            const link =
                              typeof feature.description === "string"
                                ? feature.description
                                : feature.description?.[locale] || "";
                            const IconComponent = getIconComponent(iconName);

                            if (!link) return null;

                            return (
                              <a
                                key={index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary border border-primary/20 hover:border-primary/40 hover:bg-primary hover:text-white hover:scale-110 transition-all duration-300 shadow-sm hover:shadow-lg"
                                title={iconName}
                              >
                                <IconComponent className="w-6 h-6 transition-transform group-hover:scale-110" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
