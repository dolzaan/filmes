import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const TMDB_API_KEY = process.env.TMDB_API_KEY || "0d362601b04741566e35e6417a78da9a";

// Rota para buscar filme
app.get("/streaming/:movie", async (req, res) => {
  try {
    const movieName = req.params.movie;

    // Busca lista de filmes
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(movieName)}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.results.length) {
      return res.status(404).json({ error: "Nenhum filme encontrado" });
    }

    // Para cada filme, busca provedores
    const filmesComProvedores = await Promise.all(
      searchData.results.map(async (movie) => {
        const providersUrl = `https://api.themoviedb.org/3/movie/${movie.id}/watch/providers?api_key=${TMDB_API_KEY}`;
        const providersRes = await fetch(providersUrl);
        const providersData = await providersRes.json();

        const providers = providersData.results.BR?.flatrate || [];

        return {
          title: movie.title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          providers
        };
      })
    );

    res.json(filmesComProvedores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
