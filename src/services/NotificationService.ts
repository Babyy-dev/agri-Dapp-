export interface Notification {
  id: string;
  type: 'harvest_alert' | 'quality_issue' | 'market_update' | 'compliance_warning' | 'system_update';
  title: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  actionRequired?: boolean;
  relatedBatchId?: string;
}

export class NotificationService {
  private static notifications: Notification[] = [
    {
      id: '1',
      type: 'harvest_alert',
      title: 'Optimal Harvest Window',
      message: 'Ashwagandha in Zone A ready for harvest. Weather conditions optimal for next 5 days.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
      read: false,
      actionRequired: true
    },
    {
      id: '2',
      type: 'quality_issue',
      title: 'Quality Test Alert',
      message: 'Batch ASH-2024-001 moisture content at 11.8% - approaching threshold.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      read: false,
      relatedBatchId: 'ASH-2024-001'
    },
    {
      id: '3',
      type: 'market_update',
      title: 'Price Alert',
      message: 'Ashwagandha prices increased 12.5% this week. Export opportunity to US market.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      read: true
    },
    {
      id: '4',
      type: 'compliance_warning',
      title: 'Conservation Limit Warning',
      message: 'Daily harvest quota 85% utilized in Rajasthan Zone A. Monitor closely.',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
      read: false,
      actionRequired: true
    }
  ];

  static getNotifications(): Notification[] {
    return [...this.notifications].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  static getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  static markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  static markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  static addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    this.notifications.unshift(newNotification);
  }

  static getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📋';
      case 'low': return 'ℹ️';
      default: return '📢';
    }
  }

  static getTypeIcon(type: string): string {
    switch (type) {
      case 'harvest_alert': return '🌱';
      case 'quality_issue': return '🔬';
      case 'market_update': return '📈';
      case 'compliance_warning': return '⚖️';
      case 'system_update': return '🔧';
      default: return '📢';
    }
  }
}