import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get latest assessment
  const { data: assessments } = await supabase
    .from("assessments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)

  const latestAssessment = assessments?.[0]

  let responsesCount = 0
  if (latestAssessment?.id) {
    const { count } = await supabase
      .from("assessment_responses")
      .select("*", { count: "exact", head: true })
      .eq("assessment_id", latestAssessment.id)

    responsesCount = count || 0
    console.log("[v0] Assessment ID:", latestAssessment.id)
    console.log("[v0] Responses count:", responsesCount)
  }

  // Calculate progress (total indicators = 59)
  const totalIndicators = 59
  const progress = responsesCount ? Math.round((responsesCount / totalIndicators) * 100) : 0

  let totalScore = 0
  if (latestAssessment?.id) {
    const { data: responses } = await supabase
      .from("assessment_responses")
      .select("selected_level")
      .eq("assessment_id", latestAssessment.id)

    totalScore = responses?.reduce((acc, r) => acc + r.selected_level, 0) || 0
    console.log("[v0] Total score:", totalScore)
  }

  const maxPossibleScore = responsesCount ? responsesCount * 3 : 1
  const sustainabilityLevel = Math.round((totalScore / maxPossibleScore) * 100)

  let sustainabilityCategory = "No evaluado"
  let sustainabilityCategoryColor = "#94a3b8"
  if (totalScore >= 42 && totalScore <= 93) {
    sustainabilityCategory = "Nivel mínimo"
    sustainabilityCategoryColor = "#B89B5E" // Dorado opaco
  } else if (totalScore >= 94 && totalScore <= 112) {
    sustainabilityCategory = "Nivel medio"
    sustainabilityCategoryColor = "#2F4F3E" // Verde oscuro
  } else if (totalScore >= 113 && totalScore <= 126) {
    sustainabilityCategory = "Nivel alto"
    sustainabilityCategoryColor = "#6D1A1A" // Bordó profundo
  }

  const progressData = [
    { name: "Completado", value: progress, fill: "#6D1A1A" }, // Bordó profundo
    { name: "Pendiente", value: 100 - progress, fill: "#FAF7F2" }, // Marfil
  ]

  const sustainabilityData = [
    { name: sustainabilityCategory, value: totalScore, fill: sustainabilityCategoryColor },
    { name: "Puntaje máximo", value: 126 - totalScore, fill: "#FAF7F2" }, // Marfil
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-balance">
          Bienvenido, {profile?.nombre_fantasia || profile?.razon_social}
        </h1>
        <p className="text-muted-foreground">Panel de control de sostenibilidad enoturística</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Progreso de Autoevaluación</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                completado: {
                  label: "Completado",
                  color: "#6D1A1A",
                },
                pendiente: {
                  label: "Pendiente",
                  color: "#FAF7F2",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progressData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {progressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 text-center">
              <p className="text-2xl font-bold">
                {responsesCount || 0}/{totalIndicators}
              </p>
              <p className="text-sm text-muted-foreground">Indicadores completados</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nivel de Sostenibilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                categoria: {
                  label: sustainabilityCategory,
                  color: sustainabilityCategoryColor,
                },
                maximo: {
                  label: "Puntaje máximo",
                  color: "#FAF7F2",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sustainabilityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value} pts`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sustainabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 text-center">
              <p className="text-2xl font-bold" style={{ color: sustainabilityCategoryColor }}>
                {sustainabilityCategory}
              </p>
              <p className="text-sm text-muted-foreground">Puntaje: {totalScore} de 126 puntos posibles</p>
              {totalScore >= 42 && (
                <div className="mt-2 p-3 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground">
                    {totalScore >= 113
                      ? "¡Excelente! Su bodega alcanzó el nivel alto de sostenibilidad."
                      : totalScore >= 94
                        ? "¡Muy bien! Su bodega alcanzó el nivel medio de sostenibilidad."
                        : "Su bodega alcanzó el nivel mínimo de sostenibilidad. Hay oportunidades de mejora."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Bodega</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Razón Social</p>
            <p className="font-medium">{profile?.razon_social}</p>
          </div>
          {profile?.nombre_fantasia && (
            <div>
              <p className="text-sm text-muted-foreground">Nombre de Fantasía</p>
              <p className="font-medium">{profile.nombre_fantasia}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Provincia</p>
            <p className="font-medium">{profile?.provincia}</p>
          </div>
          {profile?.departamento && (
            <div>
              <p className="text-sm text-muted-foreground">Departamento</p>
              <p className="font-medium">{profile.departamento}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
