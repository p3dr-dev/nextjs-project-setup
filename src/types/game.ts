export type Naipe = 'Paus' | 'Copas' | 'Espadas' | 'Ouros';
export type Valor = '3' | '2' | 'A' | 'K' | 'J' | 'Q' | '7' | '6' | '5' | '4';

export interface Carta {
  naipe: Naipe;
  valor: Valor;
}

export interface Jogador {
  id: string;
  nome: string;
  pontos: number;
  mao: Carta[];
  vitorias: number;
  aposta: number;
  isBot: boolean;
}

export type ModoJogo = 'normal' | 'testa' | 'escondida';

export interface EstadoJogo {
  baralho: Carta[];
  manilha: Carta | null;
  rodada: number;
  maxCartas: number;
  direcao: 'aumentando' | 'diminuindo';
  jogadores: Jogador[];
  jogadas: { [jogadorId: string]: Carta };
  vencedorRodada: Jogador | null;
  modoJogo?: ModoJogo;
  cartasSelecionadas?: { [jogadorId: string]: boolean[] };
  apostasFeitas?: boolean;
}
