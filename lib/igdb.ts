/**
 * Utilitário nativo de integração com a API IGDB v4 via Twitch OAuth2.
 * Executa exclusivamente no servidor sem expor credenciais.
 */

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TokenCache {
  token: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;

/**
 * Obtém ou renova o App Access Token da Twitch em memória.
 */
export async function getIGDBAccessToken(): Promise<string> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Credenciais da Twitch (TWITCH_CLIENT_ID e TWITCH_CLIENT_SECRET) não configuradas no servidor."
    );
  }

  // Reutiliza token se válido com folga de 60 segundos
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const response = await fetch(`https://id.twitch.tv/oauth2/token?${params.toString()}`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao obter token da Twitch: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as TwitchTokenResponse;

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
}

/**
 * Executa uma consulta Apicalypse na API IGDB v4.
 */
export async function queryIGDB<T>(endpoint: string, queryBody: string): Promise<T> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const token = await getIGDBAccessToken();

  const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": clientId!,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "text/plain",
    },
    body: queryBody,
    // Próxima busca não armazena cache do next para permitir buscas dinâmicas
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na API IGDB (${endpoint}): ${response.status} - ${errorText}`);
  }

  return (await response.json()) as T;
}

/**
 * Converte URLs ou IDs de capa da IGDB para tamanho t_cover_big com protocolo HTTPS.
 */
export function formatIGDBCover(cover?: { image_id?: string; url?: string } | null): string | null {
  if (!cover) return null;

  if (cover.image_id) {
    return `https://images.igdb.com/igdb/image/upload/t_cover_big/${cover.image_id}.jpg`;
  }

  if (cover.url) {
    let url = cover.url;
    if (url.startsWith("//")) {
      url = `https:${url}`;
    }
    return url.replace("t_thumb", "t_cover_big");
  }

  return null;
}

