import { NextRequest, NextResponse } from 'next/server'
import { Product, ProductType, ProductCategory } from '@/types/marketplace'

// In-memory storage (replace with database in production)
let products: Product[] = [
  {
    id: '1',
    title: 'NEON_DREAMS_BEAT',
    description: 'Dark synthwave beat with heavy bass and atmospheric leads. Perfect for cyberpunk vibes.',
    type: 'BEAT',
    category: 'ASSET',
    priceUSDC: 40,
    creatorId: 'creator_1',
    creatorName: 'XEN_PRODUCER',
    coverUrl: 'https://source.unsplash.com/random/400x400/?synthwave,neon',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    tags: ['trap', 'synthwave', 'dark'],
    bpm: 140,
    key: 'A minor',
    deliveryType: 'INSTANT',
    rating: 4.8,
    ordersCount: 45,
    createdAt: '2025-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'MIDNIGHT_VOCAL_KIT',
    description: 'Smooth R&B vocal samples with rich harmonies and professional processing.',
    type: 'KIT',
    category: 'ASSET',
    priceUSDC: 60,
    creatorId: 'creator_2',
    creatorName: 'VOCAL_QUEEN',
    coverUrl: 'https://source.unsplash.com/random/400x400/?microphone,studio',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    tags: ['r&b', 'vocals', 'soul'],
    deliveryType: 'INSTANT',
    rating: 4.9,
    ordersCount: 132,
    createdAt: '2025-01-10T14:30:00Z'
  },
  {
    id: '3',
    title: 'MIXING_MASTERING_SERVICE',
    description: 'Professional mixing and mastering service. Get your tracks radio-ready in 3-5 days.',
    type: 'SERVICE',
    category: 'SERVICE',
    priceUSDC: 150,
    creatorId: 'creator_3',
    creatorName: 'AUDIO_ENGINEER_PRO',
    coverUrl: 'https://source.unsplash.com/random/400x400/?audio,mixing',
    tags: ['mixing', 'mastering', 'professional'],
    deliveryType: 'CUSTOM',
    estDeliveryTimeDays: 5,
    rating: 5.0,
    ordersCount: 89,
    createdAt: '2025-01-05T09:15:00Z'
  },
  {
    id: '4',
    title: 'EXCLUSIVE_DISCORD_ACCESS',
    description: 'Join our exclusive producer community with daily feedback sessions and networking.',
    type: 'ACCESS',
    category: 'ASSET',
    priceUSDC: 25,
    creatorId: 'creator_4',
    creatorName: 'NOCULTURE_NETWORK',
    coverUrl: 'https://source.unsplash.com/random/400x400/?community,network',
    tags: ['community', 'networking', 'feedback'],
    deliveryType: 'INSTANT',
    rating: 4.7,
    ordersCount: 234,
    createdAt: '2025-01-20T16:45:00Z'
  },
  {
    id: '5',
    title: 'HYPERPOP_STARTER_KIT',
    description: 'Cutting-edge hyperpop sounds with glitchy vocals, distorted 808s, and futuristic synths.',
    type: 'KIT',
    category: 'ASSET',
    priceUSDC: 75,
    creatorId: 'creator_5',
    creatorName: 'GLITCH_MASTER',
    coverUrl: 'https://source.unsplash.com/random/400x400/?glitch,digital',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    tags: ['hyperpop', 'experimental', 'glitch'],
    deliveryType: 'INSTANT',
    rating: 4.6,
    ordersCount: 67,
    createdAt: '2025-01-18T11:20:00Z'
  },
  {
    id: '6',
    title: 'VOCAL_TUNING_SERVICE',
    description: 'Expert vocal tuning and pitch correction. Natural sound or creative effects.',
    type: 'SERVICE',
    category: 'SERVICE',
    priceUSDC: 80,
    creatorId: 'creator_3',
    creatorName: 'AUDIO_ENGINEER_PRO',
    coverUrl: 'https://source.unsplash.com/random/400x400/?vocals,studio',
    tags: ['vocals', 'tuning', 'autotune'],
    deliveryType: 'CUSTOM',
    estDeliveryTimeDays: 2,
    rating: 4.9,
    ordersCount: 156,
    createdAt: '2025-01-12T13:00:00Z'
  },
  {
    id: '7',
    title: 'DRILL_BEAT_PACK',
    description: 'Hard-hitting drill beats with UK and NY influences. 10 beats included.',
    type: 'BEAT',
    category: 'ASSET',
    priceUSDC: 120,
    creatorId: 'creator_6',
    creatorName: 'DRILL_KINGPIN',
    coverUrl: 'https://source.unsplash.com/random/400x400/?urban,street',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    tags: ['drill', 'trap', 'uk-drill'],
    bpm: 145,
    key: 'C# minor',
    deliveryType: 'INSTANT',
    rating: 4.8,
    ordersCount: 98,
    createdAt: '2025-01-08T08:30:00Z'
  },
  {
    id: '8',
    title: 'STUDIO_SESSION_BOOKING',
    description: 'Book a 4-hour session in our professional studio. Engineer included.',
    type: 'SERVICE',
    category: 'SERVICE',
    priceUSDC: 200,
    creatorId: 'creator_7',
    creatorName: 'APEX_STUDIOS',
    coverUrl: 'https://source.unsplash.com/random/400x400/?recording,studio',
    tags: ['studio', 'recording', 'professional'],
    deliveryType: 'CUSTOM',
    estDeliveryTimeDays: 7,
    rating: 5.0,
    ordersCount: 42,
    createdAt: '2025-01-03T10:00:00Z'
  }
]

