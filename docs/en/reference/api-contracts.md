---
title: API Contracts
description: Public exports of every @minimalblock/* package — types, interfaces, and function signatures.
outline: deep
---

# API Contracts

## @minimalblock/core

Domain layer. No infrastructure dependencies.

### Product

```ts
type ProductCategory = 'house' | 'furniture' | 'vehicle' | 'appliance' | 'other'

interface ProductProps {
  id: string
  name: string
  description: string
  category: ProductCategory
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

class Product {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly category: ProductCategory
  readonly ownerId: string
  readonly createdAt: Date
  readonly updatedAt: Date
  isOwnedBy(userId: string): boolean
  withUpdatedName(name: string): Product
}
```

### User

```ts
interface UserProps {
  id: string
  email: string
}

class User {
  readonly id: string
  readonly email: string
}
```

### Conversion

Aggregate root that tracks the lifecycle of one 2D-to-3D conversion job.

```ts
class Conversion {
  readonly id: string
  readonly productId: string
  readonly ownerId: string
  readonly sourceAsset: MediaAsset
  readonly outputAsset: MediaAsset | undefined
  readonly status: ConversionStatus
  readonly errorMessage: string | undefined

  static create(props: Omit<ConversionProps, 'status'>): Conversion
  markProcessing(): Conversion
  markCompleted(outputAsset: MediaAsset): Conversion
  markFailed(reason: string): Conversion
}
```

### MediaAsset

Immutable value object for any binary media file (source image or generated GLB).

```ts
interface MediaAssetProps {
  url: string
  storageKey: string
  mimeType: string
  kind: 'source-image' | 'generated-model'
  sizeBytes: number
}

class MediaAsset {
  readonly url: string
  readonly storageKey: string
  readonly mimeType: string
  readonly kind: 'source-image' | 'generated-model'
  readonly sizeBytes: number
  isSourceImage(): boolean
  is3DModel(): boolean
}
```

### ConversionStatus

Value object representing the four lifecycle states of a conversion.

```ts
class ConversionStatus {
  static pending(): ConversionStatus
  static processing(): ConversionStatus
  static completed(): ConversionStatus
  static failed(): ConversionStatus
  isPending(): boolean
  isProcessing(): boolean
  isCompleted(): boolean
  isFailed(): boolean
  isTerminal(): boolean
  toString(): 'pending' | 'processing' | 'completed' | 'failed'
}
```

### IProductRepository

```ts
interface IProductRepository {
  findById(id: string): Promise<Product | null>
  findByOwnerId(ownerId: string): Promise<Product[]>
  save(product: Product): Promise<void>
  delete(id: string): Promise<void>
}
```

### IConversionRepository

```ts
interface IConversionRepository {
  findById(id: string): Promise<Conversion | null>
  findByProductId(productId: string): Promise<Conversion[]>
  findByOwnerId(ownerId: string): Promise<Conversion[]>
  save(conversion: Conversion): Promise<void>
  delete(id: string): Promise<void>
}
```

### IModelGeneratorPort

```ts
interface GenerateModelInput {
  sourceAsset: MediaAsset
  productCategory: string
  qualityHint?: 'fast' | 'balanced' | 'quality'
}

interface GenerateModelOutput {
  outputAsset: MediaAsset
  tokensUsed: number
}

interface IModelGeneratorPort {
  generate(input: GenerateModelInput): Promise<GenerateModelOutput>
}
```

### IImageUploaderPort

```ts
interface UploadImageInput {
  file: File | Blob
  fileName: string
  ownerId: string
}

interface IImageUploaderPort {
  upload(input: UploadImageInput): Promise<MediaAsset>
  remove(storageKey: string): Promise<void>
}
```

### generateId

```ts
function generateId(): string
```

Returns a cryptographically random UUID v4 string.

### validateImageFile

```ts
interface FileValidationResult {
  valid: boolean
  reason?: string
}

function validateImageFile(file: File): FileValidationResult
```

Accepts JPEG, PNG, and WebP files up to 10 MB. Returns `{ valid: false, reason: '...' }` on rejection.

---

## @minimalblock/ai

Gemini API integration. Implements `IModelGeneratorPort`.

### createGeminiClient

```ts
function createGeminiClient(apiKey: string): GoogleGenerativeAI
```

### createGenerativeModel

```ts
const DEFAULT_MODEL_ID = 'gemini-2.0-flash-exp'
const ANALYSIS_MODEL_ID = 'gemini-1.5-pro'

function createGenerativeModel(apiKey: string, modelId?: string): GenerativeModel
```

Defaults to `DEFAULT_MODEL_ID` when `modelId` is omitted.

### GeminiModelGenerator

Implements `IModelGeneratorPort`. Sends a product image to Gemini and returns a GLB binary as a `MediaAsset`.

```ts
class GeminiModelGenerator implements IModelGeneratorPort {
  constructor(model: GenerativeModel)
  generate(input: GenerateModelInput): Promise<GenerateModelOutput>
}
```

### GeminiImageAnalyzer

Sends a product image to Gemini and returns a description and suggested category.

```ts
class GeminiImageAnalyzer {
  constructor(model: GenerativeModel)
  analyze(imageBase64: string, mimeType: string): Promise<ImageAnalysisResponse>
}
```

### buildConvert2DTo3DPrompt

```ts
type QualityHint = 'fast' | 'balanced' | 'quality'

function buildConvert2DTo3DPrompt(productCategory: string, quality?: QualityHint): string
```

### buildImageAnalysisPrompt

```ts
function buildImageAnalysisPrompt(): string
```

### Types

```ts
interface Convert2DTo3DRequest {
  sourceAsset: MediaAsset
  productCategory: string
  qualityHint?: QualityHint
}

interface AnalyzeImageRequest {
  imageBase64: string
  mimeType: string
}

interface Convert2DTo3DResponse {
  outputAsset: MediaAsset
  tokensUsed: number
}

interface ImageAnalysisResponse {
  description: string
  suggestedCategory: string
  tokensUsed: number
}
```

---

## @minimalblock/data

Supabase infrastructure. Implements all repository and storage ports from `@minimalblock/core`.

### getSupabaseClient

```ts
function getSupabaseClient(url: string, anonKey: string): SupabaseClient<Database>
```

### SupabaseProductRepository

```ts
class SupabaseProductRepository implements IProductRepository {
  constructor(client: SupabaseClient<Database>)
  findById(id: string): Promise<Product | null>
  findByOwnerId(ownerId: string): Promise<Product[]>
  save(product: Product): Promise<void>
  delete(id: string): Promise<void>
}
```

### SupabaseConversionRepository

```ts
class SupabaseConversionRepository implements IConversionRepository {
  constructor(client: SupabaseClient<Database>)
  findById(id: string): Promise<Conversion | null>
  findByProductId(productId: string): Promise<Conversion[]>
  findByOwnerId(ownerId: string): Promise<Conversion[]>
  save(conversion: Conversion): Promise<void>
  delete(id: string): Promise<void>
}
```

### SupabaseImageUploader

```ts
class SupabaseImageUploader implements IImageUploaderPort {
  constructor(client: SupabaseClient<Database>)
  upload(input: UploadImageInput): Promise<MediaAsset>
  remove(storageKey: string): Promise<void>
}
```

### Database

Generated TypeScript type derived from the Supabase schema. See [Database Schema](/en/reference/database-schema) for the full definition.

---

## @minimalblock/ui

React component library. No business logic.

### Button

```ts
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}
```

### Card / CardHeader / CardBody

```ts
interface CardProps { children: React.ReactNode; className?: string }
interface CardHeaderProps { children: React.ReactNode }
interface CardBodyProps { children: React.ReactNode }
```

### Spinner

```ts
interface SpinnerProps { size?: 'sm' | 'md' | 'lg' }
```

### FileUpload

```ts
interface FileUploadProps {
  accept?: string          // defaults to 'image/jpeg,image/png,image/webp'
  maxSizeBytes?: number    // defaults to 10 MB
  onFile: (file: File) => void
  onError?: (reason: string) => void
}
```

### Modal

```ts
interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}
```

### StatusBadge

```ts
interface StatusBadgeProps {
  status: 'pending' | 'processing' | 'completed' | 'failed'
}
```

### AppShell

```ts
interface AppShellProps {
  children: React.ReactNode
}
```

Top-level layout wrapper. Renders a header and a main content area.

### ModelViewer

```ts
interface ModelViewerProps {
  src: string              // URL of the GLB file
  alt?: string
  autoRotate?: boolean
  cameraControls?: boolean
  className?: string
}
```

Wraps the `<model-viewer>` web component. Requires the `@google/model-viewer` script to be loaded.

### ModelViewerPlaceholder

```ts
interface ModelViewerPlaceholderProps {
  status: 'pending' | 'processing' | 'failed'
  errorMessage?: string
}
```

Renders a status-aware placeholder while the GLB is being generated.

---

## @minimalblock/features

React hooks that connect the domain layer to Supabase and Gemini.

### useUpload / UseUploadState

```ts
interface UseUploadState {
  uploading: boolean
  asset: MediaAsset | null
  error: string | null
  upload: (file: File) => Promise<void>
  reset: () => void
}

function useUpload(uploader: IImageUploaderPort, ownerId: string): UseUploadState
```

### useConversion / UseConversionState

```ts
interface UseConversionState {
  conversion: Conversion | null
  converting: boolean
  error: string | null
  startConversion: (sourceAsset: MediaAsset, productId: string) => Promise<void>
}

function useConversion(
  generator: IModelGeneratorPort,
  repo: IConversionRepository,
  ownerId: string
): UseConversionState
```

### useGallery / UseGalleryState

```ts
interface UseGalleryState {
  products: Product[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

function useGallery(repo: IProductRepository, ownerId: string): UseGalleryState
```

### useAuth / UseAuthState

```ts
interface UseAuthState {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

function useAuth(client: SupabaseClient): UseAuthState
```
