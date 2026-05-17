# Minimal Block One-Day MVP Roadmap
## Core MVP Objective
Minimal Block should be ready for a hackathon demo in one day as a seller-first AI Visual Commerce QA and Product Preview Platform.

The MVP should prove one thing clearly:

Sellers should not blindly publish bad AI-generated 3D product assets. Minimal Block detects bad outputs, explains what failed, gives correction steps, and only allows publish/export when the product experience is review-ready.

## GRASP-Based MVP Principles
## Information Expert
X.1. Keep product quality decisions inside the product/conversion record

Executable steps:
   1. Map where `Keep product quality decisions inside the product/conversion record` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep product quality decisions inside the product/conversion record` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep product quality decisions inside the product/conversion record` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.2. Keep source image quality information close to uploaded image records

Executable steps:
   1. Map where `Keep source image quality information close to uploaded image records` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep source image quality information close to uploaded image records` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep source image quality information close to uploaded image records` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.3. Keep hotspot approval information close to hotspot records

Executable steps:
   1. Map where `Keep hotspot approval information close to hotspot records` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep hotspot approval information close to hotspot records` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep hotspot approval information close to hotspot records` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.4. Keep publishing readiness information close to export/share actions

Executable steps:
   1. Map where `Keep publishing readiness information close to export/share actions` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep publishing readiness information close to export/share actions` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep publishing readiness information close to export/share actions` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.5. Avoid scattering approval logic across unrelated UI buttons

Executable steps:
   1. Map where `Avoid scattering approval logic across unrelated UI buttons` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Avoid scattering approval logic across unrelated UI buttons` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Avoid scattering approval logic across unrelated UI buttons` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Controller
X.1. Use one clear workflow controller for product conversion

Executable steps:
   1. Map where `Use one clear workflow controller for product conversion` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Use one clear workflow controller for product conversion` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Use one clear workflow controller for product conversion` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.2. Route every product through the same states: upload, analyze, review, approve, publish

Executable steps:
   1. Map where `Route every product through the same states: upload, analyze, review, approve, publish` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Route every product through the same states: upload, analyze, review, approve, publish` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Route every product through the same states: upload, analyze, review, approve, publish` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.3. Avoid letting each button independently decide whether a product can be published

Executable steps:
   1. Map where `Avoid letting each button independently decide whether a product can be published` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Avoid letting each button independently decide whether a product can be published` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Avoid letting each button independently decide whether a product can be published` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.4. Keep “Run AI analysis,” “Approve,” “Export,” and “Publish” as controlled workflow actions

Executable steps:
   1. Map where `Keep “Run AI analysis,” “Approve,” “Export,” and “Publish” as controlled workflow actions` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep “Run AI analysis,” “Approve,” “Export,” and “Publish” as controlled workflow actions` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep “Run AI analysis,” “Approve,” “Export,” and “Publish” as controlled workflow actions` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Low Coupling
X.1. Keep AI analysis separate from the 3D viewer

Executable steps:
   1. Map where `Keep AI analysis separate from the 3D viewer` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep AI analysis separate from the 3D viewer` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep AI analysis separate from the 3D viewer` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.2. Keep hotspot editing separate from product upload

Executable steps:
   1. Map where `Keep hotspot editing separate from product upload` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep hotspot editing separate from product upload` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep hotspot editing separate from product upload` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.3. Keep public product page separate from merchant review

Executable steps:
   1. Map where `Keep public product page separate from merchant review` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep public product page separate from merchant review` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep public product page separate from merchant review` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.4. Keep Trendyol/export package separate from approval logic

Executable steps:
   1. Map where `Keep Trendyol/export package separate from approval logic` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep Trendyol/export package separate from approval logic` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep Trendyol/export package separate from approval logic` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.5. Keep demo/mock AI data replaceable with real Gemini later

Executable steps:
   1. Map where `Keep demo/mock AI data replaceable with real Gemini later` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep demo/mock AI data replaceable with real Gemini later` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep demo/mock AI data replaceable with real Gemini later` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## High Cohesion
X.1. Product detail page should show current product status and key actions

Executable steps:
   1. Map where `Product detail page should show current product status and key actions` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Product detail page should show current product status and key actions` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Product detail page should show current product status and key actions` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.2. AI analysis panel should only diagnose quality and recommend actions

Executable steps:
   1. Map where `AI analysis panel should only diagnose quality and recommend actions` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `AI analysis panel should only diagnose quality and recommend actions` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `AI analysis panel should only diagnose quality and recommend actions` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.3. Hotspot editor should only manage hotspots

Executable steps:
   1. Map where `Hotspot editor should only manage hotspots` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Hotspot editor should only manage hotspots` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Hotspot editor should only manage hotspots` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.4. Merchant review page should only handle final seller approval

Executable steps:
   1. Map where `Merchant review page should only handle final seller approval` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Merchant review page should only handle final seller approval` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Merchant review page should only handle final seller approval` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.5. Public page should only show buyer-facing approved content

Executable steps:
   1. Map where `Public page should only show buyer-facing approved content` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Public page should only show buyer-facing approved content` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Public page should only show buyer-facing approved content` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.6. Export page should only prepare platform-ready output

Executable steps:
   1. Map where `Export page should only prepare platform-ready output` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Export page should only prepare platform-ready output` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Export page should only prepare platform-ready output` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Polymorphism
X.1. Treat different export targets as profiles: public page, embed, Trendyol, Shopify later

Executable steps:
   1. Map where `Treat different export targets as profiles: public page, embed, Trendyol, Shopify later` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Treat different export targets as profiles: public page, embed, Trendyol, Shopify later` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Treat different export targets as profiles: public page, embed, Trendyol, Shopify later` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.2. Treat different product quality outcomes as workflow states: passed, warning, failed

Executable steps:
   1. Map where `Treat different product quality outcomes as workflow states: passed, warning, failed` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Treat different product quality outcomes as workflow states: passed, warning, failed` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Treat different product quality outcomes as workflow states: passed, warning, failed` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.3. Treat different AI providers as replaceable later, but use Gemini or mock data today

Executable steps:
   1. Map where `Treat different AI providers as replaceable later, but use Gemini or mock data today` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Treat different AI providers as replaceable later, but use Gemini or mock data today` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Treat different AI providers as replaceable later, but use Gemini or mock data today` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.4. Treat model input types consistently: uploaded images, manual GLB, imported product later

Executable steps:
   1. Map where `Treat model input types consistently: uploaded images, manual GLB, imported product later` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Treat model input types consistently: uploaded images, manual GLB, imported product later` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Treat model input types consistently: uploaded images, manual GLB, imported product later` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Pure Fabrication
X.1. Add a dedicated quality service concept, even if implemented simply today

Executable steps:
   1. Map where `Add a dedicated quality service concept, even if implemented simply today` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add a dedicated quality service concept, even if implemented simply today` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add a dedicated quality service concept, even if implemented simply today` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.2. Add a dedicated export package service concept, even if only mock export today

Executable steps:
   1. Map where `Add a dedicated export package service concept, even if only mock export today` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add a dedicated export package service concept, even if only mock export today` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add a dedicated export package service concept, even if only mock export today` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.3. Add a dedicated AI diagnosis service concept, even if Gemini is mocked today

Executable steps:
   1. Map where `Add a dedicated AI diagnosis service concept, even if Gemini is mocked today` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add a dedicated AI diagnosis service concept, even if Gemini is mocked today` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add a dedicated AI diagnosis service concept, even if Gemini is mocked today` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.4. Add a dedicated analytics event service concept, even if events are seeded today

Executable steps:
   1. Map where `Add a dedicated analytics event service concept, even if events are seeded today` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add a dedicated analytics event service concept, even if events are seeded today` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add a dedicated analytics event service concept, even if events are seeded today` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Indirection
X.1. Do not call Gemini directly from every UI component

Executable steps:
   1. Map where `Do not call Gemini directly from every UI component` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Do not call Gemini directly from every UI component` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Do not call Gemini directly from every UI component` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.2. Do not bind Trendyol export directly to the product page button

Executable steps:
   1. Map where `Do not bind Trendyol export directly to the product page button` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Do not bind Trendyol export directly to the product page button` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Do not bind Trendyol export directly to the product page button` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.3. Do not bind approval directly to score display

Executable steps:
   1. Map where `Do not bind approval directly to score display` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Do not bind approval directly to score display` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Do not bind approval directly to score display` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.4. Use a clear action layer between UI and business decisions

Executable steps:
   1. Map where `Use a clear action layer between UI and business decisions` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Use a clear action layer between UI and business decisions` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Use a clear action layer between UI and business decisions` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Protected Variations
X.1. Keep room for different marketplaces

Executable steps:
   1. Map where `Keep room for different marketplaces` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep room for different marketplaces` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep room for different marketplaces` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.2. Keep room for different 3D generation providers

Executable steps:
   1. Map where `Keep room for different 3D generation providers` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep room for different 3D generation providers` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep room for different 3D generation providers` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.3. Keep room for different product categories

Executable steps:
   1. Map where `Keep room for different product categories` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep room for different product categories` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep room for different product categories` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.4. Keep room for image-only fallback when GLB fails

Executable steps:
   1. Map where `Keep room for image-only fallback when GLB fails` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep room for image-only fallback when GLB fails` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep room for image-only fallback when GLB fails` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

X.5. Keep room for manual seller override, but require a reason

Executable steps:
   1. Map where `Keep room for manual seller override, but require a reason` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep room for manual seller override, but require a reason` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep room for manual seller override, but require a reason` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

# Phase 1 — Scope Freeze and Demo Strategy
## Objective
Lock the one-day MVP scope and avoid building features that will not help the hackathon demo.

## TODO
A.1. Define the product as AI Visual Commerce QA, not only a 3D viewer

Executable steps:
   1. Map where `Define the product as AI Visual Commerce QA, not only a 3D viewer` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Define the product as AI Visual Commerce QA, not only a 3D viewer` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Define the product as AI Visual Commerce QA, not only a 3D viewer` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

A.2. Focus on sellers first

Executable steps:
   1. Map where `Focus on sellers first` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Focus on sellers first` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Focus on sellers first` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

A.3. Support providers/platforms through export/readiness reports

Executable steps:
   1. Map where `Support providers/platforms through export/readiness reports` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Support providers/platforms through export/readiness reports` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Support providers/platforms through export/readiness reports` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

A.4. Keep buyers as the final output through public preview pages

Executable steps:
   1. Map where `Keep buyers as the final output through public preview pages` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep buyers as the final output through public preview pages` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep buyers as the final output through public preview pages` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

A.5. Use one failed product demo

Executable steps:
   1. Map where `Use one failed product demo` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Use one failed product demo` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Use one failed product demo` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

A.6. Use one successful product demo

Executable steps:
   1. Map where `Use one successful product demo` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Use one successful product demo` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Use one successful product demo` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

A.7. Use one medium-quality product demo if time allows

