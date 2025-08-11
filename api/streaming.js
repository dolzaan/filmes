export default async function handler(req, res) {
  try {
    const { movie } = req.query;

    if (!movie) {
      return res.status(400).json({ error: "Parâmetro 'movie' é obrigatório" });
    }

    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) {
      return res.status(500).json({ error: "TMDB_API_KEY não configurada no Vercel" });
    }

    // Busca filmes pelo nome
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(movie)}`;
    const searchRes = await fetch(searchUrl);

    if (!searchRes.ok) {
      return res.status(searchRes.status).json({ error: "Falha na busca de filmes" });
    }

    const searchData = await searchRes.json();
    if (!searchData.results?.length) {
      return res.status(404).json({ error: "Nenhum filme encontrado" });
    }

    // Buscar provedores para até 6 filmes
    const movies = await Promise.all(
      searchData.results.slice(0, 6).map(async (m) => {
        const providersUrl = `https://api.themoviedb.org/3/movie/${m.id}/watch/providers?api_key=${TMDB_API_KEY}`;
        const providersRes = await fetch(providersUrl);

        if (!providersRes.ok) {
          return { title: m.title, error: "Erro ao buscar provedores" };
        }

        const providersData = await providersRes.json();
        const providers = providersData.results?.BR?.flatrate || [];

        return {
          title: m.title,
          overview: m.overview,
          poster_path: m.poster_path,
          providers
        };
      })
    );

    return res.status(200).json(movies);
  } catch (err) {
    console.error("Erro na API:", err);
    return res.status(500).json({ error: "Erro no servidor", details: err.message });
  }
}
