export default function WorkspaceLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-arc-primary">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* Spinner com cores Arc. */}
        <div
          className="relative w-16 h-16"
          role="status"
          aria-label="Carregando workspace"
        >
          {/* Círculo externo - Arc Violet */}
          <div className="absolute inset-0 border-[3px] rounded-full border-transparent border-t-[#6E62E5] animate-spin"
               style={{ animationDuration: '0.8s' }}
          />
          {/* Círculo interno - Arc Blue */}
          <div className="absolute inset-2 border-[3px] rounded-full border-transparent border-t-[#4D7DFF] animate-spin"
               style={{ animationDuration: '1.2s', animationDirection: 'reverse' }}
          />
        </div>

        {/* Texto de loading com cores Arc. */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-base font-medium text-arc animate-pulse">
            Carregando workspace...
          </p>
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-[#6E62E5] animate-pulse" style={{ animationDelay: '0s' }} />
            <span className="w-2 h-2 rounded-full bg-[#6E62E5] animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="w-2 h-2 rounded-full bg-[#6E62E5] animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
