import { renderHook, act } from '@testing-library/react';
import { useUpload } from './use-upload.js';
import type { IImageUploaderPort, MediaAsset } from '@minimalblock/core';

const mockAsset: MediaAsset = {
  url: 'https://cdn/img.jpg',
  storageKey: 'u1/img.jpg',
  mimeType: 'image/jpeg',
  kind: 'source-image',
  sizeBytes: 1024,
} as unknown as MediaAsset;

function makeUploader(overrides: Partial<IImageUploaderPort> = {}): IImageUploaderPort {
  return {
    upload: jest.fn().mockResolvedValue(mockAsset),
    remove: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeFile(type = 'image/jpeg', sizeBytes = 1024): File {
  const blob = new Blob(['x'.repeat(sizeBytes)], { type });
  return new File([blob], 'photo.jpg', { type });
}

describe('useUpload', () => {
  it('initialises with empty state', () => {
    const { result } = renderHook(() => useUpload(makeUploader(), 'user-1'));
    expect(result.current.uploading).toBe(false);
    expect(result.current.asset).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('rejects an invalid MIME type before calling the uploader', async () => {
    const uploader = makeUploader();
    const { result } = renderHook(() => useUpload(uploader, 'user-1'));

    await act(async () => {
      await result.current.upload(makeFile('image/gif'));
    });

    expect(result.current.error).toMatch(/Unsupported format/);
    expect(result.current.asset).toBeNull();
    expect(uploader.upload).not.toHaveBeenCalled();
  });

  it('rejects files over 10 MB before calling the uploader', async () => {
    const uploader = makeUploader();
    const { result } = renderHook(() => useUpload(uploader, 'user-1'));

    await act(async () => {
      await result.current.upload(makeFile('image/jpeg', 10 * 1024 * 1024 + 1));
    });

    expect(result.current.error).toMatch(/too large/i);
    expect(uploader.upload).not.toHaveBeenCalled();
  });

  it('sets asset on successful upload', async () => {
    const { result } = renderHook(() => useUpload(makeUploader(), 'user-1'));

    await act(async () => {
      await result.current.upload(makeFile());
    });

    expect(result.current.asset).toBe(mockAsset);
    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error when uploader throws', async () => {
    const uploader = makeUploader({ upload: jest.fn().mockRejectedValue(new Error('Network error')) });
    const { result } = renderHook(() => useUpload(uploader, 'user-1'));

    await act(async () => {
      await result.current.upload(makeFile());
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.asset).toBeNull();
  });

  it('reset clears all state', async () => {
    const { result } = renderHook(() => useUpload(makeUploader(), 'user-1'));

    await act(async () => {
      await result.current.upload(makeFile());
    });
    expect(result.current.asset).not.toBeNull();

    act(() => result.current.reset());

    expect(result.current.asset).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.uploading).toBe(false);
  });
});
