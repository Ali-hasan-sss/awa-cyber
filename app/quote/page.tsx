"use client";

import { useMemo, useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  User,
  Building2,
  Phone,
  Mail,
  FileText,
  Wallet,
  Calendar,
  MessageCircle,
  ArrowRight,
  MapPin,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createQuotationRequestApi } from "@/lib/actions/quoteActions";
import { fetchPublicServices } from "@/lib/actions/serviceActions";
import { getSectionsByPage } from "@/lib/api/sections";

const contentMap = {
  en: {
    eyebrow: "REQUEST A QUOTE",
    title: "Request Your Free Quotation",
    subtitle:
      "Fill out the form below and our digital solutions experts will get back to you within 24 hours with a customized solution.",
    sections: {
      personal: "Personal Information",
      service: "Service Details",
      budget: "Budget & Timeline",
    },
    labels: {
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      company: "Company Name",
      serviceType: "Service Type",
      projectDesc: "Project Description",
      budgetRange: "Budget Range",
      duration: "Project Duration",
      startDate: "Preferred Start Date",
      endDate: "Expected Delivery Date",
      required: "Required",
      optional: "Optional",
    },
    placeholders: {
      fullName: "John Doe",
      email: "john@example.com",
      phone: "+1 234 567 8900",
      company: "Your Company",
      projectDesc:
        "Please describe your project needs, current requirements, and any specific features you'd like...",
    },
    select: {
      service: "Select a service",
      budget: "Select budget range",
      duration: "Estimated duration",
    },
    submit: "Submit Quotation Request",
    contactCards: [
      { title: "Email Us", value: "info@awacyber.com", icon: Mail },
      { title: "Call Us", value: "+1 (234) 567-890", icon: Phone },
      { title: "WhatsApp", value: "Quick Support", icon: MessageCircle },
    ],
  },
  ar: {
    eyebrow: "اطلب عرض سعر",
    title: "اطلب عرضك المجاني",
    subtitle:
      "املأ النموذج أدناه وسيعود إليك خبراؤنا في الحلول الرقمية خلال 24 ساعة بحل مخصص.",
    sections: {
      personal: "المعلومات الشخصية",
      service: "تفاصيل الخدمة",
      budget: "الميزانية والجدول الزمني",
    },
    labels: {
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف",
      company: "اسم الشركة",
      serviceType: "نوع الخدمة",
      projectDesc: "وصف المشروع",
      budgetRange: "نطاق الميزانية",
      duration: "مدة المشروع",
      startDate: "تاريخ البدء المفضل",
      endDate: "تاريخ التسليم المتوقع",
      required: "مطلوب",
      optional: "اختياري",
    },
    placeholders: {
      fullName: "محمد أحمد",
      email: "mohamed@example.com",
      phone: "+966 12 345 6789",
      company: "شركتك",
      projectDesc:
        "يرجى وصف احتياجات مشروعك، المتطلبات الحالية، وأي ميزات خاصة تريدها...",
    },
    select: {
      service: "اختر الخدمة",
      budget: "اختر نطاق الميزانية",
      duration: "مدة تقديرية",
    },
    submit: "إرسال طلب عرض السعر",
    contactCards: [
      { title: "راسلنا", value: "info@awacyber.com", icon: Mail },
      { title: "اتصل بنا", value: "+966 12 345 6789", icon: Phone },
      { title: "واتساب", value: "دعم فوري", icon: MessageCircle },
    ],
  },
};

interface PublicService {
  _id: string;
  title: string;
  description?: string;
}

const budgetOptions = [
  {
    value: "50-150",
    label: { en: "50 - 150 OMR", ar: "50 - 150 ريال عماني" },
    from: 50,
    to: 150,
  },
  {
    value: "150-300",
    label: { en: "150 - 300 OMR", ar: "150 - 300 ريال عماني" },
    from: 150,
    to: 300,
  },
  {
    value: "300-750",
    label: { en: "300 - 750 OMR", ar: "300 - 750 ريال عماني" },
    from: 300,
    to: 750,
  },
  {
    value: "750-1500",
    label: { en: "750 - 1,500 OMR", ar: "750 - 1500 ريال عماني" },
    from: 750,
    to: 1500,
  },
  {
    value: "1500-3000",
    label: { en: "1,500 - 3,000 OMR", ar: "1500 - 3000 ريال عماني" },
    from: 1500,
    to: 3000,
  },
];

const durationOptions = [
  { value: "2weeks", label: { en: "2 Weeks", ar: "أسبوعين" } },
  { value: "1month", label: { en: "1 Month", ar: "شهر" } },
  { value: "2months", label: { en: "2 Months", ar: "شهرين" } },
  { value: "3months", label: { en: "3 Months", ar: "3 أشهر" } },
  { value: "4months", label: { en: "4 Months", ar: "4 أشهر" } },
  { value: "5months", label: { en: "5 Months", ar: "5 أشهر" } },
  { value: "notimportant", label: { en: "Not Important", ar: "لا غير مهم" } },
];

