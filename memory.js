// memory.js — Simple localStorage Chat History Manager

const Memory = (() => {
  const STORAGE_KEY = "aperonix_chat_history";
  const MAX_MESSAGES = 50; // Keep last 50 messages to avoid overflow

  /**
   * Load full chat history from localStorage.
   * Returns an array of { role, content } objects.
   */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Aperonix Memory: Failed to load history.", e);
      return [];
    }
  }

  /**
   * Save a new message to history.
   * @param {"user"|"assistant"} role
   * @param {string} content
   */
  function save(role, content) {
    try {
      const history = load();
      history.push({ role, content, timestamp: Date.now() });

      // Trim to max allowed messages
      if (history.length > MAX_MESSAGES) {
        history.splice(0, history.length - MAX_MESSAGES);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn("Aperonix Memory: Failed to save message.", e);
    }
  }

  /**
   * Clear all stored chat history.
   */
  function clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Aperonix Memory: Failed to clear history.", e);
    }
  }

  /**
   * Get history formatted for API (without timestamps).
   */
  function getForAPI() {
    return load().map(({ role, content }) => ({ role, content }));
  }

  return { load, save, clear, getForAPI };
})();
