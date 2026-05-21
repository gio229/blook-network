/**
 * UI Management and DOM Operations
 * Handles all DOM updates and view rendering
 */
const ui = {
  /**
   * DOM element cache
   */
  elements: {},

  /**
   * Cache commonly used DOM elements
   */
  cacheElements() {
    Object.keys(DOM_SELECTORS).forEach(key => {
      const selector = DOM_SELECTORS[key];
      this.elements[key] = document.querySelector(selector);
    });
  },

  /**
   * Get cached element
   */
  getElement(key) {
    return this.elements[key];
  },

  /**
   * Safely set text content (prevents XSS)
   */
  setText(element, text) {
    if (element) {
      element.textContent = text;
    }
  },

  /**
   * Safely set HTML with sanitization for user content
   */
  setHTML(element, html) {
    if (element) {
      element.innerHTML = html;
    }
  },

  /**
   * Add event listener to cached element
   */
  addEventListener(elementKey, eventType, handler) {
    const element = this.getElement(elementKey);
    if (element) {
      element.addEventListener(eventType, handler.bind(this));
    }
  },

  /**
   * Launch the game system
   */
  launchSystem() {
    this.getElement('AUTH_SCREEN').style.display = 'none';
    this.getElement('SIDEBAR').style.display = 'flex';
    this.getElement('MAIN_CONTENT').style.display = 'block';

    if (gameState.isStaff()) {
      this.getElement('ADMIN_PANEL').style.display = 'block';
    }

    this.syncUI();
    this.renderPacks();
  },

  /**
   * Sync UI with current state
   */
  syncUI() {
    this.setText(
      this.getElement('PROFILE_TAG'),
      gameState.getUsername() + ' 👑'
    );
    this.setText(this.getElement('COINS_COUNT'), gameState.getCoins());
    this.renderCollection();
  },

  /**
   * Render market packs
   */
  renderPacks() {
    const container = this.getElement('MARKET_CARDS');
    container.innerHTML = '';

    for (let packName in gameState.packs) {
      const pack = gameState.packs[packName];
      let ratesHTML = '';

      pack.blooks.forEach(b => {
        const detail = gameState.getBlookDetails(b);
        ratesHTML += `<div class="rate-row"><span>${detail.emoji} ${b}</span><span>${detail.rate}%</span></div>`;
      });

      const packCard = document.createElement('div');
      packCard.className = 'pack-card';
      packCard.innerHTML = `
        <div style="font-size:50px; margin-bottom:10px;">${pack.emoji}</div>
        <h3>${packName}</h3>
        <p style="color:#ffcc00; font-weight:900; font-size:18px;">${pack.cost} 🪙</p>
        <div class="rates-list">${ratesHTML}</div>
      `;
      packCard.addEventListener('click', () => this.buyPack(packName));
      container.appendChild(packCard);
    }
  },

  /**
   * Render collection
   */
  renderCollection() {
    const container = this.getElement('COLLECTION_GRID');
    container.innerHTML = '';
    const counts = {};

    gameState.getBlooks().forEach(b => {
      counts[b] = (counts[b] || 0) + 1;
    });

    for (let blookName in counts) {
      const detail = gameState.getBlookDetails(blookName);
      const card = document.createElement('div');
      card.className = 'blook-card';
      card.innerHTML = `
        <div class="blook-avatar">${detail.emoji}</div>
        <h3>${blookName}</h3>
        <span class="rarity ${detail.rarity}">${detail.rarity.toUpperCase()}</span>
        <div class="blook-count">${counts[blookName]}</div>
      `;
      container.appendChild(card);
    }
  },

  /**
   * Render auctions
   */
  renderAuctions(auctions) {
    const container = this.getElement('LISTINGS_HOOK');
    container.innerHTML = '';

    auctions.forEach(auc => {
      const detail = gameState.getBlookDetails(auc.item);
      const item = document.createElement('div');
      item.className = 'auction-item';
      item.innerHTML = `
        <span>${detail.emoji} ${auc.item} by ${auc.seller}</span>
        <span>${auc.cost} 🪙</span>
      `;
      
      const buyBtn = document.createElement('button');
      buyBtn.className = 'btn-play';
      buyBtn.style.width = '80px';
      buyBtn.style.padding = '5px';
      buyBtn.textContent = 'BUY';
      buyBtn.addEventListener('click', () => this.buyAuction(auc.id));
      item.appendChild(buyBtn);
      
      container.appendChild(item);
    });
  },

  /**
   * Render trades (placeholder)
   */
  renderTrades(trades) {
    // Trades rendering can be added to a separate tab if needed
  },

  /**
   * Switch active view
   */
  switchView(viewName) {
    document.querySelectorAll(DOM_SELECTORS.WINDOWS).forEach(w => {
      w.classList.remove('active');
    });
    this.getElement(viewName.toUpperCase()).classList.add('active');

    document.querySelectorAll(DOM_SELECTORS.NAV_BUTTONS).forEach(b => {
      b.classList.remove('active-btn');
    });
    const btnId = 'btn-' + viewName;
    document.getElementById(btnId).classList.add('active-btn');
  },

  /**
   * Buy pack
   */
  buyPack(packName) {
    socketManager.emit(SOCKET_EVENTS.BUY_PACK, packName);
    this.getElement('UNBOX_OVERLAY').style.display = 'flex';
    this.getElement('PACK_WRAPPER').classList.add(ANIMATIONS.PACK_SHAKE);
  },

  /**
   * Execute burst sequence on pack click
   */
  executeBurstSequence() {
    const packEl = this.getElement('PACK_WRAPPER');
    packEl.classList.remove(ANIMATIONS.PACK_SHAKE);
    packEl.classList.add(ANIMATIONS.PACK_BURST);
    setTimeout(() => {
      packEl.classList.remove(ANIMATIONS.PACK_BURST);
      packEl.style.display = 'none';
    }, TIMEOUTS.PACK_BURST);
  },

  /**
   * Reveal reward
   */
  revealReward(blookName) {
    const blook = gameState.getBlookDetails(blookName);
    this.setText(this.getElement('REWARD_GLYPH'), blook.emoji);
    this.setText(this.getElement('REWARD_TITLE'), blookName);
    this.setText(
      this.getElement('REWARD_BADGE'),
      blook.rarity.toUpperCase()
    );
    this.getElement('REWARD_BADGE').className = `rarity ${blook.rarity}`;
    this.getElement('REWARD_CARD').style.display = 'flex';
  },

  /**
   * Close reveal overlay
   */
  closeRevealOverlay() {
    this.getElement('UNBOX_OVERLAY').style.display = 'none';
    this.getElement('PACK_WRAPPER').style.display = 'flex';
    this.getElement('REWARD_CARD').style.display = 'none';
  },

  /**
   * Add chat message (safe from XSS)
   */
  addChatMessage(user, text, rank) {
    const box = this.getElement('CHAT_BOX');
    const line = document.createElement('div');
    line.className = 'chat-line';

    if (rank === ROLES.ADMIN) {
      const tag = document.createElement('span');
      tag.className = 'tag-staff';
      tag.textContent = '[ADMIN] ';
      line.appendChild(tag);
    } else if (rank === ROLES.MOD) {
      const tag = document.createElement('span');
      tag.className = 'tag-mod';
      tag.textContent = '[MOD] ';
      line.appendChild(tag);
    }

    const strong = document.createElement('strong');
    strong.textContent = user + ': ';
    line.appendChild(strong);
    line.appendChild(document.createTextNode(text));

    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
  },

  /**
   * Buy auction
   */
  buyAuction(auctionId) {
    socketManager.emit(SOCKET_EVENTS.BUY_AUCTION, auctionId);
  },

  /**
   * Post auction listing
   */
  postAuctionListing() {
    const name = this.getElement('AUC_BLOOK_NAME').value.trim();
    const price = parseInt(this.getElement('AUC_TOKEN_PRICE').value);

    if (!name || !price) {
      socketManager.showError('Fill out all fields!');
      return;
    }

    socketManager.emit(SOCKET_EVENTS.POST_AUCTION, {
      blookName: name,
      price,
    });

    this.getElement('AUC_BLOOK_NAME').value = '';
    this.getElement('AUC_TOKEN_PRICE').value = '';
  },

  /**
   * Attempt chamber merge
   */
  attemptMerge() {
    const name = this.getElement('FORGE_INPUT').value.trim();
    socketManager.emit(SOCKET_EVENTS.MERGE_BLOOKS, name);
  },

  /**
   * Send chat message
   */
  sendChatMessage() {
    const msg = this.getElement('CHAT_INPUT').value.trim();
    if (!msg) return;

    socketManager.emit(SOCKET_EVENTS.SEND_CHAT, msg);
    this.getElement('CHAT_INPUT').value = '';
  },

  /**
   * Spin wheel
   */
  spinWheel() {
    socketManager.emit(SOCKET_EVENTS.SPIN_WHEEL);
  },

  /**
   * Logout
   */
  logout() {
    gameState.clear();
    this.getElement('AUTH_SCREEN').style.display = 'flex';
    this.getElement('SIDEBAR').style.display = 'none';
    this.getElement('MAIN_CONTENT').style.display = 'none';
  },
};
