// --- Helpers OBR (SDK) com fallback ---
// Usamos OBR.* se existir; caso contrário, definimos stubs para evitar erros.
const OBR_AVAILABLE = typeof window.OBR !== 'undefined';
const OBR = window.OBR || {
  notification: {
    async show(msg) {
      console.log('OBR.notification.show fallback:', msg);
      return null;
    },
    async close(id) {
      console.log('OBR.notification.close fallback', id);
    },
  },
  // outros namespaces podem ser adicionados conforme necessidade
};

// --- UI: abas ---
const tabs = document.querySelectorAll('.tab-button');
const contents = document.querySelectorAll('.tab-content');
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    contents.forEach((c) => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// --- Anotações (localStorage) ---
const notesArea = document.getElementById('notesArea');
const EXPORT_BTN = document.getElementById('exportNotes');
const IMPORT_BTN = document.getElementById('importNotes');

notesArea.value = localStorage.getItem('mestre_notes') || '';
notesArea.addEventListener('input', () => {
  localStorage.setItem('mestre_notes', notesArea.value);
});

EXPORT_BTN.addEventListener('click', () => {
  const data = localStorage.getItem('mestre_notes') || '';
  navigator.clipboard
    ?.writeText(data)
    .then(() => {
      notify('Notas copiadas para a área de transferência', 'SUCCESS');
    })
    .catch(() => notify('Não foi possível copiar as notas', 'ERROR'));
});

IMPORT_BTN.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    notesArea.value = text;
    localStorage.setItem('mestre_notes', text);
    notify('Notas importadas da área de transferência', 'SUCCESS');
  } catch (e) {
    notify('Falha ao importar notas', 'ERROR');
  }
});

// --- Iniciativa ---
const initiativeList = document.getElementById('initiativeList');
const addInitiative = document.getElementById('addInitiative');
const clearInitiative = document.getElementById('clearInitiative');
const sortInitiative = document.getElementById('sortInitiative');
const initiativeInput = document.getElementById('initiativeInput');

function getInitiative() {
  return JSON.parse(localStorage.getItem('mestre_initiative') || '[]');
}
function setInitiative(arr) {
  localStorage.setItem('mestre_initiative', JSON.stringify(arr));
}
function renderInitiative() {
  const data = getInitiative();
  initiativeList.innerHTML = '';
  data.forEach((itm, idx) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = itm;
    const controls = document.createElement('span');
    const up = document.createElement('button');
    up.textContent = '↑';
    up.onclick = () => {
      if (idx > 0) {
        data.splice(idx, 1);
        data.splice(idx - 1, 0, itm);
        setInitiative(data);
        renderInitiative();
      }
    };
    const down = document.createElement('button');
    down.textContent = '↓';
    down.onclick = () => {
      if (idx < data.length - 1) {
        data.splice(idx, 1);
        data.splice(idx + 1, 0, itm);
        setInitiative(data);
        renderInitiative();
      }
    };
    const del = document.createElement('button');
    del.textContent = '✖';
    del.onclick = () => {
      data.splice(idx, 1);
      setInitiative(data);
      renderInitiative();
    };
    controls.appendChild(up);
    controls.appendChild(down);
    controls.appendChild(del);
    li.appendChild(span);
    li.appendChild(controls);
    initiativeList.appendChild(li);
  });
}

addInitiative.addEventListener('click', () => {
  const name = initiativeInput.value.trim();
  if (!name) return;
  const arr = getInitiative();
  arr.push(name);
  setInitiative(arr);
  initiativeInput.value = '';
  renderInitiative();
});

clearInitiative.addEventListener('click', () => {
  if (confirm('Limpar toda a lista de iniciativa?')) {
    localStorage.removeItem('mestre_initiative');
    renderInitiative();
  }
});

sortInitiative.addEventListener('click', () => {
  const arr = getInitiative();
  arr.sort((a, b) => a.localeCompare(b));
  setInitiative(arr);
  renderInitiative();
});

renderInitiative();

// --- Rolagens (com notificação via OBR se marcado) ---
const diceButtons = document.querySelectorAll('.dice-row button');
const diceResult = document.getElementById('diceResult');
const notifyOnRollCheckbox = document.getElementById('notifyOnRoll');

function notify(message, variant = 'DEFAULT') {
  // quando OBR está disponível, exibe notificação nativa
  if (
    OBR_AVAILABLE &&
    OBR.notification &&
    typeof OBR.notification.show === 'function'
  ) {
    try {
      OBR.notification.show(message, variant);
    } catch (e) {
      console.warn('OBR notify failed:', e);
    }
  } else {
    // fallback simples
    console.log('NOTIFY:', message, variant);
  }
}

diceButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const sides = parseInt(btn.dataset.dice, 10);
    // rolagem simples
    const roll = Math.floor(Math.random() * sides) + 1;
    diceResult.textContent = `🎲 Rolou ${btn.textContent}: ${roll}`;
    if (notifyOnRollCheckbox.checked) {
      notify(`Rolagem ${btn.textContent}: ${roll}`, 'INFO');
    }
  });
});

// opcional: notificar que o painel abriu (apenas se OBR disponível)
if (OBR_AVAILABLE) {
  notify('Escudo do Mestre aberto', 'SUCCESS');
}
