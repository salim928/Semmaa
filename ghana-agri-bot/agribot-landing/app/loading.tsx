// app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-50 to-yellow-50">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-16 h-16 border-4 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-lime-600 font-semibold">Loading SEMMA-AI...</p>
      </div>
    </div>
  )
}
