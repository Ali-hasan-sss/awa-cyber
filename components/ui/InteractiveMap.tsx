"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface InteractiveMapProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
}

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: any) => any;
        Marker: new (options: any) => any;
        LatLng: new (lat: number, lng: number) => any;
        Animation: {
          DROP: any;
        };
      };
    };
    initMap?: () => void;
    [key: string]: any; // For dynamic callback names
  }
}

export default function InteractiveMap({
  lat,
  lng,
  onLocationChange,
  height = "300px",
}: InteractiveMapProps) {
  const { locale } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const onLocationChangeRef = useRef(onLocationChange);

  // Keep callback ref updated
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    let isMounted = true;
    let checkInterval: NodeJS.Timeout | null = null;

    const initializeMap = () => {
      if (!mapRef.current || !window.google || !window.google.maps) {
        console.error("Google Maps not loaded");
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        if (!isMounted) return;

        setIsLoading(false);

        const initialPosition = { lat, lng };

        // Create map
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 15,
          center: initialPosition,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        mapInstanceRef.current = map;

        // Create marker
        const marker = new window.google.maps.Marker({
          position: initialPosition,
          map: map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
        });

        markerRef.current = marker;

        // Update coordinates when marker is dragged
        marker.addListener("dragend", (e: any) => {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          onLocationChangeRef.current(newLat, newLng);
        });

        // Update coordinates when map is clicked
        map.addListener("click", (e: any) => {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          marker.setPosition({ lat: newLat, lng: newLng });
          onLocationChangeRef.current(newLat, newLng);
        });
      } catch (error) {
        console.error("Error initializing map:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) {
      // Wait for script to load
      checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          if (checkInterval) clearInterval(checkInterval);
          initializeMap();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (checkInterval) {
          clearInterval(checkInterval);
        }
        if (isMounted && (!window.google || !window.google.maps)) {
          setIsLoading(false);
          console.error("Google Maps failed to load");
        }
      }, 10000);

      return () => {
        if (checkInterval) clearInterval(checkInterval);
        isMounted = false;
      };
    }

    // Try to load without API key first (for development)
    // If that fails, use embed method
    const tryLoadMaps = () => {
      // Generate unique callback name to avoid conflicts
      const callbackName = `initMap_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Set callback function
      (window as any)[callbackName] = () => {
        if (isMounted) {
          initializeMap();
        }
        // Clean up callback
        delete (window as any)[callbackName];
      };

      // Load Google Maps API without API key (works for basic usage)
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?libraries=places&callback=${callbackName}`;
      script.async = true;
      script.defer = true;

      script.onerror = () => {
        if (isMounted) {
          setIsLoading(false);
          console.error("Failed to load Google Maps script");
        }
        delete (window as any)[callbackName];
      };

      script.onload = () => {
        // Script loaded successfully
      };

      document.head.appendChild(script);

      return callbackName;
    };

    const callbackName = tryLoadMaps();

    return () => {
      isMounted = false;
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      const script = document.querySelector(
        `script[src*="maps.googleapis.com"]`
      );
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (callbackName) {
        delete (window as any)[callbackName];
      }
    };
  }, [lat, lng]);

  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && window.google?.maps) {
      const newPosition = new window.google.maps.LatLng(lat, lng);
      markerRef.current.setPosition(newPosition);
      mapInstanceRef.current.setCenter(newPosition);
    }
  }, [lat, lng]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-white/10">
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100"
          style={{ height }}
        >
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {locale === "ar" ? "جاري تحميل الخريطة..." : "Loading map..."}
            </p>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        style={{ height, width: "100%" }}
        className={isLoading ? "hidden" : ""}
      />
      {!isLoading && (
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border border-gray-200 z-10">
          <p className="text-xs font-semibold text-gray-700">
            {locale === "ar"
              ? "💡 انقر على الخريطة أو اسحب العلامة لتحديد الموقع"
              : "💡 Click on map or drag marker to select location"}
          </p>
        </div>
      )}
    </div>
  );
}
