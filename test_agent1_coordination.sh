#!/bin/bash
# test_agent1_coordination.sh
# Script de prueba para validar que el Agente 1 puede usar correctamente el nuevo sistema

echo "🧪 PRUEBA COMPLETA DEL SISTEMA DE COORDINACIÓN PARA AGENTE 1"
echo "============================================================="
echo ""

# Test 1: Verificación de estado de todos los agentes
echo "📋 TEST 1: Verificación de estado de agentes"
echo "--------------------------------------------"
for agent in 2 3 4 5; do
  echo "Agente $agent, Semana 1:"
  result=$(./scripts/verify_agent_dependencies.sh $agent 1 2>/dev/null)
  if echo "$result" | grep -q "AUTORIZADO"; then
    echo "  ✅ AUTORIZADO - Puede trabajar"
  elif echo "$result" | grep -q "BLOQUEADO"; then
    echo "  ❌ BLOQUEADO - No puede trabajar"
    echo "$result" | grep -A 2 "Faltan las siguientes dependencias" | sed 's/^/    /'
  else
    echo "  ⚪ Sin dependencias específicas"
  fi
  echo ""
done

# Test 2: Verificar matriz de dependencias
echo "📊 TEST 2: Matriz de dependencias accesible"
echo "-------------------------------------------"
if [[ -f "DEPENDENCY_MATRIX.json" ]]; then
  echo "✅ DEPENDENCY_MATRIX.json existe"
  
  # Verificar dependencias críticas
  critical_deps=$(cat DEPENDENCY_MATRIX.json | grep -c "critical")
  echo "✅ Dependencias críticas encontradas: $critical_deps"
  
  # Verificar estructura de agentes
  for agent in 2 3 4 5; do
    if cat DEPENDENCY_MATRIX.json | grep -q "agent_$agent"; then
      echo "✅ Configuración encontrada para Agente $agent"
    else
      echo "❌ Configuración faltante para Agente $agent"
    fi
  done
else
  echo "❌ DEPENDENCY_MATRIX.json no encontrado"
fi
echo ""