const inputClasses =
  "h-12 rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder-white/40 focus-visible:ring-0 focus:border-primary transition-colors";
const textareaClasses =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus-visible:ring-0 focus:border-primary transition-colors resize-none";
const selectClasses =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary transition-colors";

export default function QuotePage() {
  const { locale } = useLanguage();
  const copy = useMemo(
    () => contentMap[locale as "en" | "ar"] || contentMap.en,
    [locale]
  );
  const [services, setServices] = useState<PublicService[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [contactSection, setContactSection] = useState<any>(null);
  const [loadingContact, setLoadingContact] = useState(true);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    serviceType: "",
    projectDesc: "",
    budgetRange: "",
    duration: "",
    startDate: "",
    endDate: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; message: string } | undefined
  >();

  useEffect(() => {
    const loadServices = async () => {
      setLoadingServices(true);
      try {
        const lang = locale === "ar" ? "ar" : "en";
        const data = await fetchPublicServices(lang);
        setServices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load services:", error);
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };
    loadServices();
  }, [locale]);

  // Load contact section data
  useEffect(() => {
    const loadContactSection = async () => {
      try {
        setLoadingContact(true);
        const data = await getSectionsByPage("contact", locale);
        const sections = Array.isArray(data) ? data : (data as any)?.data || [];
        const firstSection =
          sections.find((s: any) => s.order === 1) || sections[0];
        setContactSection(firstSection);
      } catch (error) {
        console.error("Error loading contact section:", error);
      } finally {
        setLoadingContact(false);
      }
    };
    loadContactSection();
  }, [locale]);

  // Extract contact information from section features
  const features = contactSection?.features || [];
  const addressFeature = features[0];
  const phoneFeature = features[1];

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const isAr = locale === "ar";

    // fullName: min 3 characters (REQUIRED)
    if (!form.fullName.trim()) {
      errors.fullName = isAr ? "الاسم الكامل مطلوب" : "Full name is required";
    } else if (form.fullName.trim().length < 3) {
      errors.fullName = isAr
        ? "الاسم يجب أن يكون 3 أحرف على الأقل"
        : "Full name must be at least 3 characters";
    }

    // phone: min 6 characters (REQUIRED)
    if (!form.phone.trim()) {
      errors.phone = isAr ? "رقم الهاتف مطلوب" : "Phone number is required";
    } else if (form.phone.trim().length < 6) {
      errors.phone = isAr
        ? "رقم الهاتف يجب أن يكون 6 أحرف على الأقل"
        : "Phone number must be at least 6 characters";
    }

    // serviceId: required (REQUIRED)
    if (!form.serviceType || !form.serviceType.trim()) {
      errors.serviceType = isAr ? "الخدمة مطلوبة" : "Service is required";
    }

    // email: valid email if provided (OPTIONAL)
    if (form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        errors.email = isAr
          ? "البريد الإلكتروني غير صحيح"
          : "Invalid email address";
      }
    }

    // companyName: min 2 characters if provided (OPTIONAL)
    if (
      form.company &&
      form.company.trim().length > 0 &&
      form.company.trim().length < 2
    ) {
      errors.company = isAr
        ? "اسم الشركة يجب أن يكون حرفين على الأقل"
        : "Company name must be at least 2 characters";
    }

    // projectDescription: min 10 characters if provided (OPTIONAL)
    if (form.projectDesc.trim() && form.projectDesc.trim().length < 10) {
      errors.projectDesc = isAr
        ? "وصف المشروع يجب أن يكون 10 أحرف على الأقل"
        : "Project description must be at least 10 characters";
    }

    // budget: validate if provided (OPTIONAL)
    if (form.budgetRange) {
      const budget = budgetOptions.find(
        (option) => option.value === form.budgetRange
      );
      if (!budget) {
        errors.budgetRange = isAr
          ? "نطاق الميزانية غير صحيح"
          : "Invalid budget range";
      }
    }

    // startDate: valid date if provided (OPTIONAL)
    if (form.startDate) {
      const startDate = new Date(form.startDate);
      if (Number.isNaN(startDate.getTime())) {
        errors.startDate = isAr ? "تاريخ البدء غير صحيح" : "Invalid start date";
      }
    }

    // endDate: valid date, must be after startDate if both provided (OPTIONAL)
    if (form.endDate) {
      const endDate = new Date(form.endDate);
      if (Number.isNaN(endDate.getTime())) {
        errors.endDate = isAr ? "تاريخ الانتهاء غير صحيح" : "Invalid end date";
      } else if (form.startDate) {
        const startDate = new Date(form.startDate);
        if (endDate.getTime() < startDate.getTime()) {
          errors.endDate = isAr
            ? "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء"
            : "End date must be after start date";
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = <K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(undefined);

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    try {
      // Build payload with only required fields and optional fields if provided
      const payload: any = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        serviceId: form.serviceType.trim(),
      };

      // Optional fields
      if (form.email.trim()) {
        payload.email = form.email.trim();
      }
      if (form.company?.trim()) {
        payload.companyName = form.company.trim();
      }
      if (form.projectDesc.trim()) {
        payload.projectDescription = form.projectDesc.trim();
      }
      if (form.budgetRange) {
        const budget = budgetOptions.find(
          (option) => option.value === form.budgetRange
        );
        if (budget) {
          payload.budget = {
            from: budget.from,
            to: budget.to,
          };
        }
      }
      if (form.duration) {
        const durationOption = durationOptions.find(
          (option) => option.value === form.duration
        );
        payload.expectedDuration = durationOption
          ? durationOption.label[locale as "en" | "ar"]
          : form.duration;
      }
      if (form.startDate) {
        payload.startDate = form.startDate;
      }
      if (form.endDate) {
        payload.endDate = form.endDate;
      }

      await createQuotationRequestApi(payload);
      setFeedback({
        type: "success",
        message:
          locale === "ar"
            ? "تم استلام طلبك وسنتواصل معك قريباً."
            : "Your request has been received. We'll be in touch shortly.",
      });
      setForm({
        fullName: "",
        email: "",
        phone: "",
        company: "",
        serviceType: "",
        projectDesc: "",
        budgetRange: "",
        duration: "",
        startDate: "",
        endDate: "",
      });
      setFormErrors({});
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          typeof error === "string"
            ? error
            : error instanceof Error
            ? error.message
            : locale === "ar"
            ? "تعذر إرسال الطلب، يرجى المحاولة لاحقاً."
            : "Unable to submit your request. Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="relative min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden pt-28 pb-16">
        <div className="absolute top-0 ltr:right-0 rtl:left-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl glow-spot translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 ltr:left-0 rtl:right-0 w-[26rem] h-[26rem] bg-primary/30 rounded-full blur-3xl glow-spot -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
            <span className="text-xs font-semibold tracking-[0.4em] text-primary uppercase">
              {copy.eyebrow}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold">
              {copy.title.split("Qu").length > 1 ? (
                <>
                  {copy.title.split("Qu")[0]}
                  <span className="text-primary">
                    Qu{copy.title.split("Qu")[1]}
                  </span>
                </>
              ) : (
                copy.title
              )}
            </h1>
            <p className="text-base md:text-lg text-white/80 leading-relaxed">
              {copy.subtitle}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-black/60 border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl space-y-8"
          >
            <Section
              title={copy.sections.personal}
              icon={<User className="h-5 w-5 text-primary" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label={copy.labels.fullName}
                  error={formErrors.fullName}
                  required
                >
                  <Input
                    placeholder={copy.placeholders.fullName}
                    required
                    className={`${inputClasses} ${
                      formErrors.fullName ? "border-red-400/60" : ""
                    }`}
                    value={form.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                  />
                </Field>
                <Field
                  label={copy.labels.phone}
                  error={formErrors.phone}
                  required
                >
                  <Input
                    placeholder={copy.placeholders.phone}
                    required
                    className={`${inputClasses} ${
                      formErrors.phone ? "border-red-400/60" : ""
                    }`}
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </Field>
                <Field
                  label={copy.labels.email}
                  error={formErrors.email}
                  optional
                >
                  <Input
                    type="email"
                    placeholder={copy.placeholders.email}
                    className={`${inputClasses} ${
                      formErrors.email ? "border-red-400/60" : ""
                    }`}
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </Field>
                <Field
                  label={copy.labels.company}
                  error={formErrors.company}
                  optional
                >
                  <Input
                    placeholder={copy.placeholders.company}
                    className={`${inputClasses} ${
                      formErrors.company ? "border-red-400/60" : ""
                    }`}
                    value={form.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                  />
                </Field>
              </div>
            </Section>

            <Section
              title={copy.sections.service}
              icon={<FileText className="h-5 w-5 text-primary" />}
            >
              <div className="grid gap-4">
                <Field
                  label={copy.labels.serviceType}
                  error={formErrors.serviceType}
                  required
                >
                  <select
                    className={`${selectClasses} ${
                      formErrors.serviceType ? "border-red-400/60" : ""
                    }`}
                    value={form.serviceType}
                    onChange={(e) =>
                      handleChange("serviceType", e.target.value)
                    }
                    disabled={loadingServices}
                    required
                  >
                    <option value="" className="bg-slate-900 text-white">
                      {copy.select.service}
                    </option>
                    {services.map((service) => (
                      <option
                        key={service._id}
                        value={service._id}
                        className="bg-slate-900 text-white"
                      >
                        {service.title}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  label={copy.labels.projectDesc}
                  error={formErrors.projectDesc}
                  optional
                >
                  <Textarea
                    rows={4}
                    placeholder={copy.placeholders.projectDesc}
                    className={`${textareaClasses} ${
                      formErrors.projectDesc ? "border-red-400/60" : ""
                    }`}
                    value={form.projectDesc}
                    onChange={(e) =>
                      handleChange("projectDesc", e.target.value)
                    }
                  />
                </Field>
              </div>
            </Section>

            <Section
              title={copy.sections.budget}
              icon={<Wallet className="h-5 w-5 text-primary" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label={copy.labels.budgetRange}
                  error={formErrors.budgetRange}
                  optional
                >
                  <select
                    className={`${selectClasses} ${
                      formErrors.budgetRange ? "border-red-400/60" : ""
                    }`}
                    value={form.budgetRange}
                    onChange={(e) =>
                      handleChange("budgetRange", e.target.value)
                    }
                  >
                    <option value="" className="bg-slate-900 text-white">
                      {copy.select.budget}
                    </option>
                    {budgetOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-slate-900 text-white"
                      >
                        {option.label[locale as "en" | "ar"]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  label={copy.labels.duration}
                  error={formErrors.duration}
                  optional
                >
                  <select
                    className={`${selectClasses} ${
                      formErrors.duration ? "border-red-400/60" : ""
                    }`}
                    value={form.duration}
                    onChange={(e) => handleChange("duration", e.target.value)}
                  >
                    <option value="" className="bg-slate-900 text-white">
                      {copy.select.duration}
                    </option>
                    {durationOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-slate-900 text-white"
                      >
                        {option.label[locale as "en" | "ar"]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  label={copy.labels.startDate}
                  error={formErrors.startDate}
                  optional
                >
                  <Input
                    type="date"
                    className={`${inputClasses} ${
                      formErrors.startDate ? "border-red-400/60" : ""
                    }`}
                    value={form.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                  />
                </Field>
                <Field
                  label={copy.labels.endDate}
                  error={formErrors.endDate}
                  optional
                >
                  <Input
                    type="date"
                    className={`${inputClasses} ${
                      formErrors.endDate ? "border-red-400/60" : ""
                    }`}
                    value={form.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                  />
                </Field>
              </div>
            </Section>

            {feedback && (
              <p
                className={`text-sm ${
                  feedback.type === "success"
                    ? "text-emerald-300"
                    : "text-red-300"
                }`}
              >
                {feedback.message}
              </p>
            )}

            <div className="flex flex-col gap-2 text-center">
              <Button
                className="rounded-full bg-primary text-black hover:bg-primary/90 px-8 py-6 text-sm font-semibold inline-flex items-center justify-center gap-2"
                type="submit"
                disabled={submitting}
              >
                {copy.submit}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </form>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {/* Address Card */}
            {!loadingContact && address && (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <p className="text-sm text-white/70">
                  {locale === "ar" ? "العنوان" : "Address"}
                </p>
                <p className="text-base font-semibold text-white">{address}</p>
              </div>
            )}

            {/* Phone Card */}
            {!loadingContact && phone && (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Phone className="h-6 w-6" />
                </div>
                <p className="text-sm text-white/70">
                  {locale === "ar" ? "رقم الهاتف" : "Phone Number"}
                </p>
                <a
                  href={`tel:${phone}`}
                  className="text-base font-semibold text-white hover:text-primary transition-colors ltr"
                  dir="ltr"
                >
                  {phone}
                </a>
              </div>
            )}

            {/* Fallback to default cards if contact data not loaded */}
            {loadingContact &&
              copy.contactCards.slice(0, 2).map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-6 text-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-white/70">{card.title}</p>
                    <p className="text-base font-semibold text-white">
                      {card.value}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
      <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
          {icon}
        </div>
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  error,
  required = false,
  optional = false,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  optional?: boolean;
}) {
  const { locale } = useLanguage();
  const copy = useMemo(
    () => contentMap[locale as "en" | "ar"] || contentMap.en,
    [locale]
  );

  return (
    <label className="block text-sm text-white/80 space-y-2">
      <span className="flex items-center gap-2">
        {label}
        {required && (
          <span className="text-xs text-red-400 font-semibold">
            ({copy.labels.required})
          </span>
        )}
        {optional && (
          <span className="text-xs text-white/50">
            ({copy.labels.optional})
          </span>
        )}
      </span>
      {children}
      {error && <p className="text-xs text-red-300 mt-1">{error}</p>}
    </label>
  );
}
