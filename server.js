import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const API_KEY = "0d362601b04741566e35e6417a78da9a";

app.get("/streaming/:nome", async (req, res) => {
  const nome = req.params.nome;

  try {
    // 1. Buscar filme pelo nome
    const searchRes = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(nome)}`
    );
    const searchData = await searchRes.json();

    if (!searchData.results || searchData.results.length === 0) {
      return res.json({ filmes: [] });
    }

    // 2. Montar lista de filmes
    const filmes = await Promise.all(
      searchData.results.map(async (filme) => {
        // Buscar provedores para cada filme
        const provRes = await fetch(
          `https://api.themoviedb.org/3/movie/${filme.id}/watch/providers?api_key=${API_KEY}`
        );
        const provData = await provRes.json();

        const provedores = provData.results.BR?.flatrate?.map((p) => ({
          nome: p.provider_name,
          logo: `https://image.tmdb.org/t/p/original${p.logo_path}`,
        })) || [];

        return {
          titulo: filme.title,
          descricao: filme.overview,
          capa: filme.poster_path ? `https://image.tmdb.org/t/p/w500${filme.poster_path}` : null,
          provedores
        };
      })
    );

    res.json({ filmes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar dados" });
  }
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
