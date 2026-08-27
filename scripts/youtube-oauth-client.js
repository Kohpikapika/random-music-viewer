import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const LOCAL_ENV_PATH = path.resolve('.env.local')
const TOKEN_PATH = path.resolve('.youtube-oauth.json')
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'

export async function loadLocalEnv() {
  try {
    const source = await readFile(LOCAL_ENV_PATH, 'utf8')

    for (const line of source.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
      if (!match || match[0].trimStart().startsWith('#') || process.env[match[1]]) continue
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

export function getOAuthClientConfig() {
  const clientId = process.env.YT_OAUTH_CLIENT_ID
  const clientSecret = process.env.YT_OAUTH_CLIENT_SECRET

  if (!clientId) {
    throw new Error('YT_OAUTH_CLIENT_ID is not set. Add the Desktop app client ID to .env.local.')
  }

  return { clientId, clientSecret }
}

export async function requestToken(parameters) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(parameters),
  })
  const json = await response.json().catch(() => ({}))

  if (!response.ok || json.error) {
    const message = json.error_description ?? json.error ?? `${response.status} ${response.statusText}`
    throw new Error(`Google OAuth error: ${message}`)
  }

  return json
}

export async function saveOAuthTokens(tokens, previous = {}) {
  const stored = {
    ...previous,
    ...tokens,
    refresh_token: tokens.refresh_token ?? previous.refresh_token,
    expires_at: Date.now() + Number(tokens.expires_in ?? 3600) * 1000,
  }

  await writeFile(TOKEN_PATH, `${JSON.stringify(stored, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  return stored
}

export async function getYouTubeAccessToken() {
  await loadLocalEnv()
  const { clientId, clientSecret } = getOAuthClientConfig()

  let stored
  try {
    stored = JSON.parse(await readFile(TOKEN_PATH, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('YouTube OAuth is not authorized. Run npm run youtube:auth first.')
    }
    throw error
  }

  if (stored.access_token && Number(stored.expires_at) > Date.now() + 60_000) {
    return stored.access_token
  }
  if (!stored.refresh_token) {
    throw new Error('OAuth refresh token is missing. Run npm run youtube:auth again.')
  }

  const refreshed = await requestToken({
    client_id: clientId,
    ...(clientSecret ? { client_secret: clientSecret } : {}),
    refresh_token: stored.refresh_token,
    grant_type: 'refresh_token',
  })
  const next = await saveOAuthTokens(refreshed, stored)
  return next.access_token
}
