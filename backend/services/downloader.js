const ytDlp = require('yt-dlp-exec');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');

function validarUrl(url) {
    if (typeof url !== 'string') return false;

    try {
        const endereco = new URL(url);

        const dominios = [
            'youtube.com',
            'www.youtube.com',
            'm.youtube.com',
            'youtu.be',
            'www.youtube-nocookie.com'
        ];

        return (
            endereco.protocol === 'https:' &&
            dominios.includes(endereco.hostname)
        );
    } catch {
        return false;
    }
}

async function baixarVideo(url, formato) {
    if (!validarUrl(url)) {
        throw new Error('Insira uma URL válida do YouTube.');
    }

    if (!['mp3', 'mp4'].includes(formato)) {
        throw new Error('Formato não suportado.');
    }

    if (!ffmpegPath) {
        throw new Error('FFmpeg não encontrado.');
    }

    const pasta = await fs.mkdtemp(
        path.join(os.tmpdir(), 'youtube-downloader-')
    );

    const destino = path.join(pasta, 'video.%(ext)s');

    try {
        const opcoes = {
            output: destino,
            noPlaylist: true,
            ffmpegLocation: ffmpegPath,
            noWarnings: true
        };

        if (formato === 'mp3') {
            opcoes.format = 'bestaudio/best';
            opcoes.extractAudio = true;
            opcoes.audioFormat = 'mp3';
            opcoes.audioQuality = '0';
        } else {
            opcoes.format =
                'bv*[height<=1080]+ba/b[height<=1080]';
            opcoes.mergeOutputFormat = 'mp4';
            opcoes.recodeVideo = 'mp4';
        }

        await ytDlp(url, opcoes);

        const arquivos = await fs.readdir(pasta);
        const extensao = `.${formato}`;

        const nomeArquivo = arquivos.find(
            arquivo => arquivo.endsWith(extensao)
        );

        if (!nomeArquivo) {
            throw new Error(
                'O arquivo não foi gerado corretamente.'
            );
        }

        return {
            caminho: path.join(pasta, nomeArquivo),
            pasta,
            nome: `youtube-download.${formato}`
        };

    } catch (error) {
        await fs.rm(pasta, {
            recursive: true,
            force: true
        });

        throw error;
    }
}

module.exports = { baixarVideo };