Executable steps:
   1. Map where `Use one medium-quality product demo if time allows` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Use one medium-quality product demo if time allows` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Use one medium-quality product demo if time allows` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

A.8. Freeze the demo path before coding

Executable steps:
   1. Map where `Freeze the demo path before coding` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Freeze the demo path before coding` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Freeze the demo path before coding` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

A.9. Assign one person to UI polish

Executable steps:
   1. Map where `Assign one person to UI polish` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Assign one person to UI polish` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Assign one person to UI polish` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

A.10. Assign one person to AI/mock analysis

Executable steps:
   1. Map where `Assign one person to AI/mock analysis` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Assign one person to AI/mock analysis` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Assign one person to AI/mock analysis` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

A.11. Assign one person to product status and approval logic

Executable steps:
   1. Map where `Assign one person to product status and approval logic` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Assign one person to product status and approval logic` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Assign one person to product status and approval logic` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

A.12. Assign one person to public preview/export

Executable steps:
   1. Map where `Assign one person to public preview/export` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Assign one person to public preview/export` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Assign one person to public preview/export` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

A.13. Avoid real marketplace API integrations today

Executable steps:
   1. Map where `Avoid real marketplace API integrations today` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Avoid real marketplace API integrations today` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Avoid real marketplace API integrations today` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

A.14. Avoid real image-to-3D generation dependency today

Executable steps:
   1. Map where `Avoid real image-to-3D generation dependency today` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Avoid real image-to-3D generation dependency today` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Avoid real image-to-3D generation dependency today` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

A.15. Avoid native AR today

Executable steps:
   1. Map where `Avoid native AR today` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Avoid native AR today` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Avoid native AR today` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

A.16. Prepare a backup demo path with static data

Executable steps:
   1. Map where `Prepare a backup demo path with static data` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare a backup demo path with static data` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare a backup demo path with static data` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Deliverables
- Final MVP scope.

- Demo product list.

- Demo user story.

- Feature cut list.

- Team ownership list.

## Acceptance Criteria
- Everyone can explain the MVP in one sentence.

- The team knows what not to build.

- The hackathon demo has one clear story.

# Phase 2 — Product Status and Approval Gate
## Objective
Prevent bad assets from showing as “Approved.”

## TODO
B.1. Replace simple approved/not-approved logic with workflow status

Executable steps:
   1. Map where `Replace simple approved/not-approved logic with workflow status` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Replace simple approved/not-approved logic with workflow status` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Replace simple approved/not-approved logic with workflow status` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

B.2. Add clear statuses for draft, analyzing, failed QA, ready for review, approved, and published

Executable steps:
   1. Map where `Add clear statuses for draft, analyzing, failed QA, ready for review, approved, and published` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add clear statuses for draft, analyzing, failed QA, ready for review, approved, and published` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add clear statuses for draft, analyzing, failed QA, ready for review, approved, and published` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

B.3. Show the correct status badge on product detail

Executable steps:
   1. Map where `Show the correct status badge on product detail` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show the correct status badge on product detail` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show the correct status badge on product detail` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

B.4. Show failed products as Visual QA Failed

Executable steps:
   1. Map where `Show failed products as Visual QA Failed` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show failed products as Visual QA Failed` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show failed products as Visual QA Failed` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

B.5. Show low-quality products as Needs Fix

Executable steps:
   1. Map where `Show low-quality products as Needs Fix` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show low-quality products as Needs Fix` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show low-quality products as Needs Fix` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

B.6. Show good products as Ready for Merchant Review

Executable steps:
   1. Map where `Show good products as Ready for Merchant Review` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show good products as Ready for Merchant Review` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show good products as Ready for Merchant Review` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

B.7. Show approved products only after seller review

Executable steps:
   1. Map where `Show approved products only after seller review` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show approved products only after seller review` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show approved products only after seller review` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

B.8. Block publishing when quality is too low

Executable steps:
   1. Map where `Block publishing when quality is too low` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Block publishing when quality is too low` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Block publishing when quality is too low` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

B.9. Block sharing when product is not approved

Executable steps:
   1. Map where `Block sharing when product is not approved` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Block sharing when product is not approved` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Block sharing when product is not approved` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

B.10. Allow internal preview even when product fails

Executable steps:
   1. Map where `Allow internal preview even when product fails` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Allow internal preview even when product fails` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Allow internal preview even when product fails` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

B.11. Require seller review before final approval

Executable steps:
   1. Map where `Require seller review before final approval` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Require seller review before final approval` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Require seller review before final approval` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

B.12. Require manual override reason if seller approves a risky product

Executable steps:
   1. Map where `Require manual override reason if seller approves a risky product` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Require manual override reason if seller approves a risky product` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Require manual override reason if seller approves a risky product` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

B.13. Show a warning banner when product is not publishable

Executable steps:
   1. Map where `Show a warning banner when product is not publishable` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show a warning banner when product is not publishable` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show a warning banner when product is not publishable` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

B.14. Explain why each disabled button is disabled

Executable steps:
   1. Map where `Explain why each disabled button is disabled` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Explain why each disabled button is disabled` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Explain why each disabled button is disabled` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

B.15. Keep approval logic centralized

Executable steps:
   1. Map where `Keep approval logic centralized` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep approval logic centralized` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep approval logic centralized` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

B.16. Do not let individual buttons bypass product status

Executable steps:
   1. Map where `Do not let individual buttons bypass product status` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Do not let individual buttons bypass product status` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Do not let individual buttons bypass product status` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Deliverables
- Status badge system.

- Approval gate.

- Publish/export blocking behavior.

- Failure warning banner.

- Manual override path.

## Acceptance Criteria
- Failed laptop product does not show “Approved.”

- Publish/export is disabled for failed products.

- Seller understands exactly why approval is blocked.

- Good product can move to merchant review.

# Phase 3 — AI Diagnosis Panel
## Objective
Turn AI analysis from simple scores into a clear decision and action panel.

## TODO
C.1. Show confidence score

Executable steps:
   1. Map where `Show confidence score` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show confidence score` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show confidence score` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.2. Show readiness score

Executable steps:
   1. Map where `Show readiness score` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show readiness score` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show readiness score` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.3. Show visual match score

Executable steps:
   1. Map where `Show visual match score` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show visual match score` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show visual match score` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.4. Show commerce readiness score

Executable steps:
   1. Map where `Show commerce readiness score` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show commerce readiness score` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show commerce readiness score` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.5. Show final quality score

Executable steps:
   1. Map where `Show final quality score` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show final quality score` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show final quality score` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.6. Show detected category

Executable steps:
   1. Map where `Show detected category` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show detected category` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show detected category` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.7. Show expected category

Executable steps:
   1. Map where `Show expected category` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show expected category` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show expected category` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.8. Show conversion result

Executable steps:
   1. Map where `Show conversion result` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show conversion result` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show conversion result` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.9. Show blocking reasons

Executable steps:
   1. Map where `Show blocking reasons` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show blocking reasons` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show blocking reasons` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.10. Show missing product parts

Executable steps:
   1. Map where `Show missing product parts` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show missing product parts` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show missing product parts` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.11. Show recommended actions

Executable steps:
   1. Map where `Show recommended actions` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show recommended actions` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show recommended actions` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.12. Show seller-friendly explanation

Executable steps:
   1. Map where `Show seller-friendly explanation` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show seller-friendly explanation` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show seller-friendly explanation` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.13. Add “Run AI analysis” button

Executable steps:
   1. Map where `Add “Run AI analysis” button` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add “Run AI analysis” button` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add “Run AI analysis” button` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.14. Add “Re-run analysis” button

Executable steps:
   1. Map where `Add “Re-run analysis” button` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add “Re-run analysis” button` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add “Re-run analysis” button` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.15. Add loading state

Executable steps:
   1. Map where `Add loading state` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add loading state` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add loading state` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.16. Add failure state if AI call fails

Executable steps:
   1. Map where `Add failure state if AI call fails` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add failure state if AI call fails` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add failure state if AI call fails` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.17. Add mock mode for demo reliability

Executable steps:
   1. Map where `Add mock mode for demo reliability` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add mock mode for demo reliability` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add mock mode for demo reliability` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.18. Add analysis timestamp

Executable steps:
   1. Map where `Add analysis timestamp` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add analysis timestamp` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add analysis timestamp` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.19. Add analysis version

Executable steps:
   1. Map where `Add analysis version` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add analysis version` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add analysis version` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.20. Store previous analysis attempts

Executable steps:
   1. Map where `Store previous analysis attempts` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Store previous analysis attempts` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Store previous analysis attempts` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.21. Show score changes between attempts

Executable steps:
   1. Map where `Show score changes between attempts` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show score changes between attempts` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show score changes between attempts` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.22. Never show a perfect score unless all gates pass

Executable steps:
   1. Map where `Never show a perfect score unless all gates pass` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Never show a perfect score unless all gates pass` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Never show a perfect score unless all gates pass` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.23. Label AI output as a recommendation, not final truth

Executable steps:
   1. Map where `Label AI output as a recommendation, not final truth` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Label AI output as a recommendation, not final truth` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Label AI output as a recommendation, not final truth` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.24. Keep merchant approval separate from AI diagnosis

Executable steps:
   1. Map where `Keep merchant approval separate from AI diagnosis` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep merchant approval separate from AI diagnosis` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep merchant approval separate from AI diagnosis` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Failed Laptop Diagnosis TODO
C.1. Show that the generated model does not preserve laptop silhouette

Executable steps:
   1. Map where `Show that the generated model does not preserve laptop silhouette` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show that the generated model does not preserve laptop silhouette` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show that the generated model does not preserve laptop silhouette` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.2. Show that keyboard is missing

Executable steps:
   1. Map where `Show that keyboard is missing` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show that keyboard is missing` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show that keyboard is missing` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.3. Show that trackpad is missing

Executable steps:
   1. Map where `Show that trackpad is missing` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show that trackpad is missing` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show that trackpad is missing` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.4. Show that hinge is missing

Executable steps:
   1. Map where `Show that hinge is missing` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show that hinge is missing` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show that hinge is missing` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.5. Show that screen panel is oversimplified

Executable steps:
   1. Map where `Show that screen panel is oversimplified` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show that screen panel is oversimplified` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show that screen panel is oversimplified` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.6. Show that existing hotspots are not useful

Executable steps:
   1. Map where `Show that existing hotspots are not useful` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show that existing hotspots are not useful` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show that existing hotspots are not useful` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.7. Recommend manual GLB fallback

Executable steps:
   1. Map where `Recommend manual GLB fallback` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Recommend manual GLB fallback` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Recommend manual GLB fallback` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.8. Recommend regeneration with stricter constraints

Executable steps:
   1. Map where `Recommend regeneration with stricter constraints` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Recommend regeneration with stricter constraints` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Recommend regeneration with stricter constraints` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.9. Recommend uploading detailed product angles

Executable steps:
   1. Map where `Recommend uploading detailed product angles` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Recommend uploading detailed product angles` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Recommend uploading detailed product angles` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.10. Recommend removing invalid hotspots

