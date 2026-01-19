import type { MenorPrecoInsumoDTO } from './MenorPrecoInsumoDTO.js';

export type ObraComMenorPrecoDTO = {
  workId: string;
  workName: string;
  cheapestQuotes: MenorPrecoInsumoDTO[];
};

