/**
 * AI Assistant Service
 * Provides LLM-powered organization, matching, and metadata generation
 * Supports OpenAI, Groq, and HuggingFace
 */

import { prisma } from '@/lib/prisma'

export type AIProvider = 'openai' | 'groq' | 'huggingface'

export interface AssistantMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AssistantContext {
  userId: string
  vaultAssets?: any[]
  projects?: any[]
  recentActivity?: any[]
  userProfile?: any
}

export interface AssistantRequest {
  messages: AssistantMessage[]
  context?: AssistantContext
  provider?: AIProvider
  temperature?: number
  maxTokens?: number
}

export interface AssistantResponse {
  message: string
  actions?: AssistantAction[]
  suggestions?: string[]
}

export interface AssistantAction {
  type: 'create_project' | 'organize_files' | 'find_collaborator' | 'suggest_service' | 'generate_metadata'
  data: any
}

/**
 * Send message to AI assistant
 */
export async function chatWithAssistant(
  request: AssistantRequest
): Promise<AssistantResponse> {
  // Auto-select provider based on available API keys
  let provider = request.provider
  
  if (!provider) {
    // Prefer Groq (faster, free) if available, fallback to OpenAI
    if (process.env.GROQ_API_KEY) {
      provider = 'groq'
    } else if (process.env.OPENAI_API_KEY) {
      provider = 'openai'
    } else if (process.env.HUGGINGFACE_API_KEY) {
      provider = 'huggingface'
    } else {
      throw new Error('No AI provider API key configured')
    }
  }
  
  // Build system prompt with context
  const systemPrompt = buildSystemPrompt(request.context)
  
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...request.messages,
  ]

  try {
    let response: string
    
    console.log(`[AI] Using provider: ${provider}`)
    
    switch (provider) {
      case 'openai':
        response = await callOpenAI(messages, request.temperature, request.maxTokens)
        break
      case 'groq':
        response = await callGroq(messages, request.temperature, request.maxTokens)
        break
      case 'huggingface':
        response = await callHuggingFace(messages, request.temperature, request.maxTokens)
        break
      default:
        throw new Error(`Unknown AI provider: ${provider}`)
    }

    // Parse response for actions
    const actions = extractActions(response)
    const suggestions = extractSuggestions(response)

    return {
      message: response,
      actions,
      suggestions,
    }
  } catch (error: any) {
    console.error('[AI] Assistant error:', error)
    throw new Error(`AI assistant failed: ${error.message}`)
  }
}

/**
 * Build system prompt with user context
 */
