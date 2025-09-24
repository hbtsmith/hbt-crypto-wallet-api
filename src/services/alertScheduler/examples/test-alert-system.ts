/**
 * Script de exemplo para testar o sistema de alertas
 * Execute com: tsx src/services/alertScheduler/examples/test-alert-system.ts
 */

import { getAlertSchedulerService } from '../index';
import { getNotificationService } from '../../notifications';
import { PriceAlertChecker } from '../PriceAlertChecker';

async function testAlertSystem() {
  console.log('🧪 Iniciando testes do sistema de alertas...\n');

  try {
    // 1. Testar inicialização dos serviços
    console.log('1️⃣ Testando inicialização dos serviços...');
    
    const notificationService = await getNotificationService();
    console.log('✅ Serviço de notificações inicializado');
    console.log(`   Projeto: ${notificationService.getProjectInfo().projectId}`);
    
    const schedulerService = await getAlertSchedulerService();
    console.log('✅ Serviço de agendamento inicializado');
    console.log(`   Redis: ${schedulerService.getConnectionInfo().redis}`);
    console.log(`   Fila: ${schedulerService.getConnectionInfo().queue}\n`);

    // 2. Testar estatísticas da fila
    console.log('2️⃣ Testando estatísticas da fila...');
    const stats = await schedulerService.getQueueStats();
    console.log('📊 Estatísticas da fila:');
    console.log(`   Total de jobs: ${stats.totalJobs}`);
    console.log(`   Jobs ativos: ${stats.activeJobs}`);
    console.log(`   Jobs completados: ${stats.completedJobs}`);
    console.log(`   Jobs com falha: ${stats.failedJobs}`);
    console.log(`   Jobs aguardando: ${stats.waitingJobs}\n`);

    // 3. Testar verificação imediata
    console.log('3️⃣ Testando verificação imediata de preços...');
    const jobId = await schedulerService.triggerImmediatePriceCheck();
    console.log(`✅ Job de verificação imediata criado: ${jobId}\n`);

    // 4. Testar verificação manual de alertas
    console.log('4️⃣ Testando verificação manual de alertas...');
    const priceChecker = new PriceAlertChecker();
    const summary = await priceChecker.checkAllActiveAlerts();
    console.log('📋 Resumo da verificação:');
    console.log(`   Total de alertas: ${summary.totalAlerts}`);
    console.log(`   Alertas verificados: ${summary.checkedAlerts}`);
    console.log(`   Alertas acionados: ${summary.triggeredAlerts}`);
    console.log(`   Erros: ${summary.errors.length}`);
    
    if (summary.errors.length > 0) {
      console.log('   Detalhes dos erros:');
      summary.errors.forEach((error, index) => {
        console.log(`     ${index + 1}. ${error}`);
      });
    }
    console.log('');

    // 5. Testar notificação de exemplo
    console.log('5️⃣ Testando envio de notificação de exemplo...');
    const testResult = await notificationService.sendPriceAlertNotification(
      'test-device-token',
      {
        symbol: 'BTC',
        currentPrice: 50000,
        targetPrice: 45000,
        direction: 'CROSS_UP',
        alertId: 'test-alert-123',
      }
    );
    
    if (testResult.success) {
      console.log('✅ Notificação de teste enviada com sucesso');
      console.log(`   Message ID: ${testResult.messageId}`);
    } else {
      console.log('❌ Falha ao enviar notificação de teste');
      console.log(`   Erro: ${testResult.error}`);
    }
    console.log('');

    // 6. Aguardar um pouco e verificar novamente as estatísticas
    console.log('6️⃣ Aguardando processamento e verificando estatísticas...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const updatedStats = await schedulerService.getQueueStats();
    console.log('📊 Estatísticas atualizadas:');
    console.log(`   Total de jobs: ${updatedStats.totalJobs}`);
    console.log(`   Jobs ativos: ${updatedStats.activeJobs}`);
    console.log(`   Jobs completados: ${updatedStats.completedJobs}`);
    console.log(`   Jobs com falha: ${updatedStats.failedJobs}`);
    console.log(`   Jobs aguardando: ${updatedStats.waitingJobs}\n`);

    console.log('🎉 Testes concluídos com sucesso!');
    console.log('\n💡 Próximos passos:');
    console.log('   1. Configure as variáveis de ambiente do Firebase');
    console.log('   2. Crie alertas via API: POST /token-alerts');
    console.log('   3. Configure device tokens: PUT /auth/device-token');
    console.log('   4. Monitore via endpoints internos: /internal/alerts/*');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    console.error('\n🔧 Verifique:');
    console.error('   1. Se o Redis está rodando');
    console.error('   2. Se as variáveis de ambiente estão configuradas');
    console.error('   3. Se o banco de dados está acessível');
  }
}

// Executa os testes se o script for chamado diretamente
if (require.main === module) {
  testAlertSystem()
    .then(() => {
      console.log('\n✅ Script finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script falhou:', error);
      process.exit(1);
    });
}

export { testAlertSystem };
