import { render, screen, waitFor } from '@testing-library/react'
import { DashboardSection } from '@/components/sections/DashboardSection'

describe('DashboardSection', () => {
  it('shows loading state initially', () => {
    render(<DashboardSection />)
    
    // Check for loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders dashboard content after loading', async () => {
    render(<DashboardSection />)
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    }, { timeout: 1000 })

    expect(screen.getByText('Resumen de tu progreso de aprendizaje')).toBeInTheDocument()
  })

  it('displays correct statistics', async () => {
    render(<DashboardSection />)
    
    await waitFor(() => {
      expect(screen.getByText('1249')).toBeInTheDocument() // Total Flashcards
      expect(screen.getByText('74')).toBeInTheDocument() // Estudiadas hoy
      expect(screen.getByText('92%')).toBeInTheDocument() // Precisión
      expect(screen.getByText('15 días')).toBeInTheDocument() // Racha
      expect(screen.getByText('2m')).toBeInTheDocument() // Tiempo de estudio
      expect(screen.getByText('65%')).toBeInTheDocument() // Progreso total
    })
  })

  it('displays statistic labels correctly', async () => {
    render(<DashboardSection />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Flashcards')).toBeInTheDocument()
      expect(screen.getByText('Estudiadas hoy')).toBeInTheDocument()
      expect(screen.getByText('Precisión')).toBeInTheDocument()
      expect(screen.getByText('Racha de estudio')).toBeInTheDocument()
      expect(screen.getByText('Tiempo de estudio')).toBeInTheDocument()
      expect(screen.getByText('Progreso total')).toBeInTheDocument()
    })
  })

  it('shows progress indicators', async () => {
    render(<DashboardSection />)
    
    await waitFor(() => {
      expect(screen.getByText('+12 esta semana')).toBeInTheDocument()
      expect(screen.getByText('Meta: 20')).toBeInTheDocument()
      expect(screen.getByText('+5% vs ayer')).toBeInTheDocument()
      expect(screen.getByText('¡Sigue así!')).toBeInTheDocument()
      expect(screen.getByText('hoy')).toBeInTheDocument()
    })
  })

  it('renders activity chart placeholder', async () => {
    render(<DashboardSection />)
    
    await waitFor(() => {
      expect(screen.getByText('Actividad de Estudio')).toBeInTheDocument()
      expect(screen.getByText('Gráfico de actividad (próximamente)')).toBeInTheDocument()
      expect(screen.getByText('Migración a Next.js - Semana 1')).toBeInTheDocument()
    })
  })

  it('renders quick action buttons', async () => {
    render(<DashboardSection />)
    
    await waitFor(() => {
      expect(screen.getByText('Estudiar Ahora')).toBeInTheDocument()
      expect(screen.getByText('Crear Deck')).toBeInTheDocument()
      expect(screen.getByText('Ver Estadísticas')).toBeInTheDocument()
      expect(screen.getByText('Configuración')).toBeInTheDocument()
    })
  })

  it('displays migration indicator', async () => {
    render(<DashboardSection />)
    
    await waitFor(() => {
      expect(screen.getByText('Next.js Migration - Semana 1')).toBeInTheDocument()
      expect(screen.getByText('Dashboard migrado exitosamente a Next.js 13+ con App Router')).toBeInTheDocument()
    })
  })

  it('renders statistics icons', async () => {
    render(<DashboardSection />)
    
    await waitFor(() => {
      expect(screen.getByText('📚')).toBeInTheDocument()
      expect(screen.getByText('🎯')).toBeInTheDocument()
      expect(screen.getByText('🔥')).toBeInTheDocument()
      expect(screen.getByText('⏱️')).toBeInTheDocument()
      expect(screen.getByText('📈')).toBeInTheDocument()
    })
  })

  it('has correct CSS classes for responsive design', async () => {
    const { container } = render(<DashboardSection />)
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    // Check for responsive grid classes
    const statsGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3')
    expect(statsGrid).toBeInTheDocument()

    // Check for card classes
    const cards = container.querySelectorAll('.card')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('renders progress bar with correct width', async () => {
    const { container } = render(<DashboardSection />)
    
    await waitFor(() => {
      expect(screen.getByText('65%')).toBeInTheDocument()
    })

    const progressBar = container.querySelector('[style*="width: 65%"]')
    expect(progressBar).toBeInTheDocument()
  })

  it('logs dashboard loading message', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    
    render(<DashboardSection />)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('📊 Dashboard cargado - Next.js')
    })

    consoleSpy.mockRestore()
  })
})

