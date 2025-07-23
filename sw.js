// ===== SERVICE WORKER PARA STUDYINGFLASH =====
// Implementa cache offline e sincronização em background

const CACHE_NAME = 'studyingflash-v2.1.0';
const STATIC_CACHE = 'studyingflash-static-v2.1.0';
const DYNAMIC_CACHE = 'studyingflash-dynamic-v2.1.0';

// Recursos para cache estático
const STATIC_ASSETS = [
    './',
    './index.html',
    './main.css',
    './app-functional.js',
    './performance-optimizer.js',
    './accessibility-enhancer.js',
    './advanced-study-system.js',
    './notification-system.js',
    './manifest.webmanifest',
    './icons/favicon-32x32.png',
    './icons/favicon-16x16.png',
    './icons/apple-touch-icon.png',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
];

// Recursos dinâmicos (dados do usuário)
const DYNAMIC_PATTERNS = [
    /\/api\//,
    /studyingflash_/
];

// Estratégias de cache
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
    NETWORK_ONLY: 'network-only',
    CACHE_ONLY: 'cache-only'
};

/**
 * Evento de instalação do Service Worker
 */
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Instalando...');
    
    event.waitUntil(
        Promise.all([
            // Cache estático
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 Service Worker: Cacheando recursos estáticos');
                return cache.addAll(STATIC_ASSETS);
            }),
            
            // Pular espera para ativar imediatamente
            self.skipWaiting()
        ])
    );
});

/**
 * Evento de ativação do Service Worker
 */
self.addEventListener('activate', event => {
    console.log('✅ Service Worker: Ativando...');
    
    event.waitUntil(
        Promise.all([
            // Limpar caches antigos
            cleanupOldCaches(),
            
            // Tomar controle de todas as abas
            self.clients.claim()
        ])
    );
});

/**
 * Intercepta requisições de rede
 */
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ignorar requisições não-HTTP
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // Determinar estratégia de cache
    const strategy = getCacheStrategy(request);
    
    event.respondWith(
        handleRequest(request, strategy)
    );
});

/**
 * Sincronização em background
 */
self.addEventListener('sync', event => {
    console.log('🔄 Service Worker: Sincronização em background', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(syncOfflineData());
    }
});

/**
 * Notificações push
 */
self.addEventListener('push', event => {
    console.log('🔔 Service Worker: Push notification recebida');
    
    const options = {
        body: 'Você tem flashcards para revisar!',
        icon: './icons/icon-192x192.png',
        badge: './icons/icon-144x144.png',
        tag: 'study-reminder',
        requireInteraction: false,
        actions: [
            {
                action: 'study',
                title: 'Estudar Agora'
            },
            {
                action: 'dismiss',
                title: 'Mais Tarde'
            }
        ]
    };
    
    if (event.data) {
        const data = event.data.json();
        options.body = data.body || options.body;
        options.title = data.title || 'StudyingFlash';
    }
    
    event.waitUntil(
        self.registration.showNotification('StudyingFlash', options)
    );
});

/**
 * Clique em notificação
 */
self.addEventListener('notificationclick', event => {
    console.log('👆 Service Worker: Clique em notificação', event.action);
    
    event.notification.close();
    
    if (event.action === 'study') {
        // Abrir app na seção de estudo
        event.waitUntil(
            clients.openWindow('/?section=estudiar')
        );
    } else if (event.action === 'dismiss') {
        // Apenas fechar notificação
        return;
    } else {
        // Clique na notificação (não em ação)
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * Determina estratégia de cache para uma requisição
 */
function getCacheStrategy(request) {
    const url = new URL(request.url);
    
    // Recursos estáticos - Cache First
    if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset.replace('./', '')))) {
        return CACHE_STRATEGIES.CACHE_FIRST;
    }
    
    // API calls - Network First
    if (url.pathname.includes('/api/')) {
        return CACHE_STRATEGIES.NETWORK_FIRST;
    }
    
    // Imagens - Stale While Revalidate
    if (request.destination === 'image') {
        return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
    }
    
    // HTML - Network First
    if (request.destination === 'document') {
        return CACHE_STRATEGIES.NETWORK_FIRST;
    }
    
    // CSS/JS - Stale While Revalidate
    if (request.destination === 'style' || request.destination === 'script') {
        return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
    }
    
    // Padrão - Network First
    return CACHE_STRATEGIES.NETWORK_FIRST;
}

/**
 * Manipula requisição com estratégia específica
 */
