// server.js
import express from "express";
import fetch from "node-fetch";
import OpenAI from "openai";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
const tmdbKey = process.env.TMDB_KEY;

app.post("/recomendar", async (req, res) => {
  const humor = req.body.humor;

  try {
    // 1. IA interpreta o humor
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

    res.json(filmes.results);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar filmes" });
  }
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));

import dotenv from "dotenv";
dotenv.config();

console.log("OpenAI Key:", process.env.OPENAI_KEY);
console.log("TMDB Key:", process.env.TMDB_KEY);
