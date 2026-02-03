import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

/**
 * GET /api/autoevaluaciones/historial
 * Obtiene el historial de autoevaluaciones de una bodega
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const idBodega = searchParams.get('id_bodega')

        if (!idBodega) {
            return NextResponse.json(
                { message: 'id_bodega es requerido' },
                { status: 400 }
            )
        }

        console.log('Proxy: Obteniendo historial para bodega', idBodega)

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
            `${API_BASE_URL}/api/autoevaluaciones/historial?id_bodega=${idBodega}`,
            {
                method: 'GET',
                headers,
                credentials: 'include',
            }
        )

        const data = await response.json().catch(() => [])

        if (!response.ok) {
            console.error('Proxy: Error al obtener historial:', response.status, data)
            return NextResponse.json(
                { message: data.message || `Error ${response.status}: ${response.statusText}` },
                { status: response.status }
            )
        }

        console.log('Proxy: Historial obtenido:', data)
        return NextResponse.json(data, { status: 200 })
    } catch (error) {
        console.error('Proxy: Error de conexión:', error)
        return NextResponse.json(
            { message: 'No se pudo conectar con el servidor backend' },
            { status: 503 }
        )
    }
}
