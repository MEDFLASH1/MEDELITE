import { render, screen, fireEvent } from '@testing-library/react'
import { Navigation } from '@/components/Navigation'

const mockOnSectionChange = jest.fn()

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all navigation items', () => {
    render(
      <Navigation 
        currentSection="dashboard" 
        onSectionChange={mockOnSectionChange} 
      />
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Estudiar')).toBeInTheDocument()
    expect(screen.getByText('Crear')).toBeInTheDocument()
    expect(screen.getByText('Gestionar')).toBeInTheDocument()
    expect(screen.getByText('Ranking')).toBeInTheDocument()
  })

  it('highlights current section', () => {
    render(
      <Navigation 
        currentSection="estudiar" 
        onSectionChange={mockOnSectionChange} 
      />
    )

    const estudiarButton = screen.getByRole('button', { name: /estudiar/i })
    expect(estudiarButton).toHaveClass('bg-blue-600', 'text-white')
  })

  it('calls onSectionChange when navigation item is clicked', () => {
    render(
      <Navigation 
        currentSection="dashboard" 
        onSectionChange={mockOnSectionChange} 
      />
    )

    const crearButton = screen.getByRole('button', { name: /crear/i })
    fireEvent.click(crearButton)

    expect(mockOnSectionChange).toHaveBeenCalledWith('crear')
  })

  it('renders mobile menu button', () => {
    render(
      <Navigation 
        currentSection="dashboard" 
        onSectionChange={mockOnSectionChange} 
      />
    )

    // Mobile menu button should be present (hidden on desktop)
    const mobileMenuButton = screen.getByRole('button', { name: '' })
    expect(mobileMenuButton).toBeInTheDocument()
  })

  it('shows mobile menu when button is clicked', () => {
    render(
      <Navigation 
        currentSection="dashboard" 
        onSectionChange={mockOnSectionChange} 
      />
    )

    // Find and click mobile menu button
    const mobileMenuButton = screen.getByRole('button', { name: '' })
    fireEvent.click(mobileMenuButton)

    // Mobile menu should now be visible (check for duplicate navigation items)
    const dashboardButtons = screen.getAllByText('Dashboard')
    expect(dashboardButtons.length).toBeGreaterThan(1)
  })

  it('dispatches custom event when section changes', () => {
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent')
    
    render(
      <Navigation 
        currentSection="dashboard" 
        onSectionChange={mockOnSectionChange} 
      />
    )

    const gestionarButton = screen.getByRole('button', { name: /gestionar/i })
    fireEvent.click(gestionarButton)

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'section-change',
        detail: { section: 'gestionar' }
      })
    )

    dispatchEventSpy.mockRestore()
  })

  it('renders user indicator', () => {
    render(
      <Navigation 
        currentSection="dashboard" 
        onSectionChange={mockOnSectionChange} 
      />
    )

    expect(screen.getByText('👤')).toBeInTheDocument()
    expect(screen.getByText('Usuario')).toBeInTheDocument()
  })

  it('applies correct CSS classes for active state', () => {
    render(
      <Navigation 
        currentSection="ranking" 
        onSectionChange={mockOnSectionChange} 
      />
    )

    const rankingButton = screen.getByRole('button', { name: /ranking/i })
    expect(rankingButton).toHaveClass('bg-blue-600', 'text-white')

    const dashboardButton = screen.getByRole('button', { name: /dashboard/i })
    expect(dashboardButton).toHaveClass('text-gray-300')
    expect(dashboardButton).not.toHaveClass('bg-blue-600')
  })

  it('renders navigation icons', () => {
    render(
      <Navigation 
        currentSection="dashboard" 
        onSectionChange={mockOnSectionChange} 
      />
    )

    expect(screen.getByText('📊')).toBeInTheDocument() // Dashboard
    expect(screen.getByText('📚')).toBeInTheDocument() // Estudiar
    expect(screen.getByText('➕')).toBeInTheDocument() // Crear
    expect(screen.getByText('⚙️')).toBeInTheDocument() // Gestionar
    expect(screen.getByText('🏆')).toBeInTheDocument() // Ranking
  })
})

