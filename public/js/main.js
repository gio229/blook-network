/**
 * Main Application Initialization
 * Entry point for the application
 */

document.addEventListener('DOMContentLoaded', function () {
  // Cache DOM elements
  ui.cacheElements();

  // Register socket listeners
  socketManager.registerListeners();

  // Setup event listeners for authentication
  ui.addEventListener('LOGIN_BTN', 'click', () => handleAuth('login'));
  ui.addEventListener('SIGNUP_BTN', 'click', () => handleAuth('signup'));

  // Setup event listeners for navigation
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', function () {
      const view = this.getAttribute('data-view');
      ui.switchView(view);
    });
  });

  // Setup event listeners for market
  // (Dynamic buttons will be added to pack cards)

  // Setup event listeners for fusion
  ui.addEventListener('MERGE_BTN', 'click', () => ui.attemptMerge());

  // Setup event listeners for auction
  ui.addEventListener('POST_AUCTION_BTN', 'click', () => ui.postAuctionListing());

  // Setup event listeners for chat
  ui.addEventListener('SEND_CHAT_BTN', 'click', () => ui.sendChatMessage());
  ui.addEventListener('CHAT_INPUT', 'keypress', (e) => {
    if (e.key === 'Enter') {
      ui.sendChatMessage();
    }
  });

  // Setup event listeners for wheel
  ui.addEventListener('WHEEL_SPIN_BTN', 'click', () => ui.spinWheel());

  // Setup event listeners for unbox overlay
  ui.addEventListener('PACK_WRAPPER', 'click', () => ui.executeBurstSequence());
  ui.addEventListener('COLLECT_BTN', 'click', () => ui.closeRevealOverlay());

  // Setup event listeners for logout
  ui.addEventListener('LOGOUT_BTN', 'click', () => ui.logout());

  // Setup admin event listeners
  if (gameState.isStaff()) {
    ui.addEventListener('ADMIN_ROLE_BTN', 'click', () => handleAdminRoleUpdate());
    ui.addEventListener('ADMIN_INJECT_BTN', 'click', () => handleAdminAssetInjection());
  }

  // Focus on username input on load
  const userInput = ui.getElement('USER_INPUT');
  if (userInput) {
    userInput.focus();
  }
});

/**
 * Handle authentication
 * @param {string} type - 'login' or 'signup'
 */
function handleAuth(type) {
  const username = ui.getElement('USER_INPUT').value.trim();
  const password = ui.getElement('PASS_INPUT').value.trim();

  if (!username || !password) {
    socketManager.showError(
      'Please fill out your username and password!'
    );
    return;
  }

  socketManager.emit(SOCKET_EVENTS.AUTH, {
    username,
    password,
    action: type,
  });
}

/**
 * Handle admin role update
 */
function handleAdminRoleUpdate() {
  const targetUser = ui.getElement('ADMIN_USER').value.trim();
  const role = ui.getElement('ADMIN_ROLE_SELECT').value;

  if (!targetUser) {
    socketManager.showError('Please enter a target username!');
    return;
  }

  socketManager.emit(SOCKET_EVENTS.ADMIN_ACTION, {
    target: targetUser,
    role,
  });
}

/**
 * Handle admin asset injection
 */
function handleAdminAssetInjection() {
  const blook = ui.getElement('ADMIN_BLOOK').value.trim();
  const coins = parseInt(ui.getElement('ADMIN_COINS').value) || 0;

  if (!blook && coins === 0) {
    socketManager.showError('Please enter a blook name or coin amount!');
    return;
  }

  socketManager.emit(SOCKET_EVENTS.ADMIN_ACTION, {
    target: gameState.getUsername(),
    blook,
    coins,
  });
}
