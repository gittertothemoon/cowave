export function getDisplayNameFromEmail(email) {
  if (!email || typeof email !== 'string') return 'Tu';
  const [local] = email.split('@');
  if (!local) return 'Tu';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function getAuthErrorMessage(error, { isLogin = false } = {}) {
  if (!error) return '';
  const code = (error.code || '').toLowerCase();
  const message = (error.message || '').toLowerCase();

  if (
    code === 'invalid_credentials' ||
    message.includes('invalid login') ||
    message.includes('invalid email or password') ||
    message.includes('credentia')
  ) {
    return 'Email o password non valide.';
  }

  if (code === 'email_exists' || message.includes('already registered')) {
    return 'Esiste già un account con questa email.';
  }

  if (
    code === 'email_not_confirmed' ||
    (message.includes('confirm') && message.includes('email'))
  ) {
    return 'Conferma l’email dal link ricevuto e riprova ad accedere.';
  }

  if (code === 'weak_password' || message.includes('password')) {
    return 'Password non valida. Usa almeno 6 caratteri.';
  }

  if (code === 'over_request_rate_limit' || message.includes('rate limit')) {
    return 'Hai fatto troppi tentativi. Riprova tra qualche minuto.';
  }

  return isLogin
    ? 'Accesso non riuscito. Controlla i dati e riprova.'
    : 'Registrazione non riuscita. Riprova tra poco.';
}
