const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/api/resolver-tarea', async (req, res) => {
  console.log("Recibiendo solicitud para resolver tarea:", req.body);
  const { titulo } = req.body;
  console.log("Recibiendo solicitud para resolver tarea:", titulo);
  if (!titulo) {
    return res.status(400).json({ error: "Falta el campo 'titulo' en el body" });
  }
  console.log("Consultando IA para la tarea:", titulo);
  
  const prompt = `Eres un asistente académico que ayuda a estudiantes. La tarea se llama "${titulo}". 
    Explícale paso a paso cómo puede hacerla. Si es necesario, sugiere recursos.`;

  try {
    const respuesta = await axios.post('http://localhost:11434/api/generate', {
      model: 'llama3',
      prompt,
      stream: false,
      temperature: 0.7,
      max_tokens: 300
    });
    console.log("Respuesta de IA:", respuesta.data.response);
    
    res.json({ respuesta: respuesta.data.response });
  } catch (error) {
    log.error("Error al consultar IA:", error);
    res.status(500).json({ error: 'Error al generar respuesta de IA', detalle: error.message });
  }
});

module.exports = router;