Executable steps:
   1. Map where `Recommend removing invalid hotspots` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Recommend removing invalid hotspots` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Recommend removing invalid hotspots` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Successful Product Diagnosis TODO
C.1. Show high readiness score

Executable steps:
   1. Map where `Show high readiness score` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show high readiness score` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show high readiness score` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.2. Show no blocking reasons

Executable steps:
   1. Map where `Show no blocking reasons` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show no blocking reasons` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show no blocking reasons` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.3. Recommend merchant review

Executable steps:
   1. Map where `Recommend merchant review` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Recommend merchant review` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Recommend merchant review` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.4. Recommend public preview generation

Executable steps:
   1. Map where `Recommend public preview generation` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Recommend public preview generation` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Recommend public preview generation` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.5. Recommend export package creation

Executable steps:
   1. Map where `Recommend export package creation` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Recommend export package creation` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Recommend export package creation` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

C.6. Recommend analytics tracking after publishing

Executable steps:
   1. Map where `Recommend analytics tracking after publishing` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Recommend analytics tracking after publishing` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Recommend analytics tracking after publishing` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Deliverables
- AI diagnosis card.

- Blocking reasons list.

- Recommended actions list.

- Missing parts list.

- Demo-safe mock AI output.

## Acceptance Criteria
- Seller knows whether the asset passed or failed.

- Seller knows what to do next.

- AI panel supports the product story clearly.

# Phase 4 — Source Image Readiness
## Objective
Help sellers understand whether their uploaded product images are actually useful.

## TODO
D.1. Count uploaded images

Executable steps:
   1. Map where `Count uploaded images` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Count uploaded images` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Count uploaded images` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.2. Show image grid

Executable steps:
   1. Map where `Show image grid` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show image grid` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show image grid` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.3. Show source readiness score

Executable steps:
   1. Map where `Show source readiness score` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show source readiness score` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show source readiness score` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.4. Show whether enough unique product views exist

Executable steps:
   1. Map where `Show whether enough unique product views exist` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show whether enough unique product views exist` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show whether enough unique product views exist` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.5. Show missing views

Executable steps:
   1. Map where `Show missing views` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show missing views` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show missing views` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.6. Show duplicate or near-duplicate warning

Executable steps:
   1. Map where `Show duplicate or near-duplicate warning` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show duplicate or near-duplicate warning` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show duplicate or near-duplicate warning` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.7. Show low-resolution warning

Executable steps:
   1. Map where `Show low-resolution warning` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show low-resolution warning` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show low-resolution warning` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.8. Show cropped-image warning

Executable steps:
   1. Map where `Show cropped-image warning` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show cropped-image warning` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show cropped-image warning` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.9. Show background inconsistency warning

Executable steps:
   1. Map where `Show background inconsistency warning` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show background inconsistency warning` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show background inconsistency warning` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.10. Show unclear product-angle warning

Executable steps:
   1. Map where `Show unclear product-angle warning` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show unclear product-angle warning` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show unclear product-angle warning` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.11. Let seller label views manually

Executable steps:
   1. Map where `Let seller label views manually` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Let seller label views manually` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Let seller label views manually` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.12. Add checklist for front view

Executable steps:
   1. Map where `Add checklist for front view` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add checklist for front view` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add checklist for front view` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.13. Add checklist for back view

Executable steps:
   1. Map where `Add checklist for back view` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add checklist for back view` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add checklist for back view` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.14. Add checklist for left view

Executable steps:
   1. Map where `Add checklist for left view` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add checklist for left view` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add checklist for left view` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.15. Add checklist for right view

Executable steps:
   1. Map where `Add checklist for right view` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add checklist for right view` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add checklist for right view` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.16. Add checklist for top view

Executable steps:
   1. Map where `Add checklist for top view` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add checklist for top view` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add checklist for top view` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.17. Add checklist for bottom view

Executable steps:
   1. Map where `Add checklist for bottom view` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add checklist for bottom view` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add checklist for bottom view` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.18. Add checklist for detail close-up

Executable steps:
   1. Map where `Add checklist for detail close-up` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add checklist for detail close-up` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add checklist for detail close-up` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.19. Add checklist for scale/context view

Executable steps:
   1. Map where `Add checklist for scale/context view` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add checklist for scale/context view` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add checklist for scale/context view` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.20. Add “Upload missing views” action

Executable steps:
   1. Map where `Add “Upload missing views” action` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add “Upload missing views” action` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add “Upload missing views” action` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.21. Add “Remove weak images” action

Executable steps:
   1. Map where `Add “Remove weak images” action` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add “Remove weak images” action` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add “Remove weak images” action` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.22. Add “Continue anyway” only as internal review, not publish

Executable steps:
   1. Map where `Add “Continue anyway” only as internal review, not publish` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add “Continue anyway” only as internal review, not publish` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add “Continue anyway” only as internal review, not publish` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

D.23. Explain that many images do not always mean useful images

Executable steps:
   1. Map where `Explain that many images do not always mean useful images` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Explain that many images do not always mean useful images` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Explain that many images do not always mean useful images` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Deliverables
- Source image readiness card.

- Missing image view checklist.

- Image quality warnings.

- Upload improvement actions.

## Acceptance Criteria
- Seller sees why many laptop images can still fail.

- Seller knows which image angles to add.

- Generation/review flow has better input discipline.

# Phase 5 — 3D Preview and Manual GLB Fallback
## Objective
Make the demo reliable even when AI generation fails.

## TODO
E.1. Keep manual GLB upload as a first-class fallback

Executable steps:
   1. Map where `Keep manual GLB upload as a first-class fallback` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep manual GLB upload as a first-class fallback` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep manual GLB upload as a first-class fallback` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

E.2. Rename the fallback section clearly

Executable steps:
   1. Map where `Rename the fallback section clearly` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Rename the fallback section clearly` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Rename the fallback section clearly` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

E.3. Explain when manual GLB should be used

Executable steps:
   1. Map where `Explain when manual GLB should be used` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Explain when manual GLB should be used` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Explain when manual GLB should be used` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

E.4. Load GLB in the product detail viewer

Executable steps:
   1. Map where `Load GLB in the product detail viewer` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Load GLB in the product detail viewer` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Load GLB in the product detail viewer` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

E.5. Show loading state

Executable steps:
   1. Map where `Show loading state` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show loading state` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show loading state` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

E.6. Show failed-load state

Executable steps:
   1. Map where `Show failed-load state` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show failed-load state` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show failed-load state` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

E.7. Show no-model state

Executable steps:
   1. Map where `Show no-model state` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show no-model state` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show no-model state` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

E.8. Show model-ready state

Executable steps:
   1. Map where `Show model-ready state` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show model-ready state` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show model-ready state` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

E.9. Show model-failed-QA state

Executable steps:
   1. Map where `Show model-failed-QA state` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show model-failed-QA state` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show model-failed-QA state` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

E.10. Add reset camera action

Executable steps:
   1. Map where `Add reset camera action` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add reset camera action` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add reset camera action` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

E.11. Add model preview image if possible

Executable steps:
   1. Map where `Add model preview image if possible` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add model preview image if possible` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add model preview image if possible` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

E.12. Show model file name

Executable steps:
   1. Map where `Show model file name` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show model file name` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show model file name` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

E.13. Show model upload date

Executable steps:
   1. Map where `Show model upload date` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show model upload date` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show model upload date` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

E.14. Show model file size

Executable steps:
   1. Map where `Show model file size` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show model file size` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show model file size` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

E.15. Show model source: AI-generated or manual fallback

Executable steps:
   1. Map where `Show model source: AI-generated or manual fallback` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show model source: AI-generated or manual fallback` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show model source: AI-generated or manual fallback` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

E.16. Require merchant review even for manual GLB

Executable steps:
   1. Map where `Require merchant review even for manual GLB` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Require merchant review even for manual GLB` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Require merchant review even for manual GLB` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

E.17. Do not automatically approve manual GLB

Executable steps:
   1. Map where `Do not automatically approve manual GLB` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Do not automatically approve manual GLB` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Do not automatically approve manual GLB` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

E.18. Allow internal preview for failed model

Executable steps:
   1. Map where `Allow internal preview for failed model` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Allow internal preview for failed model` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Allow internal preview for failed model` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

E.19. Do not allow public publishing for failed model

Executable steps:
   1. Map where `Do not allow public publishing for failed model` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Do not allow public publishing for failed model` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Do not allow public publishing for failed model` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Deliverables
- Reliable 3D viewer.

- Manual GLB fallback workflow.

- Model status labels.

- Viewer error handling.

## Acceptance Criteria
- Demo does not fail if image-to-3D generation is bad.

- Manual GLB fallback is understandable.

- Seller can recover from bad AI generation.

# Phase 6 — Hotspot QA and Hotspot Editor
## Objective
Prevent meaningless hotspots from appearing on product pages.

## TODO
F.1. Show all hotspots in a clear list

Executable steps:
   1. Map where `Show all hotspots in a clear list` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show all hotspots in a clear list` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show all hotspots in a clear list` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.2. Allow hotspot label editing

Executable steps:
   1. Map where `Allow hotspot label editing` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Allow hotspot label editing` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Allow hotspot label editing` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.3. Allow hotspot description editing

Executable steps:
   1. Map where `Allow hotspot description editing` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Allow hotspot description editing` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Allow hotspot description editing` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.4. Allow hotspot type selection

Executable steps:
   1. Map where `Allow hotspot type selection` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Allow hotspot type selection` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Allow hotspot type selection` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.5. Allow hotspot approval toggle

Executable steps:
   1. Map where `Allow hotspot approval toggle` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Allow hotspot approval toggle` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Allow hotspot approval toggle` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.6. Allow hotspot deletion

Executable steps:
   1. Map where `Allow hotspot deletion` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Allow hotspot deletion` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Allow hotspot deletion` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.7. Allow hotspot regeneration

Executable steps:
   1. Map where `Allow hotspot regeneration` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Allow hotspot regeneration` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Allow hotspot regeneration` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.8. Add hotspot quality status

Executable steps:
   1. Map where `Add hotspot quality status` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add hotspot quality status` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add hotspot quality status` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.9. Reject empty hotspot labels

Executable steps:
   1. Map where `Reject empty hotspot labels` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Reject empty hotspot labels` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Reject empty hotspot labels` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.10. Reject meaningless labels

Executable steps:
   1. Map where `Reject meaningless labels` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Reject meaningless labels` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Reject meaningless labels` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.11. Reject test labels

Executable steps:
   1. Map where `Reject test labels` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Reject test labels` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Reject test labels` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.12. Reject labels unrelated to product category

Executable steps:
   1. Map where `Reject labels unrelated to product category` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Reject labels unrelated to product category` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Reject labels unrelated to product category` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.13. Require buyer-useful description

Executable steps:
   1. Map where `Require buyer-useful description` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Require buyer-useful description` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Require buyer-useful description` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.14. Require hotspot type

Executable steps:
   1. Map where `Require hotspot type` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Require hotspot type` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Require hotspot type` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.15. Require all public hotspots to be approved

