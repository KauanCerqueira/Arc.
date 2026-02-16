"use client";

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import axios from 'axios';

interface FileUploadProps {
  onUploadComplete?: (url: string) => void;
  folder?: string;
  className?: string;
}

export function FileUpload({ onUploadComplete, folder = 'general', className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadedUrl(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      // Ajustar URL base conforme necessário
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/storage/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Adicionar token se necessário: Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });

      const url = response.data.url;
      // Se for local storage, adicionar a base URL se não vier completa
      const fullUrl = url.startsWith('http') ? url : `${apiUrl}${url}`;

      setUploadedUrl(fullUrl);
      if (onUploadComplete) {
        onUploadComplete(fullUrl);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError('Falha no upload. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50",
          isUploading ? "opacity-50 pointer-events-none" : ""
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          ) : uploadedUrl ? (
            <CheckCircle className="h-10 w-10 text-green-500" />
          ) : (
            <Upload className="h-10 w-10 text-gray-400" />
          )}

          <div className="text-sm text-gray-600">
            {isUploading ? (
              <p>Enviando arquivo...</p>
            ) : uploadedUrl ? (
              <p className="text-green-600 font-medium">Upload concluído!</p>
            ) : (
              <>
                <p className="font-medium">Clique ou arraste um arquivo aqui</p>
                <p className="text-xs text-gray-400 mt-1">Suporta imagens, PDF e documentos</p>
              </>
            )}
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="mt-2 flex items-center text-sm text-red-500">
          <AlertCircle className="h-4 w-4 mr-1" />
          {uploadError}
        </div>
      )}

      {uploadedUrl && (
        <div className="mt-4 p-3 bg-white border border-gray-200 rounded-md flex items-center justify-between shadow-sm">
          <div className="flex items-center overflow-hidden">
            <FileText className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
            <span className="text-sm truncate max-w-[200px] text-gray-700">{uploadedUrl.split('/').pop()}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              setUploadedUrl(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
          >
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      )}
    </div>
  );
}
