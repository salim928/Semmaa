// app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-emerald-600 font-semibold">Loading SEMMA-AI...</p>
      </div>
    </div>
  )
}
