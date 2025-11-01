export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner otimizado */}
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />

        {/* Texto de loading */}
        <p className="text-sm text-gray-600 animate-pulse">
          Carregando...
        </p>
      </div>
    </div>
  );
}
