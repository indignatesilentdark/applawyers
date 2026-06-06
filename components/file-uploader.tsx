"use client";

type FileUploaderProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
};

export function FileUploader({ files, onFilesChange }: FileUploaderProps) {
  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const incomingFiles = Array.from(event.target.files ?? []);
    onFilesChange([...files, ...incomingFiles]);
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="space-y-4">
      <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border/90 bg-background-elevated/70 p-5 text-center">
        <span className="text-sm font-medium text-white">
          Cargar evidencias
        </span>
        <span className="mt-2 text-sm leading-6 text-muted-foreground">
          Capturas, comprobantes, PDFs, correos exportados o documentos.
        </span>
        <input
          className="hidden"
          type="file"
          multiple
          onChange={handleFiles}
        />
      </label>

      <div className="space-y-3">
        {files.length ? (
          files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card-muted/60 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-xs font-medium text-muted-foreground"
              >
                Quitar
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay archivos seleccionados todavía.
          </p>
        )}
      </div>
    </div>
  );
}
