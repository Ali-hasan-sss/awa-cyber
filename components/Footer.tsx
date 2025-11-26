"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";
import Logo from "./ui/logo";
import { useLanguage } from "@/contexts/LanguageContext";

type FooterContent = {
  tagline?: string;
  quickLinks?: {
    title?: string;
    links?: string[];
  };
  services?: {
    title?: string;
    items?: string[];
  };
  contact?: {
    title?: string;
    address?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
  };
  copyright?: string;
  policies?: {
    privacy?: string;
    terms?: string;
    cookies?: string;
  };
};

const fallbackContent: FooterContent = {
  tagline:
    "Protecting businesses from cyber threats with cutting-edge security solutions and expert guidance.",
  quickLinks: {
    title: "Quick Links",
    links: ["Home", "About Us", "Services", "Portfolio", "Contact"],
  },
  services: {
    title: "Our Services",
    items: [
      "Penetration Testing",
      "Security Audits",
      "Web App Security",
      "Network Security",
      "Cloud Security",
    ],
  },
  contact: {
    title: "Get In Touch",
    address: "123 Security Street, Cyber City, CC 12345",
    email: "info@awacyber.com",
    phone: "+1 (234) 567-890",
    whatsapp: "WhatsApp Us",
  },
  copyright: "© 2025 AWA Cyber. All rights reserved.",
  policies: {
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    cookies: "Cookie Policy",
  },
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Instagram, href: "#", label: "Instagram" },
];

export default function Footer() {
  const { messages } = useLanguage();
  const content: FooterContent = {
    ...fallbackContent,
    ...(messages?.footer ?? {}),
  };

  const quickLinks =
    content.quickLinks?.links ?? fallbackContent.quickLinks!.links!;
  const services = content.services?.items ?? fallbackContent.services!.items!;

  return (
    <footer className="relative bg-gray-900 text-white overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/cyber.jpg"
          alt="Footer background"
          fill
          className="object-cover opacity-20"
          priority={false}
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Company Info & Social Media */}
          <div className="space-y-6">
            <Logo />
            <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
              {content.tagline}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-black hover:bg-primary/90 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-6">
              {content.quickLinks?.title}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={
                      link === "Home"
                        ? "/"
                        : `/${link.toLowerCase().replace(/\s+/g, "-")}`
                    }
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary transition-colors group"
                  >
                    <span className="h-1.5 w-1.5 rounded bg-gray-500 group-hover:bg-primary transition-colors" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-6">
              {content.services?.title}
            </h3>
            <ul className="space-y-3">
              {services.map((service, idx) => (
                <li key={idx}>
                  <span className="flex items-center gap-2 text-sm text-gray-300 group cursor-pointer">
                    <span className="h-1.5 w-1.5 rounded bg-gray-500 group-hover:bg-primary transition-colors" />
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Get In Touch */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-6">
              {content.contact?.title}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>{content.contact?.address}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a
                  href={`mailto:${content.contact?.email}`}
                  className="hover:text-primary transition-colors"
                >
                  {content.contact?.email}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a
                  href={`tel:${content.contact?.phone}`}
                  className="hover:text-primary transition-colors"
                >
                  {content.contact?.phone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <MessageCircle className="h-5 w-5 text-primary shrink-0" />
                <a href="#" className="hover:text-primary transition-colors">
                  {content.contact?.whatsapp}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>{content.copyright}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors"
              >
                {content.policies?.privacy}
              </Link>
              <Link
                href="/terms"
                className="hover:text-primary transition-colors"
              >
                {content.policies?.terms}
              </Link>
              <Link
                href="/cookies"
                className="hover:text-primary transition-colors"
              >
                {content.policies?.cookies}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