Executable steps:
   1. Map where `Require all public hotspots to be approved` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Require all public hotspots to be approved` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Require all public hotspots to be approved` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.16. Warn when hotspot points to missing model parts

Executable steps:
   1. Map where `Warn when hotspot points to missing model parts` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Warn when hotspot points to missing model parts` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Warn when hotspot points to missing model parts` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.17. Show invalid hotspots in red

Executable steps:
   1. Map where `Show invalid hotspots in red` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show invalid hotspots in red` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show invalid hotspots in red` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.18. Show valid hotspots in green

Executable steps:
   1. Map where `Show valid hotspots in green` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show valid hotspots in green` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show valid hotspots in green` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.19. Block publish if any public hotspot is invalid

Executable steps:
   1. Map where `Block publish if any public hotspot is invalid` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Block publish if any public hotspot is invalid` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Block publish if any public hotspot is invalid` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.20. Add “Validate hotspots” action

Executable steps:
   1. Map where `Add “Validate hotspots” action` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add “Validate hotspots” action` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add “Validate hotspots” action` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.21. Add “Generate better hotspots” action

Executable steps:
   1. Map where `Add “Generate better hotspots” action` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add “Generate better hotspots” action` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add “Generate better hotspots” action` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Laptop Hotspot TODO
F.1. Suggest keyboard layout only if keyboard is visible

Executable steps:
   1. Map where `Suggest keyboard layout only if keyboard is visible` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Suggest keyboard layout only if keyboard is visible` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Suggest keyboard layout only if keyboard is visible` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.2. Suggest trackpad only if trackpad is visible

Executable steps:
   1. Map where `Suggest trackpad only if trackpad is visible` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Suggest trackpad only if trackpad is visible` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Suggest trackpad only if trackpad is visible` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.3. Suggest screen hinge only if hinge is visible

Executable steps:
   1. Map where `Suggest screen hinge only if hinge is visible` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Suggest screen hinge only if hinge is visible` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Suggest screen hinge only if hinge is visible` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.4. Suggest ports only if ports are visible

Executable steps:
   1. Map where `Suggest ports only if ports are visible` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Suggest ports only if ports are visible` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Suggest ports only if ports are visible` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.5. Reject “selami.”

Executable steps:
   1. Map where `Reject “selami.”` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Reject “selami.”` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Reject “selami.”` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.6. Reject “hop.”

Executable steps:
   1. Map where `Reject “hop.”` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Reject “hop.”` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Reject “hop.”` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.7. Reject placeholder/demo labels

Executable steps:
   1. Map where `Reject placeholder/demo labels` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Reject placeholder/demo labels` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Reject placeholder/demo labels` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Good Product Hotspot TODO
F.1. Suggest material hotspot

Executable steps:
   1. Map where `Suggest material hotspot` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Suggest material hotspot` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Suggest material hotspot` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.2. Suggest dimension hotspot

Executable steps:
   1. Map where `Suggest dimension hotspot` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Suggest dimension hotspot` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Suggest dimension hotspot` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.3. Suggest usage/context hotspot

Executable steps:
   1. Map where `Suggest usage/context hotspot` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Suggest usage/context hotspot` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Suggest usage/context hotspot` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.4. Suggest care instruction hotspot

Executable steps:
   1. Map where `Suggest care instruction hotspot` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Suggest care instruction hotspot` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Suggest care instruction hotspot` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

F.5. Suggest feature differentiation hotspot

Executable steps:
   1. Map where `Suggest feature differentiation hotspot` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Suggest feature differentiation hotspot` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Suggest feature differentiation hotspot` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Deliverables
- Hotspot editor page.

- Hotspot validation.

- Hotspot approval workflow.

- Public hotspot gating.

## Acceptance Criteria
- Bad hotspot labels cannot be published.

- Public page only shows useful hotspots.

- Seller can edit AI-generated hotspots before publishing.

# Phase 7 — Merchant Review Control Center
## Objective
Create the final seller approval page.

## TODO
G.1. Create a merchant review page

Executable steps:
   1. Map where `Create a merchant review page` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Create a merchant review page` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Create a merchant review page` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.2. Show product metadata

Executable steps:
   1. Map where `Show product metadata` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show product metadata` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show product metadata` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.3. Show source images

Executable steps:
   1. Map where `Show source images` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show source images` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show source images` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.4. Show 3D preview

Executable steps:
   1. Map where `Show 3D preview` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show 3D preview` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show 3D preview` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.5. Show AI diagnosis

Executable steps:
   1. Map where `Show AI diagnosis` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show AI diagnosis` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show AI diagnosis` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.6. Show hotspot list

Executable steps:
   1. Map where `Show hotspot list` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show hotspot list` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show hotspot list` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.7. Show source readiness

Executable steps:
   1. Map where `Show source readiness` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show source readiness` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show source readiness` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.8. Show quality checklist

Executable steps:
   1. Map where `Show quality checklist` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show quality checklist` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show quality checklist` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.9. Show export readiness

Executable steps:
   1. Map where `Show export readiness` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show export readiness` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show export readiness` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.10. Show blocking reasons

Executable steps:
   1. Map where `Show blocking reasons` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show blocking reasons` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show blocking reasons` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.11. Show recommended fixes

Executable steps:
   1. Map where `Show recommended fixes` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show recommended fixes` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show recommended fixes` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.12. Add approve action

Executable steps:
   1. Map where `Add approve action` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add approve action` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add approve action` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.13. Add reject action

Executable steps:
   1. Map where `Add reject action` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add reject action` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add reject action` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.14. Add request regeneration action

Executable steps:
   1. Map where `Add request regeneration action` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add request regeneration action` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add request regeneration action` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.15. Add use manual GLB fallback action

Executable steps:
   1. Map where `Add use manual GLB fallback action` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add use manual GLB fallback action` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add use manual GLB fallback action` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.16. Add save merchant note action

Executable steps:
   1. Map where `Add save merchant note action` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add save merchant note action` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add save merchant note action` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.17. Add manual override action

Executable steps:
   1. Map where `Add manual override action` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add manual override action` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add manual override action` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.18. Require reason for manual override

Executable steps:
   1. Map where `Require reason for manual override` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Require reason for manual override` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Require reason for manual override` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.19. Disable approve when critical checklist items fail

Executable steps:
   1. Map where `Disable approve when critical checklist items fail` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Disable approve when critical checklist items fail` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Disable approve when critical checklist items fail` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.20. Record review decision

Executable steps:
   1. Map where `Record review decision` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Record review decision` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Record review decision` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.21. Record reviewer name or user

Executable steps:
   1. Map where `Record reviewer name or user` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Record reviewer name or user` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Record reviewer name or user` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.22. Record review timestamp

Executable steps:
   1. Map where `Record review timestamp` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Record review timestamp` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Record review timestamp` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.23. Show decision history

Executable steps:
   1. Map where `Show decision history` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show decision history` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show decision history` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Review Checklist TODO
G.1. Product name exists

Executable steps:
   1. Map where `Product name exists` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Product name exists` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Product name exists` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.2. Category exists

Executable steps:
   1. Map where `Category exists` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Category exists` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Category exists` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.3. Source images exist

Executable steps:
   1. Map where `Source images exist` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Source images exist` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Source images exist` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.4. Source readiness passes

Executable steps:
   1. Map where `Source readiness passes` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Source readiness passes` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Source readiness passes` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.5. GLB or fallback media exists

Executable steps:
   1. Map where `GLB or fallback media exists` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `GLB or fallback media exists` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `GLB or fallback media exists` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.6. Visual QA passes

Executable steps:
   1. Map where `Visual QA passes` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Visual QA passes` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Visual QA passes` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.7. AI confidence passes

Executable steps:
   1. Map where `AI confidence passes` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `AI confidence passes` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `AI confidence passes` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.8. Hotspots are valid

Executable steps:
   1. Map where `Hotspots are valid` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Hotspots are valid` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Hotspots are valid` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.9. Product description is ready

Executable steps:
   1. Map where `Product description is ready` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Product description is ready` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Product description is ready` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.10. Export package is ready

Executable steps:
   1. Map where `Export package is ready` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Export package is ready` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Export package is ready` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

G.11. Public preview is allowed

Executable steps:
   1. Map where `Public preview is allowed` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Public preview is allowed` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Public preview is allowed` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Deliverables
- Merchant review page.

- Review checklist.

- Review decision actions.

- Decision history.

## Acceptance Criteria
- Seller cannot approve accidentally.

- Failed product has clear next steps.

- Good product can be approved and moved to publish/export.

# Phase 8 — Public Product Page
## Objective
Create the buyer-facing product experience.

## TODO
H.1. Create public product preview page

Executable steps:
   1. Map where `Create public product preview page` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Create public product preview page` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Create public product preview page` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.2. Show product title

Executable steps:
   1. Map where `Show product title` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show product title` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show product title` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.3. Show product category

Executable steps:
   1. Map where `Show product category` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show product category` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show product category` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.4. Show approved 3D viewer

Executable steps:
   1. Map where `Show approved 3D viewer` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show approved 3D viewer` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show approved 3D viewer` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.5. Show fallback image gallery when model is unavailable

Executable steps:
   1. Map where `Show fallback image gallery when model is unavailable` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show fallback image gallery when model is unavailable` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show fallback image gallery when model is unavailable` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.6. Show only approved hotspots

Executable steps:
   1. Map where `Show only approved hotspots` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show only approved hotspots` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show only approved hotspots` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.7. Show product description

Executable steps:
   1. Map where `Show product description` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show product description` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show product description` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.8. Show materials

Executable steps:
   1. Map where `Show materials` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show materials` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show materials` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.9. Show dimensions if available

Executable steps:
   1. Map where `Show dimensions if available` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show dimensions if available` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show dimensions if available` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.10. Show buyer confidence checklist

Executable steps:
   1. Map where `Show buyer confidence checklist` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show buyer confidence checklist` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show buyer confidence checklist` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.11. Show seller-approved trust note

Executable steps:
   1. Map where `Show seller-approved trust note` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show seller-approved trust note` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show seller-approved trust note` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.12. Add mock CTA

Executable steps:
   1. Map where `Add mock CTA` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add mock CTA` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add mock CTA` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.13. Add share action

Executable steps:
   1. Map where `Add share action` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add share action` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add share action` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.14. Track page view

Executable steps:
   1. Map where `Track page view` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Track page view` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Track page view` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.15. Track hotspot click

Executable steps:
   1. Map where `Track hotspot click` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Track hotspot click` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Track hotspot click` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.16. Track model interaction

Executable steps:
   1. Map where `Track model interaction` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Track model interaction` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Track model interaction` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.17. Track CTA click

Executable steps:
   1. Map where `Track CTA click` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Track CTA click` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Track CTA click` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.18. Hide buyer-facing page for failed products

Executable steps:
   1. Map where `Hide buyer-facing page for failed products` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Hide buyer-facing page for failed products` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Hide buyer-facing page for failed products` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.19. Allow internal preview mode for failed products

