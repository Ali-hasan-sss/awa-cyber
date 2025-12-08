"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";

  const content = {
    en: {
      title: "Terms of Service",
      lastUpdated: "Last Updated: January 2025",
      sections: [
        {
          title: "1. Acceptance of Terms",
          content: [
            "By accessing and using AWA Cyber's website and services, you accept and agree to be bound by the terms and provision of this agreement.",
            "If you do not agree to abide by the above, please do not use this service.",
          ],
        },
        {
          title: "2. Use License",
          content: [
            "Permission is granted to temporarily download one copy of the materials on AWA Cyber's website for personal, non-commercial transitory viewing only.",
            "This is the grant of a license, not a transfer of title, and under this license you may not:",
            "• Modify or copy the materials",
            "• Use the materials for any commercial purpose or for any public display",
            "• Attempt to decompile or reverse engineer any software contained on the website",
            "• Remove any copyright or other proprietary notations from the materials",
          ],
        },
        {
          title: "3. Service Description",
          content: [
            "AWA Cyber provides cybersecurity services including but not limited to:",
            "• Penetration testing and security audits",
            "• Web application security assessments",
            "• Network security consulting",
            "• Cloud security solutions",
            "• Security training and awareness programs",
            "All services are provided subject to availability and our professional assessment of your requirements.",
          ],
        },
        {
          title: "4. User Responsibilities",
          content: [
            "You are responsible for maintaining the confidentiality of your account and password.",
            "You agree to notify us immediately of any unauthorized use of your account.",
            "You agree to provide accurate, current, and complete information during the registration process.",
            "You agree not to use the service for any unlawful purpose or in any way that could damage, disable, or impair the service.",
          ],
        },
        {
          title: "5. Payment Terms",
          content: [
            "Payment terms will be specified in individual service agreements.",
            "All fees are non-refundable unless otherwise stated in writing.",
            "We reserve the right to change our pricing at any time, but such changes will not affect existing agreements.",
          ],
        },
        {
          title: "6. Intellectual Property",
          content: [
            "All content, including but not limited to text, graphics, logos, and software, is the property of AWA Cyber or its content suppliers.",
            "You may not reproduce, distribute, modify, or create derivative works from any content without express written permission.",
          ],
        },
        {
          title: "7. Limitation of Liability",
          content: [
            "AWA Cyber shall not be liable for any indirect, incidental, special, consequential, or punitive damages.",
            "Our total liability for any claims arising from or related to the use of our services shall not exceed the amount paid by you for the services in the 12 months preceding the claim.",
          ],
        },
        {
          title: "8. Termination",
          content: [
            "We reserve the right to terminate or suspend your access to our services at any time, without prior notice, for any reason.",
            "Upon termination, your right to use the service will immediately cease.",
          ],
        },
        {
          title: "9. Changes to Terms",
          content: [
            "We reserve the right to modify these terms at any time.",
            "Your continued use of the service after any such changes constitutes your acceptance of the new terms.",
            "We encourage you to review these terms periodically.",
          ],
        },
        {
          title: "10. Contact Information",
          content: [
            "If you have any questions about these Terms of Service, please contact us at:",
            "Email: legal@awacyber.com",
            "We will respond to your inquiry within a reasonable timeframe.",
          ],
        },
      ],
    },
    ar: {
      title: "شروط الاستخدام",
      lastUpdated: "آخر تحديث: يناير 2025",
      sections: [
        {
          title: "1. قبول الشروط",
          content: [
            "من خلال الوصول إلى موقع AWA Cyber واستخدامه وخدماته، فإنك تقبل وتوافق على الالتزام بشروط وأحكام هذه الاتفاقية.",
            "إذا كنت لا توافق على الالتزام بما ورد أعلاه، يرجى عدم استخدام هذه الخدمة.",
          ],
        },
        {
          title: "2. ترخيص الاستخدام",
          content: [
            "يُمنح الإذن بتنزيل نسخة واحدة مؤقتة من المواد الموجودة على موقع AWA Cyber للعرض الشخصي غير التجاري المؤقت فقط.",
            "هذا منح ترخيص وليس نقل ملكية، وبموجب هذا الترخيص لا يجوز لك:",
            "• تعديل أو نسخ المواد",
            "• استخدام المواد لأي غرض تجاري أو للعرض العام",
            "• محاولة إلغاء التجميع أو الهندسة العكسية لأي برنامج موجود على الموقع",
            "• إزالة أي إشعارات حقوق النشر أو الملكية الأخرى من المواد",
          ],
        },
        {
          title: "3. وصف الخدمة",
          content: [
            "توفر AWA Cyber خدمات الأمن السيبراني بما في ذلك على سبيل المثال لا الحصر:",
            "• اختبار الاختراق والتدقيق الأمني",
            "• تقييمات أمان تطبيقات الويب",
            "• استشارات أمان الشبكة",
            "• حلول أمان السحابة",
            "• برامج التدريب والتوعية الأمنية",
            "يتم تقديم جميع الخدمات وفقًا للتوفر وتقييمنا المهني لمتطلباتك.",
          ],
        },
        {
          title: "4. مسؤوليات المستخدم",
          content: [
            "أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور.",
            "تتعهد بإبلاغنا فورًا عن أي استخدام غير مصرح به لحسابك.",
            "تتعهد بتقديم معلومات دقيقة وحديثة وكاملة أثناء عملية التسجيل.",
            "تتعهد بعدم استخدام الخدمة لأي غرض غير قانوني أو بأي طريقة قد تلحق الضرر أو تعطل أو تضعف الخدمة.",
          ],
        },
        {
          title: "5. شروط الدفع",
          content: [
            "سيتم تحديد شروط الدفع في اتفاقيات الخدمة الفردية.",
            "جميع الرسوم غير قابلة للاسترداد ما لم يُنص على خلاف ذلك كتابيًا.",
            "نحتفظ بالحق في تغيير أسعارنا في أي وقت، لكن هذه التغييرات لن تؤثر على الاتفاقيات الموجودة.",
          ],
        },
        {
          title: "6. الملكية الفكرية",
          content: [
            "جميع المحتويات، بما في ذلك على سبيل المثال لا الحصر النصوص والرسومات والشعارات والبرمجيات، هي ملكية AWA Cyber أو موردي المحتوى.",
            "لا يجوز لك نسخ أو توزيع أو تعديل أو إنشاء أعمال مشتقة من أي محتوى دون إذن كتابي صريح.",
          ],
        },
        {
          title: "7. تحديد المسؤولية",
          content: [
            "لن تكون AWA Cyber مسؤولة عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو عقابية.",
            "إجمالي مسؤوليتنا عن أي مطالبات تنشأ عن أو تتعلق باستخدام خدماتنا لا تتجاوز المبلغ الذي دفعته مقابل الخدمات في الـ 12 شهرًا السابقة للمطالبة.",
          ],
        },
        {
          title: "8. الإنهاء",
          content: [
            "نحتفظ بالحق في إنهاء أو تعليق وصولك إلى خدماتنا في أي وقت، دون إشعار مسبق، لأي سبب.",
            "عند الإنهاء، سيتوقف حقك في استخدام الخدمة فورًا.",
          ],
        },
        {
          title: "9. تغييرات الشروط",
          content: [
            "نحتفظ بالحق في تعديل هذه الشروط في أي وقت.",
            "استمرارك في استخدام الخدمة بعد أي من هذه التغييرات يشكل قبولك للشروط الجديدة.",
            "نشجعك على مراجعة هذه الشروط بشكل دوري.",
          ],
        },
        {
          title: "10. معلومات الاتصال",
          content: [
            "إذا كان لديك أي أسئلة حول شروط الخدمة هذه، يرجى الاتصال بنا على:",
            "البريد الإلكتروني: legal@awacyber.com",
            "سنرد على استفسارك في غضون إطار زمني معقول.",
          ],
        },
      ],
    },
  };

  const pageContent = content[locale as keyof typeof content] || content.en;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-20 pb-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {pageContent.title}
              </h1>
              <p className="text-lg text-gray-300">{pageContent.lastUpdated}</p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-12">
                {pageContent.sections.map((section, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-border/60 p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                        {section.title}
                      </h2>
                    </div>
                    <div className="space-y-4 rtl:text-right ltr:text-left">
                      {section.content.map((paragraph, pIndex) => (
                        <p
                          key={pIndex}
                          className="text-base md:text-lg text-muted-foreground leading-relaxed flex items-start gap-3"
                        >
                          {paragraph.startsWith("•") ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                              <span>{paragraph.substring(1).trim()}</span>
                            </>
                          ) : (
                            paragraph
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact CTA */}
              <div className="mt-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 md:p-10 text-center border border-primary/20">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {isArabic ? "هل لديك أسئلة؟" : "Have Questions?"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {isArabic
                    ? "إذا كان لديك أي استفسارات حول شروط الخدمة، لا تتردد في الاتصال بنا."
                    : "If you have any questions about our terms of service, please don't hesitate to contact us."}
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  {isArabic ? "اتصل بنا" : "Contact Us"}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
