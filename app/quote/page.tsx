"use client";

import { useMemo, useState } from "react";
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
  ClipboardCheck,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createQuotationRequestApi } from "@/lib/actions/quoteActions";

const contentMap = {
  en: {
    eyebrow: "REQUEST A QUOTE",
    title: "Request Your Free Quotation",
    subtitle:
      "Fill out the form below and our cybersecurity experts will get back to you within 24 hours with a customized solution.",
    sections: {
      personal: "Personal Information",
      service: "Service Details",
      budget: "Budget & Timeline",
      additional: "Additional Information",
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
      notes: "Additional Notes or Requirements",
      referral: "How did you hear about us?",
      consent:
        "I agree to the processing of my personal data and consent to be contacted by AWA Cyber regarding my quotation request.",
    },
    placeholders: {
      fullName: "John Doe",
      email: "john@example.com",
      phone: "+1 234 567 8900",
      company: "Your Company",
      projectDesc:
        "Please describe your security needs, current infrastructure, and any specific requirements...",
      notes: "Any other details we should know about your project...",
    },
    select: {
      service: "Select a service",
      budget: "Select budget range",
      duration: "Estimated duration",
      referral: "Select an option",
    },
    consentNote: "* We typically respond within 24 hours.",
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
      "املأ النموذج أدناه وسيعود إليك خبراؤنا في الأمن السيبراني خلال 24 ساعة بحل مخصص.",
    sections: {
      personal: "المعلومات الشخصية",
      service: "تفاصيل الخدمة",
      budget: "الميزانية والجدول الزمني",
      additional: "معلومات إضافية",
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
      notes: "ملاحظات أو متطلبات إضافية",
      referral: "كيف سمعت عنا؟",
      consent:
        "أوافق على معالجة بياناتي الشخصية وأسمح لـ AWA Cyber بالتواصل معي بشأن طلب عرض السعر.",
    },
    placeholders: {
      fullName: "محمد أحمد",
      email: "mohamed@example.com",
      phone: "+966 12 345 6789",
      company: "شركتك",
      projectDesc:
        "يرجى وصف احتياجاتك الأمنية، البنية الحالية، وأي متطلبات خاصة...",
      notes: "أي تفاصيل أخرى يجب أن نعرفها عن مشروعك...",
    },
    select: {
      service: "اختر الخدمة",
      budget: "اختر نطاق الميزانية",
      duration: "مدة تقديرية",
      referral: "اختر خياراً",
    },
    consentNote: "* عادةً ما نرد خلال 24 ساعة.",
    submit: "إرسال طلب عرض السعر",
    contactCards: [
      { title: "راسلنا", value: "info@awacyber.com", icon: Mail },
      { title: "اتصل بنا", value: "+966 12 345 6789", icon: Phone },
      { title: "واتساب", value: "دعم فوري", icon: MessageCircle },
    ],
  },
};

const serviceOptions = [
  "Penetration Testing",
  "Security Audits",
  "Managed Detection & Response",
  "Cloud Security",
  "Incident Response",
];

const budgetOptions = [
  { value: "5-15", label: "$5k - $15k", from: 5000, to: 15000 },
  { value: "15-30", label: "$15k - $30k", from: 15000, to: 30000 },
  { value: "30-50", label: "$30k - $50k", from: 30000, to: 50000 },
  { value: "50+", label: "$50k+", from: 50000, to: 100000 },
];

const durationOptions = ["2-4 Weeks", "1-2 Months", "3-4 Months", "Ongoing"];

