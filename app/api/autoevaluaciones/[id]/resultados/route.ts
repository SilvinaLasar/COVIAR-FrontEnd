import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

/**
 * GET /api/autoevaluaciones/[id]/resultados
 * Obtiene los resultados detallados de una autoevaluación
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        console.log('Proxy: Obteniendo resultados de autoevaluación', id)

        const cookies = request.headers.get('Cookie')
        const authHeader = request.headers.get('Authorization')

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        if (cookies) {
            headers['Cookie'] = cookies
        }

        if (authHeader) {
            headers['Authorization'] = authHeader
        }

        const response = await fetch(
            `${API_BASE_URL}/api/autoevaluaciones/${id}/resultados`,
            {
                method: 'GET',
                headers,
                credentials: 'include',
            }
        )

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
            console.error('Proxy: Error al obtener resultados:', response.status, data)
            return NextResponse.json(
                { message: data.message || `Error ${response.status}: ${response.statusText}` },
                { status: response.status }
            )
        }

        console.log('Proxy: Resultados obtenidos:', data)
        return NextResponse.json(data, { status: 200 })
    } catch (error) {
        console.error('Proxy: Error de conexión:', error)
        return NextResponse.json(
            { message: 'No se pudo conectar con el servidor backend' },
            { status: 503 }
        )
    }
}
