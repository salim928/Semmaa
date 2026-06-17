'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isFeatureEnabled, type FeatureKey } from '@/config/features';

interface FeatureGuardProps {
  feature: FeatureKey;
  children: React.ReactNode;
  redirectTo?: string;
}

export default function FeatureGuard({ 
  feature, 
  children, 
  redirectTo = '/farmer' 
}: FeatureGuardProps) {
  const router = useRouter();
  const enabled = isFeatureEnabled(feature);

  useEffect(() => {
    if (!enabled) {
      // Show a toast or notification if you have one
      console.log(`Feature "${feature}" is coming soon!`);
      router.replace(redirectTo);
    }
  }, [enabled, feature, redirectTo, router]);

  // Don't render children if feature is disabled
  if (!enabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-emerald-900 mb-2">
          Coming Soon!
        </h2>
        <p className="text-emerald-700 mb-6 max-w-md">
          We&apos;re working hard to bring you this feature. Stay tuned!
        </p>
        <button
          onClick={() => router.push('/farmer')}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
