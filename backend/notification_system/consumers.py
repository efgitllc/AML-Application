from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist
import json
import logging

logger = logging.getLogger(__name__)

class NotificationConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for real-time notifications
    """
    async def connect(self):
        """Handle WebSocket connection"""
        try:
            # Get user from scope (added by authentication middleware)
            self.user = self.scope["user"]
            if not self.user.is_authenticated:
                await self.close()
                return

            # Add user to their personal notification group
            self.notification_group = f"user_{self.user.id}_notifications"
            await self.channel_layer.group_add(
                self.notification_group,
                self.channel_name
            )

            # Accept the connection
            await self.accept()
            
            # Send any pending notifications
            await self.send_pending_notifications()
        except Exception as e:
            logger.error(f"WebSocket connection failed: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        try:
            # Remove user from their notification group
            if hasattr(self, 'notification_group'):
                await self.channel_layer.group_discard(
                    self.notification_group,
                    self.channel_name
                )
        except Exception as e:
            logger.error(f"WebSocket disconnection error: {str(e)}")

    async def receive_json(self, content):
        """Handle incoming WebSocket messages"""
        try:
            message_type = content.get('type')
            if message_type == 'mark_read':
                await self.mark_notifications_read(content.get('notification_ids', []))
            elif message_type == 'subscribe':
                await self.handle_subscription(content.get('topics', []))
            else:
                await self.send_json({
                    'type': 'error',
                    'message': 'Unsupported message type'
                })
        except Exception as e:
            logger.error(f"Error processing WebSocket message: {str(e)}")
            await self.send_json({
                'type': 'error',
                'message': 'Failed to process message'
            })

    async def notification(self, event):
        """Handle notification messages from channel layer"""
        try:
            # Send notification to WebSocket
            await self.send_json({
                'type': 'notification',
                'notification': event['notification']
            })
        except Exception as e:
            logger.error(f"Error sending notification: {str(e)}")

    @database_sync_to_async
    def send_pending_notifications(self):
        """Send pending notifications to user"""
        from .models import Notification
        try:
            notifications = Notification.objects.filter(
                user=self.user,
                is_read=False
            ).order_by('-created_at')[:10]

            for notification in notifications:
                self.channel_layer.group_send(
                    self.notification_group,
                    {
                        'type': 'notification',
                        'notification': {
                            'id': str(notification.id),
                            'title': notification.title,
                            'message': notification.message,
                            'notification_type': notification.notification_type,
                            'created_at': notification.created_at.isoformat(),
                            'data': notification.data
                        }
                    }
                )
        except Exception as e:
            logger.error(f"Error sending pending notifications: {str(e)}")

    @database_sync_to_async
    def mark_notifications_read(self, notification_ids):
        """Mark notifications as read"""
        from .models import Notification
        try:
            Notification.objects.filter(
                id__in=notification_ids,
                user=self.user
            ).update(is_read=True)

            await self.send_json({
                'type': 'notifications_marked_read',
                'notification_ids': notification_ids
            })
        except Exception as e:
            logger.error(f"Error marking notifications as read: {str(e)}")
            await self.send_json({
                'type': 'error',
                'message': 'Failed to mark notifications as read'
            })

    async def handle_subscription(self, topics):
        """Handle topic subscriptions"""
        try:
            for topic in topics:
                topic_group = f"topic_{topic}"
                await self.channel_layer.group_add(
                    topic_group,
                    self.channel_name
                )
            
            await self.send_json({
                'type': 'subscription_success',
                'topics': topics
            })
        except Exception as e:
            logger.error(f"Error handling subscription: {str(e)}")
            await self.send_json({
                'type': 'error',
                'message': 'Failed to subscribe to topics'
            }) 