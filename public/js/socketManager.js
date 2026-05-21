/**
 * Socket.IO Event Management
 * Centralized socket event handlers
 */
const socketManager = {
  socket: io(),
  listeners: {},

  /**
   * Register all socket event listeners
   */
  registerListeners() {
    this.on(SOCKET_EVENTS.AUTH_RESPONSE, this.handleAuthResponse);
    this.on(SOCKET_EVENTS.PACK_REWARD, this.handlePackReward);
    this.on(SOCKET_EVENTS.FORCE_SYNC, this.handleForceSync);
    this.on(SOCKET_EVENTS.SYSTEM_ERROR, this.handleSystemError);
    this.on(SOCKET_EVENTS.SYSTEM_MESSAGE, this.handleSystemMessage);
    this.on(SOCKET_EVENTS.SYNC_AUCTIONS, this.handleSyncAuctions);
    this.on(SOCKET_EVENTS.SYNC_TRADES, this.handleSyncTrades);
    this.on(SOCKET_EVENTS.RECEIVE_CHAT, this.handleReceiveChat);
    this.on(SOCKET_EVENTS.WHEEL_SUCCESS, this.handleWheelSuccess);
    this.on(SOCKET_EVENTS.MERGE_SUCCESS, this.handleMergeSuccess);
  },

  /**
   * Register socket event
   */
  on(eventName, handler) {
    this.socket.on(eventName, handler.bind(this));
  },

  /**
   * Emit socket event
   */
  emit(eventName, data) {
    try {
      this.socket.emit(eventName, data);
    } catch (error) {
      console.error(`Socket emit error for ${eventName}:`, error);
    }
  },

  /**
   * Handle authentication response
   */
  handleAuthResponse(data) {
    if (data.success) {
      gameState.init(data);
      ui.launchSystem();
    } else {
      this.showError(data.msg || 'Authentication failed');
    }
  },

  /**
   * Handle pack reward reveal
   */
  handlePackReward(blookName) {
    ui.revealReward(blookName);
  },

  /**
   * Handle force sync
   */
  handleForceSync(userData) {
    gameState.updateUser(userData);
    ui.syncUI();
  },

  /**
   * Handle system error
   */
  handleSystemError(msg) {
    this.showError(msg);
  },

  /**
   * Handle system message
   */
  handleSystemMessage(msg) {
    ui.addChatMessage('SYSTEM', msg, ROLES.ADMIN);
  },

  /**
   * Handle auction sync
   */
  handleSyncAuctions(auctions) {
    ui.renderAuctions(auctions);
  },

  /**
   * Handle trades sync
   */
  handleSyncTrades(trades) {
    ui.renderTrades(trades);
  },

  /**
   * Handle receive chat
   */
  handleReceiveChat(msg) {
    ui.addChatMessage(msg.username, msg.text, msg.rank);
  },

  /**
   * Handle wheel success
   */
  handleWheelSuccess(prize) {
    this.showSuccess(`Won ${prize} coins!`);
    gameState.addCoins(prize);
    ui.syncUI();
  },

  /**
   * Handle merge success
   */
  handleMergeSuccess(data) {
    this.showSuccess(`Merged ${data.original} into ${data.reward}!`);
    ui.syncUI();
  },

  /**
   * Show error notification
   */
  showError(message) {
    alert(message);
  },

  /**
   * Show success notification
   */
  showSuccess(message) {
    alert(message);
  },
};
