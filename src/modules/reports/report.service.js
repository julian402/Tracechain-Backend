import { Parser } from 'json2csv'
import PDFDocument from 'pdfkit'
import prisma from '../../config/db.js'

const getLotData = () => {
  return prisma.lot.findMany({
    include: {
      createdBy: { select: { name: true, email: true } },
      movements: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

const getMovementData = () => {
  return prisma.movement.findMany({
    include: {
      lot: { select: { code: true, name: true } },
      createdBy: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const exportLotsCSV = async () => {
  const lots = await getLotData()

  const data = lots.map(lot => ({
    codigo: lot.code,
    nombre: lot.name,
    cantidad: lot.quantity,
    unidad: lot.unit,
    estado: lot.status,
    fechaProduccion: lot.productionDate.toISOString().split('T')[0],
    fechaVencimiento: lot.expirationDate.toISOString().split('T')[0],
    registroSanitario: lot.sanitaryRecord ?? '',
    temperatura: lot.storageTemp ?? '',
    humedad: lot.storageHumidity ?? '',
    creadoPor: lot.createdBy.name,
    creadoEn: lot.createdAt.toISOString().split('T')[0]
  }))

  const parser = new Parser()
  return parser.parse(data)
}

export const exportMovementsCSV = async () => {
  const movements = await getMovementData()

  const data = movements.map(m => ({
    lote: m.lot.code,
    producto: m.lot.name,
    tipo: m.type,
    descripcion: m.description,
    cantidad: m.quantity ?? '',
    origen: m.fromLocation ?? '',
    destino: m.toLocation ?? '',
    registradoPor: m.createdBy.name,
    fecha: m.createdAt.toISOString().split('T')[0]
  }))

  const parser = new Parser()
  return parser.parse(data)
}

export const exportLotsPDF = async () => {
  const lots = await getLotData()

  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40 })
    const buffers = []

    doc.on('data', chunk => buffers.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(buffers)))

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text('TraceChain — Reporte de Lotes', { align: 'center' })
    doc.fontSize(10).font('Helvetica').text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, { align: 'center' })
    doc.moveDown()

    // Stats
    const active = lots.filter(l => l.status === 'ACTIVE').length
    const expired = lots.filter(l => l.status === 'EXPIRED').length
    const quarantine = lots.filter(l => l.status === 'QUARANTINE').length

    doc.fontSize(11).font('Helvetica-Bold').text('Resumen general')
    doc.font('Helvetica').fontSize(10)
    doc.text(`Total de lotes: ${lots.length}`)
    doc.text(`Activos: ${active}`)
    doc.text(`Vencidos: ${expired}`)
    doc.text(`En cuarentena: ${quarantine}`)
    doc.moveDown()

    // Table header
    doc.fontSize(11).font('Helvetica-Bold').text('Detalle de lotes')
    doc.moveDown(0.5)

    lots.forEach((lot, i) => {
      if (doc.y > 700) doc.addPage()

      doc.font('Helvetica-Bold').fontSize(10).text(`${i + 1}. ${lot.code} — ${lot.name}`)
      doc.font('Helvetica').fontSize(9)
      doc.text(`   Estado: ${lot.status} | Cantidad: ${lot.quantity} ${lot.unit}`)
      doc.text(`   Producción: ${lot.productionDate.toISOString().split('T')[0]} | Vencimiento: ${lot.expirationDate.toISOString().split('T')[0]}`)
      doc.text(`   Registro sanitario: ${lot.sanitaryRecord ?? 'N/A'} | Temp: ${lot.storageTemp ?? 'N/A'}°C | Humedad: ${lot.storageHumidity ?? 'N/A'}%`)
      doc.text(`   Registrado por: ${lot.createdBy.name}`)
      doc.text(`   Movimientos: ${lot.movements.length}`)
      doc.moveDown(0.5)
    })

    doc.end()
  })
}