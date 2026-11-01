# auditoria: pesos `unbalanced`

Gerado por `pnpm audit:engine --weights unbalanced`. Todas as combinações de emoção e respostas passaram pelo motor: **3.840 combinações**, 69.120 trocas de uma única resposta.

Pesos: emoção × 3, perguntas weather × 2, demais × 1, bônus de desejo +0,04.

## resumo

**6 sinalização(ões).**

- **influência** — `emotion` domina: sozinha, explica 41,0% do prato #1 e 50,9% do perfil.
- **influência** — `company` é decoração: explica só 1,5% do prato #1.
- **influência** — `dishes` é decoração: explica só 1,5% do prato #1.
- **influência** — `appetite` é decoração: explica só 1,4% do prato #1.
- **trava** — escolher `emotion=buzzing` faz `summer-rolls` ser #1 em 51,6% das combinações.
- **estabilidade** — instável: 16,8% das trocas de uma única resposta substituem o top 3 inteiro.

## 1. influência

Duas perguntas por fonte. *Troca o #1*: mudando só esta resposta, com que frequência o prato #1 muda? *Explica*: o quanto saber só esta resposta diz sobre o resultado (informação mútua como fatia da entropia do resultado; 0% = nada, 100% = tudo). Sinaliza se uma fonte explicar mais de 30,0% do prato #1 ou do perfil, ou menos de 2,0% do prato #1.

| fonte | troca o #1 | explica o #1 | explica o perfil |
| --- | --- | --- | --- |
| `emotion` | 97,4% | 41,0% `██████████` | 50,9% `██████████` |
| `weather` | 78,3% | 14,9% `█████·····` | 12,9% `████······` |
| `company` | 34,8% | 1,5% `█·········` | 1,0% `··········` |
| `dishes` | 36,4% | 1,5% `··········` | 1,3% `··········` |
| `soundtrack` | 43,7% | 2,9% `█·········` | 2,5% `█·········` |
| `appetite` | 32,2% | 1,4% `··········` | 1,1% `··········` |

> ⚠️ `emotion` domina: sozinha, explica 41,0% do prato #1 e 50,9% do perfil.
>
> ⚠️ `company` é decoração: explica só 1,5% do prato #1.
>
> ⚠️ `dishes` é decoração: explica só 1,5% do prato #1.
>
> ⚠️ `appetite` é decoração: explica só 1,4% do prato #1.

## 2. trava

Para cada resposta: o item que mais vence quando ela é escolhida. Sinaliza acima de 50,0%. Mostrando as 10 maiores.

| resposta | #1 mais comum | fatia |
| --- | --- | --- |
| `emotion=buzzing` | `summer-rolls` | 51,6% |
| `emotion=drained` | `sheet-pan-gnocchi` | 44,3% |
| `emotion=restless` | `taco-spread` | 42,6% |
| `emotion=fed-up` | `dan-dan-noodles` | 27,3% |
| `weather=heatwave` | `summer-rolls` | 26,9% |
| `emotion=homesick` | `chicken-soup` | 25,7% |
| `soundtrack=brass` | `taco-spread` | 19,0% |
| `weather=crisp` | `summer-rolls` | 18,9% |
| `soundtrack=birds` | `summer-rolls` | 18,3% |
| `weather=storm` | `taco-spread` | 17,4% |

> ⚠️ escolher `emotion=buzzing` faz `summer-rolls` ser #1 em 51,6% das combinações.

## 3. cobertura

Todo item deveria chegar em #1 para *alguém*. A fatia justa de #1 é 5,0%; sinaliza acima de 3× isso.

| item | #1 | no top 3 |
| --- | --- | --- |
| `summer-rolls` | 491 (12,8%) | 827 (21,5%) |
| `taco-spread` | 457 (11,9%) | 1092 (28,4%) |
| `sheet-pan-gnocchi` | 344 (9,0%) | 754 (19,6%) |
| `charred-corn` | 269 (7,0%) | 1193 (31,1%) |
| `smashed-potatoes` | 236 (6,1%) | 533 (13,9%) |
| `fridge-green-curry` | 215 (5,6%) | 738 (19,2%) |
| `dan-dan-noodles` | 211 (5,5%) | 449 (11,7%) |
| `miso-butter-noodles` | 209 (5,4%) | 638 (16,6%) |
| `chicken-soup` | 197 (5,1%) | 577 (15,0%) |
| `lemon-risotto` | 188 (4,9%) | 601 (15,7%) |
| `beans-on-toast` | 181 (4,7%) | 514 (13,4%) |
| `fruit-galette` | 155 (4,0%) | 445 (11,6%) |
| `chili-cucumbers` | 147 (3,8%) | 363 (9,5%) |
| `shakshuka` | 119 (3,1%) | 545 (14,2%) |
| `pizza-night` | 105 (2,7%) | 479 (12,5%) |
| `pickle-fried-chicken` | 88 (2,3%) | 381 (9,9%) |
| `hand-rolled-dumplings` | 80 (2,1%) | 492 (12,8%) |
| `peach-burrata` | 66 (1,7%) | 348 (9,1%) |
| `cold-sesame-soba` | 48 (1,3%) | 215 (5,6%) |
| `rice-pudding` | 34 (0,9%) | 336 (8,8%) |

> ✅ nada a sinalizar.

## 4. perfis

Equilíbrio (entropia normalizada, 1 = perfeitamente equilibrado): **0,90**. Sinaliza se um perfil for inalcançável ou passar de 2,5× a fatia uniforme de 10,0%.

| perfil | pessoas | fatia |
| --- | --- | --- |
| `market-sprint` | 827 | 21,5% `█████████·` |
| `slow-simmer` | 804 | 20,9% `████████··` |
| `citrus-fire` | 547 | 14,2% `██████····` |
| `kitchen-chaos` | 533 | 13,9% `██████····` |
| `spicy-blanket` | 275 | 7,2% `███·······` |
| `clean-plate` | 209 | 5,4% `██········` |
| `sunday-garden` | 208 | 5,4% `██········` |
| `flour-everywhere` | 196 | 5,1% `██········` |
| `lazy-tinkerer` | 133 | 3,5% `█·········` |
| `quiet-heat` | 108 | 2,8% `█·········` |

> ✅ nada a sinalizar.

## 5. estabilidade

Mude uma resposta, mantenha o resto. Um bom motor se mexe um pouco: nem nada (as respostas seriam decoração), nem tudo (as respostas seriam um caça-níquel).

| métrica | valor |
| --- | --- |
| média de itens mantidos no top 3 | 1,79 / 3 |
| top 3 idêntico | 29,6% |
| #1 muda | 57,2% |
| top 3 inteiro substituído | 16,8% |

Sinaliza como instável acima de 15,0% de top 3 totalmente substituído, e como grudado acima de 80,0% de top 3 idêntico.

> ⚠️ instável: 16,8% das trocas de uma única resposta substituem o top 3 inteiro.

## 6. checagens dos dados

Orçamento de pontos: toda opção dentro de uma pergunta deveria distribuir os mesmos pontos (±25,0%).

> ✅ nada a sinalizar.

Limites de tempo: cada um deveria deixar pelo menos 3 itens.

| limite | itens restantes |
| --- | --- |
| tenho a noite toda | 20 |
| mais ou menos uma hora e meia | 18 |
| menos de 45 minutos | 13 |
| 20 minutos, no máximo | 5 |

> ✅ nada a sinalizar.
