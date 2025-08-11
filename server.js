// server.js

// 1. Carrega variáveis de ambiente
import dotenv from "dotenv";
dotenv.config(); // Isso precisa vir logo no início

// 2. Agora importa o resto
import express from "express";
import fetch from "node-fetch";
import OpenAI from "openai";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 3. Usa as variáveis
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY); // teste
console.log("TMDB_KEY:", process.env.TMDB_KEY);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const tmdbKey = process.env.TMDB_KEY;

// resto do código...


// Função para buscar provedores de streaming
async function getStreamingProviders(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${tmdbKey}`;
  const resp = await fetch(url);
  const data = await resp.json();
  
  // Retorna apenas provedores no Brasil
  return data.results?.BR?.flatrate?.map(p => p.provider_name) || [];
}

app.post("/recomendar", async (req, res) => {
  const humor = req.body.humor;

  try {
    // 1. IA interpreta o humor e sugere gêneros
    const iaResp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é um assistente que recebe descrições de humor e sugere gêneros de filmes em inglês para usar no TMDB." },
        { role: "user", content: `Humor do usuário: ${humor}` }
      ],
      temperature: 0.7
    });

    const generos = iaResp.choices[0].message.content;

    // 2. Busca no TMDB com base nos gêneros
    const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(generos)}&language=pt-BR`;
    const filmesResp = await fetch(tmdbUrl);
    const filmes = await filmesResp.json();

    // 3. Adiciona informações de streaming a cada filme
    const filmesComStreaming = await Promise.all(
      filmes.results.map(async filme => {
        const providers = await getStreamingProviders(filme.id);
        return { ...filme, streaming: providers };
      })
    );

    res.json(filmesComStreaming);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar filmes" });
  }
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
