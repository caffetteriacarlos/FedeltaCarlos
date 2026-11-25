import QRCode from 'qrcode'
import { Html5Qrcode } from 'html5-qrcode'
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

    <section class="registration-section">
      <span class="eyebrow">CARLOS REWARDS CLUB</span>
      <h2>Entra nel club!</h2>
      <p>Registrati gratuitamente e ricevi la tua tessera fedeltà digitale.</p>

      <form id="registrationForm">
        <label for="customerName">Nome</label>
        <input id="customerName" type="text" required minlength="2" maxlength="60" placeholder="Il tuo nome">

        <label for="customerSurname">Cognome</label>
        <input id="customerSurname" type="text" required minlength="2" maxlength="60" placeholder="Il tuo cognome">

        <label for="customerPhone">Numero di telefono</label>
        <input id="customerPhone" type="tel" required minlength="8" maxlength="20" placeholder="Il tuo numero">

        <button type="submit" id="registrationSubmit">CREA LA MIA TESSERA</button>
        <p id="registrationMessage" role="status"></p>
      </form>

      <div id="newLoyaltyCard" hidden>
        <h3>La tua tessera è pronta!</h3>
        <p>Conserva questo QR: ti servirà per ricevere i timbri.</p>
        <div id="newCustomerQr"></div>
        <button type="button" id="downloadCustomerQr">SCARICA IL MIO QR</button>
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
  position: relative; width: min(100%, 520px);
  max-height: 90vh; overflow-y: auto;
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
#qrReader { width: 100%; margin: 15px auto; }
#qrReader video { border-radius: 10px; }
#scanMessage { font-size: 13px; }
#scannedCustomer { margin: 12px 0; }
#loginMessage { color: #a33; font-size: 12px; min-height: 18px; }
`
document.head.appendChild(style)


const registrationStyle = document.createElement('style')
registrationStyle.textContent = `
.registration-section {
  max-width: 520px;
  margin: 35px auto;
  padding: 28px;
  border-radius: 16px;
  background: #fffdf9;
  box-shadow: 0 10px 35px #49312412;
}
.registration-section h2 {
  font-family: Georgia, serif;
  font-weight: 500;
  margin: 12px 0;
}
.registration-section p {
  color: #8a7a6b;
  font-size: 13px;
}
.registration-section label {
  display: block;
  margin: 17px 0 7px;
  font-size: 12px;
}
.registration-section input {
  width: 100%;
  padding: 13px;
  border: 1px solid #d9cdbd;
  border-radius: 7px;
  font: inherit;
  background: white;
}
.registration-section form button,
#downloadCustomerQr {
  width: 100%;
  margin-top: 18px;
  padding: 14px;
  border: 0;
  border-radius: 7px;
  color: white;
  background: #493124;
  cursor: pointer;
}
#newCustomerQr {
  display: flex;
  justify-content: center;
  padding: 15px;
  background: white;
}
#newCustomerQr canvas {
  max-width: 100%;
  height: auto;
}
#registrationMessage { min-height: 18px; }
`
document.head.appendChild(registrationStyle)

const registrationForm = document.querySelector('#registrationForm')
const registrationMessage = document.querySelector('#registrationMessage')
const registrationSubmit = document.querySelector('#registrationSubmit')
const newLoyaltyCard = document.querySelector('#newLoyaltyCard')

registrationForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  registrationSubmit.disabled = true
  registrationSubmit.textContent = 'CREAZIONE IN CORSO...'
  registrationMessage.textContent = ''

  try {
    const nome = document.querySelector('#customerName').value.trim()
    const cognome = document.querySelector('#customerSurname').value.trim()
    const telefono = document.querySelector('#customerPhone').value.trim()

    const { data, error } = await supabase.rpc('registra_cliente', {
      p_nome: nome,
      p_cognome: cognome,
      p_telefono: telefono
    })

    if (error) throw error

    const cliente = Array.isArray(data) ? data[0] : data
    if (!cliente?.token_qr) {
      throw new Error('Non è stato possibile creare la tessera.')
    }

    const canvas = document.createElement('canvas')
    await QRCode.toCanvas(canvas, cliente.token_qr, {
      width: 240,
      margin: 2
    })

    document.querySelector('#newCustomerQr').replaceChildren(canvas)
    registrationForm.hidden = true
    newLoyaltyCard.hidden = false
    registrationMessage.textContent = `Benvenuto ${cliente.nome}! La tua tessera è pronta.`

    document.querySelector('#downloadCustomerQr').onclick = () => {
      const link = document.createElement('a')
      link.download = 'tessera-caffetteria-carlos.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  } catch (error) {
    console.error('Errore registrazione:', error)
    registrationMessage.textContent =
      error.message?.includes('duplicate key')
        ? 'Questo numero di telefono risulta già registrato.'
        : (error.message || 'Errore durante la registrazione.')
  } finally {
    registrationSubmit.disabled = false
    registrationSubmit.textContent = 'CREA LA MIA TESSERA'
  }
})

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

      <h3>Scanner tessere</h3>
      <p>Inquadra il QR del cliente per riconoscere la sua tessera.</p>
      <div id="qrReader"></div>
      <button type="button" id="startScanner">AVVIA SCANNER</button>
      <button type="button" id="stopScanner" disabled>FERMA FOTOCAMERA</button>
      <p id="scanMessage" role="status"></p>
      <div id="scannedCustomer"></div>

      <h3>Nuovo cliente</h3>
      <form id="newCustomerForm">
        <label for="customerName">Nome</label>
        <input id="customerName" required placeholder="Nome cliente">

        <label for="customerSurname">Cognome</label>
        <input id="customerSurname" required placeholder="Cognome cliente">

        <label for="customerEmail">Email (facoltativa)</label>
        <input id="customerEmail" type="email" placeholder="Email cliente">

<div id="customerMessage" role="status"></div>
        <button type="submit" id="saveCustomer">SALVA CLIENTE</button>
      </form>

      <button type="button" id="logoutButton">ESCI</button>
    `

    let qrScanner = null
    let scansioneInCorso = false

    const scanMessage = document.querySelector('#scanMessage')
    const scannedCustomer = document.querySelector('#scannedCustomer')
    const startScannerButton = document.querySelector('#startScanner')
    const stopScannerButton = document.querySelector('#stopScanner')

    async function fermaScanner() {
      if (qrScanner) {
        try {
          await qrScanner.stop()
        } catch (_) {}
        try {
          qrScanner.clear()
        } catch (_) {}
        qrScanner = null
      }
      startScannerButton.disabled = false
      stopScannerButton.disabled = true
    }

    startScannerButton.addEventListener('click', async () => {
      startScannerButton.disabled = true
      scanMessage.textContent = 'Avvio della fotocamera...'

      try {
        qrScanner = new Html5Qrcode('qrReader')

        await qrScanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 230, height: 230 } },
          async (codice) => {
            if (scansioneInCorso) return
            scansioneInCorso = true

            await fermaScanner()
            scanMessage.textContent = 'QR letto. Ricerca cliente...'
            scannedCustomer.replaceChildren()

            try {
              const { data, error } = await supabase.rpc('cerca_cliente_qr', {
                p_token_qr: codice.trim()
              })

              if (error) throw error

              const cliente = data?.[0]
              if (!cliente) throw new Error('Cliente non trovato.')

              const nomeCliente = document.createElement('p')
              nomeCliente.textContent =
                `${cliente.nome} ${cliente.cognome} — ${cliente.timbri}/10 timbri · Premi: ${cliente.premi_disponibili}`

              const addButton = document.createElement('button')
              addButton.type = 'button'
              addButton.textContent = 'AGGIUNGI TIMBRO'

              scannedCustomer.append(nomeCliente, addButton)
              scanMessage.textContent = 'Cliente riconosciuto!'

              addButton.addEventListener('click', async () => {
                addButton.disabled = true
                addButton.textContent = 'REGISTRAZIONE...'

                try {
                  const { data: risultato, error: erroreTimbro } =
                    await supabase.rpc('aggiungi_timbro', {
                      p_cliente_id: cliente.id
                    })

                  if (erroreTimbro) throw erroreTimbro

                  const aggiornato = risultato?.[0]
                  if (!aggiornato) throw new Error('Risposta non valida.')

                  nomeCliente.textContent =
                    `${cliente.nome} ${cliente.cognome} — ${aggiornato.timbri_attuali}/10 timbri · Premi: ${aggiornato.premi_totali}`

                  scanMessage.textContent = aggiornato.premio_ottenuto
                    ? '🎉 Decimo timbro! Premio assegnato.'
                    : '☕ Timbro aggiunto correttamente!'

                  addButton.textContent = 'TIMBRO REGISTRATO'
                } catch (errore) {
                  scanMessage.textContent =
                    errore.message || 'Errore durante l’aggiunta del timbro.'
                  addButton.disabled = false
                  addButton.textContent = 'RIPROVA'
                }
              })
            } catch (errore) {
              scanMessage.textContent =
                errore.message || 'Errore durante la ricerca del cliente.'
            } finally {
              scansioneInCorso = false
            }
          }
        )

        stopScannerButton.disabled = false
        scanMessage.textContent = 'Inquadra il QR del cliente.'
      } catch (errore) {
        await fermaScanner()
        scanMessage.textContent =
          errore.message || 'Impossibile avviare la fotocamera.'
      }
    })

    stopScannerButton.addEventListener('click', async () => {
      await fermaScanner()
      scanMessage.textContent = 'Fotocamera spenta.'
    })

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
        customerMessage.innerHTML = `
          <strong>Cliente salvato!</strong>
          <p>${cliente.nome} ${cliente.cognome}</p>
          <div id="customerQr"></div>
          <p>Codice tessera: ${cliente.codice_tessera}</p>
          <button type="button" id="downloadQr">SCARICA QR</button>
        `

        const qrCanvas = document.createElement('canvas')
        await QRCode.toCanvas(qrCanvas, cliente.token_qr, {
          width: 220,
          margin: 2
        })

        document.querySelector('#customerQr').appendChild(qrCanvas)

        document.querySelector('#downloadQr').addEventListener('click', () => {
          const link = document.createElement('a')
          link.download = 'qr-' + cliente.nome + '.png'
          link.href = qrCanvas.toDataURL('image/png')
          link.click()
        })

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
