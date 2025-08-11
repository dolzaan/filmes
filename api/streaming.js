import fetch from "node-fetch";

// Função handler padrão do Vercel
export default async function handler(req, res) {
  const { movie } = req.query;

  if (!movie) {
    return res.status(400).json({ error: "Parâmetro 'movie' é obrigatório" });
  }

  const TMDB_API_KEY = process.env.TMDB_API_KEY || "0d362601b04741566e35e6417a78da9a";

  try {
    // Busca filmes pelo nome
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(movie)}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.results.length) {
      return res.status(404).json({ error: "Nenhum filme encontrado" });
    }

    // Buscar provedores para vários filmes (limitado a 6 para performance)
    const movies = await Promise.all(
      searchData.results.slice(0, 6).map(async (m) => {
        const providersUrl = `https://api.themoviedb.org/3/movie/${m.id}/watch/providers?api_key=${TMDB_API_KEY}`;
        const providersRes = await fetch(providersUrl);
        const providersData = await providersRes.json();

        const providers = providersData.results.BR?.flatrate || [];

        return {
          title: m.title,
          overview: m.overview,
          poster_path: m.poster_path,
          providers
        };
      })
    );

    res.status(200).json(movies);
  } catch (err) {
    console.error("Erro na API:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
}