async function handleRequest(request, strategy) {
    switch (strategy) {
        case CACHE_STRATEGIES.CACHE_FIRST:
            return cacheFirst(request);
        
        case CACHE_STRATEGIES.NETWORK_FIRST:
            return networkFirst(request);
        
        case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
            return staleWhileRevalidate(request);
        
        case CACHE_STRATEGIES.NETWORK_ONLY:
            return fetch(request);
        
        case CACHE_STRATEGIES.CACHE_ONLY:
            return caches.match(request);
        
        default:
            return networkFirst(request);
    }
}

/**
 * Estratégia Cache First
 */
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Cache First falhou:', error);
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Estratégia Network First
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network First: Tentando cache para', request.url);
        
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback para página offline
        if (request.destination === 'document') {
            return caches.match('./index.html');
        }
        
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Estratégia Stale While Revalidate
 */
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const networkPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            const cache = caches.open(DYNAMIC_CACHE);
            cache.then(c => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
    }).catch(() => {
        // Falha silenciosa na atualização
    });
    
    return cachedResponse || networkPromise;
}

/**
 * Limpa caches antigos
 */
async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE];
    
    const deletePromises = cacheNames
        .filter(cacheName => !currentCaches.includes(cacheName))
        .map(cacheName => {
            console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
        });
    
    return Promise.all(deletePromises);
}

/**
 * Sincroniza dados offline
 */
async function syncOfflineData() {
    console.log('🔄 Service Worker: Sincronizando dados offline...');
    
    try {
        // Obter dados da queue offline
        const offlineQueue = await getOfflineQueue();
        
        for (const item of offlineQueue) {
            try {
                await fetch(item.url, item.options);
                console.log('✅ Sincronizado:', item.url);
            } catch (error) {
                console.error('❌ Falha na sincronização:', item.url, error);
                // Manter na queue para próxima tentativa
            }
        }
        
        // Limpar queue sincronizada
        await clearSyncedItems();
        
    } catch (error) {
        console.error('Erro na sincronização:', error);
    }
}

/**
 * Obtém queue de sincronização offline
 */
async function getOfflineQueue() {
    // Implementar lógica para obter dados da IndexedDB ou localStorage
    // Por enquanto, retorna array vazio
    return [];
}

/**
 * Limpa itens sincronizados
 */
async function clearSyncedItems() {
    // Implementar lógica para limpar itens sincronizados
    console.log('🧹 Service Worker: Limpando itens sincronizados');
}

/**
 * Agenda notificação de lembrete
 */
function scheduleStudyReminder() {
    // Verificar se já estudou hoje
    const lastStudyDate = localStorage.getItem('studyingflash_last_study_date');
    const today = new Date().toDateString();
    
    if (lastStudyDate !== today) {
        // Agendar notificação para 1 hora
        setTimeout(() => {
            self.registration.showNotification('StudyingFlash - Lembrete', {
                body: 'Que tal estudar algumas flashcards agora?',
                icon: './icons/icon-192x192.png',
                tag: 'study-reminder',
                requireInteraction: false
            });
        }, 60 * 60 * 1000); // 1 hora
    }
}

/**
 * Monitora status da rede
 */
self.addEventListener('online', () => {
    console.log('🌐 Service Worker: Conectado à internet');
    // Tentar sincronizar dados offline
    syncOfflineData();
});

self.addEventListener('offline', () => {
    console.log('📴 Service Worker: Desconectado da internet');
});

/**
 * Manipula mensagens do cliente
 */
self.addEventListener('message', event => {
    console.log('💬 Service Worker: Mensagem recebida', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
                
            case 'GET_VERSION':
                event.ports[0].postMessage({ version: CACHE_NAME });
                break;
                
            case 'CLEAR_CACHE':
                clearAllCaches().then(() => {
                    event.ports[0].postMessage({ success: true });
                });
                break;
                
            case 'SYNC_DATA':
                syncOfflineData().then(() => {
                    event.ports[0].postMessage({ success: true });
                });
                break;
        }
    }
});

/**
 * Limpa todos os caches
 */
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    const deletePromises = cacheNames.map(cacheName => caches.delete(cacheName));
    return Promise.all(deletePromises);
}

/**
 * Pré-carrega recursos importantes
 */
async function preloadCriticalResources() {
    const cache = await caches.open(STATIC_CACHE);
    
    const criticalResources = [
        './app-functional.js',
        './main.css'
    ];
    
    return cache.addAll(criticalResources);
}

// Inicializar service worker
console.log('🚀 Service Worker: Carregado');

// Agendar lembrete de estudo
scheduleStudyReminder();

