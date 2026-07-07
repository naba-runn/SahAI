// LoadingSpinner.jsx
export default function LoadingSpinner({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-saffron-100" />
        <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-saffron-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-navy-700 font-medium text-sm animate-pulse">{message}</p>
    </div>
  );
}
