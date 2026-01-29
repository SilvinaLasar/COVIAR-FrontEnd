"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, Check, Ban, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  obtenerEstructuraAutoevaluacion,
  obtenerSegmentos,
  seleccionarSegmento,
  guardarRespuesta,
  completarAutoevaluacion
} from "@/lib/api/autoevaluacion"
import type { CapituloEstructura, IndicadorEstructura, Segmento } from "@/lib/api/types"
import { Users, Settings } from "lucide-react"

export default function AutoevaluacionPage() {
  const router = useRouter()
  const [assessmentId, setAssessmentId] = useState<string | null>(null)

  // Estado para la estructura de la API
  const [estructura, setEstructura] = useState<CapituloEstructura[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Estado para navegación
  const [currentCapitulo, setCurrentCapitulo] = useState<CapituloEstructura | null>(null)
  const [currentIndicador, setCurrentIndicador] = useState<IndicadorEstructura | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [selectedNivelRespuestaId, setSelectedNivelRespuestaId] = useState<number | null>(null)
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [canFinalize, setCanFinalize] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)

  // Estado para segmentos
  // Estado para segmentos - Empezamos seleccionando segmento por defecto
  const [isSelectingSegment, setIsSelectingSegment] = useState(true)
  const [segmentos, setSegmentos] = useState<Segmento[]>([])
  const [selectedSegment, setSelectedSegment] = useState<Segmento | null>(null)
  const [loadingSegmentos, setLoadingSegmentos] = useState(false)

  // Obtener usuario y ID de autoevaluación
  useEffect(() => {
    const usuarioStr = localStorage.getItem('usuario')

    if (!usuarioStr) {
      router.push("/login")
      return
    }

    try {
      JSON.parse(usuarioStr) // Validates that the user is logged in

      // Obtener el ID de autoevaluación desde localStorage o URL
      const storedAssessmentId = localStorage.getItem('id_autoevaluacion')
      if (storedAssessmentId) {
        setAssessmentId(storedAssessmentId)
      } else {
        // ID de prueba por ahora - TODO: obtener de flujo real
        setAssessmentId("1")
      }
    } catch (error) {
      console.error('Error al obtener usuario:', error)
      router.push("/login")
    }
  }, [router])

  // Cargar segmentos disponibles al iniciar
  useEffect(() => {
    if (!assessmentId) return

    const cargarSegmentosIniciales = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await obtenerSegmentos(assessmentId)
        setSegmentos(data)
        setIsSelectingSegment(true)
      } catch (error) {
        console.error('Error al cargar segmentos iniciales:', error)
        setLoadError(error instanceof Error ? error.message : 'Error al cargar segmentos')
      } finally {
        setIsLoading(false)
        setLoadingSegmentos(false)
      }
    }

    cargarSegmentosIniciales()
  }, [assessmentId])

  // Verificar si se puede finalizar
  useEffect(() => {
    if (estructura.length === 0) return

    // Contar solo indicadores habilitados
    const totalIndicadoresHabilitados = estructura.reduce(
      (acc, cap) => acc + cap.indicadores.filter(ind => ind.habilitado).length,
      0
    )
    const completedIndicators = Object.keys(responses).length
    setCanFinalize(completedIndicators === totalIndicadoresHabilitados && totalIndicadoresHabilitados > 0)
  }, [responses, estructura])

  const handleSelectIndicator = (capitulo: CapituloEstructura, indicador: IndicadorEstructura) => {
    // Solo permitir selección de indicadores habilitados
    if (!indicador.habilitado) return

    setCurrentCapitulo(capitulo)
    setCurrentIndicador(indicador)
    const key = `${capitulo.capitulo.id_capitulo}-${indicador.indicador.id_indicador}`
    setSelectedLevel(responses[key] ?? null)
    setSelectedNivelRespuestaId(null)
  }

  const handleSaveResponse = async () => {
    if (!currentCapitulo || !currentIndicador || selectedLevel === null || selectedNivelRespuestaId === null || !currentIndicador.habilitado || !assessmentId) {
      return
    }

    setIsSaving(true)

    try {
      // Guardar respuesta en el backend
      await guardarRespuesta(
        assessmentId,
        currentIndicador.indicador.id_indicador,
        selectedNivelRespuestaId
      )

      // Guardar respuesta localmente para UI
      const key = `${currentCapitulo.capitulo.id_capitulo}-${currentIndicador.indicador.id_indicador}`
      setResponses(prev => ({
        ...prev,
        [key]: selectedLevel
      }))

      // Avanzar al siguiente indicador habilitado
      avanzarAlSiguienteIndicador()
    } catch (error) {
      console.error('Error al guardar respuesta:', error)
      alert(error instanceof Error ? error.message : 'Error al guardar la respuesta')
    } finally {
      setIsSaving(false)
    }
  }

  const avanzarAlSiguienteIndicador = () => {
    if (!currentCapitulo || !currentIndicador) return

    // Buscar el siguiente indicador habilitado
    const currentCapIndex = estructura.findIndex(c => c.capitulo.id_capitulo === currentCapitulo.capitulo.id_capitulo)
    const currentIndIndex = currentCapitulo.indicadores.findIndex(i => i.indicador.id_indicador === currentIndicador.indicador.id_indicador)

    // Buscar en los indicadores restantes del capítulo actual
    for (let i = currentIndIndex + 1; i < currentCapitulo.indicadores.length; i++) {
      if (currentCapitulo.indicadores[i].habilitado) {
        setCurrentIndicador(currentCapitulo.indicadores[i])
        setSelectedLevel(null)
        setSelectedNivelRespuestaId(null)
        return
      }
    }

    // Buscar en los capítulos siguientes
    for (let c = currentCapIndex + 1; c < estructura.length; c++) {
      for (const ind of estructura[c].indicadores) {
        if (ind.habilitado) {
          setCurrentCapitulo(estructura[c])
          setCurrentIndicador(ind)
          setSelectedLevel(null)
          setSelectedNivelRespuestaId(null)
          return
        }
      }
    }
  }

  const handleFinalizeAssessment = async () => {
    if (!assessmentId) return

    setIsFinalizing(true)

    try {
      await completarAutoevaluacion(assessmentId)
      alert('¡Autoevaluación completada exitosamente!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error al finalizar:', error)
      alert(error instanceof Error ? error.message : 'Error al finalizar la autoevaluación')
    } finally {
      setIsFinalizing(false)
    }
  }

  const handleOpenSegmentSelector = async () => {
    if (!assessmentId) return
    setIsSelectingSegment(true)
    setLoadingSegmentos(true)
    try {
      const data = await obtenerSegmentos(assessmentId)
      setSegmentos(data)
    } catch (error) {
      console.error('Error al cargar segmentos:', error)
      alert('Error al cargar segmentos disponibles')
      setIsSelectingSegment(false)
    } finally {
      setLoadingSegmentos(false)
    }
  }

  const handleSelectSegment = async (segmento: Segmento) => {
    if (!assessmentId) return

    // Si ya tenemos estructura cargada, confirmar cambio. Si no (primera vez), proceder directamente.
    if (estructura.length > 0) {
      if (!confirm(`¿Desea cambiar al segmento "${segmento.nombre}"? Esto recargará la estructura de la evaluación.`)) return
    }

    setIsLoading(true)
    try {
      await seleccionarSegmento(assessmentId, segmento.id_segmento)

      // Actualizar estado del segmento seleccionado
      setSelectedSegment(segmento)

      // Cargar estructura después de seleccionar segmento
      const response = await obtenerEstructuraAutoevaluacion(assessmentId)
      setEstructura(response.capitulos)

      // Inicializar selección
      if (response.capitulos.length > 0) {
        const primerCapitulo = response.capitulos[0]
        setCurrentCapitulo(primerCapitulo)
        const primerIndicador = primerCapitulo.indicadores.find(ind => ind.habilitado) || primerCapitulo.indicadores[0]
        setCurrentIndicador(primerIndicador)
      }

      setIsSelectingSegment(false)
    } catch (error) {
      console.error('Error al procesar segmento:', error)
      alert(error instanceof Error ? error.message : 'Error al procesar el segmento')
    } finally {
      setIsLoading(false)
    }
  }

  // Estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando estructura de autoevaluación...</p>
        </div>
      </div>
    )
  }

  // Estado de error
  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error al cargar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{loadError}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Bypass de chequeo de datos si estamos seleccionando segmento
  if (!isSelectingSegment && (!currentCapitulo || !currentIndicador)) {
    return <div className="p-8">No hay datos disponibles</div>
  }

  const isResponseSaved = (capituloId: number, indicadorId: number) => {
    return `${capituloId}-${indicadorId}` in responses
  }

  // Verificar si es el último indicador habilitado
  const ultimoCapitulo = estructura[estructura.length - 1]
  const ultimosIndicadoresHabilitados = ultimoCapitulo?.indicadores.filter(ind => ind.habilitado) || []
  const ultimoIndicadorHabilitado = ultimosIndicadoresHabilitados[ultimosIndicadoresHabilitados.length - 1]
  const isLastIndicator =
    currentCapitulo?.capitulo.id_capitulo === ultimoCapitulo?.capitulo.id_capitulo &&
    currentIndicador?.indicador.id_indicador === ultimoIndicadorHabilitado?.indicador.id_indicador

  return (
    <div className="flex h-full">
      {/* Left sidebar with chapters and indicators */}
      <div className="w-80 border-r bg-card">
        <div className="p-4 border-b bg-primary flex justify-between items-center">
          <h2 className="font-semibold text-primary-foreground">Autoevaluación</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenSegmentSelector}
            className="text-primary-foreground hover:bg-primary-foreground/20"
            title="Cambiar Segmento"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-4 space-y-4">
            {estructura.map((capitulo) => (
              <div key={capitulo.capitulo.id_capitulo} className="space-y-2">
                <h3 className="font-semibold text-sm">{capitulo.capitulo.nombre}</h3>
                <div className="space-y-1">
                  {capitulo.indicadores.map((indicadorWrapper) => {
                    const isActive =
                      currentCapitulo?.capitulo.id_capitulo === capitulo.capitulo.id_capitulo &&
                      currentIndicador?.indicador.id_indicador === indicadorWrapper.indicador.id_indicador
                    const isSaved = isResponseSaved(capitulo.capitulo.id_capitulo, indicadorWrapper.indicador.id_indicador)
                    const isDisabled = !indicadorWrapper.habilitado

                    return (
                      <button
                        key={indicadorWrapper.indicador.id_indicador}
                        onClick={() => handleSelectIndicator(capitulo, indicadorWrapper)}
                        disabled={isDisabled}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors ${isDisabled
                          ? "opacity-50 cursor-not-allowed bg-muted/20 text-muted-foreground"
                          : isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                          }`}
                      >
                        <span className="flex items-center gap-2">
                          {isDisabled ? (
                            <Ban className="w-4 h-4 text-muted-foreground" />
                          ) : isSaved ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : null}
                          {indicadorWrapper.indicador.nombre}
                        </span>
                        {!isDisabled && <ChevronRight className="w-4 h-4" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right content area */}
      <div className="flex-1 p-8 space-y-6">
        {/* Progress Dashboard */}
        {!isSelectingSegment && estructura.length > 0 && (
          <div className="bg-zinc-900 text-white p-4 rounded-lg shadow-md flex items-center justify-between gap-6">
            <div className="flex gap-8">
              <div>
                <div className="text-xs text-zinc-400 uppercase font-semibold">Categoría</div>
                <div className="font-bold text-lg leading-tight">
                  {selectedSegment?.nombre.split(' ')[0] || "General"}
                </div>
              </div>

              <div className="border-l border-zinc-700 pl-6">
                <div className="text-xs text-zinc-400 uppercase font-semibold">Indicadores a evaluar</div>
                <div className="font-bold text-lg leading-tight">
                  {estructura.reduce((acc, cap) => acc + cap.indicadores.filter(i => i.habilitado).length, 0)}
                </div>
              </div>

              <div className="border-l border-zinc-700 pl-6">
                <div className="text-xs text-zinc-400 uppercase font-semibold">Puntuación máxima</div>
                <div className="font-bold text-lg leading-tight">
                  {estructura.reduce((acc, cap) => acc + cap.indicadores.filter(i => i.habilitado).reduce((sum, ind) => {
                    const maxPuntos = Math.max(...ind.niveles_respuesta.map(n => n.puntos))
                    return sum + (isFinite(maxPuntos) ? maxPuntos : 0)
                  }, 0), 0)} puntos
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-xl">
              <div className="text-xs text-zinc-400 mb-2">Progreso general</div>
              <div className="h-2 w-full bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-yellow-400"
                  style={{ width: `${(Object.keys(responses).length / Math.max(1, estructura.reduce((acc, cap) => acc + cap.indicadores.filter(i => i.habilitado).length, 0))) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-zinc-400 mt-1">
                <span>
                  {Object.keys(responses).length} de {estructura.reduce((acc, cap) => acc + cap.indicadores.filter(i => i.habilitado).length, 0)} evaluados • {Object.values(responses).reduce((a, b) => a + b, 0)} / {estructura.reduce((acc, cap) => acc + cap.indicadores.filter(i => i.habilitado).reduce((sum, ind) => {
                    const maxPuntos = Math.max(...ind.niveles_respuesta.map(n => n.puntos))
                    return sum + (isFinite(maxPuntos) ? maxPuntos : 0)
                  }, 0), 0)} puntos
                </span>
                <span>{Math.round((Object.keys(responses).length / Math.max(1, estructura.reduce((acc, cap) => acc + cap.indicadores.filter(i => i.habilitado).length, 0))) * 100)}%</span>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            {isSelectingSegment ? (
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Seleccionar Segmento de Enoturismo
              </CardTitle>
            ) : (
              <>
                <CardTitle className="text-balance">
                  {currentCapitulo?.capitulo.nombre} - {currentIndicador?.indicador.nombre}
                </CardTitle>
                <CardDescription className="text-balance">
                  {currentIndicador?.indicador.descripcion}
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {isSelectingSegment ? (
              loadingSegmentos ? (
                <div className="text-center p-8">Cargando segmentos...</div>
              ) : (
                <div className="grid gap-4">
                  <div className="bg-blue-50 p-4 rounded-md text-blue-800 text-sm mb-4">
                    Seleccione el segmento que mejor describa su bodega según la cantidad de turistas que recibe anualmente.
                    Esto adaptará los indicadores de la autoevaluación a su realidad.
                  </div>
                  {segmentos.map((seg) => (
                    <Card
                      key={seg?.id_segmento ?? Math.random()}
                      className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-l-primary"
                      onClick={() => handleSelectSegment(seg)}
                    >
                      <CardHeader className="py-4">
                        <CardTitle className="text-lg">{seg?.nombre ?? 'Segmento'}</CardTitle>
                        <CardDescription>
                          {seg?.min_turistas != null && seg?.max_turistas != null
                            ? seg.min_turistas === 0 && seg.max_turistas === 999
                              ? "Menos de 1,000 turistas anuales"
                              : `${seg.min_turistas.toLocaleString()} - ${seg.max_turistas.toLocaleString()} turistas anuales`
                            : 'Información no disponible'}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                  {estructura.length > 0 && (
                    <Button variant="outline" onClick={() => setIsSelectingSegment(false)} className="mt-4">
                      Cancelar
                    </Button>
                  )}
                </div>
              )
            ) : !currentIndicador?.habilitado ? (
              <div className="p-6 bg-muted/30 rounded-lg border border-dashed text-center">
                <Ban className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground font-medium">Indicador no aplicable</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Este indicador no es pertinente para tu segmento.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <RadioGroup
                    value={selectedLevel?.toString()}
                    onValueChange={(v) => {
                      const nivel = currentIndicador?.niveles_respuesta.find(n => n.puntos.toString() === v)
                      if (nivel) {
                        setSelectedLevel(nivel.puntos)
                        setSelectedNivelRespuestaId(nivel.id_nivel_respuesta)
                      }
                    }}
                    className="space-y-4"
                  >
                    {currentIndicador?.niveles_respuesta.map((nivel) => (
                      <div
                        key={nivel.id_nivel_respuesta}
                        onClick={() => {
                          setSelectedLevel(nivel.puntos)
                          setSelectedNivelRespuestaId(nivel.id_nivel_respuesta)
                        }}
                        className={`p-4 border rounded-lg transition-colors cursor-pointer ${selectedLevel === nivel.puntos
                          ? "bg-primary/10 border-primary ring-2 ring-primary"
                          : "bg-muted/30 hover:bg-muted/50 hover:border-primary/50"
                          }`}
                      >
                        <RadioGroupItem
                          value={nivel.puntos.toString()}
                          id={`nivel-${nivel.id_nivel_respuesta}`}
                          className="sr-only"
                        />
                        <Label htmlFor={`nivel-${nivel.id_nivel_respuesta}`} className="cursor-pointer block">
                          <div className="font-semibold mb-2">{nivel.nombre}</div>
                          {nivel.descripcion && (
                            <div className="text-sm text-muted-foreground text-pretty">{nivel.descripcion}</div>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Button
                  onClick={handleSaveResponse}
                  disabled={selectedLevel === null || isSaving}
                  className="w-full"
                >
                  {isSaving ? "Guardando..." : "Guardar y Continuar"}
                </Button>

                {isLastIndicator && canFinalize && (
                  <Button
                    onClick={handleFinalizeAssessment}
                    disabled={isFinalizing}
                    variant="default"
                    size="lg"
                    className="w-full bg-[#81242d] hover:bg-[#6D1A1A]"
                  >
                    {isFinalizing ? "Finalizando..." : "Finalizar Autoevaluación"}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div >
  )
}
