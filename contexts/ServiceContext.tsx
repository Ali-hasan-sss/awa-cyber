"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  ServicePayload,
  fetchAdminServices,
  createServiceApi,
  updateServiceApi,
  deleteServiceApi,
} from "@/lib/actions/serviceActions";

export type AdminService = {
  _id: string;
  title: { en: string; ar: string };
  description?: { en?: string; ar?: string };
  images: string[];
  features?: Array<{
    icon: string;
    name: { en: string; ar: string };
    description?: { en?: string; ar?: string };
  }>;
};

interface ServiceContextValue {
  services: AdminService[];
  loading: boolean;
  error: string | null;
  fetchServices: () => Promise<void>;
  createService: (payload: ServicePayload) => Promise<void>;
  updateService: (
    id: string,
    payload: Partial<ServicePayload>
  ) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
}

const ServiceContext = createContext<ServiceContextValue | undefined>(
  undefined
);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminServices();
      setServices(data as AdminService[]);
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  const createService = useCallback(
    async (payload: ServicePayload) => {
      setLoading(true);
      setError(null);
      try {
        await createServiceApi(payload);
        await fetchServices();
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to create service");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchServices]
  );

  const updateService = useCallback(
    async (id: string, payload: Partial<ServicePayload>) => {
      setLoading(true);
      setError(null);
      try {
        await updateServiceApi(id, payload);
        await fetchServices();
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to update service");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchServices]
  );

  const deleteService = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await deleteServiceApi(id);
        await fetchServices();
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to delete service");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchServices]
  );

  const value = useMemo(
    () => ({
      services,
      loading,
      error,
      fetchServices,
      createService,
      updateService,
      deleteService,
    }),
    [
      services,
      loading,
      error,
      fetchServices,
      createService,
      updateService,
      deleteService,
    ]
  );

  return (
    <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
  );
};

export const useServices = () => {
  const ctx = useContext(ServiceContext);
  if (!ctx) {
    throw new Error("useServices must be used within ServiceProvider");
  }
  return ctx;
};
