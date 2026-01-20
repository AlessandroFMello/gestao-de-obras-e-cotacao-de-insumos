import { CotacaoReadRepository } from '../../interface-adapters/gateways/CotacaoReadRepository.js';
import { CotacaoWriteRepository } from '../../interface-adapters/gateways/CotacaoWriteRepository.js';
import { WorkReadRepository } from '../../interface-adapters/gateways/WorkReadRepository.js';
import { SupplyRepository } from '../../interface-adapters/gateways/SupplyRepository.js';
import { SupplierRepository } from '../../interface-adapters/gateways/SupplierRepository.js';
import type { ICotacaoReadRepository } from '../../application/ports/queries/ICotacaoReadRepository.js';
import type { ICotacaoWriteRepository } from '../../application/ports/repositories/ICotacaoWriteRepository.js';
import type { IWorkReadRepository } from '../../application/ports/queries/IWorkReadRepository.js';
import type { ISupplyRepository } from '../../application/ports/repositories/ISupplyRepository.js';
import type { ISupplierRepository } from '../../application/ports/repositories/ISupplierRepository.js';

/**
 * Factory for read repositories
 */
export function makeCotacaoReadRepository(): ICotacaoReadRepository {
  return new CotacaoReadRepository();
}

export function makeWorkReadRepository(): IWorkReadRepository {
  return new WorkReadRepository();
}

/**
 * Factory for write repositories
 */
export function makeCotacaoWriteRepository(): ICotacaoWriteRepository {
  return new CotacaoWriteRepository();
}

export function makeSupplyRepository(): ISupplyRepository {
  return new SupplyRepository();
}

export function makeSupplierRepository(): ISupplierRepository {
  return new SupplierRepository();
}

