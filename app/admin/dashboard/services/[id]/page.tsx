"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiClient } from "@/lib/apiClient";
import { getSectionsByPage } from "@/lib/api/sections";
import ServiceHero from "@/components/services/ServiceHero";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import ServiceSections from "@/components/services/ServiceSections";
import ServiceFirstSection from "@/components/services/ServiceFirstSection";
import AdminServiceEditor from "@/components/admin/AdminServiceEditor";
import AddFirstSectionForm from "@/components/admin/AddFirstSectionForm";
import AddSecondSectionForm from "@/components/admin/AddSecondSectionForm";
import AddThirdSectionForm from "@/components/admin/AddThirdSectionForm";
import AddFourthSectionForm from "@/components/admin/AddFourthSectionForm";
import AddFifthSectionForm from "@/components/admin/AddFifthSectionForm";
import ServiceSecondSection from "@/components/services/ServiceSecondSection";
import ServiceThirdSection from "@/components/services/ServiceThirdSection";
import ServiceFourthSection from "@/components/services/ServiceFourthSection";
import ServiceFifthSection from "@/components/services/ServiceFifthSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2, Eye, Plus } from "lucide-react";
import Link from "next/link";

export default function AdminServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useLanguage();
  const serviceId = params.id as string;
  const [service, setService] = useState<any>(null);
  const [serviceForDisplay, setServiceForDisplay] = useState<any>(null); // للعرض (localized)
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingFirstSection, setIsAddingFirstSection] = useState(false);
  const [isAddingSecondSection, setIsAddingSecondSection] = useState(false);
  const [isAddingThirdSection, setIsAddingThirdSection] = useState(false);
  const [isAddingFourthSection, setIsAddingFourthSection] = useState(false);
  const [isAddingFifthSection, setIsAddingFifthSection] = useState(false);

  useEffect(() => {
    loadService();
  }, [serviceId, locale]);

  const loadService = async () => {
    try {
      setLoading(true);
      const rawResponse = await apiClient.get(`/api/services/${serviceId}`, {
        headers: { "x-lang": "NOT" },
      });

      const rawServiceData = rawResponse.data;
      setService(rawServiceData);

      // جلب البيانات localized للعرض
      const displayResponse = await apiClient.get(
        `/api/services/public/${serviceId}`,
        {
          headers: { "x-lang": locale },
        }
      );

      const displayServiceData = displayResponse.data;
      // التأكد من أن البيانات تحتوي على images
      if (
        !displayServiceData.images ||
        displayServiceData.images.length === 0
      ) {
        // إذا لم تكن هناك صور، استخدم الصور من البيانات الخام
        displayServiceData.images = rawServiceData.images || [];
      }
      setServiceForDisplay(displayServiceData);

      // جلب الأقسام المرتبطة بالخدمة
      if (displayServiceData.sections) {
        setSections(displayServiceData.sections);
      } else {
        setSections([]);
      }
    } catch (error) {
      console.error("Error loading service:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceUpdated = () => {
    loadService();
    setIsEditing(false);
  };

  const handleFirstSectionAdded = () => {
    loadService();
    setIsAddingFirstSection(false);
  };

  const handleSecondSectionAdded = () => {
    loadService();
    setIsAddingSecondSection(false);
  };

  const handleThirdSectionAdded = () => {
    loadService();
    setIsAddingThirdSection(false);
  };

  const handleFourthSectionAdded = () => {
    loadService();
    setIsAddingFourthSection(false);
  };

  const handleFifthSectionAdded = () => {
    loadService();
    setIsAddingFifthSection(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">
          {locale === "ar" ? "جاري التحميل..." : "Loading..."}
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">
          {locale === "ar" ? "الخدمة غير موجودة" : "Service not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard/services">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 ltr:mr-2 rtl:ml-2 rtl:rotate-180" />
                  {locale === "ar" ? "العودة" : "Back"}
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {locale === "ar" ? "عرض الخدمة" : "View Service"}
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {serviceForDisplay?.title ||
                    (typeof service.title === "string"
                      ? service.title
                      : service.title?.[locale] || service.title?.en || "")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/services/${serviceId}`} target="_blank">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Eye className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                  {locale === "ar" ? "عرض للزبون" : "View as Customer"}
                </Button>
              </Link>
              <Button
                onClick={() => {
                  setIsEditing(!isEditing);
                  setIsAddingFirstSection(false);
                }}
                className={`${
                  isEditing
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-primary hover:bg-primary/90"
                } text-white`}
              >
                <Edit2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {isEditing
                  ? locale === "ar"
                    ? "إلغاء التعديل"
                    : "Cancel Edit"
                  : locale === "ar"
                  ? "تعديل الخدمة"
                  : "Edit Service"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdminServiceEditor
            service={service}
            onUpdated={handleServiceUpdated}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        serviceForDisplay && (
          <div className="relative min-h-screen bg-white">
            {/* Hero Section */}
            <ServiceHero service={serviceForDisplay} />

            {/* First Section - Two Column Layout */}
            {isAddingFirstSection ? (
              <div className="py-16 md:py-24 bg-gray-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <AddFirstSectionForm
                    serviceId={serviceId}
                    section={
                      sections && sections.length > 0 ? sections[0] : null
                    }
                    onSuccess={handleFirstSectionAdded}
                    onCancel={() => setIsAddingFirstSection(false)}
                  />
                </div>
              </div>
            ) : sections && sections.length > 0 && sections[0] ? (
              <div className="relative group">
                <ServiceFirstSection section={sections[0]} />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => {
                      setIsAddingFirstSection(true);
                      setIsEditing(false);
                    }}
                    className="bg-primary hover:bg-primary/90 text-white"
                    size="sm"
                  >
                    <Edit2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    {locale === "ar" ? "تعديل" : "Edit"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-2xl mx-auto text-center">
                    <p className="text-gray-600 mb-6">
                      {locale === "ar"
                        ? "لا يوجد قسم أول. أضف القسم الأول لعرضه هنا."
                        : "No first section. Add the first section to display it here."}
                    </p>
                    <Button
                      onClick={() => {
                        setIsAddingFirstSection(true);
                        setIsEditing(false);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      {locale === "ar"
                        ? "إضافة القسم الأول"
                        : "Add First Section"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Content Section */}
            <div className="relative z-10 bg-white">
              <ServiceFeatures service={serviceForDisplay} />

              {/* Second Section - Key Features & Benefits */}
              {isAddingSecondSection ? (
                <div className="py-16 md:py-24 bg-gray-900">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <AddSecondSectionForm
                      serviceId={serviceId}
                      section={
                        sections && sections.length > 1 ? sections[1] : null
                      }
                      onSuccess={handleSecondSectionAdded}
                      onCancel={() => setIsAddingSecondSection(false)}
                    />
                  </div>
                </div>
              ) : sections && sections.length > 1 && sections[1] ? (
                <div className="relative group">
                  <ServiceSecondSection section={sections[1]} />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => {
                        setIsAddingSecondSection(true);
                        setIsEditing(false);
                        setIsAddingFirstSection(false);
                      }}
                      className="bg-primary hover:bg-primary/90 text-white"
                      size="sm"
                    >
                      <Edit2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      {locale === "ar" ? "تعديل" : "Edit"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-16 md:py-24 bg-white">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl mx-auto text-center">
                      <p className="text-gray-600 mb-6">
                        {locale === "ar"
                          ? "لا يوجد قسم ثاني. أضف القسم الثاني لعرضه هنا."
                          : "No second section. Add the second section to display it here."}
                      </p>
                      <Button
                        onClick={() => {
                          setIsAddingSecondSection(true);
                          setIsEditing(false);
                          setIsAddingFirstSection(false);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {locale === "ar"
                          ? "إضافة القسم الثاني"
                          : "Add Second Section"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Third Section - Our Process */}
              {isAddingThirdSection ? (
                <div className="py-16 md:py-24 bg-gray-900">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <AddThirdSectionForm
                      serviceId={serviceId}
                      section={
                        sections && sections.length > 2 ? sections[2] : null
                      }
                      onSuccess={handleThirdSectionAdded}
                      onCancel={() => setIsAddingThirdSection(false)}
                    />
                  </div>
                </div>
              ) : sections && sections.length > 2 && sections[2] ? (
                <div className="relative group">
                  <ServiceThirdSection section={sections[2]} />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => {
                        setIsAddingThirdSection(true);
                        setIsEditing(false);
                        setIsAddingFirstSection(false);
                        setIsAddingSecondSection(false);
                      }}
                      className="bg-primary hover:bg-primary/90 text-white"
                      size="sm"
                    >
                      <Edit2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      {locale === "ar" ? "تعديل" : "Edit"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-16 md:py-24 bg-white">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl mx-auto text-center">
                      <p className="text-gray-600 mb-6">
                        {locale === "ar"
                          ? "لا يوجد قسم ثالث. أضف القسم الثالث لعرضه هنا."
                          : "No third section. Add the third section to display it here."}
                      </p>
                      <Button
                        onClick={() => {
                          setIsAddingThirdSection(true);
                          setIsEditing(false);
                          setIsAddingFirstSection(false);
                          setIsAddingSecondSection(false);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {locale === "ar"
                          ? "إضافة القسم الثالث"
                          : "Add Third Section"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Fourth Section - Recent Projects */}
              {isAddingFourthSection ? (
                <div className="py-16 md:py-24 bg-gray-900">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <AddFourthSectionForm
                      serviceId={serviceId}
                      section={
                        sections && sections.length > 3 ? sections[3] : null
                      }
                      onSuccess={handleFourthSectionAdded}
                      onCancel={() => setIsAddingFourthSection(false)}
                    />
                  </div>
                </div>
              ) : sections && sections.length > 3 && sections[3] ? (
                <div className="relative group">
                  <ServiceFourthSection
                    section={sections[3]}
                    serviceId={serviceId}
                  />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => {
                        setIsAddingFourthSection(true);
                        setIsEditing(false);
                        setIsAddingFirstSection(false);
                        setIsAddingSecondSection(false);
                        setIsAddingThirdSection(false);
                      }}
                      className="bg-primary hover:bg-primary/90 text-white"
                      size="sm"
                    >
                      <Edit2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      {locale === "ar" ? "تعديل" : "Edit"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-16 md:py-24 bg-white">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl mx-auto text-center">
                      <p className="text-gray-600 mb-6">
                        {locale === "ar"
                          ? "لا يوجد قسم رابع. أضف القسم الرابع لعرضه هنا."
                          : "No fourth section. Add the fourth section to display it here."}
                      </p>
                      <Button
                        onClick={() => {
                          setIsAddingFourthSection(true);
                          setIsEditing(false);
                          setIsAddingFirstSection(false);
                          setIsAddingSecondSection(false);
                          setIsAddingThirdSection(false);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {locale === "ar"
                          ? "إضافة القسم الرابع"
                          : "Add Fourth Section"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Fifth Section - Call to Action */}
              {isAddingFifthSection ? (
                <div className="py-16 md:py-24 bg-gray-900">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <AddFifthSectionForm
                      serviceId={serviceId}
                      section={
                        sections && sections.length > 4 ? sections[4] : null
                      }
                      onSuccess={handleFifthSectionAdded}
                      onCancel={() => setIsAddingFifthSection(false)}
                    />
                  </div>
                </div>
              ) : sections && sections.length > 4 && sections[4] ? (
                <div className="relative group">
                  <ServiceFifthSection section={sections[4]} />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => {
                        setIsAddingFifthSection(true);
                        setIsEditing(false);
                        setIsAddingFirstSection(false);
                        setIsAddingSecondSection(false);
                        setIsAddingThirdSection(false);
                        setIsAddingFourthSection(false);
                      }}
                      className="bg-primary hover:bg-primary/90 text-white"
                      size="sm"
                    >
                      <Edit2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      {locale === "ar" ? "تعديل" : "Edit"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-16 md:py-24 bg-white">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl mx-auto text-center">
                      <p className="text-gray-600 mb-6">
                        {locale === "ar"
                          ? "لا يوجد قسم خامس. أضف القسم الخامس لعرضه هنا."
                          : "No fifth section. Add the fifth section to display it here."}
                      </p>
                      <Button
                        onClick={() => {
                          setIsAddingFifthSection(true);
                          setIsEditing(false);
                          setIsAddingFirstSection(false);
                          setIsAddingSecondSection(false);
                          setIsAddingThirdSection(false);
                          setIsAddingFourthSection(false);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {locale === "ar"
                          ? "إضافة القسم الخامس"
                          : "Add Fifth Section"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Sections */}
              {sections && sections.length > 5 && (
                <ServiceSections sections={sections.slice(5)} />
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
