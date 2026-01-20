import type { CheapestQuoteDTO } from './CheapestQuoteDTO.js';
import type { CategoryDTO } from './CategoryDTO.js';
import type { InspectionDTO } from './InspectionDTO.js';

export type ObraComMenorPrecoDTO = {
  workId: string;
  workName: string;
  cheapestQuote: CheapestQuoteDTO;
  categories: CategoryDTO[];
  inspections: InspectionDTO[];
};