Executable steps:
   1. Map where `Allow internal preview mode for failed products` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Allow internal preview mode for failed products` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Allow internal preview mode for failed products` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.20. Clearly mark unapproved previews as internal only

Executable steps:
   1. Map where `Clearly mark unapproved previews as internal only` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Clearly mark unapproved previews as internal only` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Clearly mark unapproved previews as internal only` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Buyer Confidence Checklist TODO
H.1. Show size clarity

Executable steps:
   1. Map where `Show size clarity` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show size clarity` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show size clarity` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.2. Show material clarity

Executable steps:
   1. Map where `Show material clarity` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show material clarity` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show material clarity` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.3. Show main feature clarity

Executable steps:
   1. Map where `Show main feature clarity` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show main feature clarity` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show main feature clarity` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.4. Show use-case clarity

Executable steps:
   1. Map where `Show use-case clarity` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show use-case clarity` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show use-case clarity` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.5. Show product limitations if relevant

Executable steps:
   1. Map where `Show product limitations if relevant` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show product limitations if relevant` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show product limitations if relevant` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

H.6. Show “seller approved” indication

Executable steps:
   1. Map where `Show “seller approved” indication` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show “seller approved” indication` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show “seller approved” indication` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Deliverables
- Public product preview page.

- Internal preview mode.

- Buyer-facing hotspot display.

- Basic interaction tracking.

## Acceptance Criteria
- Approved product has clean public page.

- Failed product is not accidentally buyer-facing.

- Public page communicates product value clearly.

# Phase 9 — Share and Embed
## Objective
Let sellers distribute approved product experiences.

## TODO
I.1. Add share modal

Executable steps:
   1. Map where `Add share modal` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add share modal` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add share modal` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

I.2. Add copy public link action

Executable steps:
   1. Map where `Add copy public link action` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add copy public link action` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add copy public link action` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

I.3. Add copy internal review link action

Executable steps:
   1. Map where `Add copy internal review link action` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add copy internal review link action` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add copy internal review link action` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

I.4. Add open in new tab action

Executable steps:
   1. Map where `Add open in new tab action` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add open in new tab action` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add open in new tab action` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

I.5. Add embed code display

Executable steps:
   1. Map where `Add embed code display` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add embed code display` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add embed code display` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

I.6. Add iframe embed option

Executable steps:
   1. Map where `Add iframe embed option` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add iframe embed option` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add iframe embed option` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

I.7. Add script embed option as mock if needed

Executable steps:
   1. Map where `Add script embed option as mock if needed` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add script embed option as mock if needed` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add script embed option as mock if needed` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

I.8. Add disabled state for failed products

Executable steps:
   1. Map where `Add disabled state for failed products` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add disabled state for failed products` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add disabled state for failed products` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

I.9. Add warning when sharing unapproved preview

Executable steps:
   1. Map where `Add warning when sharing unapproved preview` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add warning when sharing unapproved preview` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add warning when sharing unapproved preview` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

I.10. Add QR code only if time remains

Executable steps:
   1. Map where `Add QR code only if time remains` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add QR code only if time remains` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add QR code only if time remains` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

I.11. Add copy success toast

Executable steps:
   1. Map where `Add copy success toast` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add copy success toast` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add copy success toast` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

I.12. Add share event tracking

Executable steps:
   1. Map where `Add share event tracking` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add share event tracking` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add share event tracking` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Share Rules TODO
I.1. Approved products can be publicly shared

Executable steps:
   1. Map where `Approved products can be publicly shared` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Approved products can be publicly shared` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Approved products can be publicly shared` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

I.2. Published products can be embedded

Executable steps:
   1. Map where `Published products can be embedded` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Published products can be embedded` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Published products can be embedded` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

I.3. Failed products can only be internally previewed

Executable steps:
   1. Map where `Failed products can only be internally previewed` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Failed products can only be internally previewed` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Failed products can only be internally previewed` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

I.4. Products with invalid hotspots cannot be embedded

Executable steps:
   1. Map where `Products with invalid hotspots cannot be embedded` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Products with invalid hotspots cannot be embedded` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Products with invalid hotspots cannot be embedded` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

I.5. Products with manual override show warning

Executable steps:
   1. Map where `Products with manual override show warning` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Products with manual override show warning` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Products with manual override show warning` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Deliverables
- Share modal.

- Embed modal.

- Copy link behavior.

- Share/Embed gating.

## Acceptance Criteria
- Seller can share approved preview.

- Seller cannot accidentally embed failed product.

- Share/export story is clear.

# Phase 10 — Trendyol Readiness and Export Package
## Objective
Make the marketplace/provider story credible without building real Trendyol integration today.

## TODO
J.1. Rename “Publish to Trendyol” to “Trendyol Readiness” or “Export Trendyol Package.”

Executable steps:
   1. Map where `Rename “Publish to Trendyol” to “Trendyol Readiness” or “Export Trendyol Package.”` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Rename “Publish to Trendyol” to “Trendyol Readiness” or “Export Trendyol Package.”` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Rename “Publish to Trendyol” to “Trendyol Readiness” or “Export Trendyol Package.”` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.2. Add readiness checklist

Executable steps:
   1. Map where `Add readiness checklist` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add readiness checklist` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add readiness checklist` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.3. Check product title

Executable steps:
   1. Map where `Check product title` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Check product title` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Check product title` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.4. Check category

Executable steps:
   1. Map where `Check category` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Check category` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Check category` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.5. Check description

Executable steps:
   1. Map where `Check description` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Check description` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Check description` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.6. Check product images

Executable steps:
   1. Map where `Check product images` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Check product images` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Check product images` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.7. Check approval status

Executable steps:
   1. Map where `Check approval status` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Check approval status` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Check approval status` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.8. Check quality score

Executable steps:
   1. Map where `Check quality score` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Check quality score` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Check quality score` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.9. Check hotspot approval

Executable steps:
   1. Map where `Check hotspot approval` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Check hotspot approval` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Check hotspot approval` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.10. Check GLB availability as optional asset

Executable steps:
   1. Map where `Check GLB availability as optional asset` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Check GLB availability as optional asset` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Check GLB availability as optional asset` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.11. Show ready/not-ready state

Executable steps:
   1. Map where `Show ready/not-ready state` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show ready/not-ready state` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show ready/not-ready state` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.12. Show missing requirements

Executable steps:
   1. Map where `Show missing requirements` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show missing requirements` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show missing requirements` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.13. Generate export package summary

Executable steps:
   1. Map where `Generate export package summary` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Generate export package summary` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Generate export package summary` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.14. Add copy export data action

Executable steps:
   1. Map where `Add copy export data action` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add copy export data action` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add copy export data action` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.15. Add download export data action if time allows

Executable steps:
   1. Map where `Add download export data action if time allows` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add download export data action if time allows` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add download export data action if time allows` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.16. Add warning that this is not live API submission

Executable steps:
   1. Map where `Add warning that this is not live API submission` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add warning that this is not live API submission` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add warning that this is not live API submission` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.17. Track export package generation

Executable steps:
   1. Map where `Track export package generation` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Track export package generation` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Track export package generation` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Export Package TODO
J.1. Include product title

Executable steps:
   1. Map where `Include product title` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Include product title` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Include product title` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.2. Include product category

Executable steps:
   1. Map where `Include product category` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Include product category` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Include product category` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.3. Include product description

Executable steps:
   1. Map where `Include product description` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Include product description` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Include product description` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.4. Include image links

Executable steps:
   1. Map where `Include image links` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Include image links` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Include image links` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.5. Include GLB link if available

Executable steps:
   1. Map where `Include GLB link if available` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Include GLB link if available` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Include GLB link if available` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.6. Include public preview link if approved

Executable steps:
   1. Map where `Include public preview link if approved` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Include public preview link if approved` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Include public preview link if approved` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.7. Include quality score

Executable steps:
   1. Map where `Include quality score` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Include quality score` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Include quality score` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.8. Include materials

Executable steps:
   1. Map where `Include materials` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Include materials` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Include materials` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.9. Include dimensions

Executable steps:
   1. Map where `Include dimensions` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Include dimensions` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Include dimensions` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.10. Include approved hotspots

Executable steps:
   1. Map where `Include approved hotspots` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Include approved hotspots` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Include approved hotspots` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.11. Include seller notes

Executable steps:
   1. Map where `Include seller notes` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Include seller notes` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Include seller notes` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

J.12. Include quality report summary

Executable steps:
   1. Map where `Include quality report summary` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Include quality report summary` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Include quality report summary` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Deliverables
- Trendyol readiness modal/page.

- Export package preview.

- Copy/download export action.

- Not-ready explanation.

## Acceptance Criteria
- Button does not overpromise real publishing.

- Seller sees exactly what is missing.

- Provider/platform value is visible.

# Phase 11 — Analytics MVP
## Objective
Show that Minimal Block is a commerce tool, not just a visual tool.

## TODO
K.1. Track product upload

Executable steps:
   1. Map where `Track product upload` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Track product upload` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Track product upload` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.2. Track AI analysis start

Executable steps:
   1. Map where `Track AI analysis start` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Track AI analysis start` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Track AI analysis start` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.3. Track AI analysis completion

Executable steps:
   1. Map where `Track AI analysis completion` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Track AI analysis completion` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Track AI analysis completion` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.4. Track visual QA failure

Executable steps:
   1. Map where `Track visual QA failure` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Track visual QA failure` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Track visual QA failure` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.5. Track merchant review open

Executable steps:
   1. Map where `Track merchant review open` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Track merchant review open` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Track merchant review open` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.6. Track product approval

Executable steps:
   1. Map where `Track product approval` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Track product approval` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Track product approval` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.7. Track product rejection

Executable steps:
   1. Map where `Track product rejection` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Track product rejection` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Track product rejection` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.8. Track public page view

Executable steps:
   1. Map where `Track public page view` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Track public page view` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Track public page view` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.9. Track model load

Executable steps:
   1. Map where `Track model load` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Track model load` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Track model load` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.10. Track hotspot click

Executable steps:
   1. Map where `Track hotspot click` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Track hotspot click` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Track hotspot click` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.11. Track share click

Executable steps:
   1. Map where `Track share click` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Track share click` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Track share click` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.12. Track export package generation

Executable steps:
   1. Map where `Track export package generation` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Track export package generation` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Track export package generation` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.13. Show product-level stats

Executable steps:
   1. Map where `Show product-level stats` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show product-level stats` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show product-level stats` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.14. Show store-level stats

Executable steps:
   1. Map where `Show store-level stats` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show store-level stats` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show store-level stats` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.15. Seed analytics for demo products

Executable steps:
   1. Map where `Seed analytics for demo products` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Seed analytics for demo products` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Seed analytics for demo products` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.16. Add simple stat cards

Executable steps:
   1. Map where `Add simple stat cards` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add simple stat cards` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add simple stat cards` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.17. Avoid complex charts if time is short

Executable steps:
   1. Map where `Avoid complex charts if time is short` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Avoid complex charts if time is short` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Avoid complex charts if time is short` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.18. Show status history

