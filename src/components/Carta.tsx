'use client';

import { Carta } from '../types/game';
import { motion } from 'framer-motion';

interface CartaProps {
  carta: Carta;
  isCega?: boolean;
  onClick?: () => void;
}

export default function CartaComponent({ carta, isCega, onClick }: CartaProps) {
  const getCardColor = (naipe: string) => {
    return naipe === 'Copas' || naipe === 'Ouros' ? 'text-red-600' : 'text-black';
  };

  const getNaipeSymbol = (naipe: string) => {
    switch (naipe) {
      case 'Copas': return '♥';
      case 'Ouros': return '♦';
      case 'Paus': return '♣';
      case 'Espadas': return '♠';
      default: return '';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block m-1"
      onClick={onClick}
    >
      <div
        className={`w-24 h-36 flex flex-col items-center justify-between p-2 rounded-xl
          ${isCega 
            ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white cursor-not-allowed'
            : 'bg-white cursor-pointer hover:shadow-xl'
          }
          shadow-lg border-2 border-white/20 transition-all duration-300`}
      >
        {isCega ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl font-bold">?</div>
          </div>
        ) : (
          <>
            <div className={`self-start text-lg font-bold ${getCardColor(carta.naipe)}`}>
              {carta.valor}
            </div>
            <div className={`text-4xl ${getCardColor(carta.naipe)}`}>
              {getNaipeSymbol(carta.naipe)}
            </div>
            <div className={`self-end text-lg font-bold rotate-180 ${getCardColor(carta.naipe)}`}>
              {carta.valor}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
