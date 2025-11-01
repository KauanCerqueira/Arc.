export default function WorkspaceLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        <p className="text-sm text-gray-600">Carregando workspace...</p>
      </div>
    </div>
  );
}
