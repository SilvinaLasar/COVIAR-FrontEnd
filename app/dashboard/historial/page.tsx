"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, FileBarChart, AlertCircle } from "lucide-react"
import { obtenerHistorialAutoevaluaciones } from "@/lib/api/autoevaluacion"
import type { AutoevaluacionHistorial } from "@/lib/api/types"
import { NIVELES_SOSTENIBILIDAD, determineSustainabilityLevel } from "@/lib/utils/scoring"

export default function HistorialPage() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<AutoevaluacionHistorial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargarHistorial() {
      try {
        // Obtener id_bodega del usuario en localStorage
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

        const data = await obtenerHistorialAutoevaluaciones(idBodega)
        setAssessments(data)
      } catch (err) {
        console.error('Error al cargar historial:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar el historial')
      } finally {
        setIsLoading(false)
      }
    }

    cargarHistorial()
  }, [])

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'completada':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Completada</Badge>
      case 'pendiente':
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">En Progreso</Badge>
      case 'cancelada':
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Cancelada</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const getNivelBadge = (porcentaje: number | null) => {
    if (porcentaje === null) return null
    const nivel = determineSustainabilityLevel(porcentaje)
    return (
      <Badge
        style={{ backgroundColor: `${nivel.color}20`, color: nivel.color }}
        className="font-medium"
      >
        {nivel.nombre}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando historial...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-4 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Historial de Evaluaciones</h1>
        <p className="text-muted-foreground">Visualiza y analiza tus evaluaciones anteriores</p>
      </div>

      <Card className="border-[#880D1E]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5 text-[#880D1E]" />
            Evaluaciones Realizadas
          </CardTitle>
          <CardDescription>Lista de todas tus autoevaluaciones de sostenibilidad</CardDescription>
        </CardHeader>
        <CardContent>
          {!assessments || assessments.length === 0 ? (
            <div className="text-center py-12">
              <FileBarChart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No tienes evaluaciones registradas todavía
              </p>
              <Button asChild>
                <Link href="/dashboard/autoevaluacion">
                  Comenzar Primera Evaluación
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Puntaje</TableHead>
                  <TableHead>Porcentaje</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((assessment) => (
                  <TableRow key={assessment.id_autoevaluacion}>
                    <TableCell className="font-medium">
                      {new Date(assessment.fecha_inicio).toLocaleDateString("es-AR", {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      {getEstadoBadge(assessment.estado)}
                    </TableCell>
                    <TableCell>
                      {assessment.puntaje_final !== null
                        ? `${assessment.puntaje_final} / ${assessment.puntaje_maximo || '?'}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {assessment.porcentaje !== null
                        ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div
                                className="bg-[#880D1E] h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(assessment.porcentaje, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{assessment.porcentaje}%</span>
                          </div>
                        )
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {getNivelBadge(assessment.porcentaje)}
                    </TableCell>
                    <TableCell className="text-right">
                      {assessment.estado === 'completada' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/resultados/${assessment.id_autoevaluacion}`)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Ver Resultados
                        </Button>
                      )}
                      {assessment.estado === 'pendiente' && (
                        <Button
                          size="sm"
                          onClick={() => router.push('/dashboard/autoevaluacion')}
                          className="gap-2 bg-[#880D1E] hover:bg-[#6a0a17]"
                        >
                          Continuar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
