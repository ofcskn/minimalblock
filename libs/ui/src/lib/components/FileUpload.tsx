import { useRef, useState } from 'react';

export interface FileUploadProps {
  accept?: string;
  maxSizeMb?: number;
  multiple?: boolean;
  helperText?: string;
  onFileSelected?: (file: File) => void;
  onFilesSelected?: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  accept = 'image/jpeg,image/png,image/webp',
  maxSizeMb = 10,
  multiple = false,
  helperText,
  onFileSelected,
  onFilesSelected,
  disabled,
  className = '',
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handle = (files: File[]) => {
    const validFiles = files.filter((file) => file.size <= maxSizeMb * 1024 * 1024);
    if (validFiles.length === 0) return;
    if (multiple) {
      onFilesSelected?.(validFiles);
      return;
    }
    onFileSelected?.(validFiles[0]);
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => {
        e.preventDefault();
        setDragOver(false);
        const dropped = Array.from(e.dataTransfer.files);
        if (dropped.length > 0) handle(multiple ? dropped : [dropped[0]]);
      }}
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-colors cursor-pointer
        ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 bg-gray-50'}
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
        ${className}`}
    >
      <svg className="mb-3 h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 9l-4-4m0 0L8 9m4-4v12" />
      </svg>
      <p className="text-sm text-gray-600">
        <span className="font-medium text-indigo-600">{multiple ? 'Choose files' : 'Choose a file'}</span> or drag and drop
      </p>
      <p className="mt-1 text-xs text-gray-400">{helperText ?? `JPEG, PNG, WebP — max ${maxSizeMb} MB`}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={e => {
          const selected = Array.from(e.target.files ?? []);
          if (selected.length > 0) handle(selected);
        }}
      />
    </div>
  );
}