Executable steps:
   1. Map where `Show status history` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show status history` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show status history` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.19. Show most common failure reason

Executable steps:
   1. Map where `Show most common failure reason` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show most common failure reason` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show most common failure reason` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.20. Show current recommended action

Executable steps:
   1. Map where `Show current recommended action` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show current recommended action` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show current recommended action` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Product Detail Analytics TODO
K.1. Preview views

Executable steps:
   1. Map where `Preview views` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Preview views` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Preview views` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.2. Model loads

Executable steps:
   1. Map where `Model loads` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Model loads` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Model loads` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.3. Hotspot clicks

Executable steps:
   1. Map where `Hotspot clicks` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Hotspot clicks` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Hotspot clicks` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.4. Share clicks

Executable steps:
   1. Map where `Share clicks` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Share clicks` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Share clicks` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.5. Export clicks

Executable steps:
   1. Map where `Export clicks` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Export clicks` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Export clicks` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.6. Current quality score

Executable steps:
   1. Map where `Current quality score` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Current quality score` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Current quality score` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.7. Current status

Executable steps:
   1. Map where `Current status` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Current status` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Current status` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.8. Last AI analysis date

Executable steps:
   1. Map where `Last AI analysis date` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Last AI analysis date` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Last AI analysis date` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.9. Last review decision

Executable steps:
   1. Map where `Last review decision` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Last review decision` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Last review decision` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Store Analytics TODO
K.1. Total products

Executable steps:
   1. Map where `Total products` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Total products` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Total products` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.2. Products approved

Executable steps:
   1. Map where `Products approved` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Products approved` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Products approved` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.3. Products failed QA

Executable steps:
   1. Map where `Products failed QA` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Products failed QA` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Products failed QA` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.4. Products published

Executable steps:
   1. Map where `Products published` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Products published` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Products published` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.5. Average readiness score

Executable steps:
   1. Map where `Average readiness score` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Average readiness score` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Average readiness score` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.6. Average quality score

Executable steps:
   1. Map where `Average quality score` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Average quality score` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Average quality score` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

K.7. Most common blocking reason

Executable steps:
   1. Map where `Most common blocking reason` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Most common blocking reason` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Most common blocking reason` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Deliverables
- Product analytics cards.

- Store analytics cards.

- Seeded demo metrics.

- Event tracking helper or mock event logger.

## Acceptance Criteria
- Seller can see product quality and engagement.

- Demo shows business value.

- Minimal Block looks measurable and operational.

# Phase 12 — Expo Go Mobile Capture
## Objective
Add mobile seller capture only if the core web MVP is stable.

## MVP Priority
Expo is useful, but not mandatory for one-day hackathon readiness. Build it only after core web flow works.

## TODO
L.1. Create Expo Go app

Executable steps:
   1. Map where `Create Expo Go app` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Create Expo Go app` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Create Expo Go app` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

L.2. Add product list

Executable steps:
   1. Map where `Add product list` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add product list` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add product list` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

L.3. Add create product screen

Executable steps:
   1. Map where `Add create product screen` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add create product screen` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add create product screen` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

L.4. Add camera or image picker

Executable steps:
   1. Map where `Add camera or image picker` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add camera or image picker` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add camera or image picker` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

L.5. Add source view checklist

Executable steps:
   1. Map where `Add source view checklist` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add source view checklist` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add source view checklist` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

L.6. Let seller capture front view

Executable steps:
   1. Map where `Let seller capture front view` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Let seller capture front view` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Let seller capture front view` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

L.7. Let seller capture back view

Executable steps:
   1. Map where `Let seller capture back view` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Let seller capture back view` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Let seller capture back view` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

L.8. Let seller capture side view

Executable steps:
   1. Map where `Let seller capture side view` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Let seller capture side view` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Let seller capture side view` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

L.9. Let seller capture top view

Executable steps:
   1. Map where `Let seller capture top view` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Let seller capture top view` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Let seller capture top view` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

L.10. Let seller capture bottom view

Executable steps:
   1. Map where `Let seller capture bottom view` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Let seller capture bottom view` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Let seller capture bottom view` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

L.11. Let seller capture detail view

Executable steps:
   1. Map where `Let seller capture detail view` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Let seller capture detail view` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Let seller capture detail view` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

L.12. Upload images to same backend/storage

Executable steps:
   1. Map where `Upload images to same backend/storage` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Upload images to same backend/storage` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Upload images to same backend/storage` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

L.13. Trigger source readiness analysis

Executable steps:
   1. Map where `Trigger source readiness analysis` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Trigger source readiness analysis` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Trigger source readiness analysis` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

L.14. Show missing views

Executable steps:
   1. Map where `Show missing views` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show missing views` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show missing views` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

L.15. Let seller retake missing images

Executable steps:
   1. Map where `Let seller retake missing images` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Let seller retake missing images` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Let seller retake missing images` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

L.16. Open product detail or public preview in web view

Executable steps:
   1. Map where `Open product detail or public preview in web view` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Open product detail or public preview in web view` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Open product detail or public preview in web view` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

L.17. Add share preview action if time remains

Executable steps:
   1. Map where `Add share preview action if time remains` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add share preview action if time remains` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add share preview action if time remains` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Deliverables
- Mobile product capture flow.

- Mobile upload flow.

- Mobile missing-view checklist.

- Web preview handoff.

## Acceptance Criteria
- Seller can capture better product images from phone.

- Mobile supports source readiness story.

- Mobile does not distract from core MVP.

# Phase 13 — Demo Data and Backup Mode
## Objective
Make the demo reliable even if AI, 3D, or network services fail.

## TODO
M.1. Prepare failed laptop product

Executable steps:
   1. Map where `Prepare failed laptop product` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare failed laptop product` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare failed laptop product` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.2. Prepare approved chair/lamp/bag product

Executable steps:
   1. Map where `Prepare approved chair/lamp/bag product` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare approved chair/lamp/bag product` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare approved chair/lamp/bag product` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.3. Prepare medium-warning product if time allows

Executable steps:
   1. Map where `Prepare medium-warning product if time allows` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare medium-warning product if time allows` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare medium-warning product if time allows` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.4. Add static source images

Executable steps:
   1. Map where `Add static source images` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add static source images` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add static source images` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.5. Add static GLB files

Executable steps:
   1. Map where `Add static GLB files` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add static GLB files` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add static GLB files` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.6. Add static AI analysis results

Executable steps:
   1. Map where `Add static AI analysis results` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add static AI analysis results` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add static AI analysis results` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.7. Add static hotspot lists

Executable steps:
   1. Map where `Add static hotspot lists` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add static hotspot lists` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add static hotspot lists` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.8. Add static analytics metrics

Executable steps:
   1. Map where `Add static analytics metrics` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add static analytics metrics` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add static analytics metrics` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.9. Add demo reset action

Executable steps:
   1. Map where `Add demo reset action` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add demo reset action` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add demo reset action` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.10. Add mock AI mode

Executable steps:
   1. Map where `Add mock AI mode` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add mock AI mode` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add mock AI mode` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.11. Add fallback if Gemini fails

Executable steps:
   1. Map where `Add fallback if Gemini fails` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add fallback if Gemini fails` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add fallback if Gemini fails` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.12. Add fallback if GLB fails

Executable steps:
   1. Map where `Add fallback if GLB fails` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add fallback if GLB fails` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add fallback if GLB fails` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.13. Add fallback if analytics fails

Executable steps:
   1. Map where `Add fallback if analytics fails` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add fallback if analytics fails` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add fallback if analytics fails` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.14. Record a backup demo video

Executable steps:
   1. Map where `Record a backup demo video` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Record a backup demo video` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Record a backup demo video` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.15. Test demo on the actual machine

Executable steps:
   1. Map where `Test demo on the actual machine` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Test demo on the actual machine` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Test demo on the actual machine` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.16. Test demo in the actual browser

Executable steps:
   1. Map where `Test demo in the actual browser` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Test demo in the actual browser` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Test demo in the actual browser` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.17. Test with slow network disabled if possible

Executable steps:
   1. Map where `Test with slow network disabled if possible` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Test with slow network disabled if possible` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Test with slow network disabled if possible` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.18. Keep all demo assets local or cached

Executable steps:
   1. Map where `Keep all demo assets local or cached` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Keep all demo assets local or cached` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Keep all demo assets local or cached` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.19. Failed Laptop Demo TODO

Executable steps:
   1. Map where `Failed Laptop Demo TODO` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Failed Laptop Demo TODO` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Failed Laptop Demo TODO` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.20. Show many uploaded images

Executable steps:
   1. Map where `Show many uploaded images` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show many uploaded images` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show many uploaded images` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.21. Show bad model preview

Executable steps:
   1. Map where `Show bad model preview` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show bad model preview` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show bad model preview` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.22. Show low confidence

Executable steps:
   1. Map where `Show low confidence` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show low confidence` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show low confidence` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.23. Show low readiness

Executable steps:
   1. Map where `Show low readiness` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show low readiness` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show low readiness` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.24. Show failed QA status

Executable steps:
   1. Map where `Show failed QA status` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show failed QA status` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show failed QA status` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.25. Show blocked publish/export

Executable steps:
   1. Map where `Show blocked publish/export` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show blocked publish/export` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show blocked publish/export` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.26. Show invalid hotspot warning

Executable steps:
   1. Map where `Show invalid hotspot warning` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show invalid hotspot warning` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show invalid hotspot warning` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.27. Show recommended fixes

Executable steps:
   1. Map where `Show recommended fixes` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show recommended fixes` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show recommended fixes` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.28. Successful Product Demo TODO

Executable steps:
   1. Map where `Successful Product Demo TODO` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Successful Product Demo TODO` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Successful Product Demo TODO` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.29. Show good model preview

Executable steps:
   1. Map where `Show good model preview` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show good model preview` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show good model preview` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.30. Show strong AI score

Executable steps:
   1. Map where `Show strong AI score` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show strong AI score` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show strong AI score` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.31. Show meaningful hotspots

Executable steps:
   1. Map where `Show meaningful hotspots` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show meaningful hotspots` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show meaningful hotspots` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.32. Show merchant review ready

Executable steps:
   1. Map where `Show merchant review ready` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show merchant review ready` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show merchant review ready` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.33. Approve product

Executable steps:
   1. Map where `Approve product` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Approve product` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Approve product` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.34. Open public page

Executable steps:
   1. Map where `Open public page` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Open public page` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Open public page` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.35. Share link

Executable steps:
   1. Map where `Share link` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Share link` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Share link` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

M.36. Open export readiness

Executable steps:
   1. Map where `Open export readiness` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Open export readiness` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Open export readiness` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Deliverables
- Stable demo dataset.

- Mock mode.

- Backup video.

- Demo reset.

## Acceptance Criteria
- Demo works even if Gemini fails.

- Demo works even if generation fails.

- Demo story remains clear.

# Phase 14 — Hackathon Pitch and Presentation Flow
## Objective
Explain the product clearly and convincingly.

