import { defineConfig } from 'vitepress'

export default defineConfig({
  srcDir: '../../../docs',
  head: [
    ['meta', { name: 'robots', content: 'noindex, nofollow, noarchive, noimageindex' }],
    ['meta', { name: 'googlebot', content: 'noindex, nofollow' }],
  ],

  locales: {
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      title: 'Minimal Block',
      description: 'Upload a product photo — AI generates an interactive 3D GLB model for your listing.',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Tutorials', link: '/en/tutorials/getting-started' },
          { text: 'How-To', link: '/en/how-to/configure-supabase' },
          { text: 'Reference', link: '/en/reference/api-contracts' },
          { text: 'Explanation', link: '/en/explanation/architecture' },
        ],
        sidebar: {
          '/en/tutorials/': [
            {
              text: 'Tutorials',
              items: [
                { text: 'Getting Started', link: '/en/tutorials/getting-started' },
                { text: 'Create a 3D Product Preview', link: '/en/tutorials/create-product-3d-preview' },
              ],
            },
          ],
          '/en/how-to/': [
            {
              text: 'How-To Guides',
              items: [
                { text: 'Configure Supabase', link: '/en/how-to/configure-supabase' },
                { text: 'Configure Gemini AI', link: '/en/how-to/configure-gemini' },
                { text: 'Add a Product', link: '/en/how-to/add-product' },
                { text: 'Embed the 3D Viewer', link: '/en/how-to/embed-3d-viewer' },
              ],
            },
          ],
          '/en/reference/': [
            {
              text: 'Reference',
              items: [
                { text: 'API Contracts', link: '/en/reference/api-contracts' },
                { text: 'Database Schema', link: '/en/reference/database-schema' },
                { text: 'Database Types', link: '/en/reference/database-types' },
                { text: 'Product Categories', link: '/en/reference/product-categories' },
              ],
            },
          ],
          '/en/explanation/': [
            {
              text: 'Explanation',
              items: [
                { text: 'Architecture', link: '/en/explanation/architecture' },
                { text: 'AI Pipeline', link: '/en/explanation/ai-pipeline' },
                { text: 'Product Decision', link: '/en/explanation/product-decision' },
              ],
            },
          ],
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/ofcskn/minimalblock' },
        ],
      },
    },
    tr: {
      label: 'Türkçe',
      lang: 'tr-TR',
      link: '/tr/',
      title: 'Minimal Block',
      description: 'Ürün fotoğrafı yükle — Yapay zeka etkileşimli 3D GLB modeli oluşturur.',
      themeConfig: {
        nav: [
          { text: 'Ana Sayfa', link: '/tr/' },
          { text: 'Dersler', link: '/tr/tutorials/getting-started' },
          { text: 'Nasıl Yapılır', link: '/tr/how-to/configure-supabase' },
          { text: 'Referans', link: '/tr/reference/api-contracts' },
          { text: 'Açıklama', link: '/tr/explanation/architecture' },
        ],
        sidebar: {
          '/tr/tutorials/': [
            {
              text: 'Dersler',
              items: [
                { text: 'Başlarken', link: '/tr/tutorials/getting-started' },
                { text: '3D Ürün Önizlemesi Oluştur', link: '/tr/tutorials/create-product-3d-preview' },
              ],
            },
          ],
          '/tr/how-to/': [
            {
              text: 'Nasıl Yapılır',
              items: [
                { text: 'Supabase Yapılandır', link: '/tr/how-to/configure-supabase' },
                { text: 'Gemini AI Yapılandır', link: '/tr/how-to/configure-gemini' },
                { text: 'Ürün Ekle', link: '/tr/how-to/add-product' },
                { text: '3D Görüntüleyici Yerleştir', link: '/tr/how-to/embed-3d-viewer' },
              ],
            },
          ],
          '/tr/reference/': [
            {
              text: 'Referans',
              items: [
                { text: 'API Sözleşmeleri', link: '/tr/reference/api-contracts' },
                { text: 'Veritabanı Şeması', link: '/tr/reference/database-schema' },
                { text: 'Veritabanı Tipleri', link: '/tr/reference/database-types' },
                { text: 'Ürün Kategorileri', link: '/tr/reference/product-categories' },
              ],
            },
          ],
          '/tr/explanation/': [
            {
              text: 'Açıklama',
              items: [
                { text: 'Mimari', link: '/tr/explanation/architecture' },
                { text: 'Yapay Zeka Boru Hattı', link: '/tr/explanation/ai-pipeline' },
                { text: 'Ürün Karar Notu', link: '/tr/explanation/product-decision' },
              ],
            },
          ],
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/ofcskn/minimalblock' },
        ],
      },
    },
  },
})
