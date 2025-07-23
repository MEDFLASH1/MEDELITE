#!/usr/bin/env node
// scripts/notify_dependent_agents.js
// Sistema de notificación automática para agentes dependientes

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Matriz de dependencias: quien completa → quien se desbloquea
const DEPENDENCY_MATRIX = {
  "3": {
    "1": [
      {
        "agent": 4, 
        "week": 1, 
        "task": "Next.js migration with data structure analysis",
        "critical_info": "question/answer vs front_content/back_content discrepancy identified"
      }
    ]
  },
  "4": {
    "1": [
      {
        "agent": 5, 
        "week": 1, 
        "task": "Testing setup for Next.js components",
        "critical_info": "React components and structure ready for testing"
      }
    ],
    "2": [
      {
        "agent": 5, 
        "week": 2, 
        "task": "Testing of hooks and advanced components",
        "critical_info": "Custom hooks and context providers ready"
      }
    ]
  },
  "2": {
    "2": [
      {
        "agent": 4, 
        "week": 2, 
        "task": "Integration with HTML structure",
        "critical_info": "HTML components and structure ready for React integration"
      }
    ]
  }
};

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Directorio creado: ${dirPath}`);
  }
}

function notifyCompletion(agentId, week) {
  console.log(`\n🎯 ========================================`);
  console.log(`📢 NOTIFICACIÓN: Agente ${agentId} completó Semana ${week}`);
  console.log(`🕐 Timestamp: ${new Date().toISOString()}`);
  console.log(`========================================\n`);
  
  // Asegurar que existe el directorio de estado
  ensureDirectoryExists('.agent_status');
  
  // Crear archivo de estado de completación
  const completionFile = `.agent_status/agent_${agentId}_week_${week}_complete.json`;
  const completionStatus = {
    agent_id: parseInt(agentId),
    week: parseInt(week),
    status: "COMPLETE",
    completion_timestamp: new Date().toISOString(),
    dependencies_released: [`AGENT_${agentId}_WEEK_${week}_READY`],
    tag_created: `AGENT_${agentId}_WEEK_${week}_COMPLETE`,
    notification_sent: true
  };
  
  fs.writeFileSync(completionFile, JSON.stringify(completionStatus, null, 2));
  console.log(`✅ Archivo de completación creado: ${completionFile}`);
  
  // Obtener agentes dependientes
  const dependents = DEPENDENCY_MATRIX[agentId]?.[week] || [];
  
  if (dependents.length === 0) {
    console.log(`📋 No hay agentes dependientes para Agente ${agentId}, Semana ${week}`);
  } else {
    console.log(`🔓 Desbloqueando ${dependents.length} agente(s) dependiente(s):`);
    
    dependents.forEach((dep, index) => {
      console.log(`\n   ${index + 1}. Agente ${dep.agent} - Semana ${dep.week}`);
      console.log(`      📋 Tarea: ${dep.task}`);
      console.log(`      💡 Info crítica: ${dep.critical_info}`);
      
      createPrerequisiteFile(dep.agent, dep.week, agentId, week, dep);
    });
  }
  
  // Crear tag automático
  try {
    const tagName = `AGENT_${agentId}_WEEK_${week}_COMPLETE`;
    const tagMessage = `Dependencies released for dependent agents - Agent ${agentId} Week ${week} completed`;
    
    execSync(`git tag "${tagName}" -m "${tagMessage}"`, { stdio: 'inherit' });
    console.log(`\n🏷️  Tag creado exitosamente: ${tagName}`);
  } catch (error) {
    console.log(`⚠️  Error creando tag (puede ya existir): ${error.message}`);
  }
  
  // Mostrar resumen final
  console.log(`\n📊 RESUMEN DE NOTIFICACIÓN:`);
  console.log(`   ✅ Agente ${agentId} marcado como completado`);
  console.log(`   🏷️  Tag creado: AGENT_${agentId}_WEEK_${week}_COMPLETE`);
  console.log(`   🔓 Agentes desbloqueados: ${dependents.length}`);
  console.log(`   📄 Archivos de estado actualizados`);
  
  if (dependents.length > 0) {
    console.log(`\n🚀 PRÓXIMOS PASOS PARA AGENTES DESBLOQUEADOS:`);
    dependents.forEach(dep => {
      console.log(`   • Agente ${dep.agent}: Ejecutar ./scripts/verify_agent_dependencies.sh ${dep.agent} ${dep.week}`);
    });
  }
  
  console.log(`\n✨ Notificación completada exitosamente\n`);
}

function createPrerequisiteFile(dependentAgent, dependentWeek, completedAgent, completedWeek, depInfo) {
  const prereqFile = `.agent_status/agent_${dependentAgent}_week_${dependentWeek}_prerequisites.json`;
  
  // Leer archivo existente o crear estructura base
  let prereqs = {
    agent_id: parseInt(dependentAgent),
    week: parseInt(dependentWeek),
    pending_dependencies: [],
    completed_dependencies: [],
    all_dependencies_met: false,
    critical_information: [],
    last_updated: null
  };
  
  if (fs.existsSync(prereqFile)) {
    try {
      prereqs = JSON.parse(fs.readFileSync(prereqFile, 'utf8'));
    } catch (error) {
      console.log(`⚠️  Error leyendo archivo existente ${prereqFile}, creando nuevo`);
    }
  }
  
  // Actualizar dependencias
  const completedDep = `AGENT_${completedAgent}_WEEK_${completedWeek}_COMPLETE`;
  
  if (!prereqs.completed_dependencies.includes(completedDep)) {
    prereqs.completed_dependencies.push(completedDep);
  }
  
  prereqs.pending_dependencies = prereqs.pending_dependencies.filter(
    dep => dep !== completedDep
  );
  
  // Agregar información crítica
  if (depInfo.critical_info && !prereqs.critical_information.some(info => info.from_agent === completedAgent)) {
    prereqs.critical_information.push({
      from_agent: parseInt(completedAgent),
      from_week: parseInt(completedWeek),
      message: depInfo.critical_info,
      timestamp: new Date().toISOString()
    });
  }
  
  // Verificar si todas las dependencias están satisfechas
  prereqs.all_dependencies_met = prereqs.pending_dependencies.length === 0;
  prereqs.last_updated = new Date().toISOString();
  
  // Guardar archivo actualizado
  fs.writeFileSync(prereqFile, JSON.stringify(prereqs, null, 2));
  console.log(`      📄 Actualizado: ${prereqFile}`);
  
  if (prereqs.all_dependencies_met) {
    console.log(`      🚀 ¡Agente ${dependentAgent} está LISTO para Semana ${dependentWeek}!`);
  } else {
    console.log(`      ⏳ Agente ${dependentAgent} aún espera: ${prereqs.pending_dependencies.length} dependencia(s)`);
  }
}

function showUsage() {
  console.log(`
