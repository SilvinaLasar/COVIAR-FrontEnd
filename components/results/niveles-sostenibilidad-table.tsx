"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RANGOS_POR_SEGMENTO, type SegmentoTipo } from "@/lib/utils/scoring"

interface NivelesSostenibilidadTableProps {
    segmentoActual?: SegmentoTipo
    puntajeActual?: number
}

export function NivelesSostenibilidadTable({
    segmentoActual,
    puntajeActual
}: NivelesSostenibilidadTableProps) {
    const segmentos: { key: SegmentoTipo; nombre: string }[] = [
        { key: 'micro_bodega', nombre: 'Micro Bodega Turística/Artesanal' },
        { key: 'pequena_bodega', nombre: 'Pequeña Bodega Turística' },
        { key: 'mediana_bodega', nombre: 'Mediana Bodega Turística' },
        { key: 'bodega', nombre: 'Bodega Turística' },
        { key: 'gran_bodega', nombre: 'Gran Bodega Turística' }
    ]

    // Determinar el nivel actual del puntaje para el segmento
    const getNivelActual = (segmento: SegmentoTipo): 'minimo' | 'medio' | 'alto' | null => {
        if (segmento !== segmentoActual || puntajeActual === undefined) return null
        const rangos = RANGOS_POR_SEGMENTO[segmento]
        if (puntajeActual >= rangos.alto.min) return 'alto'
        if (puntajeActual >= rangos.medio.min) return 'medio'
        if (puntajeActual >= rangos.minimo.min) return 'minimo'
        return null
    }

    return (
        <Card className="overflow-hidden border-2 border-gray-200 shadow-lg rounded-xl">
            <CardHeader className="bg-[#880D1E] border-b border-[#6a0a17] py-5">
                <CardTitle className="text-center text-2xl font-bold text-white tracking-wide">
                    Niveles de Sostenibilidad
                </CardTitle>
                <p className="text-center text-white/70 text-sm mt-1">
                    Guía de referencia de puntuación según segmento
                </p>
            </CardHeader>
            <CardContent className="p-0">
                {/* Badges de niveles */}
                <div className="flex justify-center gap-4 py-5 bg-gray-50/50 border-b border-gray-100">
                    <Badge
                        className="px-5 py-2.5 text-sm font-semibold text-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                        style={{ backgroundColor: '#84CC16' }}
                    >
                        NIVEL MÍNIMO DE SOSTENIBILIDAD
                    </Badge>
                    <Badge
                        className="px-5 py-2.5 text-sm font-semibold text-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                        style={{ backgroundColor: '#22C55E' }}
                    >
                        NIVEL MEDIO DE SOSTENIBILIDAD
                    </Badge>
                    <Badge
                        className="px-5 py-2.5 text-sm font-semibold text-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                        style={{ backgroundColor: '#15803D' }}
                    >
                        NIVEL ALTO DE SOSTENIBILIDAD
                    </Badge>
                </div>

                {/* Tabla de rangos con Mínimo/Máximo */}
                <div className="overflow-x-auto border border-gray-300 rounded-lg">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            {/* Primera fila: headers de nivel */}
                            <tr className="border-b border-gray-200">
                                <th className="px-5 py-3.5 text-left font-bold text-gray-700 bg-gray-50" rowSpan={2}>
                                    SEGMENTO
                                </th>
                                <th
                                    className="px-4 py-2.5 text-center font-semibold border-l text-white"
                                    colSpan={2}
                                    style={{ backgroundColor: '#84CC16' }}
                                >
                                    Nivel mínimo de Sostenibilidad
                                </th>
                                <th
                                    className="px-4 py-2.5 text-center font-semibold border-l text-white"
                                    colSpan={2}
                                    style={{ backgroundColor: '#22C55E' }}
                                >
                                    Nivel medio de sostenibilidad
                                </th>
                                <th
                                    className="px-4 py-2.5 text-center font-semibold border-l text-white"
                                    colSpan={2}
                                    style={{ backgroundColor: '#15803D' }}
                                >
                                    Nivel alto de sostenibilidad
                                </th>
                            </tr>
                            {/* Segunda fila: Mínimo/Máximo */}
                            <tr className="border-b border-gray-200 text-xs uppercase tracking-wider">
                                <th className="px-3 py-2.5 text-center border-l text-white/90" style={{ backgroundColor: '#84CC16CC' }}>Mínimo</th>
                                <th className="px-3 py-2.5 text-center text-white/90" style={{ backgroundColor: '#84CC16CC' }}>Máximo</th>
                                <th className="px-3 py-2.5 text-center border-l text-white/90" style={{ backgroundColor: '#22C55ECC' }}>Mínimo</th>
                                <th className="px-3 py-2.5 text-center text-white/90" style={{ backgroundColor: '#22C55ECC' }}>Máximo</th>
                                <th className="px-3 py-2.5 text-center border-l text-white/90" style={{ backgroundColor: '#15803DCC' }}>Mínimo</th>
                                <th className="px-3 py-2.5 text-center text-white/90" style={{ backgroundColor: '#15803DCC' }}>Máximo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {segmentos.map(({ key, nombre }, index) => {
                                const rangos = RANGOS_POR_SEGMENTO[key]
                                const isCurrentSegment = key === segmentoActual
                                const nivelActual = getNivelActual(key)

                                return (
                                    <tr
                                        key={key}
                                        className={`border-b border-gray-100 hover:bg-gray-50/80 transition-colors ${isCurrentSegment ? 'bg-[#880D1E]/5 ring-1 ring-inset ring-[#880D1E]/20' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                            }`}
                                    >
                                        <td className="px-5 py-3.5 font-medium italic text-[#880D1E]">
                                            {nombre}
                                            {isCurrentSegment && (
                                                <Badge className="ml-2 text-xs bg-[#880D1E] text-white hover:bg-[#6a0a17]">
                                                    Tu segmento
                                                </Badge>
                                            )}
                                        </td>
                                        {/* Nivel Mínimo - #84CC16 */}
                                        <td
                                            className={`px-3 py-3.5 text-center border-l font-medium ${nivelActual === 'minimo' ? 'font-bold' : ''}`}
                                            style={{ backgroundColor: nivelActual === 'minimo' ? '#84CC1650' : '#84CC1625', borderColor: '#84CC1660', color: '#3f6212' }}
                                        >
                                            {rangos.minimo.min}
                                        </td>
                                        <td
                                            className={`px-3 py-3.5 text-center font-medium ${nivelActual === 'minimo' ? 'font-bold' : ''}`}
                                            style={{ backgroundColor: nivelActual === 'minimo' ? '#84CC1650' : '#84CC1625', color: '#3f6212' }}
                                        >
                                            {rangos.minimo.max}
                                        </td>
                                        {/* Nivel Medio - #22C55E */}
                                        <td
                                            className={`px-3 py-3.5 text-center border-l font-medium ${nivelActual === 'medio' ? 'font-bold' : ''}`}
                                            style={{ backgroundColor: nivelActual === 'medio' ? '#22C55E50' : '#22C55E25', borderColor: '#22C55E60', color: '#14532d' }}
                                        >
                                            {rangos.medio.min}
                                        </td>
                                        <td
                                            className={`px-3 py-3.5 text-center font-medium ${nivelActual === 'medio' ? 'font-bold' : ''}`}
                                            style={{ backgroundColor: nivelActual === 'medio' ? '#22C55E50' : '#22C55E25', color: '#14532d' }}
                                        >
                                            {rangos.medio.max}
                                        </td>
                                        {/* Nivel Alto - #15803D */}
                                        <td
                                            className={`px-3 py-3.5 text-center border-l font-medium ${nivelActual === 'alto' ? 'font-bold' : ''}`}
                                            style={{ backgroundColor: nivelActual === 'alto' ? '#15803D50' : '#15803D25', borderColor: '#15803D60', color: '#052e16' }}
                                        >
                                            {rangos.alto.min}
                                        </td>
                                        <td
                                            className={`px-3 py-3.5 text-center font-medium ${nivelActual === 'alto' ? 'font-bold' : ''}`}
                                            style={{ backgroundColor: nivelActual === 'alto' ? '#15803D50' : '#15803D25', color: '#052e16' }}
                                        >
                                            {rangos.alto.max}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
