/**
 * Game State Management
 * Centralized state store for the application
 */
const gameState = {
  currentUser: null,
  packs: {},
  blookDetails: {},
  isAuthenticated: false,

  /**
   * Initialize state with data from server
   */
  init(data) {
    this.currentUser = data.user;
    this.packs = data.packs;
    this.blookDetails = data.blookDetails;
    this.isAuthenticated = true;
  },

  /**
   * Update user data
   */
  updateUser(userData) {
    this.currentUser = userData;
  },

  /**
   * Get current user coins
   */
  getCoins() {
    return this.currentUser?.coins || 0;
  },

  /**
   * Set current user coins
   */
  setCoins(amount) {
    if (this.currentUser) {
      this.currentUser.coins = amount;
    }
  },

  /**
   * Add coins
   */
  addCoins(amount) {
    if (this.currentUser) {
      this.currentUser.coins += amount;
    }
  },

  /**
   * Get user blooks
   */
  getBlooks() {
    return this.currentUser?.blooks || [];
  },

  /**
   * Add blook to inventory
   */
  addBlook(blookName) {
    if (this.currentUser && this.currentUser.blooks) {
      this.currentUser.blooks.push(blookName);
    }
  },

  /**
   * Get blook details
   */
  getBlookDetails(blookName) {
    return this.blookDetails[blookName] || { emoji: '📦', rarity: 'common' };
  },

  /**
   * Check if user is admin or mod
   */
  isAdmin() {
    return this.currentUser?.rank === ROLES.ADMIN;
  },

  isMod() {
    return this.currentUser?.rank === ROLES.MOD;
  },

  isStaff() {
    return this.isAdmin() || this.isMod();
  },

  /**
   * Get username
   */
  getUsername() {
    return this.currentUser?.username || '';
  },

  /**
   * Validate state
   */
  isValid() {
    return this.currentUser && this.isAuthenticated;
  },

  /**
   * Clear state on logout
   */
  clear() {
    this.currentUser = null;
    this.packs = {};
    this.blookDetails = {};
    this.isAuthenticated = false;
  },
};
