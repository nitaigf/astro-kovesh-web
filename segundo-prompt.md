# EXTENSÃO DO PROMPT — FRONTEND COSMOS DINÂMICO COM THREE.JS

Você deve **evoluir o frontend existente**, sem quebrar o que já está funcionando, adicionando um **background procedural dinâmico que simule o espaço sideral**, substituindo o fundo estático atual.

---

# Objetivo visual

O fundo atual (degradê escuro) deve ser substituído por:

* um **campo de estrelas dinâmico**
* gerado **em tempo de execução (runtime)**
* com aparência realista de espaço profundo
* com leve movimento (parallax ou drift)
* que **não atrapalhe a leitura do conteúdo**
* que **valorize o efeito glassmorphism do card central**

Referência de comportamento visual:

* partículas no espaço
* profundidade
* sensação de infinito
* leve movimento contínuo

---

# Tecnologia obrigatória

Utilizar:

* Three.js

Motivos:

* controle total do canvas
* performance com WebGL
* facilidade para partículas

---

# Requisitos técnicos do background

## 1. Renderização

* usar `<canvas>` com WebGL via Three.js
* renderizar **full screen (100vw x 100vh)**
* posicionar como **background absoluto**
* z-index abaixo de todo o conteúdo

Exemplo de layering:

* canvas (background)
* overlay leve (opcional)
* conteúdo (card glass)

---

## 2. Sistema de partículas (estrelas)

Implementar:

* `THREE.BufferGeometry`
* `THREE.Points`
* `THREE.PointsMaterial`

Configuração:

* quantidade inicial: 1000 a 3000 partículas
* distribuição:

  * aleatória em espaço 3D
  * evitar clustering artificial
* tamanhos variados (leve variação)
* brilho sutil (não estourado)

---

## 3. Profundidade (efeito 3D)

Criar sensação de profundidade usando:

* distribuição em eixo Z
* variação de tamanho por distância
* movimento diferencial (parallax leve)

---

## 4. Movimento

Adicionar animação contínua:

* drift lento das estrelas (ex: eixo Z ou Y)
* ou rotação muito sutil do campo

Regras:

* movimento deve ser **quase imperceptível**
* evitar distração
* evitar motion sickness

---

## 5. Randomização

A cada load da página:

* gerar seed diferente
* variar:

  * posição das estrelas
  * densidade leve
  * distribuição

Resultado:

* cada acesso parece único

---

## 6. Performance

Essencial:

* usar `requestAnimationFrame`
* evitar recriação de geometria por frame
* não usar milhares de objetos individuais (usar buffer)
* limitar FPS se necessário

Deve rodar bem em:

* desktop médio
* notebook comum

Fallback:

* se WebGL falhar → voltar para fundo degradê simples

---

## 7. Integração com SolidJS

Criar um componente isolado, por exemplo:

```
/components/CosmosBackground.tsx
```

Responsabilidades:

* montar cena Three.js
* iniciar renderer
* controlar lifecycle (onMount / onCleanup)
* redimensionar canvas no resize

---

## 8. Glassmorphism (correção do problema atual)

O efeito glass do card deve voltar a ser visível.

Ajustar:

* background do card:

  * rgba com transparência real (ex: 0.1 ~ 0.2)
* adicionar:

  * `backdrop-blur`
  * `border` sutil
  * `box-shadow` suave

Exemplo de intenção:

* vidro fosco
* leve reflexo
* separação clara do fundo

---

## 9. Contraste e legibilidade

Garantir:

* estrelas não sejam muito brilhantes
* fundo não “brigue” com o conteúdo
* texto continue legível

Se necessário:

* adicionar overlay escuro sutil entre canvas e conteúdo

---

## 10. Responsividade

Garantir:

* canvas adapta ao resize
* não quebra em mobile
* reduz partículas em telas pequenas (opcional)

---

# Estrutura esperada

Adicionar no frontend:

* componente `CosmosBackground`
* hook ou util para setup do Three.js
* integração no layout principal (App ou Page root)

---

# Critérios de aceite

O trabalho será considerado correto se:

* o fundo deixa de ser um degradê estático
* o background é gerado dinamicamente a cada load
* há partículas simulando estrelas
* existe leve movimento contínuo
* o card glass volta a ficar visualmente evidente
* performance é fluida
* não interfere na usabilidade do formulário
* funciona junto com o restante do sistema já existente

---

# Restrições importantes

* NÃO quebrar o funcionamento atual da aplicação
* NÃO adicionar complexidade desnecessária
* NÃO usar libs pesadas além de Three.js
* NÃO transformar isso em um projeto de visualização 3D complexo

---

# Entregáveis adicionais

Atualizar:

## Código

* componente de background
* integração no layout

## README

Adicionar seção:

"Frontend Visual Enhancement"

Explicar:

* uso de Three.js
* como funciona o background procedural
* como ajustar densidade de estrelas
* como desativar se necessário

---

# Resultado esperado

Ao abrir a aplicação:

* o usuário vê um **espaço profundo com estrelas**
* o fundo é **vivo e único**
* o card central parece realmente vidro sobre o cosmos
* a experiência fica mais imersiva, mas ainda leve e profissional

---

Implemente agora essa evolução mantendo o restante do sistema intacto.
