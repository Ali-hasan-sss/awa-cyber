"use client";

export default function HomePageLoader() {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton */}
      <div className="h-screen bg-gradient-to-b from-gray-900 to-black animate-pulse">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="h-4 bg-white/10 rounded w-32 mx-auto"></div>
            <div className="h-16 bg-white/10 rounded w-3/4 mx-auto"></div>
            <div className="h-6 bg-white/10 rounded w-2/3 mx-auto"></div>
            <div className="flex gap-4 justify-center mt-8">
              <div className="h-12 bg-white/10 rounded-full w-40"></div>
              <div className="h-12 bg-white/10 rounded-full w-40"></div>
            </div>
          </div>
        </div>
      </div>

      {/* WhoWeAre Skeleton */}
      <div className="py-20 md:py-28 bg-white animate-pulse">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="h-12 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
              <div className="grid grid-cols-2 gap-6 pt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gray-200 rounded-3xl shadow-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* TrustedClients Skeleton */}
      <div className="py-20 md:py-28 bg-gradient-to-b from-white to-primary/5 animate-pulse">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
            <div className="h-10 bg-gray-200 rounded w-2/3 mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-white/80 px-6 py-8 text-center"
              >
                <div className="mx-auto mb-4 h-14 w-14 bg-gray-200 rounded-2xl"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SecurityServices Skeleton */}
      <div className="py-20 md:py-28 bg-gradient-to-b from-primary/5 via-white to-white animate-pulse">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="h-12 bg-gray-200 rounded w-2/3 mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden h-full flex flex-col"
              >
                <div className="relative w-full aspect-video bg-gray-200"></div>
                <div className="p-6 md:p-8 flex flex-col flex-grow">
                  <div className="h-7 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="space-y-2 flex-grow">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LatestProjects Skeleton */}
      <div className="py-20 md:py-28 bg-gradient-to-b from-white to-primary/10 animate-pulse">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="h-12 bg-gray-200 rounded w-2/3 mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="rounded-[32px] border border-gray-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="relative lg:w-1/2">
                <div className="aspect-video bg-gray-200"></div>
              </div>
              <div className="lg:w-1/2 p-8 md:p-12 space-y-6">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-10 w-10 bg-gray-200 rounded-2xl"></div>
                      <div className="h-5 bg-gray-200 rounded flex-1"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhyChooseUs Skeleton */}
      <div className="py-20 md:py-28 bg-gradient-to-b from-black to-gray-900 animate-pulse">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="relative">
              <div className="relative rounded-[32px] shadow-2xl border border-white/10">
                <div className="aspect-video bg-gray-800 rounded-2xl"></div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-12 bg-gray-800 rounded w-3/4"></div>
              <div className="h-6 bg-gray-800 rounded w-full"></div>
              <div className="grid gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5"
                  >
                    <div className="h-12 w-12 bg-gray-800 rounded-2xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-6 bg-gray-800 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-800 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Skeleton */}
      <div className="py-20 md:py-28 bg-white animate-pulse">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="h-12 bg-gray-200 rounded w-2/3 mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HowItWorks Skeleton */}
      <div className="py-20 md:py-28 bg-gradient-to-b from-gray-900 to-black animate-pulse">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="h-12 bg-gray-800 rounded w-2/3 mx-auto"></div>
            <div className="h-6 bg-gray-800 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="relative rounded-3xl border border-white/10 bg-gray-800/50 p-6 md:p-8"
              >
                <div className="absolute -top-4 -left-4 h-10 w-10 bg-gray-700 rounded-full"></div>
                <div className="mb-6 h-16 w-16 bg-gray-700 rounded-2xl"></div>
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SecurityTechnologies Skeleton */}
      <div className="py-20 md:py-28 bg-white animate-pulse">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="h-12 bg-gray-200 rounded w-2/3 mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="mt-12 bg-gradient-to-b from-primary/20 via-white to-white rounded-[36px] p-6 md:p-8 shadow-lg border border-primary/10">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/60 bg-white/80 p-5 text-center"
                >
                  <div className="mx-auto mb-4 h-12 w-12 bg-gray-200 rounded-2xl"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 rounded-full bg-white shadow-lg border border-gray-200 px-6 py-6 md:px-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-10 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SecurityModal Skeleton */}
      <div className="py-20 md:py-28 bg-gradient-to-b from-gray-900 to-black animate-pulse">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-gradient-to-b from-primary via-primary to-primary/90 rounded-3xl p-8 md:p-10 shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 bg-white/20 rounded-full"></div>
              </div>
              <div className="h-10 bg-white/20 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-6 bg-white/20 rounded w-full mb-6"></div>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-6 bg-white/20 rounded w-24"></div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 h-12 bg-white/20 rounded-full"></div>
                <div className="flex-1 h-12 bg-white/20 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
