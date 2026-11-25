import './style.css'
import { supabase } from './supabase.js'

document.querySelector('#app').innerHTML = `
  <header class="topbar">
    <div class="brand">
      <div class="brand-icon">C</div>
      <div>
        <strong>CARLOS</strong>
        <span>FEDELTÀ DIGITALE</span>
      </div>
    </div>
    <span class="online"><i></i> PROGRAMMA FEDELTÀ</span>
  </header>

  <main>
    <section class="welcome">
      <span class="eyebrow">CAFFETTERIA CARLOS · REWARDS CLUB</span>
      <h1>Un piccolo gesto,<br><em>un grande premio.</em></h1>
      <p>Premiamo la tua fedeltà, una consumazione alla volta.</p>
    </section>

    <section class="dashboard">
      <div class="section-heading">
        <div>
          <span class="eyebrow">IL TUO PROGRAMMA</span>
          <h2>La tua tessera digitale</h2>
        </div>
        <span class="status">ATTIVA</span>
      </div>

      <div class="loyalty-card">
        <div class="card-top">
          <div>
            <span class="card-label">CAFFETTERIA</span>
            <h2>CARLOS<span>.</span></h2>
          </div>
          <div class="coffee-icon">☕</div>
        </div>

        <div class="card-middle">
          <span>IL TUO PERCORSO FEDELTÀ</span>
          <strong id="progress">00 <small>/ 10</small></strong>
        </div>

        <div class="stamps" id="stamps">
          ${Array.from({length:10},(_,i)=>`
            <div class="stamp">
              <span>${String(i+1).padStart(2,'0')}</span>
              <b>☕</b>
            </div>
          `).join('')}
        </div>

        <div class="card-bottom">
          <span>10 CONSUMAZIONI</span>
          <span>1 PREMIO</span>
        </div>
      </div>

      <div class="reward">
        <div class="reward-icon">✦</div>
        <div>
          <span class="eyebrow">IL TUO PROSSIMO PREMIO</span>
          <h3>Un premio ti aspetta!</h3>
          <p>Raggiungi 10 consumazioni e ricevi il tuo premio.</p>
        </div>
      </div>
    </section>

    <section class="admin-section">
      <div>
        <span class="eyebrow">AREA RISERVATA</span>
        <h2>Gestione Caffetteria</h2>
        <p>Gestisci clienti, tessere digitali e premi dal tuo pannello.</p>
      </div>
      <button id="adminButton">ACCEDI AL PANNELLO <span>→</span></button>
    </section>
  </main>

  <footer>
    <strong>CARLOS.</strong>
    <span>Il piacere di tornare.</span>
  </footer>

  <div id="loginModal" class="login-modal" hidden>
    <div class="login-box">
      <button type="button" id="closeLogin" class="login-close">×</button>
      <span class="eyebrow">AREA RISERVATA</span>
      <h2>Accesso amministratore</h2>
      <p>Inserisci le tue credenziali per entrare.</p>
      <form id="loginForm">
        <label for="adminEmail">Email</label>
        <input id="adminEmail" type="email" autocomplete="username" required placeholder="La tua email">
        <label for="adminPassword">Password</label>
        <input id="adminPassword" type="password" autocomplete="current-password" required placeholder="La tua password">
        <p id="loginMessage" role="alert"></p>
        <button type="submit" id="loginSubmit">ACCEDI</button>
      </form>
    </div>
  </div>
`

