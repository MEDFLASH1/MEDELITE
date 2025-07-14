"""
Backend Integration for Dashboard-Flashcard Connectivity
Implementa endpoints y servicios para la integración dashboard-flashcards
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend_app.models import User, Deck, Flashcard, StudySession, CardReview
from backend_app.extensions import db
from datetime import datetime, timedelta
from sqlalchemy import func, desc
import logging

logger = logging.getLogger(__name__)
dashboard_integration_bp = Blueprint("dashboard_integration", __name__)


class DashboardFlashcardIntegration:
    """
    Servicio de integración entre dashboard y flashcards
    Proporciona estadísticas, tarjetas pendientes y recomendaciones
    """
    
    def __init__(self, db_session=None):
        self.db = db_session or db
    
    def get_user_deck_stats(self, user_id):
        """
        Obtiene estadísticas de progreso de todos los decks del usuario
        para mostrarlas en el dashboard
        """
        try:
            decks = Deck.query.filter_by(user_id=user_id, is_deleted=False).all()
            stats = []
            
            for deck in decks:
                cards = Flashcard.query.filter_by(deck_id=deck.id, is_deleted=False).all()
                
                # Calcular estadísticas de dominio basadas en repeticiones
                mastered = sum(1 for card in cards if card.repetitions >= 3)
                in_progress = sum(1 for card in cards if 0 < card.repetitions < 3)
                not_started = sum(1 for card in cards if card.repetitions == 0)
                
                completion_rate = (mastered / len(cards)) * 100 if len(cards) > 0 else 0
                
                stats.append({
                    'deck_id': deck.id,
                    'deck_name': deck.name,
                    'total_cards': len(cards),
                    'mastered': mastered,
                    'in_progress': in_progress,
                    'not_started': not_started,
                    'completion_rate': round(completion_rate, 1)
                })
            
            return {'success': True, 'data': stats}
            
        except Exception as e:
            logger.error(f"Error getting deck stats for user {user_id}: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_due_flashcards(self, user_id, limit=5):
        """
        Obtiene flashcards pendientes de repaso para mostrar recordatorios
        en el dashboard
        """
        try:
            today = datetime.utcnow()
            
            # Consulta optimizada para obtener flashcards pendientes
            due_cards = (
                self.db.session.query(Flashcard, Deck.name.label('deck_name'))
                .join(Deck)
                .filter(
                    Deck.user_id == user_id,
                    Deck.is_deleted == False,
                    Flashcard.is_deleted == False,
                    Flashcard.next_review <= today
                )
                .order_by(Flashcard.next_review)
                .limit(limit)
                .all()
            )
            
            # Obtener el conteo total
            total_due = (
                self.db.session.query(func.count(Flashcard.id))
                .join(Deck)
                .filter(
                    Deck.user_id == user_id,
                    Deck.is_deleted == False,
                    Flashcard.is_deleted == False,
                    Flashcard.next_review <= today
                )
                .scalar()
            )
            
            # Formatear resultados
            formatted_cards = []
            for card, deck_name in due_cards:
                formatted_cards.append({
                    'id': card.id,
                    'front': card.front[:100] + '...' if len(card.front) > 100 else card.front,
                    'deck_name': deck_name,
                    'deck_id': card.deck_id,
                    'next_review': card.next_review.isoformat() if card.next_review else None
                })
            
            return {
                'success': True,
                'data': {
                    'due_cards': formatted_cards,
                    'total_due': total_due or 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting due flashcards for user {user_id}: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_study_recommendations(self, user_id, limit=3):
        """
        Genera recomendaciones personalizadas basadas en el historial y patrones de estudio
        """
        try:
            recommendations = []
            
            # 1. Decks con pocas tarjetas (menos de 5)
            small_decks = (
                self.db.session.query(Deck, func.count(Flashcard.id).label('card_count'))
                .outerjoin(Flashcard)
                .filter(
                    Deck.user_id == user_id,
                    Deck.is_deleted == False
                )
                .group_by(Deck.id)
                .having(func.count(Flashcard.id) < 5)
                .having(func.count(Flashcard.id) > 0)
                .all()
            )
            
            for deck, card_count in small_decks[:1]:  # Solo el primero
                recommendations.append({
                    'type': 'expand_deck',
                    'title': 'Expande tus mazos',
                    'description': f'El mazo "{deck.name}" tiene solo {card_count} tarjetas. ¡Agregar más mejorará tu aprendizaje!',
                    'action': 'create_flashcard',
                    'deck_id': deck.id,
                    'priority': 'medium'
                })
            
            # 2. Decks abandonados (sin revisar en más de 7 días)
            week_ago = datetime.utcnow() - timedelta(days=7)
            abandoned_decks = (
                self.db.session.query(Deck)
                .join(Flashcard)
                .filter(
                    Deck.user_id == user_id,
                    Deck.is_deleted == False,
                    Flashcard.next_review < week_ago
                )
                .group_by(Deck.id)
                .limit(1)
                .all()
            )
            
            for deck in abandoned_decks:
                recommendations.append({
                    'type': 'review_abandoned',
                    'title': 'Retoma el estudio',
                    'description': f'Tienes tarjetas pendientes en "{deck.name}". ¡Es hora de repasar!',
                    'action': 'start_study',
                    'deck_id': deck.id,
                    'priority': 'high'
                })
            
            # 3. Oportunidades de mejora (tarjetas con baja precisión)
            if len(recommendations) < limit:
                difficult_decks = (
                    self.db.session.query(
                        Deck,
                        func.avg(CardReview.rating).label('avg_rating')
                    )
                    .join(Flashcard)
                    .join(CardReview)
                    .filter(
                        Deck.user_id == user_id,
                        Deck.is_deleted == False,
                        CardReview.reviewed_at >= datetime.utcnow() - timedelta(days=30)
                    )
                    .group_by(Deck.id)
                    .having(func.avg(CardReview.rating) < 2.5)
                    .order_by(func.avg(CardReview.rating))
                    .limit(1)
                    .all()
                )
                
                for deck, avg_rating in difficult_decks:
                    recommendations.append({
                        'type': 'improve_performance',
                        'title': 'Mejora tu rendimiento',
                        'description': f'El mazo "{deck.name}" necesita más práctica. Promedio actual: {avg_rating:.1f}/4',
                        'action': 'start_study',
                        'deck_id': deck.id,
                        'priority': 'high'
                    })
            
            return {'success': True, 'data': recommendations[:limit]}
            
        except Exception as e:
            logger.error(f"Error generating recommendations for user {user_id}: {str(e)}")
            return {'success': False, 'error': str(e)}


# Instancia del servicio
integration_service = DashboardFlashcardIntegration()


@dashboard_integration_bp.route('/dashboard/flashcard-stats', methods=['GET'])
@jwt_required()
def dashboard_flashcard_stats():
    """
    Endpoint para obtener estadísticas de flashcards para el dashboard
    GET /api/dashboard/flashcard-stats
    """
    try:
        user_id = get_jwt_identity()
        
        # Obtener estadísticas de decks
        deck_stats_result = integration_service.get_user_deck_stats(user_id)
        if not deck_stats_result['success']:
            return jsonify({'error': deck_stats_result['error']}), 400
        
        # Obtener tarjetas pendientes
        due_cards_result = integration_service.get_due_flashcards(user_id, limit=5)
        if not due_cards_result['success']:
            return jsonify({'error': due_cards_result['error']}), 400
        
        # Obtener recomendaciones
        recommendations_result = integration_service.get_study_recommendations(user_id, limit=3)
        if not recommendations_result['success']:
            return jsonify({'error': recommendations_result['error']}), 400
        
        return jsonify({
            'success': True,
            'data': {
                'deck_stats': deck_stats_result['data'],
                'due_cards': due_cards_result['data']['due_cards'],
                'total_due': due_cards_result['data']['total_due'],
                'recommendations': recommendations_result['data']
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error in dashboard_flashcard_stats: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


@dashboard_integration_bp.route('/dashboard/quick-create-flashcard', methods=['POST'])
@jwt_required()
def quick_create_flashcard():
    """
    Endpoint para crear rápidamente flashcards desde el dashboard
    POST /api/dashboard/quick-create-flashcard
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        # Validar campos requeridos
        required_fields = ['deck_id', 'front', 'back']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo requerido faltante: {field}'}), 400
        
        # Verificar que el deck pertenece al usuario
        deck = Deck.query.filter_by(
            id=data['deck_id'],
            user_id=user_id,
            is_deleted=False
        ).first()
        
        if not deck:
            return jsonify({'error': 'Deck no encontrado o acceso denegado'}), 404
        
        # Crear flashcard
        flashcard = Flashcard(
            deck_id=deck.id,
            front=data['front'],
            back=data['back'],
            created_at=datetime.utcnow()
        )
        
        db.session.add(flashcard)
        db.session.commit()
        
        # Actualizar estadísticas del deck
        deck.total_cards = Flashcard.query.filter_by(deck_id=deck.id, is_deleted=False).count()
        db.session.commit()
        
        logger.info(f"Quick flashcard created: {flashcard.id} for user {user_id}")
        
        return jsonify({
            'success': True,
            'flashcard': {
                'id': flashcard.id,
                'front': flashcard.front,
                'back': flashcard.back,
                'deck_name': deck.name,
                'created_at': flashcard.created_at.isoformat()
            },
            'message': 'Flashcard creada exitosamente desde el dashboard'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in quick_create_flashcard: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


@dashboard_integration_bp.route('/dashboard/study-session-summary', methods=['GET'])
@jwt_required()
def study_session_summary():
    """
    Obtiene un resumen de las sesiones de estudio para el dashboard
    GET /api/dashboard/study-session-summary
    """
    try:
        user_id = get_jwt_identity()
        
        # Estadísticas de hoy
        today = datetime.utcnow().date()
        today_start = datetime.combine(today, datetime.min.time())
        today_end = datetime.combine(today, datetime.max.time())
        
        today_sessions = StudySession.query.filter(
            StudySession.user_id == user_id,
            StudySession.start_time >= today_start,
            StudySession.start_time <= today_end
        ).all()
        
        # Calcular métricas de hoy
        cards_studied_today = sum(session.cards_studied or 0 for session in today_sessions)
        study_time_today = sum(session.duration_minutes or 0 for session in today_sessions)
        
        # Estadísticas de la semana
        week_ago = datetime.utcnow() - timedelta(days=7)
        weekly_sessions = StudySession.query.filter(
            StudySession.user_id == user_id,
            StudySession.start_time >= week_ago
        ).all()
        
        # Racha de estudio (días consecutivos)
        streak = calculate_study_streak(user_id)
        
        # Precisión promedio (últimos 30 días)
        month_ago = datetime.utcnow() - timedelta(days=30)
        recent_reviews = CardReview.query.join(Flashcard).join(Deck).filter(
            Deck.user_id == user_id,
            CardReview.reviewed_at >= month_ago
        ).all()
        
        accuracy = 0
        if recent_reviews:
            correct_reviews = sum(1 for review in recent_reviews if review.rating >= 3)
            accuracy = (correct_reviews / len(recent_reviews)) * 100
        
        return jsonify({
            'success': True,
            'data': {
                'today': {
                    'cards_studied': cards_studied_today,
                    'study_time_minutes': study_time_today,
                    'sessions_count': len(today_sessions)
                },
                'weekly': {
                    'cards_studied': sum(session.cards_studied or 0 for session in weekly_sessions),
                    'study_time_minutes': sum(session.duration_minutes or 0 for session in weekly_sessions),
                    'sessions_count': len(weekly_sessions)
                },
                'streak_days': streak,
                'accuracy_percentage': round(accuracy, 1)
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error in study_session_summary: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500


def calculate_study_streak(user_id):
    """
    Calcula la racha de días consecutivos de estudio
    """
    try:
        today = datetime.utcnow().date()
        streak = 0
        current_date = today
        
        # Verificar hacia atrás día por día
        for i in range(365):  # Máximo 365 días
            day_start = datetime.combine(current_date, datetime.min.time())
            day_end = datetime.combine(current_date, datetime.max.time())
            
            day_sessions = StudySession.query.filter(
                StudySession.user_id == user_id,
                StudySession.start_time >= day_start,
                StudySession.start_time <= day_end,
                StudySession.cards_studied > 0
            ).first()
            
            if day_sessions:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break
        
        return streak
        
    except Exception as e:
        logger.error(f"Error calculating study streak: {str(e)}")
        return 0


# Exportar blueprint para registro en la aplicación principal
__all__ = ['dashboard_integration_bp', 'DashboardFlashcardIntegration']
