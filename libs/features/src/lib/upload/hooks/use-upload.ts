import { useState, useCallback } from 'react';
import { validateImageFile } from '@minimalblock/core';
import type { IImageUploaderPort, MediaAsset } from '@minimalblock/core';

export interface UseUploadState {
  uploading: boolean;
  error: string | null;
  asset: MediaAsset | null;
}

export function useUpload(uploader: IImageUploaderPort, ownerId: string) {
  const [state, setState] = useState<UseUploadState>({ uploading: false, error: null, asset: null });

  const upload = useCallback(async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setState(s => ({ ...s, error: validation.reason ?? 'Invalid file' }));
      return null;
    }

    setState({ uploading: true, error: null, asset: null });
    try {
      const asset = await uploader.upload({ file, fileName: file.name, ownerId });
      setState({ uploading: false, error: null, asset });
      return asset;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setState({ uploading: false, error: message, asset: null });
      return null;
    }
  }, [uploader, ownerId]);

  const reset = useCallback(() => setState({ uploading: false, error: null, asset: null }), []);

  return { ...state, upload, reset };
}