const style = document.createElement('style')
style.textContent = `
.login-modal[hidden] { display: none; }
.login-modal {
  position: fixed; inset: 0; z-index: 1000;
  display: grid; place-items: center;
  padding: 20px; background: #241912bb;
}
.login-box {
  position: relative; width: min(100%, 420px);
  padding: 35px; border-radius: 16px;
  background: #fffdf9; box-shadow: 0 20px 70px #0004;
}
.login-box h2 { font-family: Georgia,serif; font-weight: 500; margin: 12px 0; }
.login-box > p { color: #8a7a6b; font-size: 13px; }
.login-box label { display: block; margin: 17px 0 7px; font-size: 12px; }
.login-box input {
  width: 100%; padding: 13px; border: 1px solid #d9cdbd;
  border-radius: 7px; font: inherit; background: white;
}
.login-box form button {
  width: 100%; margin-top: 18px; padding: 14px;
  border: 0; border-radius: 7px; color: white;
  background: #493124; cursor: pointer;
}
.login-close {
  position: absolute; top: 12px; right: 15px;
  border: 0; background: none; font-size: 26px; cursor: pointer;
}
#loginMessage { color: #a33; font-size: 12px; min-height: 18px; }
`
document.head.appendChild(style)

const modal = document.querySelector('#loginModal')
const message = document.querySelector('#loginMessage')
const submit = document.querySelector('#loginSubmit')

document.querySelector('#adminButton').addEventListener('click', () => {
  modal.hidden = false
})

document.querySelector('#closeLogin').addEventListener('click', () => {
  modal.hidden = true
})

modal.addEventListener('click', (event) => {
  if (event.target === modal) modal.hidden = true
})

document.querySelector('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault()
  message.textContent = ''
  submit.disabled = true
  submit.textContent = 'VERIFICA IN CORSO...'

  const email = document.querySelector('#adminEmail').value.trim()
  const password = document.querySelector('#adminPassword').value

  try {
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (loginError) throw loginError

    const { data: isAdmin, error: adminError } =
      await supabase.rpc('verifica_amministratore')

    if (adminError) throw adminError

    if (isAdmin !== true) {
      await supabase.auth.signOut()
      throw new Error('Questo account non è autorizzato come amministratore.')
    }

    document.querySelector('.login-box').innerHTML = `
      <span class="eyebrow">AREA RISERVATA</span>
      <h2>Gestione Caffetteria</h2>
      <p>Benvenuto, Carlo! Il tuo accesso amministratore è attivo.</p>

      <h3>Nuovo cliente</h3>
      <form id="newCustomerForm">
        <label for="customerName">Nome</label>
        <input id="customerName" required placeholder="Nome cliente">

        <label for="customerSurname">Cognome</label>
        <input id="customerSurname" required placeholder="Cognome cliente">

        <label for="customerEmail">Email (facoltativa)</label>
        <input id="customerEmail" type="email" placeholder="Email cliente">

        <p id="customerMessage" role="status"></p>
        <button type="submit" id="saveCustomer">SALVA CLIENTE</button>
      </form>

      <button type="button" id="logoutButton">ESCI</button>
    `

    document.querySelector('#newCustomerForm').addEventListener('submit', async (event) => {
      event.preventDefault()

      const saveButton = document.querySelector('#saveCustomer')
      const customerMessage = document.querySelector('#customerMessage')
      saveButton.disabled = true
      saveButton.textContent = 'SALVATAGGIO...'
      customerMessage.textContent = ''

      try {
        const { data, error } = await supabase.rpc('crea_cliente', {
          p_nome: document.querySelector('#customerName').value.trim(),
          p_cognome: document.querySelector('#customerSurname').value.trim(),
          p_email: document.querySelector('#customerEmail').value.trim() || null
        })

        if (error) throw error

        const cliente = data[0]
        customerMessage.textContent =
          'Cliente salvato! Codice tessera: ' + cliente.codice_tessera

        document.querySelector('#newCustomerForm').reset()
      } catch (error) {
        customerMessage.textContent = error.message || 'Errore durante il salvataggio.'
      } finally {
        saveButton.disabled = false
        saveButton.textContent = 'SALVA CLIENTE'
      }
    })

    document.querySelector('#logoutButton').addEventListener('click', async () => {
      await supabase.auth.signOut()
      window.location.reload()
    })

  } catch (error) {
    message.textContent = error.message || 'Errore durante l’accesso.'
    submit.disabled = false
    submit.textContent = 'ACCEDI'
  }
})