/**
 * Helper: Apply filters and sorting to products
 */
function filterAndSortProducts(
  products: Product[],
  filters: {
    search?: string
    type?: ProductType
    category?: ProductCategory
    tag?: string
    minPrice?: number
    maxPrice?: number
    sort?: 'newest' | 'price_low' | 'price_high' | 'popular'
  }
): Product[] {
  let filtered = [...products]

  // Search filter (title, description, creator, tags)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.creatorName.toLowerCase().includes(searchLower) ||
      p.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }

  // Type filter
  if (filters.type) {
    filtered = filtered.filter(p => p.type === filters.type)
  }

  // Category filter
  if (filters.category) {
    filtered = filtered.filter(p => p.category === filters.category)
  }

  // Tag filter
  if (filters.tag) {
    filtered = filtered.filter(p => p.tags?.includes(filters.tag))
  }

  // Price range filter
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(p => p.priceUSDC >= filters.minPrice!)
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.priceUSDC <= filters.maxPrice!)
  }

  // Sorting
  const sort = filters.sort || 'newest'
  filtered.sort((a, b) => {
    switch (sort) {
      case 'price_low':
        return a.priceUSDC - b.priceUSDC
      case 'price_high':
        return b.priceUSDC - a.priceUSDC
      case 'popular':
        return (b.ordersCount || 0) - (a.ordersCount || 0)
      case 'newest':
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    }
  })

  return filtered
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const filters = {
      search: searchParams.get('search') || undefined,
      type: searchParams.get('type') as ProductType | undefined,
      category: searchParams.get('category') as ProductCategory | undefined,
      tag: searchParams.get('tag') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      sort: searchParams.get('sort') as 'newest' | 'price_low' | 'price_high' | 'popular' | undefined
    }

    const filtered = filterAndSortProducts(products, filters)
    
    return NextResponse.json({ products: filtered })
  } catch (error) {
    console.error('[PRODUCTS_API] Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validation
    if (!body.title || !body.description || !body.type || body.priceUSDC === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, type, priceUSDC' },
        { status: 400 }
      )
    }

    // Determine category based on type
    const category: ProductCategory = body.type === 'SERVICE' ? 'SERVICE' : 'ASSET'

    // Create new product
    const newProduct: Product = {
      id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: body.title,
      description: body.description,
      type: body.type,
      category,
      priceUSDC: parseFloat(body.priceUSDC),
      creatorId: body.creatorId || undefined,
      creatorName: body.creatorName || 'ANONYMOUS',
      coverUrl: body.coverUrl || undefined,
      previewUrl: body.previewUrl || undefined,
      tags: body.tags || [],
      bpm: body.bpm || null,
      key: body.key || null,
      deliveryType: body.deliveryType || 'INSTANT',
      estDeliveryTimeDays: body.estDeliveryTimeDays || null,
      rating: null,
      ordersCount: 0,
      createdAt: new Date().toISOString()
    }

    // Add to products array
    products.push(newProduct)

    console.log('[PRODUCTS_API] Created new product:', newProduct.id)

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('[PRODUCTS_API] Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
