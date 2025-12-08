"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ShieldCheck, Lock, Eye, Database, CheckCircle2 } from "lucide-react";

export default function PrivacyPage() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";

  const content = {
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last Updated: January 2025",
      intro:
        "At AWA Cyber, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.",
      sections: [
        {
          title: "1. Information We Collect",
          icon: Database,
          content: [
            "We collect information that you provide directly to us, including:",
            "• Personal information such as name, email address, phone number, and company details",
            "• Information you provide when contacting us or requesting our services",
            "• Payment information when you purchase our services",
            "• We also automatically collect certain information when you visit our website, including:",
            "• IP address and browser type",
            "• Pages visited and time spent on our website",
            "• Referring website addresses",
            "• Device information and operating system",
          ],
        },
        {
          title: "2. How We Use Your Information",
          icon: Eye,
          content: [
            "We use the information we collect to:",
            "• Provide, maintain, and improve our services",
            "• Process your requests and transactions",
            "• Send you technical notices, updates, and support messages",
            "• Respond to your comments, questions, and requests",
            "• Monitor and analyze trends, usage, and activities",
            "• Detect, prevent, and address technical issues and security threats",
            "• Comply with legal obligations and enforce our terms",
          ],
        },
        {
          title: "3. Information Sharing and Disclosure",
          icon: ShieldCheck,
          content: [
            "We do not sell, trade, or rent your personal information to third parties.",
            "We may share your information only in the following circumstances:",
            "• With your explicit consent",
            "• To comply with legal obligations or respond to legal requests",
            "• To protect our rights, privacy, safety, or property",
            "• With service providers who assist us in operating our website and conducting our business",
            "• In connection with a merger, acquisition, or sale of assets",
          ],
        },
        {
          title: "4. Data Security",
          icon: Lock,
          content: [
            "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
            "These measures include:",
            "• Encryption of sensitive data",
            "• Secure servers and databases",
            "• Regular security assessments and updates",
            "• Access controls and authentication mechanisms",
            "• Employee training on data protection",
            "However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.",
          ],
        },
        {
          title: "5. Your Rights and Choices",
          icon: CheckCircle2,
          content: [
            "You have the right to:",
            "• Access and receive a copy of your personal information",
            "• Request correction of inaccurate or incomplete information",
            "• Request deletion of your personal information",
            "• Object to processing of your personal information",
            "• Request restriction of processing",
            "• Data portability",
            "• Withdraw consent at any time",
            "To exercise these rights, please contact us using the information provided in the Contact section.",
          ],
        },
        {
          title: "6. Cookies and Tracking Technologies",
          content: [
            "We use cookies and similar tracking technologies to track activity on our website and hold certain information.",
            "You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.",
            "However, if you do not accept cookies, you may not be able to use some portions of our website.",
          ],
        },
        {
          title: "7. Third-Party Links",
          content: [
            "Our website may contain links to third-party websites that are not operated by us.",
            "We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services.",
            "We encourage you to review the privacy policies of any third-party sites you visit.",
          ],
        },
        {
          title: "8. Children's Privacy",
          content: [
            "Our services are not directed to individuals under the age of 18.",
            "We do not knowingly collect personal information from children under 18.",
            "If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.",
          ],
        },
        {
          title: "9. Changes to This Privacy Policy",
          content: [
            "We may update our Privacy Policy from time to time.",
            "We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Last Updated' date.",
            "You are advised to review this Privacy Policy periodically for any changes.",
          ],
        },
        {
          title: "10. Contact Us",
          content: [
            "If you have any questions about this Privacy Policy, please contact us at:",
            "Email: privacy@awacyber.com",
            "We will respond to your inquiry within a reasonable timeframe.",
          ],
        },
      ],
    },
    ar: {
      title: "سياسة الخصوصية",
      lastUpdated: "آخر تحديث: يناير 2025",
      intro:
        "في AWA Cyber، نحن ملتزمون بحماية خصوصيتك وضمان أمان معلوماتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وكشف وحماية معلوماتك عند زيارة موقعنا واستخدام خدماتنا.",
      sections: [
        {
          title: "1. المعلومات التي نجمعها",
          icon: Database,
          content: [
            "نجمع المعلومات التي تقدمها لنا مباشرة، بما في ذلك:",
            "• المعلومات الشخصية مثل الاسم وعنوان البريد الإلكتروني ورقم الهاتف وتفاصيل الشركة",
            "• المعلومات التي تقدمها عند الاتصال بنا أو طلب خدماتنا",
            "• معلومات الدفع عند شراء خدماتنا",
            "• كما نجمع تلقائيًا معلومات معينة عند زيارة موقعنا، بما في ذلك:",
            "• عنوان IP ونوع المتصفح",
            "• الصفحات التي تمت زيارتها والوقت الذي تم قضاؤه على موقعنا",
            "• عناوين المواقع المرجعية",
            "• معلومات الجهاز ونظام التشغيل",
          ],
        },
        {
          title: "2. كيفية استخدام معلوماتك",
          icon: Eye,
          content: [
            "نستخدم المعلومات التي نجمعها لـ:",
            "• تقديم وصيانة وتحسين خدماتنا",
            "• معالجة طلباتك ومعاملاتك",
            "• إرسال إشعارات تقنية وتحديثات ورسائل دعم",
            "• الرد على تعليقاتك وأسئلتك وطلباتك",
            "• مراقبة وتحليل الاتجاهات والاستخدام والأنشطة",
            "• اكتشاف ومنع ومعالجة المشكلات التقنية والتهديدات الأمنية",
            "• الامتثال للالتزامات القانونية وإنفاذ شروطنا",
          ],
        },
        {
          title: "3. مشاركة المعلومات والكشف عنها",
          icon: ShieldCheck,
          content: [
            "لا نبيع أو نتاجر أو نؤجر معلوماتك الشخصية لأطراف ثالثة.",
            "قد نشارك معلوماتك فقط في الحالات التالية:",
            "• بموافقتك الصريحة",
            "• للامتثال للالتزامات القانونية أو الرد على الطلبات القانونية",
            "• لحماية حقوقنا أو خصوصيتنا أو سلامتنا أو ممتلكاتنا",
            "• مع مقدمي الخدمات الذين يساعدوننا في تشغيل موقعنا وإدارة أعمالنا",
            "• فيما يتعلق بالاندماج أو الاستحواذ أو بيع الأصول",
          ],
        },
        {
          title: "4. أمان البيانات",
          icon: Lock,
          content: [
            "نطبق تدابير أمنية تقنية وتنظيمية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التعديل أو الكشف أو التدمير.",
            "تشمل هذه التدابير:",
            "• تشفير البيانات الحساسة",
            "• خوادم وقواعد بيانات آمنة",
            "• تقييمات وتحديثات أمنية منتظمة",
            "• ضوابط الوصول وآليات المصادقة",
            "• تدريب الموظفين على حماية البيانات",
            "ومع ذلك، لا توجد طريقة نقل عبر الإنترنت أو التخزين الإلكتروني آمنة بنسبة 100%، ولا يمكننا ضمان الأمان المطلق.",
          ],
        },
        {
          title: "5. حقوقك وخياراتك",
          icon: CheckCircle2,
          content: [
            "لديك الحق في:",
            "• الوصول إلى معلوماتك الشخصية والحصول على نسخة منها",
            "• طلب تصحيح المعلومات غير الدقيقة أو غير المكتملة",
            "• طلب حذف معلوماتك الشخصية",
            "• الاعتراض على معالجة معلوماتك الشخصية",
            "• طلب تقييد المعالجة",
            "• قابلية نقل البيانات",
            "• سحب الموافقة في أي وقت",
            "لممارسة هذه الحقوق، يرجى الاتصال بنا باستخدام المعلومات المقدمة في قسم الاتصال.",
          ],
        },
        {
          title: "6. ملفات تعريف الارتباط وتقنيات التتبع",
          content: [
            "نستخدم ملفات تعريف الارتباط وتقنيات التتبع المماثلة لتتبع النشاط على موقعنا والاحتفاظ بمعلومات معينة.",
            "يمكنك توجيه متصفحك لرفض جميع ملفات تعريف الارتباط أو الإشارة عند إرسال ملف تعريف الارتباط.",
            "ومع ذلك، إذا لم تقبل ملفات تعريف الارتباط، فقد لا تتمكن من استخدام بعض أجزاء موقعنا.",
          ],
        },
        {
          title: "7. روابط الطرف الثالث",
          content: [
            "قد يحتوي موقعنا على روابط لمواقع طرف ثالث لا نعملها.",
            "ليس لدينا سيطرة ولا نتحمل أي مسؤولية عن محتوى أو سياسات الخصوصية أو ممارسات أي مواقع أو خدمات طرف ثالث.",
            "نشجعك على مراجعة سياسات الخصوصية لأي مواقع طرف ثالث تزورها.",
          ],
        },
        {
          title: "8. خصوصية الأطفال",
          content: [
            "خدماتنا ليست موجهة للأفراد الذين تقل أعمارهم عن 18 عامًا.",
            "لا نجمع معلومات شخصية من الأطفال دون سن 18 عامًا عن علم.",
            "إذا كنت والدًا أو وصيًا وتعتقد أن طفلك قد زودنا بمعلومات شخصية، يرجى الاتصال بنا فورًا.",
          ],
        },
        {
          title: "9. تغييرات سياسة الخصوصية هذه",
          content: [
            "قد نحدث سياسة الخصوصية الخاصة بنا من وقت لآخر.",
            "سنخطرك بأي تغييرات عن طريق نشر سياسة الخصوصية الجديدة على هذه الصفحة وتحديث تاريخ 'آخر تحديث'.",
            "يُنصح بمراجعة سياسة الخصوصية هذه بشكل دوري لأي تغييرات.",
          ],
        },
        {
          title: "10. اتصل بنا",
          content: [
            "إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا على:",
            "البريد الإلكتروني: privacy@awacyber.com",
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
                  <Lock className="w-8 h-8 text-primary" />
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
              {/* Introduction */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 md:p-10 mb-12 border border-primary/20">
                <p className="text-lg text-muted-foreground leading-relaxed rtl:text-right ltr:text-left">
                  {pageContent.intro}
                </p>
              </div>

              <div className="space-y-12">
                {pageContent.sections.map((section, index) => {
                  const IconComponent = section.icon || ShieldCheck;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-2xl border border-border/60 p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-primary" />
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
                  );
                })}
              </div>

              {/* Contact CTA */}
              <div className="mt-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 md:p-10 text-center border border-primary/20">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {isArabic
                    ? "هل لديك أسئلة حول الخصوصية؟"
                    : "Have Questions About Privacy?"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {isArabic
                    ? "إذا كان لديك أي استفسارات حول سياسة الخصوصية، لا تتردد في الاتصال بنا."
                    : "If you have any questions about our privacy policy, please don't hesitate to contact us."}
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
