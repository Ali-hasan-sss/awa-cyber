"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FileUpload from "@/components/ui/FileUpload";
import {
  Pencil,
  Save,
  X,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  MapPin,
  Phone,
  ChevronDown as ChevronDownIcon,
} from "lucide-react";
import Image from "next/image";
import { getSections, updateSection, Section } from "@/lib/api/sections";
import { normalizeImageUrl } from "@/lib/utils";
import {
  socialIconOptions,
  socialIconComponents,
  SocialIconKey,
} from "@/lib/socialIconOptions";
import InteractiveMap from "@/components/ui/InteractiveMap";

// Helper function to strip HTML tags
const stripHtml = (html: string): string => {
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
  const IconComponent =
    socialIconComponents[iconName as SocialIconKey] ||
    socialIconComponents["Facebook"];
  return IconComponent;
};

export default function ContactHeroSection() {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [heroSection, setHeroSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openIconPicker, setOpenIconPicker] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    image: "",
    features: [] as Array<{
      icon: string;
      nameEn: string;
      nameAr: string;
      descriptionEn: string;
      descriptionAr: string;
      order: number;
    }>,
  });
  const [mapLocation, setMapLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    loadHeroSection();
  }, []);

  // Close icon picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openIconPicker !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest(".icon-picker-container")) {
          setOpenIconPicker(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openIconPicker]);

  const loadHeroSection = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSections({ page: "contact" });
      const sortedData = data.sort((a, b) => a.order - b.order);
      if (sortedData && sortedData.length > 0) {
        const section = sortedData[0];
        setHeroSection(section);
        const features =
          section.features?.map((feature) => ({
            icon: feature.icon,
            nameEn: feature.name?.en || "",
            nameAr: feature.name?.ar || "",
            descriptionEn: feature.description?.en || "",
            descriptionAr: feature.description?.ar || "",
            order: feature.order,
          })) || [];

        // Extract location from third feature (index 2)
        const locationFeature = features[2];
        if (locationFeature) {
          const lat = parseFloat(
            locationFeature.descriptionAr || locationFeature.descriptionEn || ""
          );
          const lng = parseFloat(
            locationFeature.nameAr || locationFeature.nameEn || ""
          );
          if (!isNaN(lat) && !isNaN(lng)) {
            setMapLocation({ lat, lng });
          }
        }

        setForm({
          titleEn: section.title?.en || "",
          titleAr: section.title?.ar || "",
          descriptionEn: section.description?.en || "",
          descriptionAr: section.description?.ar || "",
          image: section.images?.[0] || "",
          features,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load section");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (!heroSection) {
        throw new Error("Section not found");
      }

      // Prepare features with location in third feature
      const features = form.features.map((feature, index) => {
        // Third feature (index 2) stores location coordinates
        if (index === 2 && mapLocation) {
          return {
            icon: feature.icon || "MapPin",
            name: {
              en: mapLocation.lng.toString(),
              ar: mapLocation.lng.toString(),
            },
            description: {
              en: mapLocation.lat.toString(),
              ar: mapLocation.lat.toString(),
            },
            order: feature.order,
          };
        }
        return {
          icon: feature.icon,
          name: {
            en: feature.nameEn,
            ar: feature.nameAr,
          },
          description: {
            en: feature.descriptionEn,
            ar: feature.descriptionAr,
          },
          order: feature.order,
        };
      });

      // Ensure third feature exists for location
      if (mapLocation && features.length < 3) {
        // Add location feature if it doesn't exist
        while (features.length < 2) {
          features.push({
            icon: "",
            name: { en: "", ar: "" },
            description: { en: "", ar: "" },
            order: features.length,
          });
        }
        features.push({
          icon: "MapPin",
          name: {
            en: mapLocation.lat.toString(),
            ar: mapLocation.lng.toString(),
          },
          description: {
            en: mapLocation.lat.toString(),
            ar: mapLocation.lng.toString(),
          },
          order: 2,
        });
      }

      const payload: any = {
        title: {
          en: form.titleEn,
          ar: form.titleAr,
        },
        description: {
          en: form.descriptionEn,
          ar: form.descriptionAr,
        },
        images: form.image ? [form.image] : [],
        features,
      };

      await updateSection(heroSection._id, payload);
      await loadHeroSection();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save section");
    } finally {
      setSubmitting(false);
    }
  };

  const addFeature = () => {
    const newOrder =
      form.features.length > 0
        ? Math.max(...form.features.map((f) => f.order)) + 1
        : form.features.length + 1;

    setForm({
      ...form,
      features: [
        ...form.features,
        {
          icon: "Facebook",
          nameEn: "",
          nameAr: "",
          descriptionEn: "",
          descriptionAr: "",
          order: newOrder,
        },
      ],
    });
  };

  const removeFeature = (index: number) => {
    setForm({
      ...form,
      features: form.features.filter((_, i) => i !== index),
    });
  };

  const moveFeature = (index: number, direction: "up" | "down") => {
    const newFeatures = [...form.features];
    if (direction === "up" && index > 0) {
      [newFeatures[index - 1], newFeatures[index]] = [
        newFeatures[index],
        newFeatures[index - 1],
      ];
      newFeatures[index - 1].order = index;
      newFeatures[index].order = index + 1;
    } else if (direction === "down" && index < newFeatures.length - 1) {
      [newFeatures[index], newFeatures[index + 1]] = [
        newFeatures[index + 1],
        newFeatures[index],
      ];
      newFeatures[index].order = index + 1;
      newFeatures[index + 1].order = index + 2;
    }
    setForm({ ...form, features: newFeatures });
  };

  const updateFeature = (index: number, field: string, value: any) => {
    const newFeatures = [...form.features];
    (newFeatures[index] as any)[field] = value;
    setForm({ ...form, features: newFeatures });
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">Loading...</div>
      </div>
    );
  }

  if (!heroSection) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-center text-white/60">No section found</div>
      </div>
    );
  }

  const addressFeature = form.features[0];
  const phoneFeature = form.features[1];
  const locationFeature = form.features[2];
  const socialFeatures = form.features.slice(3);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          {isArabic ? "قسم الهيرو - اتصل بنا" : "Contact Hero Section"}
        </h2>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-primary text-black hover:bg-primary-dark"
          >
            <Pencil className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            {isArabic ? "تعديل" : "Edit"}
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-6 bg-black/60 p-6 rounded-2xl">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              {isArabic ? "العنوان (إنجليزي)" : "Title (English)"}
            </label>
            <Input
              value={form.titleEn}
              onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder={isArabic ? "Get In Touch" : "Get In Touch"}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              {isArabic ? "العنوان (عربي)" : "Title (Arabic)"}
            </label>
            <Input
              value={form.titleAr}
              onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder={isArabic ? "تواصل معنا" : "تواصل معنا"}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              {isArabic ? "الوصف (إنجليزي)" : "Description (English)"}
            </label>
            <RichTextEditor
              value={form.descriptionEn}
              onChange={(value) => setForm({ ...form, descriptionEn: value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              {isArabic ? "الوصف (عربي)" : "Description (Arabic)"}
            </label>
            <RichTextEditor
              value={form.descriptionAr}
              onChange={(value) => setForm({ ...form, descriptionAr: value })}
            />
          </div>

          {/* Hero Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              {isArabic ? "صورة الخلفية" : "Background Image"}
            </label>
            <FileUpload
              accept="image/*"
              maxSize={10}
              hideUploadedFiles={true}
              onUploadComplete={(url: string) => {
                setForm({ ...form, image: url });
              }}
            />
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {isArabic ? "معلومات الاتصال" : "Contact Information"}
              </h3>
            </div>

            <div className="bg-white/5 p-4 rounded-lg space-y-4">
              <p className="text-sm text-white/70">
                {isArabic
                  ? "الميزة الأولى: العنوان | الميزة الثانية: رقم الهاتف | الميزة الثالثة: موقع الشركة | الميزات من 4 فما فوق: روابط التواصل الاجتماعي"
                  : "First Feature: Address | Second Feature: Phone | Third Feature: Company Location | Features 4+: Social Media Links"}
              </p>

              {/* Address Feature (First) */}
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-white">
                    {isArabic ? "1. العنوان" : "1. Address"}
                  </h4>
                </div>
                {addressFeature ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white/70 block mb-1">
                        {isArabic ? "العنوان (إنجليزي)" : "Address (English)"}
                      </label>
                      <Input
                        value={addressFeature.nameEn}
                        onChange={(e) =>
                          updateFeature(0, "nameEn", e.target.value)
                        }
                        className="bg-white/5 border-white/10 text-white text-sm"
                        placeholder={
                          isArabic ? "New York, USA" : "New York, USA"
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/70 block mb-1">
                        {isArabic ? "العنوان (عربي)" : "Address (Arabic)"}
                      </label>
                      <Input
                        value={addressFeature.nameAr}
                        onChange={(e) =>
                          updateFeature(0, "nameAr", e.target.value)
                        }
                        className="bg-white/5 border-white/10 text-white text-sm"
                        placeholder={
                          isArabic
                            ? "نيويورك، الولايات المتحدة"
                            : "نيويورك، الولايات المتحدة"
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white/50">
                    {isArabic
                      ? "أضف ميزة أولى للعنوان"
                      : "Add first feature for address"}
                  </p>
                )}
              </div>

              {/* Phone Feature (Second) */}
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-white">
                    {isArabic ? "2. رقم الهاتف" : "2. Phone Number"}
                  </h4>
                </div>
                {phoneFeature ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white/70 block mb-1">
                        {isArabic ? "رقم الهاتف (إنجليزي)" : "Phone (English)"}
                      </label>
                      <Input
                        value={phoneFeature.nameEn}
                        onChange={(e) =>
                          updateFeature(1, "nameEn", e.target.value)
                        }
                        className="bg-white/5 border-white/10 text-white text-sm"
                        placeholder={
                          isArabic ? "+1 234 567 8900" : "+1 234 567 8900"
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/70 block mb-1">
                        {isArabic ? "رقم الهاتف (عربي)" : "Phone (Arabic)"}
                      </label>
                      <Input
                        value={phoneFeature.nameAr}
                        onChange={(e) =>
                          updateFeature(1, "nameAr", e.target.value)
                        }
                        className="bg-white/5 border-white/10 text-white text-sm"
                        placeholder={
                          isArabic ? "+1 234 567 8900" : "+1 234 567 8900"
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white/50">
                    {isArabic
                      ? "أضف ميزة ثانية لرقم الهاتف"
                      : "Add second feature for phone"}
                  </p>
                )}
              </div>

              {/* Location Feature (Third) */}
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-white">
                    {isArabic ? "3. موقع الشركة" : "3. Company Location"}
                  </h4>
                </div>
                {form.features[2] ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-white/70 block mb-1">
                          {isArabic ? "خط العرض (Latitude)" : "Latitude"}
                        </label>
                        <Input
                          type="number"
                          step="any"
                          value={mapLocation?.lat || ""}
                          onChange={(e) => {
                            const lat = parseFloat(e.target.value);
                            if (!isNaN(lat)) {
                              setMapLocation((prev) => ({
                                lat,
                                lng: prev?.lng || 46.6753,
                              }));
                              updateFeature(2, "descriptionAr", lat.toString());
                              updateFeature(2, "descriptionEn", lat.toString());
                            }
                          }}
                          className="bg-white/5 border-white/10 text-white text-sm"
                          placeholder="24.7136"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/70 block mb-1">
                          {isArabic ? "خط الطول (Longitude)" : "Longitude"}
                        </label>
                        <Input
                          type="number"
                          step="any"
                          value={mapLocation?.lng || ""}
                          onChange={(e) => {
                            const lng = parseFloat(e.target.value);
                            if (!isNaN(lng)) {
                              setMapLocation((prev) => ({
                                lat: prev?.lat || 24.7136,
                                lng,
                              }));
                              updateFeature(2, "nameAr", lng.toString());
                              updateFeature(2, "nameEn", lng.toString());
                            }
                          }}
                          className="bg-white/5 border-white/10 text-white text-sm"
                          placeholder="46.6753"
                        />
                      </div>
                    </div>
                    <InteractiveMap
                      lat={mapLocation?.lat || 24.7136}
                      lng={mapLocation?.lng || 46.6753}
                      onLocationChange={(newLat, newLng) => {
                        setMapLocation({ lat: newLat, lng: newLng });
                        updateFeature(2, "descriptionAr", newLat.toString());
                        updateFeature(2, "descriptionEn", newLat.toString());
                        updateFeature(2, "nameAr", newLng.toString());
                        updateFeature(2, "nameEn", newLng.toString());
                      }}
                      height="400px"
                    />
                    <p className="text-xs text-white/50">
                      {isArabic
                        ? "💡 انقر على الخريطة أو اسحب العلامة لتحديد الموقع، أو يمكنك تعديل الإحداثيات يدوياً"
                        : "💡 Click on map or drag marker to select location, or edit coordinates manually"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-white/50">
                      {isArabic
                        ? "أضف ميزة ثالثة للموقع"
                        : "Add third feature for location"}
                    </p>
                    <Button
                      type="button"
                      onClick={() => {
                        const newFeatures = [...form.features];
                        while (newFeatures.length < 2) {
                          newFeatures.push({
                            icon: "",
                            nameEn: "",
                            nameAr: "",
                            descriptionEn: "",
                            descriptionAr: "",
                            order: newFeatures.length,
                          });
                        }
                        newFeatures.push({
                          icon: "MapPin",
                          nameEn: "24.7136",
                          nameAr: "46.6753",
                          descriptionEn: "24.7136",
                          descriptionAr: "46.6753",
                          order: 2,
                        });
                        setForm({ ...form, features: newFeatures });
                        setMapLocation({ lat: 24.7136, lng: 46.6753 });
                      }}
                      className="bg-primary/20 text-primary hover:bg-primary/30"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
                      {isArabic ? "إضافة ميزة الموقع" : "Add Location Feature"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Social Media Features (4+) */}
              <div className="bg-white/5 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">
                    {isArabic
                      ? "4+. روابط التواصل الاجتماعي"
                      : "4+. Social Media Links"}
                  </h4>
                  <Button
                    onClick={addFeature}
                    size="sm"
                    className="bg-primary/20 text-primary hover:bg-primary/30"
                  >
                    <Plus className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
                    {isArabic ? "إضافة" : "Add"}
                  </Button>
                </div>
                <p className="text-xs text-white/50 mb-4">
                  {isArabic
                    ? "اختر الأيقونة وأدخل الرابط"
                    : "Select icon and enter link"}
                </p>
                {socialFeatures.map((feature, index) => {
                  const actualIndex = index + 3;
                  return (
                    <div
                      key={actualIndex}
                      className="bg-white/5 p-4 rounded-lg mb-3 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white">
                          {isArabic ? `رابط ${index + 1}` : `Link ${index + 1}`}
                        </span>
                        <div className="flex items-center gap-2">
                          {actualIndex > 2 && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => moveFeature(actualIndex, "up")}
                                className="h-7 w-7 p-0 text-white/70 hover:text-white"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => moveFeature(actualIndex, "down")}
                                className="h-7 w-7 p-0 text-white/70 hover:text-white"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFeature(actualIndex)}
                            className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="relative icon-picker-container">
                          <label className="text-xs text-white/70 block mb-1">
                            {isArabic ? "اختر الأيقونة" : "Select Icon"}
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenIconPicker(
                                openIconPicker === actualIndex
                                  ? null
                                  : actualIndex
                              )
                            }
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between hover:bg-white/10 transition"
                          >
                            <div className="flex items-center gap-2">
                              {(() => {
                                const selectedOption = socialIconOptions.find(
                                  (opt) => opt.value === feature.icon
                                );
                                if (selectedOption) {
                                  const Icon = selectedOption.Icon;
                                  return (
                                    <>
                                      <Icon className="w-4 h-4" />
                                      <span>
                                        {isArabic
                                          ? selectedOption.label.ar
                                          : selectedOption.label.en}
                                      </span>
                                    </>
                                  );
                                }
                                return (
                                  <span className="text-white/50">
                                    {isArabic ? "اختر أيقونة" : "Select icon"}
                                  </span>
                                );
                              })()}
                            </div>
                            <ChevronDownIcon
                              className={`w-4 h-4 transition-transform ${
                                openIconPicker === actualIndex
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>
                          {openIconPicker === actualIndex && (
                            <div className="absolute z-50 w-full mt-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2 max-h-60 overflow-y-auto">
                              <div className="grid grid-cols-2 gap-2">
                                {socialIconOptions.map((option) => {
                                  const Icon = option.Icon;
                                  const isSelected =
                                    feature.icon === option.value;
                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => {
                                        updateFeature(
                                          actualIndex,
                                          "icon",
                                          option.value
                                        );
                                        setOpenIconPicker(null);
                                      }}
                                      className={`p-3 rounded-lg border transition-all flex items-center gap-2 ${
                                        isSelected
                                          ? "bg-primary/20 border-primary text-primary"
                                          : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                      }`}
                                    >
                                      <Icon className="w-5 h-5" />
                                      <span className="text-sm">
                                        {isArabic
                                          ? option.label.ar
                                          : option.label.en}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-white/70 block mb-1">
                            {isArabic ? "الرابط" : "Link"}
                          </label>
                          <Input
                            value={
                              feature.descriptionEn || feature.nameEn || ""
                            }
                            onChange={(e) => {
                              const link = e.target.value;
                              // Ensure full URL (add https:// if missing)
                              let fullLink = link.trim();
                              if (
                                fullLink &&
                                !fullLink.startsWith("http://") &&
                                !fullLink.startsWith("https://")
                              ) {
                                fullLink = `https://${fullLink}`;
                              }
                              // Update description with full link (for navigation)
                              updateFeature(
                                actualIndex,
                                "descriptionEn",
                                fullLink
                              );
                              updateFeature(
                                actualIndex,
                                "descriptionAr",
                                fullLink
                              );
                              // Keep name as display text (domain only)
                              const domain = fullLink
                                .replace(/^https?:\/\//, "")
                                .split("/")[0];
                              updateFeature(actualIndex, "nameEn", domain);
                              updateFeature(actualIndex, "nameAr", domain);
                            }}
                            className="bg-white/5 border-white/10 text-white text-sm"
                            placeholder="https://facebook.com/yourpage"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {socialFeatures.length === 0 && (
                  <p className="text-sm text-white/50 text-center py-4">
                    {isArabic
                      ? "لا توجد روابط تواصل اجتماعي. اضغط 'إضافة' لإضافة رابط."
                      : "No social media links. Click 'Add' to add a link."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={submitting}
              className="bg-primary text-black hover:bg-primary-dark flex-1"
            >
              <Save className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
              {submitting
                ? isArabic
                  ? "جاري الحفظ..."
                  : "Saving..."
                : isArabic
                ? "حفظ"
                : "Save"}
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                loadHeroSection();
              }}
              variant="outline"
              className="flex-1 border-white/10 text-white hover:bg-white/10"
            >
              <X className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* View Mode */}
          <div className="relative h-[40vh] rounded-2xl overflow-hidden">
            {form.image && (
              <Image
                src={normalizeImageUrl(form.image)}
                alt="Hero"
                fill
                className="object-cover"
                style={{ filter: "brightness(0.4)" }}
              />
            )}
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center text-white">
                <h3 className="text-3xl font-bold mb-2">
                  {isArabic ? form.titleAr : form.titleEn}
                </h3>
                {form.descriptionEn && (
                  <p className="text-white/90">
                    {stripHtml(
                      isArabic ? form.descriptionAr : form.descriptionEn
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
