/*
 * vim: ts=4:sw=4:expandtab
 */
;(function() {
    'use strict';
    window.Whisper = window.Whisper || {};

    var SETTINGS = {
        OFF     : 'off',
        COUNT   : 'count',
        NAME    : 'name',
        MESSAGE : 'message'
    };

    Whisper.Notifications = new (Backbone.Collection.extend({
        initialize: function() {
            this.on('add', this.update);
            this.on('remove', this.onRemove);
        },
        onclick: function() {
            var conversation;
            var last = this.last();
            if (last) {
                conversation = ConversationController.get(last.get('conversationId'));
            }
            this.trigger('click', conversation);
            this.clear();
        },
        update: function() {
            console.log('updating notifications', this.length);
            if (this.length === 0) {
                return;
            }
            var audioNotification = storage.get('audio-notification') || false;

            var setting = storage.get('notification-setting') || 'message';
            if (setting === SETTINGS.OFF) {
                return;
            }

            var title;
            var message;
            var iconUrl;

            var newMessageCount = [
                this.length,
                this.length === 1 ? i18n('newMessage') : i18n('newMessages')
            ].join(' ');

            var last = this.last();
            switch (this.getSetting()) {
              case SETTINGS.COUNT:
                title = 'Signal';
                message = newMessageCount;
                break;
              case SETTINGS.NAME:
                title = newMessageCount;
                message = 'Most recent from ' + last.get('title');
                iconUrl = last.get('iconUrl');
                break;
              case SETTINGS.MESSAGE:
                title = last.get('title');
                message = last.get('message');
                iconUrl = last.get('iconUrl');
                break;
            }
            var notification = new Notification(title, {
                body   : message,
                icon   : iconUrl,
                tag    : 'signal',
                silent : !audioNotification
            });
            notification.onclick = this.onclick.bind(this);
        },
        getSetting: function() {
            return storage.get('notification-setting') || 'message';
        },
        showMessage: function() {
            return this.getSetting() === SETTINGS.MESSAGE;
        },
        showSender: function() {
            var setting = this.getSetting();
            return (setting === SETTINGS.MESSAGE || setting === SETTINGS.NAME);
        },
        onRemove: function() {
            console.log('remove notification');
            if (this.length === 0) {
                return;
            }
        },
        clear: function() {
            this.reset([]);
        }
    }))();
})();