function buildSystemPrompt(context?: AssistantContext): string {
  let prompt = `You are an AI assistant for NoCulture OS, a music production and collaboration platform.

Your capabilities:
- Organize files into projects
- Suggest collaborators based on needs (mixing, mastering, vocals, video)
- Generate metadata (titles, tags, descriptions)
- Match users with service providers
- Provide music industry advice

Guidelines:
- Be concise and actionable
- Use music industry terminology
- Suggest specific next steps
- Reference user's vault and projects when relevant
`

  if (context) {
    if (context.vaultAssets && context.vaultAssets.length > 0) {
      prompt += `\nUser's Vault (${context.vaultAssets.length} assets):\n`
      context.vaultAssets.slice(0, 10).forEach(asset => {
        prompt += `- ${asset.title} (${asset.type})\n`
      })
    }

    if (context.projects && context.projects.length > 0) {
      prompt += `\nUser's Projects (${context.projects.length}):\n`
      context.projects.slice(0, 5).forEach(project => {
        prompt += `- ${project.title} (${project.status})\n`
      })
    }

    if (context.userProfile) {
      prompt += `\nUser Profile:\n`
      prompt += `- Roles: ${context.userProfile.roles?.join(', ')}\n`
      prompt += `- Location: ${context.userProfile.location}\n`
    }
  }

  return prompt
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  messages: AssistantMessage[],
  temperature = 0.7,
  maxTokens = 1000
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * Call Groq API (faster, cheaper alternative)
 */
async function callGroq(
  messages: AssistantMessage[],
  temperature = 0.7,
  maxTokens = 1000
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured')
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Groq API error: ${error.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * Call HuggingFace API
 */
async function callHuggingFace(
  messages: AssistantMessage[],
  temperature = 0.7,
  maxTokens = 1000
): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY not configured')
  }

  // Convert messages to prompt
  const prompt = messages
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n')

  const response = await fetch(
    'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature,
          max_new_tokens: maxTokens,
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data[0].generated_text
}

/**
 * Extract actionable items from AI response
 */
function extractActions(response: string): AssistantAction[] {
  const actions: AssistantAction[] = []

  // Look for action patterns in response
  if (response.includes('create a project') || response.includes('organize into a project')) {
    actions.push({
      type: 'create_project',
      data: { suggested: true },
    })
  }

  if (response.includes('find') && (response.includes('engineer') || response.includes('producer'))) {
    actions.push({
      type: 'find_collaborator',
      data: { suggested: true },
    })
  }

  return actions
}

/**
 * Extract suggestions from AI response
 */
function extractSuggestions(response: string): string[] {
  const suggestions: string[] = []
  
  // Extract bullet points or numbered lists
  const lines = response.split('\n')
  lines.forEach(line => {
    if (line.match(/^[-*•]\s/) || line.match(/^\d+\.\s/)) {
      suggestions.push(line.replace(/^[-*•\d.]\s+/, '').trim())
    }
  })

  return suggestions
}

/**
 * Organize files into projects using AI
 */
export async function organizeFilesWithAI(
  userId: string,
  assetIds: string[]
): Promise<{ projectName: string; assets: string[] }[]> {
  // Get assets
  const assets = await prisma.asset.findMany({
    where: {
      id: { in: assetIds },
      ownerId: userId,
    },
  })

  // Build prompt
  const assetList = assets.map(a => `${a.title} (${a.type})`).join('\n')
  
  const response = await chatWithAssistant({
    messages: [
      {
        role: 'user',
        content: `I have these files in my vault:\n${assetList}\n\nHow should I organize them into projects? Suggest project names and which files go in each.`,
      },
    ],
    context: { userId },
  })

  // Parse response into project groups
  // This is a simplified version - in production, use structured output
  return [
    {
      projectName: 'Suggested Project',
      assets: assetIds,
    },
  ]
}

/**
 * Find matching collaborators using AI
 */
export async function findCollaboratorsWithAI(
  userId: string,
  need: string,
  location?: string
): Promise<any[]> {
  // Get user's projects and needs
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  // Build search criteria from AI
  const response = await chatWithAssistant({
    messages: [
      {
        role: 'user',
        content: `I need ${need}${location ? ` in ${location}` : ''}. What should I look for in a collaborator?`,
      },
    ],
    context: { userId, userProfile: user },
  })

  // Search for providers based on AI suggestions
  const providers = await prisma.user.findMany({
    where: {
      servicesOffered: {
        hasSome: [need.toUpperCase()],
      },
      ...(location && {
        location: {
          contains: location,
          mode: 'insensitive',
        },
      }),
    },
    take: 10,
  })

  return providers
}

/**
 * Generate metadata for asset using AI
 */
export async function generateMetadataWithAI(
  assetId: string,
  analysisData?: any
): Promise<{ title?: string; description?: string; tags?: string[] }> {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
  })

  if (!asset) {
    throw new Error('Asset not found')
  }

  // Build prompt with analysis data
  let prompt = `Generate metadata for this audio file:\n`
  prompt += `- Current title: ${asset.title}\n`
  
  if (analysisData) {
    prompt += `- Genre: ${analysisData.genre}\n`
    prompt += `- Tempo: ${analysisData.tempo} BPM\n`
    prompt += `- Key: ${analysisData.key}\n`
    prompt += `- Mood: ${analysisData.mood}\n`
  }

  prompt += `\nSuggest:\n1. A better title\n2. A description\n3. Relevant tags`

  const response = await chatWithAssistant({
    messages: [{ role: 'user', content: prompt }],
  })

  // Parse response (simplified - use structured output in production)
  return {
    title: asset.title,
    description: response.message,
    tags: [],
  }
}

/**
 * Get AI-powered action feed for dashboard
 */
export async function getAIActionFeed(userId: string): Promise<any[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      assets: { take: 20, orderBy: { createdAt: 'desc' } },
      projects: { take: 10, orderBy: { updatedAt: 'desc' } },
    },
  })

  if (!user) {
    return []
  }

  const actions: any[] = []

  // Analyze vault for opportunities
  const unorganizedAssets = user.assets.filter(a => !a.projectId)
  if (unorganizedAssets.length > 5) {
    actions.push({
      type: 'organize',
      title: 'Organize your vault',
      description: `You have ${unorganizedAssets.length} unorganized files`,
      action: 'organize_files',
    })
  }

  // Check for projects needing services
  const projectsNeedingMix = user.projects.filter(p => 
    p.needs?.includes('mixing') && p.status === 'IN_PROGRESS'
  )
  if (projectsNeedingMix.length > 0) {
    actions.push({
      type: 'service',
      title: 'Find a mixing engineer',
      description: `${projectsNeedingMix.length} project(s) need mixing`,
      action: 'find_engineer',
    })
  }

  // Check for high-quality tracks ready to sell
  const readyToSell = user.assets.filter(a => 
    a.analysisMetadata?.quality > 80 && !a.forSale
  )
  if (readyToSell.length > 0) {
    actions.push({
      type: 'monetize',
      title: 'List your beats for sale',
      description: `${readyToSell.length} high-quality track(s) ready to sell`,
      action: 'list_for_sale',
    })
  }

  return actions
}
