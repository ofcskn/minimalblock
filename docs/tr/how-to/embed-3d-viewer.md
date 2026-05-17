---
title: 3D Görüntüleyiciyi Yerleştir
description: model-viewer web bileşenini yükleyin, ModelViewer'ı yapılandırın ve ürün listeleme sayfasına gömin.
---

# 3D Görüntüleyiciyi Yerleştir

## model-viewer web bileşenini yükleyin

`@minimalblock/ui` içindeki `ModelViewer`, Google'ın `<model-viewer>` web bileşenini sarmalamaktadır. Herhangi bir `<model-viewer>` öğesi render edilmeden önce betiğin yüklenmesi gerekir.

`apps/web/index.html` dosyasına aşağıdakini ekleyin ya da uygulama giriş noktasında bir kez içe aktarın:

```html
<script type="module"
  src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js">
</script>
```

Alternatif olarak paketi yükleyip `main.tsx` dosyasında içe aktarın:

```bash
pnpm add @google/model-viewer
```

```ts
import '@google/model-viewer'
```

---

## ModelViewer'ı zorunlu özelliklerle kullanın

```tsx
import { ModelViewer } from '@minimalblock/ui'

<ModelViewer
  src={conversion.outputAsset.url}
  alt="Ahşap yemek sandalyesinin 3D modeli"
/>
```

`src`, bir `.glb` dosyasına işaret eden bir URL olmalıdır. `GeminiModelGenerator`'dan gelen `data:model/gltf-binary;base64,...` URL'si çalışır; ancak görüntüleyicinin bir veri URI'si yerine CDN URL'sinden yüklemesi için GLB'yi önce Supabase Storage'a yükleyin.

### İsteğe bağlı özellikler

| Özellik | Varsayılan | Açıklama |
|---|---|---|
| `alt` | `''` | Erişilebilir açıklama |
| `autoRotate` | `false` | Modeli Y ekseni etrafında sürekli döndürür |
| `cameraControls` | `true` | İşaretçi olaylarıyla kaydırma, yörünge ve yakınlaştırmayı etkinleştirir |
| `className` | `''` | `<model-viewer>` öğesine uygulanan CSS sınıfı |

---

## Model hazır olmadan önce ModelViewerPlaceholder kullanın

Dönüşüm `pending` veya `processing` durumdayken `ModelViewer` yerine `ModelViewerPlaceholder` render edin:

```tsx
import { ModelViewer, ModelViewerPlaceholder } from '@minimalblock/ui'

{conversion?.status.isCompleted() && conversion.outputAsset ? (
  <ModelViewer src={conversion.outputAsset.url} autoRotate cameraControls />
) : (
  <ModelViewerPlaceholder
    status={conversion?.status.toString() ?? 'pending'}
    errorMessage={conversion?.errorMessage}
  />
)}
```

`ModelViewerPlaceholder` şunları render eder:
- `pending` için tarafsız bir mesaj
- `processing` için dönen animasyon
- `failed` için nedeni içeren kırmızı hata mesajı

---

## Kamera ve otomatik döndürmeyi özelleştirin

`className` özelliği aracılığıyla ek `<model-viewer>` niteliklerini doğrudan geçirin ya da `ModelViewer` bileşenini bunları iletecek şekilde genişletin:

```tsx
<ModelViewer
  src={glbUrl}
  autoRotate
  cameraControls
  className="h-64 w-full rounded-lg"
/>
```

`<model-viewer>`, öğe üzerinde CSS boyutlandırmayı kabul eder. `height` ve `width` değerlerini Tailwind sınıfları veya satır içi stiller aracılığıyla ayarlayın.

---

## Ürün listeleme sayfasına gömün

3D görüntüleyicili eksiksiz bir ürün kartı:

```tsx
import { Card, CardHeader, CardBody, StatusBadge, ModelViewer, ModelViewerPlaceholder } from '@minimalblock/ui'

function ProductCard({ product, conversion }) {
  const modelReady = conversion?.status.isCompleted() && conversion.outputAsset

  return (
    <Card>
      <CardHeader>{product.name}</CardHeader>
      <CardBody>
        <div className="h-64 w-full">
          {modelReady ? (
            <ModelViewer
              src={conversion.outputAsset.url}
              alt={product.name}
              autoRotate
              cameraControls
            />
          ) : (
            <ModelViewerPlaceholder
              status={conversion?.status.toString() ?? 'pending'}
              errorMessage={conversion?.errorMessage}
            />
          )}
        </div>
        <p>{product.description}</p>
        {conversion && <StatusBadge status={conversion.status.toString()} />}
      </CardBody>
    </Card>
  )
}
```
