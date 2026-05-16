---
title: API Sözleşmeleri
description: Her @minimalblock/* paketinin genel dışa aktarımları — tipler, arayüzler ve fonksiyon imzaları.
outline: deep
---

# API Sözleşmeleri

## @minimalblock/core

Alan katmanı. Altyapı bağımlılığı yoktur.

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

Tek bir 2B-to-3D dönüşüm işinin yaşam döngüsünü izleyen aggregate kökü.

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

Herhangi bir ikili medya dosyası (kaynak görsel veya oluşturulan GLB) için değişmez değer nesnesi.

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

Dönüşümün dört yaşam döngüsü durumunu bir nesne olarak temsil eden değer nesnesi.

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

Kriptografik olarak rastgele bir UUID v4 dizesi döndürür.

### validateImageFile

```ts
interface FileValidationResult {
  valid: boolean
  reason?: string
}

function validateImageFile(file: File): FileValidationResult
```

10 MB'a kadar JPEG, PNG ve WebP dosyaları kabul eder. Reddedilen dosyalar için `{ valid: false, reason: '...' }` döndürür.

---

## @minimalblock/ai

Gemini API entegrasyonu. `IModelGeneratorPort` arayüzünü uygular.

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

`modelId` atlandığında `DEFAULT_MODEL_ID` kullanır.

### GeminiModelGenerator

`IModelGeneratorPort`'u uygular. Bir ürün görselini Gemini'ye gönderir ve `MediaAsset` olarak GLB ikili verisi döndürür.

```ts
class GeminiModelGenerator implements IModelGeneratorPort {
  constructor(model: GenerativeModel)
  generate(input: GenerateModelInput): Promise<GenerateModelOutput>
}
```

### GeminiImageAnalyzer

Bir ürün görselini Gemini'ye gönderir ve açıklama ile önerilen kategori döndürür.

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

### Tipler

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

Supabase altyapısı. `@minimalblock/core` paketindeki tüm depo ve depolama portlarını uygular.

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

Supabase şemasından türetilmiş TypeScript tipi. Tam tanım için [Veritabanı Şeması](/tr/reference/database-schema) sayfasına bakın.

---

## @minimalblock/ui

React bileşen kitaplığı. İş mantığı içermez.

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
  accept?: string          // varsayılan: 'image/jpeg,image/png,image/webp'
  maxSizeBytes?: number    // varsayılan: 10 MB
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

Üst düzey düzen sarmalayıcısı. Bir başlık ve ana içerik alanı render eder.

### ModelViewer

```ts
interface ModelViewerProps {
  src: string              // GLB dosyasının URL'si
  alt?: string
  autoRotate?: boolean
  cameraControls?: boolean
  className?: string
}
```

`<model-viewer>` web bileşenini sarar. `@google/model-viewer` betiğinin yüklenmesini gerektirir.

### ModelViewerPlaceholder

```ts
interface ModelViewerPlaceholderProps {
  status: 'pending' | 'processing' | 'failed'
  errorMessage?: string
}
```

GLB oluşturulurken duruma duyarlı bir yer tutucu render eder.

---

## @minimalblock/features

Alan katmanını Supabase ve Gemini'ye bağlayan React hook'ları.

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
