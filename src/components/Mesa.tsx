'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Carta, Jogador, EstadoJogo, ModoJogo } from '../types/game';
import CartaComponent from './Carta';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  distribuirCartas,
  determinarManilha,
  embaralhar,
  criarBaralho,
  determinarVencedorTurno,
  botFazerAposta,
  botJogarCarta,
  podeVerCarta,
  podeVerManilha,
} from '../lib/gameLogic';

interface MesaProps {
  numJogadores: number;
}

export default function Mesa({ numJogadores }: MesaProps) {
  const [estado, setEstado] = useState<EstadoJogo>(() => ({
    baralho: embaralhar(criarBaralho()),
    manilha: null,
    rodada: 1,
    maxCartas: numJogadores * 2,
    direcao: 'aumentando',
    jogadores: Array.from({ length: numJogadores }, (_, i) => ({
      id: `j${i}`,
      nome: i === 0 ? 'Você' : `Bot ${i}`,
      pontos: 0,
      mao: [],
      vitorias: 0,
      aposta: 0,
      isBot: i !== 0,
    })),
    jogadas: {},
    vencedorRodada: null,
    modoJogo: 'normal',
    cartasSelecionadas: {},
    apostasFeitas: false,
  }));

  const [apostaJogador, setApostaJogador] = useState<number>(0);
  const [modoSelecionado, setModoSelecionado] = useState<ModoJogo>('normal');
  const [cartaSelecionada, setCartaSelecionada] = useState<number>(-1);

  const selecionarModo = (modo: ModoJogo) => {
    setModoSelecionado(modo);
    setEstado(prev => ({ ...prev, modoJogo: modo }));
  };

  const iniciarRodada = () => {
    const novoBaralho = embaralhar(criarBaralho());
    const manilha = determinarManilha(novoBaralho);
    const numCartas =
      estado.rodada <= estado.maxCartas
        ? estado.rodada
        : estado.maxCartas * 2 - estado.rodada;

    distribuirCartas(novoBaralho, numCartas, estado.jogadores);

    setEstado((prev) => ({
      ...prev,
      baralho: novoBaralho,
      manilha,
      jogadas: {},
      cartasSelecionadas: {},
      apostasFeitas: false,
    }));
  };

  const fazerAposta = () => {
    const novasApostas: { [jogadorId: string]: number } = {};
    estado.jogadores.forEach((jogador) => {
      if (jogador.isBot) {
        novasApostas[jogador.id] = botFazerAposta(jogador, jogador.mao.length);
      } else {
        novasApostas[jogador.id] = apostaJogador;
      }
    });

    setEstado((prev) => ({
      ...prev,
      jogadores: prev.jogadores.map((j) => ({
        ...j,
        aposta: novasApostas[j.id],
      })),
      apostasFeitas: true,
    }));
  };

  const jogarCarta = (jogadorId: string, cartaIndex: number) => {
    const jogador = estado.jogadores.find(j => j.id === jogadorId);
    if (!jogador || jogador.mao.length === 0) return;

    const carta = jogador.mao[cartaIndex];
    const novasJogadas = { ...estado.jogadas, [jogadorId]: carta };
    jogador.mao = jogador.mao.filter((_, i) => i !== cartaIndex);

    // Bots jogam suas cartas
    estado.jogadores.forEach((j) => {
      if (j.isBot && !estado.jogadas[j.id] && j.mao.length > 0) {
        novasJogadas[j.id] = botJogarCarta(j);
        j.mao = j.mao.slice(1);
      }
    });

    const vencedor = determinarVencedorTurno(novasJogadas, estado.manilha!, estado.jogadores);
    if (vencedor) {
      vencedor.vitorias += 1;
    }

    setEstado((prev) => ({
      ...prev,
      jogadas: novasJogadas,
      jogadores: [...prev.jogadores],
      vencedorRodada: vencedor,
    }));
  };

  const avancarRodada = () => {
    const novosJogadores = estado.jogadores.map((j) => ({
      ...j,
      pontos: j.pontos + Math.abs(j.aposta - j.vitorias),
      vitorias: 0,
      aposta: 0,
    }));

    const jogadoresAtivos = novosJogadores.filter((j) => j.pontos < 10);
    if (jogadoresAtivos.length <= 1) {
      alert(jogadoresAtivos[0]?.nome + ' venceu!');
      return;
    }

    let novaRodada = estado.rodada;
    let novaDirecao = estado.direcao;
    if (estado.direcao === 'aumentando' && estado.rodada < estado.maxCartas) {
      novaRodada += 1;
    } else if (estado.direcao === 'aumentando') {
      novaDirecao = 'diminuindo';
      novaRodada -= 1;
    } else if (estado.direcao === 'diminuindo' && estado.rodada > 1) {
      novaRodada -= 1;
    } else {
      novaDirecao = 'aumentando';
      novaRodada += 1;
    }

    setEstado({
      ...estado,
      rodada: novaRodada,
      direcao: novaDirecao,
      jogadores: jogadoresAtivos,
      baralho: embaralhar(criarBaralho()),
      manilha: null,
      jogadas: {},
      vencedorRodada: null,
      modoJogo: 'normal',
      cartasSelecionadas: {},
      apostasFeitas: false,
    });
    setApostaJogador(0);
    setCartaSelecionada(-1);
  };

  return (
    <div className="min-h-screen bg-[#1B4D3E] p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6"
        >
          <h1 className="text-3xl font-bold text-center mb-4 text-white">Filho da Puta</h1>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-lg text-white">Rodada: {estado.rodada}</div>
            {estado.manilha && podeVerManilha(estado.modoJogo!) && (
              <div className="flex items-center gap-2">
                <span className="text-lg text-white">Manilha:</span>
                <CartaComponent carta={estado.manilha} />
              </div>
            )}
          </div>

          {!estado.manilha && !estado.apostasFeitas && (
            <div className="flex justify-center gap-4 mb-6">
              <Button
                onClick={() => selecionarModo('normal')}
                className={`${modoSelecionado === 'normal' ? 'bg-blue-600' : 'bg-gray-400'} text-white`}
              >
                Normal
              </Button>
              <Button
                onClick={() => selecionarModo('testa')}
                className={`${modoSelecionado === 'testa' ? 'bg-blue-600' : 'bg-gray-400'} text-white`}
              >
                Na Testa
              </Button>
              <Button
                onClick={() => selecionarModo('escondida')}
                className={`${modoSelecionado === 'escondida' ? 'bg-blue-600' : 'bg-gray-400'} text-white`}
              >
                Escondida
              </Button>
            </div>
          )}
        </motion.div>

        <div className="mesa-container aspect-square relative mb-6">
          <AnimatePresence>
            {estado.jogadores.map((jogador, index) => (
              <motion.div
                key={jogador.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                className={`jogador-slot`}
              >
                <div className="flex flex-col items-center">
                  <div className="avatar">
                    <span className="text-xl font-bold">{jogador.nome[0]}</span>
                  </div>
                  <div className="placar text-sm mb-2">
                    <div>Pontos: {jogador.pontos}</div>
                    <div>Apostou: {jogador.aposta}</div>
                    <div>Vitórias: {jogador.vitorias}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <AnimatePresence>
                      {jogador.mao.map((carta, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                        >
                          <CartaComponent
                            carta={carta}
                            isCega={!podeVerCarta(jogador.id, i, estado.modoJogo!, jogador.isBot)}
                            onClick={() => !jogador.isBot && setCartaSelecionada(i)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Área central para cartas jogadas */}
          <div className="absolute inset-1/4 rounded-full bg-[#0F2E25]/50 backdrop-blur-sm">
            <AnimatePresence>
              {Object.entries(estado.jogadas).map(([jogadorId, carta], index) => (
                <motion.div
                  key={jogadorId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="carta-jogada"
                >
                  <CartaComponent carta={carta} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-4"
        >
          {!estado.manilha && (
            <Button
              onClick={iniciarRodada}
              className="botao-acao"
            >
              Iniciar Rodada
            </Button>
          )}

          {estado.manilha && !estado.apostasFeitas && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                value={apostaJogador}
                onChange={(e) => setApostaJogador(Number(e.target.value))}
                className="w-20 bg-white/10 text-white"
                placeholder="Aposta"
              />
              <Button
                onClick={fazerAposta}
                className="botao-acao"
              >
                Fazer Aposta
              </Button>
            </div>
          )}

          {estado.apostasFeitas && cartaSelecionada >= 0 && (
            <Button
              onClick={() => jogarCarta(estado.jogadores[0].id, cartaSelecionada)}
              className="botao-acao"
            >
              Jogar Carta
            </Button>
          )}

          {Object.keys(estado.jogadas).length > 0 && (
            <div className="text-center">
              {estado.vencedorRodada && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xl font-bold mb-2 text-white"
                >
                  Vencedor: {estado.vencedorRodada.nome}
                </motion.div>
              )}
              <Button
                onClick={avancarRodada}
                className="botao-acao"
              >
                Avançar Rodada
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