🔧 USO: node notify_dependent_agents.js [AGENT_ID] [WEEK]

📋 EJEMPLOS:
   node notify_dependent_agents.js 3 1    # Agente 3 completó Semana 1
   node notify_dependent_agents.js 4 1    # Agente 4 completó Semana 1
   node notify_dependent_agents.js 5 2    # Agente 5 completó Semana 2

📊 MATRIZ DE DEPENDENCIAS ACTUAL:
   • Agente 3, Semana 1 → Desbloquea Agente 4, Semana 1
   • Agente 4, Semana 1 → Desbloquea Agente 5, Semana 1
   • Agente 4, Semana 2 → Desbloquea Agente 5, Semana 2
   • Agente 2, Semana 2 → Desbloquea Agente 4, Semana 2

🎯 PROPÓSITO:
   Este script notifica automáticamente cuando un agente completa su trabajo,
   creando los archivos de estado necesarios y desbloqueando agentes dependientes.
`);
}

// Función principal
function main() {
  const [,, agentId, week] = process.argv;
  
  if (!agentId || !week) {
    showUsage();
    process.exit(1);
  }
  
  if (!/^\d+$/.test(agentId) || !/^\d+$/.test(week)) {
    console.log(`❌ ERROR: AGENT_ID y WEEK deben ser números`);
    console.log(`   Recibido: AGENT_ID="${agentId}", WEEK="${week}"`);
    showUsage();
    process.exit(1);
  }
  
  if (parseInt(agentId) < 1 || parseInt(agentId) > 5) {
    console.log(`❌ ERROR: AGENT_ID debe estar entre 1 y 5`);
    console.log(`   Recibido: AGENT_ID="${agentId}"`);
    process.exit(1);
  }
  
  if (parseInt(week) < 1 || parseInt(week) > 10) {
    console.log(`❌ ERROR: WEEK debe estar entre 1 y 10`);
    console.log(`   Recibido: WEEK="${week}"`);
    process.exit(1);
  }
  
  try {
    notifyCompletion(agentId, week);
  } catch (error) {
    console.log(`❌ ERROR durante la notificación: ${error.message}`);
    console.log(`📋 Stack trace:`, error.stack);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { notifyCompletion, createPrerequisiteFile, DEPENDENCY_MATRIX };

