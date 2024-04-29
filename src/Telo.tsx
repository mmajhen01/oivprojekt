import React, { useState, useEffect } from 'react';
import * as CryptoJS from 'crypto-js';
import { Trie } from './cschecking/Trie';


export default function Telo() {
  const [geslo, setGeslo] = useState("");
  const [rezultat, setRezultat] = useState("");
  const [rezultatSeznama, setRezultatSeznama] = useState("");

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

      // if trie

    } catch (error) {
      console.error('Napaka:', error);
    }
    preveriSeznamGesel();
    setGeslo("");
  }
  function preveriSeznamGesel(){
    fetch('http://localhost:3001/preveri-geslo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ geslo: geslo }),
  })
  .then(response => response.json())
  .then(data => {
    setRezultatSeznama(data.message);
  })
  .catch(error => console.error('Napaka:', error));
  console.log(rezultatSeznama);
  } 

  const [malaCrka, setMalaCrka] = useState(false);
  const [velikaCrka, setVelikaCrka] = useState(false);
  const [stevilka, setStevilka] = useState(false);
  const [znak, setZnak] = useState(false);
  const [stanje, setStanje] = useState("");

  const [dovoljZnakov, setDovoljZnakov] = useState(false);
  function handleGesloChange(event: React.ChangeEvent<HTMLInputElement>) {
    const novoGeslo = event.target.value;
    setGeslo(novoGeslo);

    setMalaCrka(/[a-z]/.test(novoGeslo));
    setVelikaCrka(/[A-Z]/.test(novoGeslo));
    setStevilka(/[0-9]/.test(novoGeslo));
    setZnak(/[^a-zA-Z0-9]/.test(novoGeslo));
    setDovoljZnakov(novoGeslo.length >= 12);
  
    let pogoji = 0;
    if (malaCrka) pogoji++;
    if (velikaCrka) pogoji++;
    if (stevilka) pogoji++;
    if (znak) pogoji++;
    if (dovoljZnakov) pogoji++;
  
    if (pogoji >= 2 && pogoji < 5) {
      setStanje('mid');
    } else if(pogoji < 2){
      setStanje('bad');
    }
  }

  return (
    <div className={"container"}>
      <h1>Geslo checker</h1>
      <div>
      <form onSubmit={handleFileSubmit}>
        <input type="file" />
        <button type="submit">Process File</button>
      </form>
      </div>

      <div >
        <form onSubmit={submitHandler} className={'forma'}>
          <input className={"polje"} type="password" id="geslo" value={geslo} onChange={handleGesloChange} />
          <button type="submit">
            <img src={require("./isci.png")}></img>
          </button>
        </form>
      </div>
      
      <div className={`rezultat ${rezultat === 'Geslo ni bilo najdeno v bazi podatkov.' ? 'good' : 'bad'}`}>
      {rezultat && (
        <div>
          <h2>Rezultat:</h2>
          <p>{rezultat}</p>
        </div>
      )}
      </div>

      <div className={`rezultat ${rezultatSeznama === 'Geslo je na seznamu pogostih gesel. Prosim izberite varnejše geslo.' ? 'bad' : 'good'}`}>
      {rezultatSeznama && (
        <div>
          <h2>rezultatSeznama:</h2>
          <p>{rezultatSeznama}</p>
        </div>
      )}
      </div>


      <div className={`rezultat ${stanje}`}>
      {!stevilka && geslo.length > 0 && (
        <div>
          <p>Geslo potrebuje številko</p>
        </div>
      )}
      {!malaCrka && geslo.length > 0 &&(
        <div>
          <p>Geslo potrebuje malo črko.</p>
        </div>
      )}
      {!velikaCrka && geslo.length > 0 &&(
        <div>
          <p>Geslo potrebuje veliko črko</p>
        </div>
      )}
      {!znak && geslo.length > 0 &&(
        <div>
          <p>Geslo potrebje poseben znak</p>
        </div>
      )}
      {!dovoljZnakov && geslo.length > 0 &&(
        <div>
          <p>Geslo more imeti vsaj 12 znakov</p>
        </div>
      )}
      </div>
    </div>
  );
}