## TODO
N.1. Prepare one-line product description

Executable steps:
   1. Map where `Prepare one-line product description` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare one-line product description` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare one-line product description` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.2. Prepare problem statement

Executable steps:
   1. Map where `Prepare problem statement` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare problem statement` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare problem statement` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.3. Prepare seller pain story

Executable steps:
   1. Map where `Prepare seller pain story` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare seller pain story` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare seller pain story` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.4. Prepare provider/platform value story

Executable steps:
   1. Map where `Prepare provider/platform value story` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare provider/platform value story` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare provider/platform value story` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.5. Prepare buyer value story

Executable steps:
   1. Map where `Prepare buyer value story` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare buyer value story` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare buyer value story` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.6. Prepare demo story

Executable steps:
   1. Map where `Prepare demo story` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare demo story` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare demo story` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.7. Prepare architecture summary

Executable steps:
   1. Map where `Prepare architecture summary` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare architecture summary` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare architecture summary` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.8. Prepare before/after comparison

Executable steps:
   1. Map where `Prepare before/after comparison` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare before/after comparison` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare before/after comparison` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.9. Prepare MVP scope explanation

Executable steps:
   1. Map where `Prepare MVP scope explanation` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare MVP scope explanation` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare MVP scope explanation` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.10. Prepare next roadmap explanation

Executable steps:
   1. Map where `Prepare next roadmap explanation` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare next roadmap explanation` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare next roadmap explanation` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.11. Prepare competitor differentiation

Executable steps:
   1. Map where `Prepare competitor differentiation` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare competitor differentiation` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare competitor differentiation` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.12. Prepare business value statement

Executable steps:
   1. Map where `Prepare business value statement` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare business value statement` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare business value statement` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.13. Prepare final closing sentence

Executable steps:
   1. Map where `Prepare final closing sentence` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare final closing sentence` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare final closing sentence` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.14. Demo Script TODO

Executable steps:
   1. Map where `Demo Script TODO` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Demo Script TODO` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Demo Script TODO` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.15. Start with failed AI-generated laptop

Executable steps:
   1. Map where `Start with failed AI-generated laptop` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Start with failed AI-generated laptop` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Start with failed AI-generated laptop` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.16. Explain that many AI tools treat generation completion as success

Executable steps:
   1. Map where `Explain that many AI tools treat generation completion as success` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Explain that many AI tools treat generation completion as success` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Explain that many AI tools treat generation completion as success` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.17. Show Minimal Block detecting failure

Executable steps:
   1. Map where `Show Minimal Block detecting failure` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show Minimal Block detecting failure` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show Minimal Block detecting failure` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.18. Show blocked publish

Executable steps:
   1. Map where `Show blocked publish` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show blocked publish` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show blocked publish` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.19. Show reasons and recommended actions

Executable steps:
   1. Map where `Show reasons and recommended actions` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show reasons and recommended actions` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show reasons and recommended actions` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.20. Show merchant review control center

Executable steps:
   1. Map where `Show merchant review control center` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show merchant review control center` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show merchant review control center` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.21. Switch to approved product

Executable steps:
   1. Map where `Switch to approved product` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Switch to approved product` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Switch to approved product` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.22. Show public page

Executable steps:
   1. Map where `Show public page` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show public page` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show public page` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.23. Show share/embed/export

Executable steps:
   1. Map where `Show share/embed/export` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show share/embed/export` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show share/embed/export` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.24. Show analytics

Executable steps:
   1. Map where `Show analytics` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Show analytics` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Show analytics` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.25. End with seller/provider value

Executable steps:
   1. Map where `End with seller/provider value` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `End with seller/provider value` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `End with seller/provider value` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.26. Key Pitch Lines TODO

Executable steps:
   1. Map where `Key Pitch Lines TODO` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Key Pitch Lines TODO` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Key Pitch Lines TODO` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.27. “Sellers do not only need 3D generation; they need safe-to-publish product experiences.”

Executable steps:
   1. Map where `“Sellers do not only need 3D generation; they need safe-to-publish product experiences.”` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `“Sellers do not only need 3D generation; they need safe-to-publish product experiences.”` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `“Sellers do not only need 3D generation; they need safe-to-publish product experiences.”` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.28. “Minimal Block blocks bad AI-generated product assets before they reach customers.”

Executable steps:
   1. Map where `“Minimal Block blocks bad AI-generated product assets before they reach customers.”` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `“Minimal Block blocks bad AI-generated product assets before they reach customers.”` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `“Minimal Block blocks bad AI-generated product assets before they reach customers.”` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.29. “We help sellers turn product media into reviewed, explainable, publish-ready visual commerce experiences.”

Executable steps:
   1. Map where `“We help sellers turn product media into reviewed, explainable, publish-ready visual commerce experiences.”` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `“We help sellers turn product media into reviewed, explainable, publish-ready visual commerce experiences.”` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `“We help sellers turn product media into reviewed, explainable, publish-ready visual commerce experiences.”` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.30. “For providers, this becomes a product-content quality layer across seller catalogs.”

Executable steps:
   1. Map where `“For providers, this becomes a product-content quality layer across seller catalogs.”` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `“For providers, this becomes a product-content quality layer across seller catalogs.”` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `“For providers, this becomes a product-content quality layer across seller catalogs.”` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

N.31. “For buyers, it means less uncertainty before purchase.”

Executable steps:
   1. Map where `“For buyers, it means less uncertainty before purchase.”` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `“For buyers, it means less uncertainty before purchase.”` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `“For buyers, it means less uncertainty before purchase.”` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Deliverables
- Three-minute demo script.

- Short pitch narrative.

- Architecture slide or section.

- Business value slide or section.

- Roadmap slide or section.

## Acceptance Criteria
- Judges understand the product in under one minute.

- Demo has a visible failure and visible recovery.

- Product value is not confused with generic 3D generation.

# Phase 15 — One-Day Execution Schedule
## Hour 0–1 — Scope Freeze
O.1. Freeze demo story

Executable steps:
   1. Map where `Freeze demo story` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Freeze demo story` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Freeze demo story` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.2. Freeze product list

Executable steps:
   1. Map where `Freeze product list` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Freeze product list` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Freeze product list` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.3. Assign ownership

Executable steps:
   1. Map where `Assign ownership` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Assign ownership` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Assign ownership` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.4. Remove non-MVP features

Executable steps:
   1. Map where `Remove non-MVP features` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Remove non-MVP features` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Remove non-MVP features` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.5. Prepare assets

Executable steps:
   1. Map where `Prepare assets` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare assets` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare assets` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Hour 1–3 — Status and Approval Gate
O.1. Fix product status

Executable steps:
   1. Map where `Fix product status` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Fix product status` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Fix product status` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.2. Fix approval badge

Executable steps:
   1. Map where `Fix approval badge` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Fix approval badge` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Fix approval badge` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.3. Add quality gate

Executable steps:
   1. Map where `Add quality gate` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add quality gate` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add quality gate` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.4. Disable publish/export for failed products

Executable steps:
   1. Map where `Disable publish/export for failed products` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Disable publish/export for failed products` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Disable publish/export for failed products` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.5. Add failure banner

Executable steps:
   1. Map where `Add failure banner` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add failure banner` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add failure banner` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Hour 3–5 — AI Diagnosis
O.1. Add AI diagnosis panel

Executable steps:
   1. Map where `Add AI diagnosis panel` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add AI diagnosis panel` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add AI diagnosis panel` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.2. Add mock/Gemini result

Executable steps:
   1. Map where `Add mock/Gemini result` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add mock/Gemini result` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add mock/Gemini result` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.3. Add blocking reasons

Executable steps:
   1. Map where `Add blocking reasons` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add blocking reasons` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add blocking reasons` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.4. Add recommended actions

Executable steps:
   1. Map where `Add recommended actions` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add recommended actions` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add recommended actions` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.5. Add final quality score

Executable steps:
   1. Map where `Add final quality score` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add final quality score` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add final quality score` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Hour 5–7 — Source Image Readiness
O.1. Add image checklist

Executable steps:
   1. Map where `Add image checklist` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add image checklist` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add image checklist` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.2. Add readiness card

Executable steps:
   1. Map where `Add readiness card` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add readiness card` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add readiness card` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.3. Add missing views

Executable steps:
   1. Map where `Add missing views` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add missing views` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add missing views` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.4. Add source warnings

Executable steps:
   1. Map where `Add source warnings` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add source warnings` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add source warnings` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.5. Add upload correction actions

Executable steps:
   1. Map where `Add upload correction actions` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add upload correction actions` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add upload correction actions` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Hour 7–9 — Hotspot QA
O.1. Add hotspot list

Executable steps:
   1. Map where `Add hotspot list` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add hotspot list` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add hotspot list` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.2. Add hotspot edit

Executable steps:
   1. Map where `Add hotspot edit` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add hotspot edit` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add hotspot edit` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.3. Add hotspot approval

Executable steps:
   1. Map where `Add hotspot approval` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add hotspot approval` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add hotspot approval` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.4. Add invalid hotspot detection

Executable steps:
   1. Map where `Add invalid hotspot detection` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add invalid hotspot detection` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add invalid hotspot detection` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.5. Block publish for invalid hotspots

Executable steps:
   1. Map where `Block publish for invalid hotspots` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Block publish for invalid hotspots` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Block publish for invalid hotspots` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Hour 9–11 — Merchant Review
O.1. Create review page

Executable steps:
   1. Map where `Create review page` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Create review page` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Create review page` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.2. Add checklist

Executable steps:
   1. Map where `Add checklist` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add checklist` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add checklist` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.3. Add approve/reject actions

Executable steps:
   1. Map where `Add approve/reject actions` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add approve/reject actions` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add approve/reject actions` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.4. Add manual override reason

Executable steps:
   1. Map where `Add manual override reason` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add manual override reason` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add manual override reason` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.5. Add decision history

Executable steps:
   1. Map where `Add decision history` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add decision history` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add decision history` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Hour 11–13 — Public Page
O.1. Create public product page

Executable steps:
   1. Map where `Create public product page` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Create public product page` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Create public product page` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.2. Add viewer/image fallback

Executable steps:
   1. Map where `Add viewer/image fallback` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add viewer/image fallback` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add viewer/image fallback` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.3. Add approved hotspots

Executable steps:
   1. Map where `Add approved hotspots` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add approved hotspots` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add approved hotspots` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.4. Add trust note

Executable steps:
   1. Map where `Add trust note` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add trust note` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add trust note` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.5. Add CTA

Executable steps:
   1. Map where `Add CTA` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add CTA` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add CTA` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Hour 13–15 — Share and Export
O.1. Add share modal

Executable steps:
   1. Map where `Add share modal` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add share modal` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add share modal` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.2. Add embed modal

Executable steps:
   1. Map where `Add embed modal` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add embed modal` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add embed modal` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.3. Add Trendyol readiness

Executable steps:
   1. Map where `Add Trendyol readiness` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add Trendyol readiness` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add Trendyol readiness` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.4. Add export package

