export const mergeChatMessages = (current, incoming) => {
  const byId = new Map();
  [...current, ...incoming].forEach((message) => {
    const key = message.id ? String(message.id) : `${message.senderAlias}:${message.createdAt}:${message.text}`;
    byId.set(key, message);
  });

  return [...byId.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};
