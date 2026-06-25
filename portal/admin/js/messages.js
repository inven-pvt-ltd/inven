let conversations = [];
let selectedIndex = 0;

async function loadConversations() {
  if (!window.firebaseDb) {
    setTimeout(loadConversations, 100);
    return;
  }

  try {
    const snapshot = await window.firebaseDb.collection('messages').orderBy('createdAt', 'asc').get();
    const grouped = new Map();

    snapshot.forEach(doc => {
      const data = doc.data();
      const clientId = data.clientId;
      if (!grouped.has(clientId)) {
        grouped.set(clientId, {
          clientId: clientId,
          name: data.clientName || 'Unknown',
          avatar: data.avatar || '',
          unread: 0,
          messages: []
        });
      }
      const conv = grouped.get(clientId);
      conv.messages.push({
        id: doc.id,
        sender: data.sender,
        text: data.text,
        createdAt: data.createdAt ? data.createdAt.toDate() : null
      });
      if (data.sender !== 'admin' && !data.read) {
        conv.unread++;
      }
    });

    conversations = Array.from(grouped.values());

    if (typeof window.renderConversations === 'function') {
      window.renderConversations();
    }

    if (conversations.length === 0) {
      const conversationList = document.querySelector('#conversationList');
      if (conversationList) {
        conversationList.innerHTML = '';
      }
      const chatArea = document.querySelector('#chatArea');
      if (chatArea) {
        chatArea.innerHTML = '<p>No messages yet.</p>';
      }
      return;
    }

    if (typeof window.renderChat === 'function') {
      window.renderChat();
    }
  } catch (error) {
    console.error('Failed to load conversations:', error);
  }
}

window.sendMessage = async function() {
  const input = document.querySelector('#chatInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const conversation = conversations[selectedIndex];
  if (!conversation) return;

  // Append local message
  const newMessage = {
    id: 'local-' + Date.now(),
    sender: 'admin',
    text: text,
    createdAt: new Date()
  };
  conversation.messages.push(newMessage);
  input.value = '';

  if (typeof window.renderChat === 'function') {
    window.renderChat();
  }

  try {
    await window.firebaseDb.collection('messages').add({
      clientId: conversation.clientId,
      clientName: conversation.name,
      sender: 'admin',
      text: text,
      createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};

window.loadConversations = loadConversations;

document.addEventListener('DOMContentLoaded', loadConversations);
