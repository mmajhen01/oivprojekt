import React, { useState } from 'react';
import * as CryptoJS from 'crypto-js';

export default function Telo() {
  const [geslo, setGeslo] = useState("");
  const [rezultat, setRezultat] = useState("");

  async function submitHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const sha1Hash = CryptoJS.SHA1(geslo).toString(CryptoJS.enc.Hex).toUpperCase();
      const prefix = sha1Hash.substring(0, 5);
      const postfix = sha1Hash.substring(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      if (!response.ok) {
        throw new Error('Napaka pri poizvedbi API-ja');
      }
      const data = await response.text();
      // Preveri, ali je celoten hash prisoten v odgovoru API-ja
      const found = data.split('\n').find(line => line.trim().startsWith(postfix));

      if (found) {
        const count = found.split(':')[1];
        setRezultat(`Geslo je bilo najdeno v bazi podatkov ${count} krat.`);
      } else {
        setRezultat('Geslo ni bilo najdeno v bazi podatkov.');
      }
    } catch (error) {
      console.error('Napaka:', error);
    }
  }

  function handleGesloChange(event: React.ChangeEvent<HTMLInputElement>) {
    setGeslo(event.target.value);
  }

  return (
    <div className="container">
      <h1>Geslo checker</h1>
      <form onSubmit={submitHandler}>
        <input type="password" id="geslo" value={geslo} onChange={handleGesloChange} />
        <button type="submit">Preveri geslo</button>
      </form>
      {rezultat && (
        <div>
          <h2>Rezultat:</h2>
          <p>{rezultat}</p>
        </div>
      )}
    </div>
  );
}
