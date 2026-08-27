import { createHash, randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import {
  getOAuthClientConfig,
  loadLocalEnv,
  requestToken,
  saveOAuthTokens,
} from './youtube-oauth-client.js'

const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const YOUTUBE_READONLY_SCOPE = 'https://www.googleapis.com/auth/youtube.readonly'
const DEFAULT_REDIRECT_URI = 'http://127.0.0.1:53682/oauth2callback'

function base64Url(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function openBrowser(url) {
  let command
  let args

  if (process.platform === 'win32') {
    command = 'rundll32.exe'
    args = ['url.dll,FileProtocolHandler', url]
  } else if (process.platform === 'darwin') {
    command = 'open'
    args = [url]
  } else {
    command = 'xdg-open'
    args = [url]
  }

  const child = spawn(command, args, { detached: true, stdio: 'ignore', windowsHide: true })
  child.unref()
}

function waitForAuthorization(server, expectedState) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.close()
      reject(new Error('OAuth authorization timed out. Run npm run youtube:auth again.'))
    }, 5 * 60 * 1000)

    server.on('request', (request, response) => {
      const url = new URL(request.url, 'http://127.0.0.1')
      if (url.pathname !== '/oauth2callback') {
        response.writeHead(404).end('Not found')
        return
      }

      clearTimeout(timeout)
      const error = url.searchParams.get('error')
      const state = url.searchParams.get('state')
      const code = url.searchParams.get('code')

      if (error || state !== expectedState || !code) {
        response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' })
        response.end('認証できませんでした。このタブを閉じて、ターミナルを確認してください。')
        server.close()
        reject(new Error(error ? `OAuth authorization failed: ${error}` : 'OAuth state or code is invalid.'))
        return
      }

      resolve({ code, response })
    })
  })
}

async function run() {
  await loadLocalEnv()
  const { clientId, clientSecret } = getOAuthClientConfig()
  const redirectUri = process.env.YT_OAUTH_REDIRECT_URI || DEFAULT_REDIRECT_URI
  const redirectUrl = new URL(redirectUri)
  if (redirectUrl.protocol !== 'http:' || redirectUrl.hostname !== '127.0.0.1') {
    throw new Error('YT_OAUTH_REDIRECT_URI must use http://127.0.0.1 for local OAuth.')
  }
  if (!redirectUrl.port) {
    throw new Error('YT_OAUTH_REDIRECT_URI must include a port number.')
  }
  const state = base64Url(randomBytes(24))
  const codeVerifier = base64Url(randomBytes(48))
  const codeChallenge = base64Url(createHash('sha256').update(codeVerifier).digest())
  const server = createServer()

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(Number(redirectUrl.port), '127.0.0.1', resolve)
  })

  const authorizationUrl = new URL(AUTH_ENDPOINT)
  authorizationUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: YOUTUBE_READONLY_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  console.log('Googleの認証画面をブラウザで開きます。')
  console.log(`Redirect URI: ${redirectUri}`)
  console.log(`開かない場合は次のURLへアクセスしてください:\n${authorizationUrl}`)
  const authorization = waitForAuthorization(server, state)
  openBrowser(authorizationUrl.toString())

  const { code, response } = await authorization

  try {
    const tokens = await requestToken({
      client_id: clientId,
      ...(clientSecret ? { client_secret: clientSecret } : {}),
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    })
    await saveOAuthTokens(tokens)
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end('<!doctype html><meta charset="utf-8"><title>認証完了</title><p>認証できました。このタブを閉じてターミナルへ戻ってください。</p>')
    console.log('YouTube OAuth認証が完了しました。')
  } catch (error) {
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('トークンの保存に失敗しました。ターミナルを確認してください。')
    throw error
  } finally {
    server.close()
  }
}

run().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