Executable steps:
   1. Map where `Add export package` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add export package` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add export package` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.5. Add disabled states

Executable steps:
   1. Map where `Add disabled states` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add disabled states` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add disabled states` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Hour 15–17 — Analytics
O.1. Add event tracking or mock event logger

Executable steps:
   1. Map where `Add event tracking or mock event logger` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add event tracking or mock event logger` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add event tracking or mock event logger` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.2. Add product stat cards

Executable steps:
   1. Map where `Add product stat cards` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add product stat cards` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add product stat cards` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.3. Add store stat cards

Executable steps:
   1. Map where `Add store stat cards` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add store stat cards` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add store stat cards` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.4. Seed demo metrics

Executable steps:
   1. Map where `Seed demo metrics` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Seed demo metrics` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Seed demo metrics` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Hour 17–20 — Demo Hardening
O.1. Add mock mode

Executable steps:
   1. Map where `Add mock mode` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add mock mode` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add mock mode` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.2. Add static fallback data

Executable steps:
   1. Map where `Add static fallback data` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add static fallback data` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add static fallback data` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.3. Add demo reset

Executable steps:
   1. Map where `Add demo reset` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add demo reset` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add demo reset` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.4. Add error states

Executable steps:
   1. Map where `Add error states` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add error states` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add error states` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.5. Add loading states

Executable steps:
   1. Map where `Add loading states` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Add loading states` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Add loading states` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.6. Test full path

Executable steps:
   1. Map where `Test full path` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Test full path` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Test full path` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Hour 20–24 — Pitch and Final QA
O.1. Rehearse demo

Executable steps:
   1. Map where `Rehearse demo` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Rehearse demo` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Rehearse demo` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.2. Fix only critical bugs

Executable steps:
   1. Map where `Fix only critical bugs` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Fix only critical bugs` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Fix only critical bugs` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.3. Prepare backup video

Executable steps:
   1. Map where `Prepare backup video` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare backup video` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare backup video` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.4. Prepare final pitch

Executable steps:
   1. Map where `Prepare final pitch` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare final pitch` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare final pitch` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.5. Prepare screenshots

Executable steps:
   1. Map where `Prepare screenshots` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Prepare screenshots` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Prepare screenshots` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

O.6. Final browser test

Executable steps:
   1. Map where `Final browser test` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Final browser test` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Final browser test` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

# Final A-to-Z MVP Checklist
## Core Product
P.1. Seller can upload product

Executable steps:
   1. Map where `Seller can upload product` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Seller can upload product` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Seller can upload product` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.2. Seller can see source images

Executable steps:
   1. Map where `Seller can see source images` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Seller can see source images` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Seller can see source images` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.3. Seller can see 3D preview

Executable steps:
   1. Map where `Seller can see 3D preview` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Seller can see 3D preview` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Seller can see 3D preview` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.4. Seller can see AI diagnosis

Executable steps:
   1. Map where `Seller can see AI diagnosis` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Seller can see AI diagnosis` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Seller can see AI diagnosis` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.5. Seller can see quality status

Executable steps:
   1. Map where `Seller can see quality status` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Seller can see quality status` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Seller can see quality status` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.6. Seller can understand failure reasons

Executable steps:
   1. Map where `Seller can understand failure reasons` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Seller can understand failure reasons` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Seller can understand failure reasons` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.7. Seller can fix or fallback

Executable steps:
   1. Map where `Seller can fix or fallback` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Seller can fix or fallback` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Seller can fix or fallback` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.8. Seller can review

Executable steps:
   1. Map where `Seller can review` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Seller can review` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Seller can review` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.9. Seller can approve

Executable steps:
   1. Map where `Seller can approve` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Seller can approve` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Seller can approve` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.10. Seller can share

Executable steps:
   1. Map where `Seller can share` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Seller can share` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Seller can share` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.11. Seller can export

Executable steps:
   1. Map where `Seller can export` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Seller can export` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Seller can export` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Quality Control
P.1. Failed product is blocked

Executable steps:
   1. Map where `Failed product is blocked` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Failed product is blocked` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Failed product is blocked` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.2. Low score is not approved

Executable steps:
   1. Map where `Low score is not approved` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Low score is not approved` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Low score is not approved` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.3. Hotspots are validated

Executable steps:
   1. Map where `Hotspots are validated` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Hotspots are validated` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Hotspots are validated` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.4. Source images are checked

Executable steps:
   1. Map where `Source images are checked` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Source images are checked` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Source images are checked` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.5. Public page is gated

Executable steps:
   1. Map where `Public page is gated` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Public page is gated` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Public page is gated` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.6. Export is gated

Executable steps:
   1. Map where `Export is gated` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Export is gated` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Export is gated` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.7. Manual override requires reason

Executable steps:
   1. Map where `Manual override requires reason` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Manual override requires reason` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Manual override requires reason` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## AI
P.1. AI score exists

Executable steps:
   1. Map where `AI score exists` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `AI score exists` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `AI score exists` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.2. AI diagnosis exists

Executable steps:
   1. Map where `AI diagnosis exists` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `AI diagnosis exists` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `AI diagnosis exists` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.3. AI blocking reasons exist

Executable steps:
   1. Map where `AI blocking reasons exist` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `AI blocking reasons exist` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `AI blocking reasons exist` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.4. AI recommended actions exist

Executable steps:
   1. Map where `AI recommended actions exist` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `AI recommended actions exist` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `AI recommended actions exist` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.5. AI suggested hotspots exist

Executable steps:
   1. Map where `AI suggested hotspots exist` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `AI suggested hotspots exist` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `AI suggested hotspots exist` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.6. Mock AI fallback exists

Executable steps:
   1. Map where `Mock AI fallback exists` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Mock AI fallback exists` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Mock AI fallback exists` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Buyer Output
P.1. Public page exists

Executable steps:
   1. Map where `Public page exists` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Public page exists` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Public page exists` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.2. Approved hotspots show

Executable steps:
   1. Map where `Approved hotspots show` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Approved hotspots show` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Approved hotspots show` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.3. Product details show

Executable steps:
   1. Map where `Product details show` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Product details show` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Product details show` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.4. CTA exists

Executable steps:
   1. Map where `CTA exists` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `CTA exists` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `CTA exists` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.5. Trust note exists

Executable steps:
   1. Map where `Trust note exists` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Trust note exists` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Trust note exists` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.6. Failed products are not public

Executable steps:
   1. Map where `Failed products are not public` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Failed products are not public` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Failed products are not public` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Provider Output
P.1. Trendyol readiness exists

Executable steps:
   1. Map where `Trendyol readiness exists` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Trendyol readiness exists` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Trendyol readiness exists` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.2. Export package exists

Executable steps:
   1. Map where `Export package exists` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Export package exists` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Export package exists` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.3. Share/embed exists

Executable steps:
   1. Map where `Share/embed exists` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Share/embed exists` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Share/embed exists` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.4. Quality report exists

Executable steps:
   1. Map where `Quality report exists` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Quality report exists` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Quality report exists` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.5. Store-level stats exist

Executable steps:
   1. Map where `Store-level stats exist` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Store-level stats exist` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Store-level stats exist` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Demo
P.1. Failed laptop case works

Executable steps:
   1. Map where `Failed laptop case works` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Failed laptop case works` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Failed laptop case works` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.2. Successful product case works

Executable steps:
   1. Map where `Successful product case works` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Successful product case works` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Successful product case works` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.3. Mock data works

Executable steps:
   1. Map where `Mock data works` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Mock data works` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Mock data works` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.4. Backup video exists

Executable steps:
   1. Map where `Backup video exists` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Backup video exists` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Backup video exists` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.5. Pitch script exists

Executable steps:
   1. Map where `Pitch script exists` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Pitch script exists` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Pitch script exists` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

P.6. Demo reset exists

Executable steps:
   1. Map where `Demo reset exists` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Demo reset exists` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Demo reset exists` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

# Final MVP Priority Order
## Build First
Q.1. Product status and approval gate

Executable steps:
   1. Map where `Product status and approval gate` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Product status and approval gate` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Product status and approval gate` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

Q.2. AI diagnosis panel

Executable steps:
   1. Map where `AI diagnosis panel` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `AI diagnosis panel` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `AI diagnosis panel` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

Q.3. Source image readiness

Executable steps:
   1. Map where `Source image readiness` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Source image readiness` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Source image readiness` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

Q.4. Hotspot QA

Executable steps:
   1. Map where `Hotspot QA` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Hotspot QA` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Hotspot QA` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

Q.5. Merchant review page

Executable steps:
   1. Map where `Merchant review page` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Merchant review page` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Merchant review page` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

Q.6. Public product page

Executable steps:
   1. Map where `Public product page` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Public product page` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Public product page` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

Q.7. Share/export package

Executable steps:
   1. Map where `Share/export package` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Share/export package` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Share/export package` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Build If Time Remains
Q.1. Analytics dashboard

Executable steps:
   1. Map where `Analytics dashboard` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Analytics dashboard` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Analytics dashboard` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

Q.2. Expo Go capture

Executable steps:
   1. Map where `Expo Go capture` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Expo Go capture` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Expo Go capture` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

Q.3. QR code

Executable steps:
   1. Map where `QR code` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `QR code` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `QR code` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

Q.4. Advanced charts

Executable steps:
   1. Map where `Advanced charts` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Advanced charts` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Advanced charts` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

Q.5. Real Gemini comparison

Executable steps:
   1. Map where `Real Gemini comparison` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Real Gemini comparison` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Real Gemini comparison` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

## Do Not Build Today
Q.1. Real image-to-3D generation

Executable steps:
   1. Map where `Real image-to-3D generation` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Real image-to-3D generation` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Real image-to-3D generation` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

Q.2. Real Trendyol submission

Executable steps:
   1. Map where `Real Trendyol submission` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Real Trendyol submission` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Real Trendyol submission` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

Q.3. Real Shopify OAuth

Executable steps:
   1. Map where `Real Shopify OAuth` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Real Shopify OAuth` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Real Shopify OAuth` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

Q.4. Native AR

Executable steps:
   1. Map where `Native AR` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Native AR` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Native AR` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

Q.5. Complex mesh validation

Executable steps:
   1. Map where `Complex mesh validation` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Complex mesh validation` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Complex mesh validation` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

Q.6. Enterprise catalog sync

Executable steps:
   1. Map where `Enterprise catalog sync` belongs in the existing product flow by inspecting the relevant UI, state, service, storage, and test files before editing.
   2. Implement `Enterprise catalog sync` through the smallest cohesive change that keeps the decision logic centralized and avoids direct coupling between unrelated UI components.
   3. Add or update mock/demo data when needed so the failed-product and successful-product demo paths both exercise this behavior.
   4. Validate `Enterprise catalog sync` with the relevant unit, integration, E2E, or manual demo-path test; record the expected pass/fail behavior in the issue notes.

# Final Product Statement
Minimal Block helps e-commerce sellers detect, fix, approve, and publish AI-assisted 3D product experiences safely, instead of blindly trusting broken AI-generated assets.
