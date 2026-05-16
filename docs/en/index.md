---
layout: home
title: Minimal Block — English
description: Upload a product photo — AI generates an interactive 3D GLB model for your listing.

hero:
  name: "Minimal Block"
  text: "AI-powered 3D product previews"
  tagline: Upload a photo. Get a 3D model. Embed it in seconds.
  actions:
    - theme: brand
      text: Getting Started →
      link: /en/tutorials/getting-started
    - theme: alt
      text: API Reference
      link: /en/reference/api-contracts

features:
  - title: One photo, one model
    details: Upload a JPEG, PNG, or WebP product image. Gemini 2.0 Flash returns a GLB model in one API call.
  - title: Clean Architecture
    details: Domain logic in libs/core is fully decoupled from Supabase and Gemini. Swap adapters without touching business rules.
  - title: RLS-protected gallery
    details: Row Level Security on every table ensures users see only their own products and conversions — enforced at the database level.
  - title: Interactive 3D viewer
    details: The model-viewer web component renders the GLB inline. Shoppers can orbit, zoom, and inspect from every angle.
---
