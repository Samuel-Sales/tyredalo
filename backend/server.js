
const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const { baixarVideo } = require('./services/downloader');

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10kb' }));

app.use(express.static(
    path.join(__dirname, '../frontend')
));

app.get('/api/status', (req, res) => {
    res.json({
        mensagem: 'Backend funcionando!',
        status: 'online'
    });
});

app.post('/api/download', async (req, res) => {
    const { url, format } = req.body || {};

    let resultado;

    try {
        resultado = await baixarVideo(url, format);

        res.download(
            resultado.caminho,
            resultado.nome,
            async (erro) => {
                await fs.rm(resultado.pasta, {
                    recursive: true,
                    force: true
                }).catch(console.error);

                if (erro) {
                    console.error(
                        'Erro ao enviar arquivo:',
                        erro.message
                    );
                }
            }
        );

    } catch (error) {
        console.error('Erro:', error.message);

        if (!res.headersSent) {
            res.status(500).json({
                erro: error.message
            });
        }
    }
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(
        `Servidor rodando em http://localhost:${PORT}`
    );
});