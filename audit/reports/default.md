# auditoria: pesos `default`

Gerado por `pnpm audit:engine`. Todas as combinações de emoção e respostas passaram pelo motor: **3.840 combinações**, 69.120 trocas de uma única resposta.

Pesos: emoção × 1,25, perguntas todas × 1, bônus de desejo +0,04.

## resumo

**Nenhuma sinalização.** ✅

## 1. influência

Duas perguntas por fonte. *Troca o #1*: mudando só esta resposta, com que frequência o prato #1 muda? *Explica*: o quanto saber só esta resposta diz sobre o resultado (informação mútua como fatia da entropia do resultado; 0% = nada, 100% = tudo). Sinaliza se uma fonte explicar mais de 30,0% do prato #1 ou do perfil, ou menos de 2,0% do prato #1.

| fonte | troca o #1 | explica o #1 | explica o perfil |
| --- | --- | --- | --- |
| `emotion` | 86,7% | 19,5% `██████····` | 22,0% `███████···` |
| `weather` | 69,3% | 8,2% `███·······` | 8,4% `███·······` |
| `company` | 56,1% | 4,1% `█·········` | 4,3% `█·········` |
| `dishes` | 66,0% | 5,9% `██········` | 7,3% `██········` |
| `soundtrack` | 66,5% | 7,7% `███·······` | 8,9% `███·······` |
| `appetite` | 54,5% | 4,1% `█·········` | 4,1% `█·········` |

> ✅ nada a sinalizar.

## 2. trava

Para cada resposta: o item que mais vence quando ela é escolhida. Sinaliza acima de 50,0%. Mostrando as 10 maiores.

| resposta | #1 mais comum | fatia |
| --- | --- | --- |
| `emotion=restless` | `taco-spread` | 31,4% |
| `emotion=drained` | `sheet-pan-gnocchi` | 28,0% |
| `emotion=fed-up` | `fridge-green-curry` | 25,0% |
| `soundtrack=brass` | `taco-spread` | 24,9% |
| `emotion=buzzing` | `summer-rolls` | 23,8% |
| `emotion=homesick` | `smashed-potatoes` | 21,9% |
| `dishes=someone-else` | `fridge-green-curry` | 21,0% |
| `weather=crisp` | `taco-spread` | 19,2% |
| `company=crowd` | `taco-spread` | 19,2% |
| `company=impress` | `fridge-green-curry` | 18,5% |

> ✅ nada a sinalizar.

## 3. cobertura

Todo item deveria chegar em #1 para *alguém*. A fatia justa de #1 é 5,0%; sinaliza acima de 3× isso.

| item | #1 | no top 3 |
| --- | --- | --- |
| `charred-corn` | 435 (11,3%) | 1308 (34,1%) |
| `taco-spread` | 435 (11,3%) | 1027 (26,7%) |
| `smashed-potatoes` | 410 (10,7%) | 781 (20,3%) |
| `fridge-green-curry` | 406 (10,6%) | 1026 (26,7%) |
| `sheet-pan-gnocchi` | 306 (8,0%) | 695 (18,1%) |
| `shakshuka` | 274 (7,1%) | 943 (24,6%) |
| `summer-rolls` | 242 (6,3%) | 643 (16,7%) |
| `lemon-risotto` | 161 (4,2%) | 537 (14,0%) |
| `miso-butter-noodles` | 154 (4,0%) | 677 (17,6%) |
| `peach-burrata` | 138 (3,6%) | 389 (10,1%) |
| `dan-dan-noodles` | 134 (3,5%) | 423 (11,0%) |
| `fruit-galette` | 127 (3,3%) | 336 (8,8%) |
| `cold-sesame-soba` | 114 (3,0%) | 397 (10,3%) |
| `chili-cucumbers` | 108 (2,8%) | 440 (11,5%) |
| `pickle-fried-chicken` | 106 (2,8%) | 453 (11,8%) |
| `pizza-night` | 87 (2,3%) | 417 (10,9%) |
| `beans-on-toast` | 79 (2,1%) | 300 (7,8%) |
| `chicken-soup` | 62 (1,6%) | 240 (6,3%) |
| `hand-rolled-dumplings` | 39 (1,0%) | 328 (8,5%) |
| `rice-pudding` | 23 (0,6%) | 160 (4,2%) |

> ✅ nada a sinalizar.

## 4. perfis

Equilíbrio (entropia normalizada, 1 = perfeitamente equilibrado): **0,96**. Sinaliza se um perfil for inalcançável ou passar de 2,5× a fatia uniforme de 10,0%.

| perfil | pessoas | fatia |
| --- | --- | --- |
| `slow-simmer` | 670 | 17,4% `███████···` |
| `citrus-fire` | 528 | 13,8% `██████····` |
| `kitchen-chaos` | 520 | 13,5% `█████·····` |
| `market-sprint` | 481 | 12,5% `█████·····` |
| `spicy-blanket` | 434 | 11,3% `█████·····` |
| `clean-plate` | 369 | 9,6% `████······` |
| `flour-everywhere` | 255 | 6,6% `███·······` |
| `sunday-garden` | 214 | 5,6% `██········` |
| `lazy-tinkerer` | 193 | 5,0% `██········` |
| `quiet-heat` | 176 | 4,6% `██········` |

> ✅ nada a sinalizar.

## 5. estabilidade

Mude uma resposta, mantenha o resto. Um bom motor se mexe um pouco: nem nada (as respostas seriam decoração), nem tudo (as respostas seriam um caça-níquel).

| métrica | valor |
| --- | --- |
| média de itens mantidos no top 3 | 1,58 / 3 |
| top 3 idêntico | 14,3% |
| #1 muda | 67,7% |
| top 3 inteiro substituído | 12,5% |

Sinaliza como instável acima de 15,0% de top 3 totalmente substituído, e como grudado acima de 80,0% de top 3 idêntico.

> ✅ nada a sinalizar.

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
