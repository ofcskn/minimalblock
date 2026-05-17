---
title: Embed the 3D Viewer
description: Load the model-viewer web component, configure ModelViewer, and embed it in a product listing page.
---

# Embed the 3D Viewer

## Load the model-viewer web component

`ModelViewer` in `@minimalblock/ui` wraps the `<model-viewer>` web component from Google. The script must be loaded before any `<model-viewer>` element is rendered.

Add the following to `apps/web/index.html` or import it once at the app entry point:

```html
<script type="module"
  src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js">
</script>
```

Alternatively, install the package and import it in `main.tsx`:

```bash
pnpm add @google/model-viewer
```

```ts
import '@google/model-viewer'
```

---

## Use ModelViewer with required props

```tsx
import { ModelViewer } from '@minimalblock/ui'

<ModelViewer
  src={conversion.outputAsset.url}
  alt="3D model of a wooden dining chair"
/>
```

`src` must be a URL pointing to a `.glb` file. A `data:model/gltf-binary;base64,...` URL from `GeminiModelGenerator` works, but upload the GLB to Supabase Storage first so the viewer loads from a CDN URL rather than a data URI.

### Optional props

| Prop | Default | Description |
|---|---|---|
| `alt` | `''` | Accessible description |
| `autoRotate` | `false` | Continuously rotates the model around the Y axis |
| `cameraControls` | `true` | Enables pan, orbit, and zoom with pointer events |
| `className` | `''` | CSS class applied to the `<model-viewer>` element |

---

## Use ModelViewerPlaceholder before the model is ready

While the conversion is `pending` or `processing`, render `ModelViewerPlaceholder` in place of `ModelViewer`:

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

`ModelViewerPlaceholder` renders a status-appropriate message for `pending`, a spinner for `processing`, and an error message with the reason for `failed`.

---

## Customise camera and auto-rotate

Pass HTML attributes directly through the `className` prop or extend the `ModelViewer` component to forward additional `<model-viewer>` attributes:

```tsx
<ModelViewer
  src={glbUrl}
  autoRotate
  cameraControls
  className="h-64 w-full rounded-lg"
/>
```

`<model-viewer>` accepts CSS sizing on the element. Set `height` and `width` via Tailwind classes or inline styles.

---

## Embed in a product listing page

A complete product card with a 3D viewer:

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
