import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/modules/lots/lot.repository.js', () => ({
  createLot: vi.fn(),
  findLotById: vi.fn(),
  findAllLots: vi.fn(),
  findLotByQrCode: vi.fn(),
  updateLotStatus: vi.fn(),
  findLotAncestors: vi.fn(),
  findLotDescendants: vi.fn()
}))

vi.mock('../../src/shared/audit.helper.js', () => ({
  logAction: vi.fn()
}))

vi.mock('uuid', () => ({ v4: () => 'mock-uuid' }))

import {
  createLotService,
  getAllLots,
  getLotById,
  changeLotStatus
} from '../../src/modules/lots/lot.service.js'

import {
  createLot,
  findLotById,
  findAllLots,
  updateLotStatus
} from '../../src/modules/lots/lot.repository.js'

const mockLot = {
  id: 'lot-123',
  code: 'LOT-001',
  qrCode: 'mock-uuid',
  name: 'Lote Test',
  quantity: 100,
  unit: 'kg',
  status: 'ACTIVE',
  productionDate: new Date(),
  expirationDate: new Date(),
  createdById: 'user-123',
  parentLotId: null
}

describe('lot.service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('createLotService', () => {
    it('debe crear un lote correctamente', async () => {
      createLot.mockResolvedValue(mockLot)

      const result = await createLotService({
        name: 'Lote Test',
        quantity: 100,
        unit: 'kg',
        productionDate: new Date(),
        expirationDate: new Date()
      }, 'user-123')

      expect(result).toHaveProperty('id')
      expect(result.name).toBe('Lote Test')
      expect(createLot).toHaveBeenCalledOnce()
    })

    it('debe lanzar error si el lote padre no existe', async () => {
      findLotById.mockResolvedValue(null)

      await expect(
        createLotService({
          name: 'Lote hijo',
          quantity: 50,
          unit: 'kg',
          productionDate: new Date(),
          expirationDate: new Date(),
          parentLotId: 'padre-inexistente'
        }, 'user-123')
      ).rejects.toThrow('Lote padre no encontrado')
    })
  })

  describe('getLotById', () => {
    it('debe retornar el lote si existe', async () => {
      findLotById.mockResolvedValue(mockLot)
      const result = await getLotById('lot-123')
      expect(result.id).toBe('lot-123')
    })

    it('debe lanzar error si el lote no existe', async () => {
      findLotById.mockResolvedValue(null)
      await expect(getLotById('no-existe')).rejects.toThrow('Lote no encontrado')
    })
  })

  describe('changeLotStatus', () => {
    it('debe cambiar el estado del lote', async () => {
      findLotById.mockResolvedValue(mockLot)
      updateLotStatus.mockResolvedValue({ ...mockLot, status: 'EXPIRED' })

      const result = await changeLotStatus('lot-123', 'EXPIRED')
      expect(result.status).toBe('EXPIRED')
    })
  })
})