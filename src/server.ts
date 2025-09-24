import app from "./app";
import { getAlertSchedulerService } from "./services/alertScheduler";
import { getNotificationService } from "./services/notifications";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize alert and notification services
    console.log('🔄 Initializing services...');
    
    await getNotificationService();
    console.log('✅ Notification service initialized');
    
    await getAlertSchedulerService();
    console.log('✅ Alert scheduler service initialized');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Internal dashboard: http://localhost:${PORT}/internal/alerts/status`);
    });
  } catch (error) {
    console.error('❌ Error initializing server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down server...');
  
  try {
    const schedulerService = await getAlertSchedulerService();
    await schedulerService.shutdown();
    console.log('✅ Services disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting services:', error);
  }
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down server...');
  
  try {
    const schedulerService = await getAlertSchedulerService();
    await schedulerService.shutdown();
    console.log('✅ Services disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting services:', error);
  }
  
  process.exit(0);
});

startServer();
