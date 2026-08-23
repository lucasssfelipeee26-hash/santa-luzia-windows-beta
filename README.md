# Santa Luzia Windows Beta

Canal de testes para Windows, separado do Android estável.

- **Windows Beta:** este repositório publica prereleases `.exe`.
- **Android estável:** `lucasssfelipeee26-hash/comunidade-santa-luzia`, atualmente 1.0.6 / code 18.
- O build Windows parte de um snapshot congelado do Android estável (`androidBaseCommit`) e aplica somente os arquivos deste repositório como overlay.
- O **Setup** é o executável recomendado para testes contínuos. Ele tenta primeiro o `electron-updater` e, se necessário, consulta diretamente `releases/windows-beta-latest.json`, validando tamanho e SHA-256 antes de executar o instalador oficial.
- O **Portable** existe para testes rápidos e não é o canal principal de auto-update.
- A interface da Beta herda o Android sem badge, tema ou layout exclusivos de Windows.
- As experiências em teste são empacotadas no executável e só entram após uma atualização nativa do Windows.

## Beta atual — 0.1.0-beta.19

Esta versão preserva todas as correções anteriores e corrige a falha grave da Jornada Litúrgica:

- impede que a limpeza de textos redundantes esconda os contêineres completos da tela;
- mantém Quiz, Jogos, Ranking e Avulsos visíveis e funcionais dentro da sessão ativa;
- valida no Electron real os dados do ranking, a geração das cinco perguntas litúrgicas e a troca entre todas as abas;
- reduz a transição a um véu curto e não bloqueante, sem misturar telas;
- remove da Beta o banner repetitivo de atraso confirmado;
- consolida o relatório em um único cartão por pessoa, com todos os totais e detalhes;
- sincroniza os três ponteiros dos relógios com o Windows e mantém cada ponteiro independente;
- anima os ícones originais de Presenças e Registro, sem trocar seus desenhos;
- mantém somente a formação concluída mais recente em destaque e arquiva as anteriores;
- permite editar toda a escala publicada e escolher uma única celebração do iLiturgia;
- permite à pessoa escalada justificar sua falta na missa e registra isso no histórico correto;
- bloqueia definitivamente a escolha pessoal da formação após o primeiro registro;
- libera `Presente` somente no horário do Windows e mantém `Falta justificada` disponível desde a publicação;
- evita os zeros temporários no painel enquanto os dados reais ainda estão chegando;
- consulta `releases/windows-beta-runtime.json`, valida tamanho e SHA-256 e aplica ajustes remotos sem reinstalação;
- lê manifesto e script remoto do mesmo commit do GitHub para impedir combinações parciais durante a propagação;
- mantém `electron-updater`, `beta.yml` e o manifesto oficial como fallback independente;
- mantém o Android estável 1.0.6/code18 congelado no mesmo commit.

Mudanças nativas no Electron ainda usam o auto-update do Setup. O canal remoto nunca é carregado pelo Android.

Melhorias acumuladas do canal Beta:

- janela inicia no mesmo breakpoint visual usado no Android;
- remove do menu do moderador os atalhos redundantes **Painel**, **Jornada**, **Quizzes** e **Escala pública**;
- mantém **Atrasos**, **Escalas**, **Formação**, **Presenças**, **Registro** e **Cores** em grade 3 × 2;
- mantém o **Quiz** da barra inferior;
- o menu do membro não é alterado;
- os ajustes da experiência são exclusivos do canal Windows e não alteram a interface Android estável.

## Versionamento

As Betas usam numeração independente, por exemplo:

- `0.1.0-beta.1`
- `0.1.0-beta.2`
- `0.2.0-beta.1`

Somente mudanças aprovadas na Beta devem ser promovidas depois para uma futura versão Android.
