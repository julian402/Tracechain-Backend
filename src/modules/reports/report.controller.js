import { exportLotsCSV, exportMovementsCSV, exportLotsPDF } from './report.service.js'

export const exportLotsCSVController = async (req, res, next) => {
  try {
    const csv = await exportLotsCSV()
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=lotes.csv')
    res.send(csv)
  } catch (error) {
    next(error)
  }
}

export const exportMovementsCSVController = async (req, res, next) => {
  try {
    const csv = await exportMovementsCSV()
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=movimientos.csv')
    res.send(csv)
  } catch (error) {
    next(error)
  }
}

export const exportLotsPDFController = async (req, res, next) => {
  try {
    const pdf = await exportLotsPDF()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-lotes.pdf')
    res.send(pdf)
  } catch (error) {
    next(error)
  }
}