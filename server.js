import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

// Carrega variáveis de ambiente
dotenv.config();

// Inicializa o app
const app = express();

// Middlewares
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

// Rota para buscar provedores de streaming
app.get("/streaming/:movie", async (req, res) => {
  const movieName = req.params.movie;
  const apiKey = process.env.TMDB_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "TMDB_KEY não configurada" });
  }

  try {
    // 1️⃣ Buscar ID do filme
    const searchRes = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
        movieName
      )}&language=pt-BR`
    );
    const searchData = await searchRes.json();

    if (!searchData.results.length) {
      return res.json({ providers: [] });
    }

    const movieId = searchData.results[0].id;

    // 2️⃣ Buscar provedores de streaming
    const providersRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${apiKey}`
    );
    const providersData = await providersRes.json();

    const providers = providersData.results.BR?.flatrate || [];

    res.json({ providers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar dados" });
  }
});

// Inicia o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
