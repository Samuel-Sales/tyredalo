
const form = document.getElementById('downloadForm');
const status = document.getElementById('status');
const botao = form.querySelector('button');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const url = document.getElementById('videoUrl').value;
    const format = document.getElementById('format').value;

    botao.disabled = true;
    botao.textContent = 'Processando...';

    status.textContent = 'Preparando download...';

    try {
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url, format })
        });

        if (!response.ok) {
            const data = await response.json();

            throw new Error(
                data.erro || 'Erro ao baixar arquivo.'
            );
        }

        status.textContent = 'Recebendo arquivo...';

        const blob = await response.blob();
        const arquivoUrl = URL.createObjectURL(blob);

        const extensao = format === 'mp3'
            ? 'mp3'
            : 'mp4';

        const link = document.createElement('a');

        link.href = arquivoUrl;
        link.download = `youtube-download.${extensao}`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => {
            URL.revokeObjectURL(arquivoUrl);
        }, 60000);

        status.textContent = 'Download iniciado!';

    } catch (error) {
        status.textContent = `Erro: ${error.message}`;
        console.error(error);

    } finally {
        botao.disabled = false;
        botao.textContent = 'Baixar';
    }
});