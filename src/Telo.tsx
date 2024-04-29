import React, { useState, useEffect } from 'react';
import * as CryptoJS from 'crypto-js';
import { Trie } from './cschecking/Trie';


export default function Telo() {
  const [geslo, setGeslo] = useState("");
  const [rezultat, setRezultat] = useState("");
  const [trie, setTrie] = useState<Trie | null>(null); // Initialize trie state
  
  async function handleFileSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();

      // file input
      const formElement = event.target as HTMLFormElement;
      const fileInput = formElement.querySelector('input[type="file"]') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      if (!file) {
        console.error('No file selected.');
        return;
      }

      try {
        // read file & split by break
        const text = await readFile(file);
        console.log("test passwords:\n",text)
        const dictionary = text.split('\n');
        
        // new trie & dictionary for each word
        const trieInstance = new Trie();
        dictionary.forEach(word => {trieInstance.insert(word)});
        setTrie(trieInstance); 
      } catch (error) {
        console.error('Error reading file:', error);
      }
  }

  function readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsText(file);
    });
  }

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

    try{
      trie?.logAllChildren()
      console.log("input text:", geslo)
      if (trie) {
        const threshold = 2;
        const similarWords = trie.findSimilarWords(geslo, threshold);
        console.log("similar passowrds: ", similarWords);
      } 
    }catch(error){
      console.error('Napaka pri True:', error);
    }
    
    
  setGeslo("");
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
  
    console.log(pogoji);
  
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