# Test 3: Verificar archivos de estado
echo "📄 TEST 3: Sistema de archivos de estado"
echo "----------------------------------------"
if [[ -d ".agent_status" ]]; then
  echo "✅ Directorio .agent_status existe"
  
  file_count=$(ls -1 .agent_status/*.json 2>/dev/null | wc -l)
  echo "📁 Archivos de estado encontrados: $file_count"
  
  if [[ $file_count -gt 0 ]]; then
    echo "📋 Archivos de estado:"
    ls -la .agent_status/*.json | sed 's/^/  /'
  fi
else
  echo "❌ Directorio .agent_status no encontrado"
fi
echo ""

# Test 4: Verificar tags de completación
echo "🏷️  TEST 4: Sistema de tags de completación"
echo "-------------------------------------------"
tag_count=$(git tag -l | grep -c "AGENT_.*_WEEK_.*_COMPLETE" || echo "0")
echo "🏷️  Tags de completación encontrados: $tag_count"

if [[ $tag_count -gt 0 ]]; then
  echo "📋 Tags existentes:"
  git tag -l | grep "AGENT_.*_WEEK_.*_COMPLETE" | sed 's/^/  /'
fi
echo ""

# Test 5: Simular decisión de coordinación
echo "🎯 TEST 5: Simulación de decisión de coordinación"
echo "-------------------------------------------------"
echo "Escenario: Migración Frontend-First Next.js"
echo ""

echo "ANÁLISIS DE DISPONIBILIDAD:"
echo "- Agente 2 (HTML): $(./scripts/verify_agent_dependencies.sh 2 1 2>/dev/null | grep -o -E "(AUTORIZADO|BLOQUEADO)" || echo "DISPONIBLE")"
echo "- Agente 3 (Datos): $(./scripts/verify_agent_dependencies.sh 3 1 2>/dev/null | grep -o -E "(AUTORIZADO|BLOQUEADO)" || echo "DISPONIBLE")"
echo "- Agente 4 (Next.js): $(./scripts/verify_agent_dependencies.sh 4 1 2>/dev/null | grep -o -E "(AUTORIZADO|BLOQUEADO)" || echo "DISPONIBLE")"
echo "- Agente 5 (Testing): $(./scripts/verify_agent_dependencies.sh 5 1 2>/dev/null | grep -o -E "(AUTORIZADO|BLOQUEADO)" || echo "DISPONIBLE")"
echo ""

echo "DECISIÓN RECOMENDADA PARA SEMANA 1:"
if ./scripts/verify_agent_dependencies.sh 3 1 2>/dev/null | grep -q "AUTORIZADO"; then
  echo "✅ Agente 3 [A] - Análisis de datos (AUTORIZADO)"
else
  echo "❌ Agente 3 [a] - Análisis de datos (BLOQUEADO)"
fi

if ./scripts/verify_agent_dependencies.sh 4 1 2>/dev/null | grep -q "AUTORIZADO"; then
  echo "✅ Agente 4 [A] - Migración Next.js (AUTORIZADO)"
else
  echo "⏳ Agente 4 [a] - Migración Next.js (BLOQUEADO - Esperando Agente 3)"
fi

if ./scripts/verify_agent_dependencies.sh 5 1 2>/dev/null | grep -q "AUTORIZADO"; then
  echo "✅ Agente 5 [A] - Testing setup (AUTORIZADO)"
else
  echo "⏳ Agente 5 [a] - Testing setup (BLOQUEADO - Esperando Agente 4)"
fi
echo ""

# Test 6: Verificar comandos de monitoreo
echo "📊 TEST 6: Comandos de monitoreo"
echo "--------------------------------"
echo "Últimos commits de completación:"
recent_commits=$(git log --oneline --grep="AGENT_.*_WEEK_.*_COMPLETE" | head -3)
if [[ -n "$recent_commits" ]]; then
  echo "$recent_commits" | sed 's/^/  /'
else
  echo "  No hay commits de completación recientes"
fi
echo ""

# Test 7: Verificar scripts funcionando
echo "🔧 TEST 7: Scripts del sistema"
echo "------------------------------"
if [[ -x "./scripts/verify_agent_dependencies.sh" ]]; then
  echo "✅ verify_agent_dependencies.sh es ejecutable"
else
  echo "❌ verify_agent_dependencies.sh no es ejecutable"
fi

if [[ -f "./scripts/notify_dependent_agents.cjs" ]]; then
  echo "✅ notify_dependent_agents.cjs existe"
else
  echo "❌ notify_dependent_agents.cjs no encontrado"
fi
echo ""

# Resumen final
echo "📋 RESUMEN DE LA PRUEBA"
echo "======================"
echo ""

# Contar tests pasados
tests_passed=0
total_tests=7

# Verificar cada test
[[ -f "DEPENDENCY_MATRIX.json" ]] && ((tests_passed++))
[[ -d ".agent_status" ]] && ((tests_passed++))
[[ $tag_count -gt 0 ]] && ((tests_passed++))
[[ -x "./scripts/verify_agent_dependencies.sh" ]] && ((tests_passed++))
[[ -f "./scripts/notify_dependent_agents.cjs" ]] && ((tests_passed++))

# Verificar disponibilidad de agentes
agent2_available=$(./scripts/verify_agent_dependencies.sh 2 1 2>/dev/null | grep -q "AUTORIZADO" && echo "1" || echo "0")
agent3_available=$(./scripts/verify_agent_dependencies.sh 3 1 2>/dev/null | grep -q "AUTORIZADO" && echo "1" || echo "0")

[[ $agent2_available -eq 1 && $agent3_available -eq 1 ]] && ((tests_passed++))

# Verificar que el sistema bloquea correctamente
agent5_blocked=$(./scripts/verify_agent_dependencies.sh 5 1 2>/dev/null | grep -q "BLOQUEADO" && echo "1" || echo "0")
[[ $agent5_blocked -eq 1 ]] && ((tests_passed++))

echo "Tests pasados: $tests_passed/$total_tests"
echo ""

if [[ $tests_passed -eq $total_tests ]]; then
  echo "🎉 ✅ TODOS LOS TESTS PASADOS"
  echo "El sistema de coordinación está funcionando correctamente."
  echo "El Agente 1 puede usar todas las herramientas de coordinación."
elif [[ $tests_passed -ge 5 ]]; then
  echo "⚠️  ✅ MAYORÍA DE TESTS PASADOS"
  echo "El sistema funciona en su mayoría, pero hay algunos problemas menores."
else
  echo "❌ ⚠️  TESTS FALLIDOS"
  echo "Hay problemas significativos que deben resolverse."
fi

echo ""
echo "🎯 PRÓXIMOS PASOS PARA AGENTE 1:"
echo "1. Usar ./scripts/verify_agent_dependencies.sh antes de asignar trabajo"
echo "2. Consultar DEPENDENCY_MATRIX.json para entender dependencias"
echo "3. Monitorear .agent_status/ para ver completaciones"
echo "4. Comunicar claramente dependencias al usuario"
echo ""
echo "📋 Prueba completada: $(date)"

