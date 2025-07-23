// @ts-check
/**
 * Error Handler - Sistema robusto de tratamento de erros
 * Implementa captura global, retry automático e feedback ao usuário
 */

/**
 * @typedef {Object} ErrorInfo
 * @property {string} message - Mensagem do erro
 * @property {string} stack - Stack trace do erro
 * @property {string} filename - Arquivo onde ocorreu o erro
 * @property {number} lineno - Linha do erro
 * @property {number} colno - Coluna do erro
 * @property {string} timestamp - Timestamp do erro
 * @property {string} userAgent - User agent do navegador
 * @property {string} url - URL onde ocorreu o erro
 */

/**
 * @typedef {Object} RetryOptions
 * @property {number} maxRetries - Número máximo de tentativas
 * @property {number} delay - Delay entre tentativas em ms
 * @property {Function} backoff - Função de backoff
 * @property {Function} shouldRetry - Função que determina se deve tentar novamente
 */

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.retryAttempts = new Map();
        this.errorCallbacks = new Map();
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    /**
     * Inicializa o sistema de tratamento de erros
     */
    init() {
        this.setupGlobalErrorHandling();
        this.setupUnhandledPromiseRejection();
        this.setupNetworkErrorHandling();
        this.setupResourceErrorHandling();
        this.createErrorReportingUI();
        this.setupOfflineDetection();
    }

    /**
     * Configuração de captura global de erros JavaScript
     */
    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            const errorInfo = {
                message: event.message,
                stack: event.error?.stack || '',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                type: 'javascript'
            };

            this.handleError(errorInfo);
        });
    }

    /**
     * Configuração de captura de promises rejeitadas
     */
    setupUnhandledPromiseRejection() {
        window.addEventListener('unhandledrejection', (event) => {
            const errorInfo = {
                message: event.reason?.message || 'Promise rejeitada',
                stack: event.reason?.stack || '',
                filename: '',
                lineno: 0,
                colno: 0,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                type: 'promise',
                reason: event.reason
            };

            this.handleError(errorInfo);
            event.preventDefault(); // Previne log no console
        });
    }

    /**
     * Configuração de tratamento de erros de rede
     */
    setupNetworkErrorHandling() {
        // Interceptar fetch para capturar erros de rede
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                
                if (!response.ok) {
                    const errorInfo = {
                        message: `HTTP ${response.status}: ${response.statusText}`,
                        stack: '',
                        filename: '',
                        lineno: 0,
                        colno: 0,
                        timestamp: new Date().toISOString(),
                        userAgent: navigator.userAgent,
                        url: args[0],
                        type: 'network',
                        status: response.status,
                        statusText: response.statusText
                    };
                    
                    this.handleError(errorInfo);
                }
                
                return response;
            } catch (error) {
                const errorInfo = {
                    message: error.message,
                    stack: error.stack || '',
                    filename: '',
                    lineno: 0,
                    colno: 0,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    url: args[0],
                    type: 'network',
                    networkError: true
                };
                
                this.handleError(errorInfo);
                throw error;
            }
        };
    }

    /**
     * Configuração de tratamento de erros de recursos
     */
    setupResourceErrorHandling() {
        document.addEventListener('error', (event) => {
            if (event.target !== window) {
                const errorInfo = {
                    message: `Falha ao carregar recurso: ${event.target.src || event.target.href}`,
                    stack: '',
                    filename: event.target.src || event.target.href || '',
                    lineno: 0,
                    colno: 0,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    type: 'resource',
                    element: event.target.tagName
                };

                this.handleError(errorInfo);
            }
        }, true);
    }

    /**
     * Manipula um erro capturado
     * @param {ErrorInfo} errorInfo - Informações do erro
     */
    handleError(errorInfo) {
        // Adicionar à lista de erros
        this.errors.push(errorInfo);
        
        // Limitar número de erros armazenados
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Log do erro
        console.error('🚨 Erro capturado:', errorInfo);

        // Executar callbacks registrados
        this.executeErrorCallbacks(errorInfo);

        // Mostrar feedback ao usuário se necessário
        this.showUserFeedback(errorInfo);

        // Tentar recuperação automática
        this.attemptRecovery(errorInfo);

        // Reportar erro se configurado
        this.reportError(errorInfo);
    }

    /**
     * Executa callbacks registrados para tipos de erro
     * @param {ErrorInfo} errorInfo - Informações do erro
     */
    executeErrorCallbacks(errorInfo) {
        const callbacks = this.errorCallbacks.get(errorInfo.type) || [];
        callbacks.forEach(callback => {
            try {
                callback(errorInfo);
            } catch (callbackError) {
                console.error('Erro no callback de erro:', callbackError);
            }
        });
    }

    /**
     * Mostra feedback ao usuário baseado no tipo de erro
     * @param {ErrorInfo} errorInfo - Informações do erro
     */
    showUserFeedback(errorInfo) {
        let message = '';
        let type = 'error';

        switch (errorInfo.type) {
            case 'network':
                if (!this.isOnline) {
                    message = 'Você está offline. Verifique sua conexão com a internet.';
                } else if (errorInfo.status >= 500) {
                    message = 'Erro no servidor. Tente novamente em alguns minutos.';
                } else if (errorInfo.status === 404) {
                    message = 'Recurso não encontrado.';
                } else {
                    message = 'Erro de conexão. Tente novamente.';
                }
                break;
                
            case 'resource':
                message = 'Falha ao carregar recurso. A página pode não funcionar corretamente.';
                type = 'warning';
                break;
                
            case 'javascript':
                if (this.isCriticalError(errorInfo)) {
                    message = 'Ocorreu um erro inesperado. Tente recarregar a página.';
                }
                break;
                
            case 'promise':
                message = 'Operação falhou. Tente novamente.';
                break;
        }

        if (message) {
            this.showNotification(message, type);
        }
    }

    /**
     * Determina se um erro é crítico
     * @param {ErrorInfo} errorInfo - Informações do erro
     * @returns {boolean} Se o erro é crítico
     */
    isCriticalError(errorInfo) {
        const criticalPatterns = [
            /Cannot read property/,
            /Cannot access before initialization/,
            /is not a function/,
            /ReferenceError/,
            /TypeError/
        ];

        return criticalPatterns.some(pattern => pattern.test(errorInfo.message));
    }

    /**
     * Tenta recuperação automática do erro
     * @param {ErrorInfo} errorInfo - Informações do erro
     */
    attemptRecovery(errorInfo) {
        switch (errorInfo.type) {
            case 'network':
                this.scheduleRetry(() => {
                    // Tentar recarregar dados
                    if (window.app && window.app.refreshData) {
                        window.app.refreshData();
                    }
                }, 5000);
                break;
                
            case 'resource':
                this.retryResourceLoad(errorInfo);
                break;
                
            case 'javascript':
                if (this.isCriticalError(errorInfo)) {
                    this.suggestPageReload();
                }
                break;
        }
    }

    /**
     * Tenta recarregar um recurso que falhou
     * @param {ErrorInfo} errorInfo - Informações do erro
     */
    retryResourceLoad(errorInfo) {
        const url = errorInfo.filename;
        const retryKey = `resource_${url}`;
        const attempts = this.retryAttempts.get(retryKey) || 0;

        if (attempts < 3) {
            this.retryAttempts.set(retryKey, attempts + 1);
            
            setTimeout(() => {
                if (url.endsWith('.css')) {
                    this.reloadStylesheet(url);
                } else if (url.endsWith('.js')) {
                    this.reloadScript(url);
                }
            }, 2000 * (attempts + 1)); // Backoff exponencial
        }
    }

    /**
     * Recarrega uma stylesheet
     * @param {string} url - URL da stylesheet
     */
    reloadStylesheet(url) {
        const link = document.querySelector(`link[href="${url}"]`);
        if (link) {
            const newLink = link.cloneNode();
            newLink.href = `${url}?retry=${Date.now()}`;
            link.parentNode.insertBefore(newLink, link.nextSibling);
            link.remove();
        }
    }

    /**
     * Recarrega um script
     * @param {string} url - URL do script
     */
    reloadScript(url) {
        const script = document.querySelector(`script[src="${url}"]`);
        if (script) {
            const newScript = document.createElement('script');
            newScript.src = `${url}?retry=${Date.now()}`;
            newScript.async = script.async;
            newScript.defer = script.defer;
            document.head.appendChild(newScript);
        }
    }

    /**
     * Sugere recarregamento da página
     */
    suggestPageReload() {
        const shouldReload = confirm(
            'A aplicação encontrou um erro crítico. Deseja recarregar a página?'
        );
        
        if (shouldReload) {
            window.location.reload();
        }
    }

    /**
     * Agenda uma tentativa de retry
     * @param {Function} callback - Função a ser executada
     * @param {number} delay - Delay em millisegundos
     */
    scheduleRetry(callback, delay) {
        setTimeout(() => {
            try {
                callback();
            } catch (error) {
                console.error('Erro na tentativa de recuperação:', error);
            }
        }, delay);
    }

    /**
     * Sistema de retry com backoff exponencial
     * @param {Function} fn - Função a ser executada
     * @param {RetryOptions} options - Opções de retry
     * @returns {Promise} Promise da operação
     */
    async retry(fn, options = {}) {
        const {
            maxRetries = 3,
            delay = 1000,
            backoff = (attempt) => delay * Math.pow(2, attempt),
            shouldRetry = () => true
        } = options;

        let lastError;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                
                if (attempt === maxRetries || !shouldRetry(error)) {
                    throw error;
                }
                
                const waitTime = backoff(attempt);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
        
        throw lastError;
    }

    /**
     * Configuração de detecção de status online/offline
     */
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNotification('Conexão restaurada', 'success');
            
            // Tentar recarregar dados quando voltar online
            if (window.app && window.app.refreshData) {
                window.app.refreshData();
            }
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNotification('Você está offline', 'warning');
        });
    }

    /**
     * Cria interface para reportar erros
     */
    createErrorReportingUI() {
        // Criar botão de report de erro (oculto por padrão)
        const reportButton = document.createElement('button');
        reportButton.id = 'error-report-button';
        reportButton.textContent = 'Reportar Erro';
        reportButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 10000;
            display: none;
        `;

        reportButton.addEventListener('click', () => {
            this.showErrorReportDialog();
        });

        document.body.appendChild(reportButton);
    }

    /**
     * Mostra diálogo para reportar erro
     */
    showErrorReportDialog() {
        const lastError = this.errors[this.errors.length - 1];
        if (!lastError) return;

        const dialog = document.createElement('div');
        dialog.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10001;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 8px; max-width: 500px; width: 90%;">
                    <h3>Reportar Erro</h3>
                    <p>Descreva o que você estava fazendo quando o erro ocorreu:</p>
                    <textarea id="error-description" style="width: 100%; height: 100px; margin: 10px 0;"></textarea>
                    <div style="text-align: right;">
                        <button id="cancel-report" style="margin-right: 10px;">Cancelar</button>
                        <button id="send-report" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px;">Enviar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        document.getElementById('cancel-report').addEventListener('click', () => {
            dialog.remove();
        });

        document.getElementById('send-report').addEventListener('click', () => {
            const description = document.getElementById('error-description').value;
            this.sendErrorReport(lastError, description);
            dialog.remove();
            this.showNotification('Relatório enviado. Obrigado!', 'success');
        });
    }

    /**
     * Envia relatório de erro
     * @param {ErrorInfo} errorInfo - Informações do erro
     * @param {string} description - Descrição do usuário
     */
    sendErrorReport(errorInfo, description) {
        const report = {
            ...errorInfo,
            userDescription: description,
            reportedAt: new Date().toISOString()
        };

        // Aqui você enviaria para seu serviço de logging
        console.log('📧 Relatório de erro:', report);
        
        // Exemplo de envio para serviço externo:
        // fetch('/api/error-reports', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(report)
        // });
    }

    /**
     * Reporta erro automaticamente
     * @param {ErrorInfo} errorInfo - Informações do erro
     */
    reportError(errorInfo) {
        // Reportar apenas erros críticos automaticamente
        if (this.isCriticalError(errorInfo)) {
            // Mostrar botão de report
            const reportButton = document.getElementById('error-report-button');
            if (reportButton) {
                reportButton.style.display = 'block';
                
                // Ocultar após 10 segundos
                setTimeout(() => {
                    reportButton.style.display = 'none';
                }, 10000);
            }
        }
    }

    /**
     * Registra callback para tipo de erro
     * @param {string} errorType - Tipo de erro
     * @param {Function} callback - Callback a ser executado
     */
    onError(errorType, callback) {
        if (!this.errorCallbacks.has(errorType)) {
            this.errorCallbacks.set(errorType, []);
        }
        this.errorCallbacks.get(errorType).push(callback);
    }

    /**
     * Mostra notificação ao usuário
     * @param {string} message - Mensagem
     * @param {string} type - Tipo da notificação
     */
    showNotification(message, type = 'error') {
        // Usar sistema de notificações existente se disponível
        if (window.Utils && window.Utils.showNotification) {
            window.Utils.showNotification(message, type);
            return;
        }

        // Fallback para notificação simples
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#28a745'};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Obtém estatísticas de erros
     * @returns {Object} Estatísticas
     */
    getErrorStats() {
        const stats = {
            total: this.errors.length,
            byType: {},
            recent: this.errors.slice(-10),
            criticalCount: 0
        };

        this.errors.forEach(error => {
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
            if (this.isCriticalError(error)) {
                stats.criticalCount++;
            }
        });

        return stats;
    }

    /**
     * Limpa histórico de erros
     */
    clearErrors() {
        this.errors = [];
        this.retryAttempts.clear();
    }

    /**
     * Exporta erros para análise
     * @returns {string} JSON com erros
     */
    exportErrors() {
        return JSON.stringify(this.errors, null, 2);
    }
}

// Instância global
const errorHandler = new ErrorHandler();

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
} else if (typeof window !== 'undefined') {
    window.ErrorHandler = ErrorHandler;
    window.errorHandler = errorHandler;
}

