import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StudyingFlashApp } from '@/components/StudyingFlashApp'

// Mock window.showSection function
const mockShowSection = jest.fn()
Object.defineProperty(window, 'showSection', {
  writable: true,
  value: mockShowSection,
})

describe('StudyingFlashApp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    render(<StudyingFlashApp />)
    
    expect(screen.getByText('Cargando StudyingFlash...')).toBeInTheDocument()
    expect(screen.getByText('Preparando tu experiencia de aprendizaje')).toBeInTheDocument()
  })

  it('renders main app after loading', async () => {
    render(<StudyingFlashApp />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('StudyingFlash')).toBeInTheDocument()
    }, { timeout: 2000 })

    // Check for Next.js indicator
    expect(screen.getByText('Next.js')).toBeInTheDocument()
  })

  it('renders navigation component', async () => {
    render(<StudyingFlashApp />)
    
    await waitFor(() => {
      expect(screen.getByText('StudyingFlash')).toBeInTheDocument()
    })

    // Check for navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Estudiar')).toBeInTheDocument()
    expect(screen.getByText('Crear')).toBeInTheDocument()
    expect(screen.getByText('Gestionar')).toBeInTheDocument()
    expect(screen.getByText('Ranking')).toBeInTheDocument()
  })

  it('renders dashboard section by default', async () => {
    render(<StudyingFlashApp />)
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    // Check for dashboard content
    expect(screen.getByText('Resumen de tu progreso de aprendizaje')).toBeInTheDocument()
    expect(screen.getByText('Total Flashcards')).toBeInTheDocument()
  })

  it('exposes global showSection function', async () => {
    render(<StudyingFlashApp />)
    
    await waitFor(() => {
      expect(window.showSection).toBeDefined()
    })

    expect(typeof window.showSection).toBe('function')
  })

  it('sets global configuration variables', async () => {
    render(<StudyingFlashApp />)
    
    await waitFor(() => {
      expect(window.NEXT_JS_MIGRATION).toBe(true)
      expect(window.APP_VERSION).toBe('2.0.0-nextjs')
    })
  })

  it('renders footer component', async () => {
    render(<StudyingFlashApp />)
    
    await waitFor(() => {
      expect(screen.getByText('StudyingFlash')).toBeInTheDocument()
    })

    // Check for footer content
    expect(screen.getByText('© 2025 StudyingFlash. Todos los derechos reservados.')).toBeInTheDocument()
  })

  it('applies correct CSS classes', async () => {
    const { container } = render(<StudyingFlashApp />)
    
    await waitFor(() => {
      expect(screen.getByText('StudyingFlash')).toBeInTheDocument()
    })

    // Check for main container classes
    const mainDiv = container.querySelector('.min-h-screen.bg-gray-900.text-white')
    expect(mainDiv).toBeInTheDocument()
  })
})

