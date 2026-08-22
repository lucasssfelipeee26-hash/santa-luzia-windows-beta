# Santa Luzia Windows Beta

Canal de testes para Windows, separado do Android estável.

- **Windows Beta:** este repositório publica prereleases `.exe`.
- **Android estável:** `lucasssfelipeee26-hash/comunidade-santa-luzia`, atualmente 1.0.6 / code 18.
- O build Windows parte de um snapshot congelado do Android estável (`androidBaseCommit`) e aplica somente os arquivos deste repositório como overlay.
- O **Setup** é o executável recomendado para testes contínuos. Ele tenta primeiro o `electron-updater` e, se necessário, consulta diretamente `releases/windows-beta-latest.json`, validando tamanho e SHA-256 antes de executar o instalador oficial.
- O **Portable** existe para testes rápidos e não é o canal principal de auto-update.
- A interface da Beta herda o Android sem badge, tema ou layout exclusivos de Windows.
- As experiências em teste são empacotadas no executável e só entram após uma atualização nativa do Windows.

## Beta atual — 0.1.0-beta.8

Esta versão preserva todas as melhorias da beta.7 e corrige o auto-update do Windows:

- mantém `electron-updater` e `beta.yml` como primeira tentativa;
- usa o manifesto oficial no GitHub como fallback independente;
- compara a versão instalada, baixa somente o Setup da release correspondente e valida tamanho e SHA-256;
- executa a instalação silenciosa somente depois da validação;
- mantém o Android estável 1.0.6/code18 congelado no mesmo commit.

Melhorias acumuladas do canal Beta:

- janela inicia no mesmo breakpoint visual usado no Android;
- remove do menu do moderador os atalhos redundantes **Painel**, **Jornada**, **Quizzes** e **Escala pública**;
- mantém **Atrasos**, **Escalas**, **Formação**, **Presenças**, **Registro** e **Cores** em grade 3 × 2;
- mantém o **Quiz** da barra inferior;
- o menu do membro não é alterado;
- o patch da experiência está dentro do EXE, não no servidor.

## Versionamento

As Betas usam numeração independente, por exemplo:

- `0.1.0-beta.1`
- `0.1.0-beta.2`
- `0.2.0-beta.1`

Somente mudanças aprovadas na Beta devem ser promovidas depois para uma futura versão Android.