const referralOptions = [
  "Google Search",
  "Social Media",
  "Conference / Event",
  "Existing Client",
  "Other",
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
    notes: "",
    referral: "",
    consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; message: string } | undefined
  >();

  const handleChange = <K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(undefined);
    try {
      if (!form.consent) {
        throw new Error(
          locale === "ar"
            ? "يرجى الموافقة على الشروط قبل الإرسال."
            : "Please accept the consent before submitting."
        );
      }
      const budget = budgetOptions.find(
        (option) => option.value === form.budgetRange
      );
      if (!budget) {
        throw new Error(
          locale === "ar"
            ? "يرجى تحديد نطاق الميزانية."
            : "Please select a budget range."
        );
      }
      await createQuotationRequestApi({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        companyName: form.company || undefined,
        serviceId: form.serviceType || "custom",
        projectDescription: form.projectDesc,
        budget: {
          from: budget.from,
          to: budget.to,
        },
        expectedDuration: form.duration || "unspecified",
        startDate: form.startDate,
        endDate: form.endDate,
        additionalInfo: [form.notes, form.referral].filter(Boolean).join(" — "),
      });
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
        notes: "",
        referral: "",
        consent: false,
      });
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
                <Field label={copy.labels.fullName}>
                  <Input
                    placeholder={copy.placeholders.fullName}
                    required
                    className={inputClasses}
                    value={form.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                  />
                </Field>
                <Field label={copy.labels.email}>
                  <Input
                    type="email"
                    placeholder={copy.placeholders.email}
                    required
                    className={inputClasses}
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </Field>
                <Field label={copy.labels.phone}>
                  <Input
                    placeholder={copy.placeholders.phone}
                    className={inputClasses}
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </Field>
                <Field label={copy.labels.company}>
                  <Input
                    placeholder={copy.placeholders.company}
                    className={inputClasses}
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
                <Field label={copy.labels.serviceType}>
                  <select
                    className={selectClasses}
                    value={form.serviceType}
                    onChange={(e) =>
                      handleChange("serviceType", e.target.value)
                    }
                  >
                    <option value="">{copy.select.service}</option>
                    {serviceOptions.map((option) => (
                      <option
                        key={option}
                        value={option}
                        className="text-black"
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={copy.labels.projectDesc}>
                  <Textarea
                    rows={4}
                    placeholder={copy.placeholders.projectDesc}
                    className={textareaClasses}
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
                <Field label={copy.labels.budgetRange}>
                  <select
                    className={selectClasses}
                    value={form.budgetRange}
                    onChange={(e) =>
                      handleChange("budgetRange", e.target.value)
                    }
                    required
                  >
                    <option value="">{copy.select.budget}</option>
                    {budgetOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="text-black"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={copy.labels.duration}>
                  <select
                    className={selectClasses}
                    value={form.duration}
                    onChange={(e) => handleChange("duration", e.target.value)}
                  >
                    <option value="">{copy.select.duration}</option>
                    {durationOptions.map((option) => (
                      <option
                        key={option}
                        value={option}
                        className="text-black"
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={copy.labels.startDate}>
                  <Input
                    type="date"
                    className={inputClasses}
                    value={form.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    required
                  />
                </Field>
                <Field label={copy.labels.endDate}>
                  <Input
                    type="date"
                    className={inputClasses}
                    value={form.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    required
                  />
                </Field>
              </div>
            </Section>

            <Section
              title={copy.sections.additional}
              icon={<ClipboardCheck className="h-5 w-5 text-primary" />}
            >
              <div className="grid gap-4">
                <Field label={copy.labels.notes}>
                  <Textarea
                    rows={4}
                    placeholder={copy.placeholders.notes}
                    className={textareaClasses}
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                  />
                </Field>

                <Field label={copy.labels.referral}>
                  <select
                    className={selectClasses}
                    value={form.referral}
                    onChange={(e) => handleChange("referral", e.target.value)}
                  >
                    <option value="">{copy.select.referral}</option>
                    {referralOptions.map((option) => (
                      <option
                        key={option}
                        value={option}
                        className="text-black"
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>

                <label className="flex items-start gap-3 text-xs text-white/80">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-primary focus:ring-primary"
                    required
                    checked={form.consent}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        consent: e.target.checked,
                      }))
                    }
                  />
                  <span>{copy.labels.consent}</span>
                </label>
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
              <span className="text-xs text-white/70">{copy.consentNote}</span>
            </div>
          </form>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {copy.contactCards.map((card) => {
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
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm text-white/80 space-y-2">
      <span>{label}</span>
      {children}
    </label>
  );
}
