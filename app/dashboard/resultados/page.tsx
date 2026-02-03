"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, TrendingUp, TrendingDown, Minus, BarChart3, Target, Award, History } from "lucide-react"
import { obtenerHistorialAutoevaluaciones, obtenerResultadosAutoevaluacion } from "@/lib/api/autoevaluacion"
import type { AutoevaluacionHistorial, ResultadoDetallado } from "@/lib/api/types"
import { determineSustainabilityLevel, calculateComparison } from "@/lib/utils/scoring"
import { ScoreRadarChart } from "@/components/charts/score-radar-chart"
import { ProgressBarChart } from "@/components/charts/progress-bar-chart"
import { TrendLineChart } from "@/components/charts/trend-line-chart"
import { ChapterProgressCard } from "@/components/results/chapter-progress-card"

export default function ResultadosPage() {
    const router = useRouter()
    const [historial, setHistorial] = useState<AutoevaluacionHistorial[]>([])
    const [ultimaEvaluacion, setUltimaEvaluacion] = useState<ResultadoDetallado | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function cargarResultados() {
            try {
                const usuarioStr = localStorage.getItem('usuario')
                if (!usuarioStr) {
                    setError('No hay usuario autenticado')
                    setIsLoading(false)
                    return
                }

                const usuario = JSON.parse(usuarioStr)
                const idBodega = usuario.bodega?.id

                if (!idBodega) {
                    setError('No se encontró información de la bodega')
                    setIsLoading(false)
                    return
                }

                // Cargar historial
                const historialData = await obtenerHistorialAutoevaluaciones(idBodega)
                setHistorial(historialData)

                // Buscar la última evaluación completada
                const completadas = historialData.filter(a => a.estado === 'completada')
                if (completadas.length > 0) {
                    const ultima = completadas.sort((a, b) =>
                        new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime()
                    )[0]

                    const resultados = await obtenerResultadosAutoevaluacion(ultima.id_autoevaluacion)
                    setUltimaEvaluacion(resultados)
                }
            } catch (err) {
                console.error('Error al cargar resultados:', err)
                setError(err instanceof Error ? err.message : 'Error al cargar los resultados')
            } finally {
                setIsLoading(false)
            }
        }

        cargarResultados()
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando resultados...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="text-destructive bg-destructive/10 p-4 rounded-lg">
                    {error}
                </div>
            </div>
        )
    }

    const completadas = historial.filter(a => a.estado === 'completada')

    if (completadas.length === 0) {
        return (
            <div className="p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Resultados</h1>
                    <p className="text-muted-foreground">Análisis y estadísticas de tus evaluaciones</p>
                </div>

                <Card className="text-center py-12">
                    <CardContent>
                        <BarChart3 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Sin evaluaciones completadas</h3>
                        <p className="text-muted-foreground mb-6">
                            Completa tu primera autoevaluación para ver tus resultados aquí
                        </p>
                        <Button asChild className="bg-[#880D1E] hover:bg-[#6a0a17]">
                            <Link href="/dashboard/autoevaluacion">
                                Comenzar Autoevaluación
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const ultima = ultimaEvaluacion?.autoevaluacion
    const nivel = ultima?.porcentaje !== null && ultima?.porcentaje !== undefined
        ? determineSustainabilityLevel(ultima.porcentaje)
        : null

    // Calcular comparación si hay más de una evaluación
    let comparacion = null
    if (completadas.length >= 2 && ultima) {
        const anterior = completadas.sort((a, b) =>
            new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime()
        )[1]

        if (anterior && ultima.puntaje_final !== null && anterior.puntaje_final !== null) {
            comparacion = calculateComparison(
                ultima.puntaje_final,
                anterior.puntaje_final,
                ultima.puntaje_maximo || 100,
                anterior.puntaje_maximo || 100
            )
        }
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Resultados</h1>
                    <p className="text-muted-foreground">Análisis y estadísticas de tus evaluaciones de sostenibilidad</p>
                </div>
                <Button variant="outline" onClick={() => router.push('/dashboard/historial')}>
                    <History className="h-4 w-4 mr-2" />
                    Ver Historial
                </Button>
            </div>

            {/* Resumen Principal */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-[#880D1E]/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Puntaje Total
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-[#880D1E]">
                            {ultima?.puntaje_final ?? '-'}
                            <span className="text-lg text-muted-foreground font-normal">
                                {' '}/ {ultima?.puntaje_maximo ?? '?'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-[#880D1E]/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Porcentaje
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold" style={{ color: nivel?.color }}>
                            {ultima?.porcentaje ?? '-'}%
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-[#880D1E]/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Nivel de Sostenibilidad
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Badge
                            className="text-lg px-3 py-1"
                            style={{ backgroundColor: `${nivel?.color}20`, color: nivel?.color }}
                        >
                            {nivel?.nombre ?? 'Sin evaluar'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className="border-[#880D1E]/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            {comparacion?.mejora ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : comparacion?.diferenciaPorcentaje === 0 ? (
                                <Minus className="h-4 w-4" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            vs. Evaluación Anterior
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {comparacion ? (
                            <div className={`text-3xl font-bold ${comparacion.mejora ? 'text-green-500' : comparacion.diferenciaPorcentaje === 0 ? '' : 'text-red-500'}`}>
                                {comparacion.diferenciaPorcentaje > 0 ? '+' : ''}{comparacion.diferenciaPorcentaje}%
                            </div>
                        ) : (
                            <div className="text-muted-foreground">Primera evaluación</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Gráficos */}
            <Tabs defaultValue="radar" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="radar">Vista Radar</TabsTrigger>
                    <TabsTrigger value="barras">Vista Barras</TabsTrigger>
                    <TabsTrigger value="tendencia">Tendencia Histórica</TabsTrigger>
                </TabsList>

                <TabsContent value="radar">
                    <Card>
                        <CardHeader>
                            <CardTitle>Desempeño por Capítulo</CardTitle>
                            <CardDescription>Vista comparativa de todas las dimensiones evaluadas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {ultimaEvaluacion?.capitulos && (
                                <ScoreRadarChart data={ultimaEvaluacion.capitulos} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="barras">
                    <Card>
                        <CardHeader>
                            <CardTitle>Progreso por Capítulo</CardTitle>
                            <CardDescription>Porcentaje de cumplimiento en cada dimensión</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {ultimaEvaluacion?.capitulos && (
                                <ProgressBarChart data={ultimaEvaluacion.capitulos} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tendencia">
                    <Card>
                        <CardHeader>
                            <CardTitle>Evolución Histórica</CardTitle>
                            <CardDescription>Progreso de tus evaluaciones a lo largo del tiempo</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TrendLineChart data={historial} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Detalle por Capítulos */}
            <div>
                <h2 className="text-xl font-bold mb-4">Detalle por Capítulo</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {ultimaEvaluacion?.capitulos?.map(capitulo => (
                        <ChapterProgressCard key={capitulo.id_capitulo} capitulo={capitulo} />
                    ))}
                </div>
            </div>
        </div>
    )
}
