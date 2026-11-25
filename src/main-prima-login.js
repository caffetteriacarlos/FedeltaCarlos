import './style.css'

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
`

document.querySelector('#adminButton').addEventListener('click', () => {
  alert('Area amministratore: la collegheremo con accesso protetto nel prossimo passaggio.')
})
