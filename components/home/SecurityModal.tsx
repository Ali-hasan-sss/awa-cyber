"use client";

import { CheckCircle2, Phone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type SectionContent = {
  title?: string;
  description?: string;
  features?: string[];
  buttons?: {
    quote?: string;
    call?: string;
  };
  privacy?: string;
};

const fallbackContent: SectionContent = {
  title: "Ready to Secure Your Business?",
  description:
    "Don't wait for a security breach to take action. Get a comprehensive security assessment and protect your business from cyber threats today.",
  features: ["Free Consultation", "No Commitment", "Expert Guidance"],
  buttons: {
    quote: "Get Your Free Quote",
    call: "Schedule a Call",
  },
  privacy: "Your information is secure and confidential",
};

export default function SecurityModal() {
  const { messages } = useLanguage();

  const content: SectionContent = {
    ...fallbackContent,
    ...(messages?.securityModal ?? {}),
  };

  const features = content.features ?? fallbackContent.features!;

  return (
    <section className="relative bg-gradient-to-b from-gray-900 to-black py-20 md:py-28 text-white overflow-hidden">
      {/* Yellow light spots - top right and bottom left */}
      <div className="absolute top-0 ltr:right-0 rtl:left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 ltr:left-0 rtl:right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-gradient-to-b from-primary via-primary to-primary/90 rounded-3xl p-8 md:p-10 shadow-2xl">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white border-4 border-primary/20">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-4">
              {content.title}
            </h2>

            {/* Description */}
            <p className="text-base text-gray-700 text-center mb-6 leading-relaxed">
              {content.description}
            </p>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-black text-white shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button className="flex-1 bg-white text-black hover:bg-gray-100 rounded-full px-6 py-3 font-semibold shadow-lg">
                <CheckCircle2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {content.buttons?.quote}
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-white/90 text-black hover:bg-white border-2 border-black/20 rounded-full px-6 py-3 font-semibold shadow-lg"
              >
                <Phone className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {content.buttons?.call}
              </Button>
            </div>

            {/* Privacy Note */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <Lock className="h-3 w-3" />
              <span>{content.privacy}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
