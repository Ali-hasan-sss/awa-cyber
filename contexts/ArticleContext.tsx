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
  ArticlePayload,
  fetchAdminArticles,
  createArticleApi,
  updateArticleApi,
  deleteArticleApi,
} from "@/lib/actions/articleActions";

export type AdminArticle = {
  _id: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  body: { en: string; ar: string };
  serviceId: string | { _id: string; title: { en: string; ar: string } };
  mainImage: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

interface ArticleContextValue {
  articles: AdminArticle[];
  loading: boolean;
  error: string | null;
  fetchArticles: (serviceId?: string) => Promise<void>;
  createArticle: (payload: ArticlePayload) => Promise<void>;
  updateArticle: (
    id: string,
    payload: Partial<ArticlePayload>
  ) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
}

const ArticleContext = createContext<ArticleContextValue | undefined>(
  undefined
);

export const ArticleProvider = ({ children }: { children: ReactNode }) => {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async (serviceId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminArticles(serviceId);
      setArticles(data as AdminArticle[]);
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, []);

  const createArticle = useCallback(
    async (payload: ArticlePayload) => {
      setLoading(true);
      setError(null);
      try {
        await createArticleApi(payload);
        await fetchArticles();
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to create article");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchArticles]
  );

  const updateArticle = useCallback(
    async (id: string, payload: Partial<ArticlePayload>) => {
      setLoading(true);
      setError(null);
      try {
        await updateArticleApi(id, payload);
        await fetchArticles();
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to update article");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchArticles]
  );

  const deleteArticle = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await deleteArticleApi(id);
        await fetchArticles();
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to delete article");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchArticles]
  );

  const value = useMemo(
    () => ({
      articles,
      loading,
      error,
      fetchArticles,
      createArticle,
      updateArticle,
      deleteArticle,
    }),
    [
      articles,
      loading,
      error,
      fetchArticles,
      createArticle,
      updateArticle,
      deleteArticle,
    ]
  );

  return (
    <ArticleContext.Provider value={value}>{children}</ArticleContext.Provider>
  );
};

export const useArticles = () => {
  const ctx = useContext(ArticleContext);
  if (!ctx) {
    throw new Error("useArticles must be used within ArticleProvider");
  }
  return ctx;
};
