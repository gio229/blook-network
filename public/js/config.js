/**
 * Configuration and Constants
 */
const DOM_SELECTORS = {
  // Auth
  AUTH_SCREEN: '#auth-screen',
  LOGIN_BTN: '#login-btn',
  SIGNUP_BTN: '#signup-btn',
  USER_INPUT: '#user-in',
  PASS_INPUT: '#pass-in',

  // Sidebar
  SIDEBAR: '#sidebar',
  PROFILE_TAG: '#sidebar-profile-tag',
  COINS_COUNT: '#sidebar-coins-count',
  NAV_BUTTONS: '.nav-btn',
  LOGOUT_BTN: '#logout-btn',

  // Main Content
  MAIN_CONTENT: '#main-content',
  WINDOWS: '.window',

  // Market
  MARKET_CARDS: '#market-cards-container',

  // Collection
  COLLECTION_GRID: '#collection-grid-container',

  // Fusion
  FORGE_INPUT: '#forge-blook-input',
  MERGE_BTN: '#merge-btn',

  // Auction
  LISTINGS_HOOK: '#listings-hook',
  AUC_BLOOK_NAME: '#auc-blook-name',
  AUC_TOKEN_PRICE: '#auc-token-price',
  POST_AUCTION_BTN: '#post-auction-btn',

  // Chat
  CHAT_BOX: '#chat-window-box',
  CHAT_INPUT: '#chat-entry-box',
  SEND_CHAT_BTN: '#send-chat-btn',

  // Wheel
  WHEEL_SPIN_BTN: '#wheel-spin-btn',

  // Unbox Overlay
  UNBOX_OVERLAY: '#unbox-overlay',
  PACK_WRAPPER: '#pack-wrapper-node',
  REWARD_CARD: '#reward-reveal-card',
  REWARD_GLYPH: '#reward-glyph',
  REWARD_TITLE: '#reward-title',
  REWARD_BADGE: '#reward-tier-badge',
  COLLECT_BTN: '#collect-btn',

  // Admin
  ADMIN_PANEL: '#admin-panel',
  ADMIN_USER: '#adm-target-user',
  ADMIN_ROLE_SELECT: '#adm-role-select',
  ADMIN_ROLE_BTN: '#admin-role-btn',
  ADMIN_BLOOK: '#adm-blook',
  ADMIN_COINS: '#adm-coins',
  ADMIN_INJECT_BTN: '#admin-inject-btn',
};

const SOCKET_EVENTS = {
  AUTH: 'auth',
  AUTH_RESPONSE: 'auth_res',
  BUY_PACK: 'buy_pack',
  PACK_REWARD: 'pack_reward_reveal',
  FORCE_SYNC: 'force_sync',
  SYSTEM_ERROR: 'sys_err',
  SYSTEM_MESSAGE: 'sys_msg',
  SYNC_AUCTIONS: 'sync_auctions',
  SYNC_TRADES: 'sync_trades',
  RECEIVE_CHAT: 'receive_chat',
  SEND_CHAT: 'send_chat',
  WHEEL_SUCCESS: 'wheel_success',
  MERGE_SUCCESS: 'merge_success',
  MERGE_BLOOKS: 'merge_blooks',
  POST_AUCTION: 'post_auction',
  BUY_AUCTION: 'buy_auction',
  SPIN_WHEEL: 'spin_wheel',
  ADMIN_ACTION: 'admin_action',
};

const ANIMATIONS = {
  PACK_SHAKE: 'shake-loop',
  PACK_BURST: 'burst-exit',
};

const RARITY_CLASSES = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  CHROMA: 'chroma',
};

const ROLES = {
  ADMIN: 'admin',
  MOD: 'mod',
  USER: 'user',
};

const VIEWS = {
  MARKET: 'market',
  COLLECTION: 'collection',
  FUSION: 'fusion',
  AUCTION: 'auction',
  CHAT: 'chat',
  WHEEL: 'wheel',
};

const TIMEOUTS = {
  PACK_BURST: 400,
};
