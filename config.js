const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000" // URL do backend local
    : "https://onde-assistir-meu-filme.vercel.app"; // URL no Vercel

export default API_BASE_URL;
