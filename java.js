// Pomocné pole pro nově přidané knihy a odeslaná hodnocení, které si pamatujeme v paměti prohlížeče
let pridaneKnihy = JSON.parse(localStorage.getItem('mojePridaneKnihy')) || [];
let odeslanaHodnoceni = JSON.parse(localStorage.getItem('odeslanaHodnoceni')) || [];

let puvodniKnihy = [];
let puvodniAutori = [];

// Načtení dat a KONTROLA STAVU PŘIHLÁŠENÍ hned po načtení jakékoliv stránky
window.onload = function() {
    let knihySelect = document.getElementById('scrollKnihy');
    if (knihySelect) {
        for (let i = 1; i < knihySelect.options.length; i++) {
            puvodniKnihy.push({ value: knihySelect.options[i].value, text: knihySelect.options[i].text });
        }
    }
    
    let autoriSelect = document.getElementById('scrollAutori');
    if (autoriSelect) {
        for (let i = 1; i < autoriSelect.options.length; i++) {
            puvodniAutori.push({ value: autoriSelect.options[i].value, text: autoriSelect.options[i].text });
        }
    }

    nactiKnihyZPameti();
    obnovStavPrihlaseni();
};

// Funkce, která vloží přidané knihy z localStorage do rozbalovacího menu
function nactiKnihyZPameti() {
    let knihySelect = document.getElementById('scrollKnihy');
    if (knihySelect && pridaneKnihy.length > 0) {
        pridaneKnihy.forEach(kniha => {
            puvodniKnihy.push({ value: kniha.value, text: kniha.text });
            let opt = document.createElement('option');
            opt.value = kniha.value;
            opt.text = kniha.text;
            knihySelect.add(opt);
        });
    }
}

// Funkce pro dynamické vyhledávání v horní liště
function vyhledejVSeznamech() {
    let input = document.getElementById('hledani').value.toLowerCase();
    let knihySelect = document.getElementById('scrollKnihy');
    if (knihySelect) {
        while (knihySelect.options.length > 1) {
            knihySelect.remove(1);
        }
        puvodniKnihy.forEach(kniha => {
            if (kniha.text.toLowerCase().includes(input)) {
                let opt = document.createElement('option');
                opt.value = kniha.value;
                opt.text = kniha.text;
                knihySelect.add(opt);
            }
        });
    }
    
    let autoriSelect = document.getElementById('scrollAutori');
    if (autoriSelect) {
        while (autoriSelect.options.length > 1) {
            autoriSelect.remove(1);
        }
        puvodniAutori.forEach(autor => {
            if (autor.text.toLowerCase().includes(input)) {
                let opt = document.createElement('option');
                opt.value = autor.value;
                opt.text = autor.text;
                autoriSelect.add(opt);
            }
        });
    }
}

// UKLÁDÁNÍ HODNOCENÍ DO LOCALSTORAGE + OKAMŽITÁ AKTUALIZACE HADA
function ulozHodnoceniDoMatrixu(event) {
    event.preventDefault();

    let knihaSelect = document.getElementById('vyber_knihy');
    let vybranaKniha = knihaSelect ? knihaSelect.options[knihaSelect.selectedIndex].text : "Neznámá kniha";
    
    let jmenoUzivatele = document.getElementById('jmeno') ? document.getElementById('jmeno').value : "Anonymní uživatel";
    
    let hodnoceniInput = document.getElementById('ciselne_hodnoceni');
    let hodnoceniCislo = hodnoceniInput ? hodnoceniInput.value : "Nezadáno";
    
    let textKomentare = document.getElementById('slovni_hodnoceni') ? document.getElementById('slovni_hodnoceni').value : "";

    let noveHodnoceni = {
        kniha: vybranaKniha,
        od: jmenoUzivatele,
        znamka: hodnoceniCislo,
        komentar: textKomentare,
        cas: new Date().toLocaleTimeString()
    };

    odeslanaHodnoceni.push(noveHodnoceni);
    localStorage.setItem('odeslanaHodnoceni', JSON.stringify(odeslanaHodnoceni));

    document.getElementById('ratingForm').reset();
    alert(`Úspěch! Hodnocení od uživatele "${jmenoUzivatele}" pro knihu "${vybranaKniha}" bylo odesláno.`);
    
    let ulozenyUzivatel = localStorage.getItem('prihlasenyUzivatel');
    if (ulozenyUzivatel) {
        nastavPrihlasenyVzhled(ulozenyUzivatel);
    }
}

// Přepínání zobrazení dropdownu pod hadem
function prepniZvonecek() {
    let dropdown = document.getElementById('bellDropdown');
    if (dropdown) {
        if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
        } else {
            dropdown.style.display = 'block';
        }
    }
}

// --- SPRÁVA PŘIHLAŠOVÁNÍ ---

function otevriModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function zavriModal() {
    document.getElementById('loginModal').style.display = 'none';
}

window.onclick = function(event) {
    let modal = document.getElementById('loginModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
    let bellDropdown = document.getElementById('bellDropdown');
    let bellBtn = document.querySelector('.bell-btn');
    if (bellDropdown && event.target !== bellDropdown && event.target !== bellBtn && !bellBtn.contains(event.target)) {
        bellDropdown.style.display = 'none';
    }
};

function provedPrihlaseni(event) {
    event.preventDefault();
    let jmeno = document.getElementById('username').value;
    let heslo = document.getElementById('password') ? document.getElementById('password').value : '';
    
    if (jmeno === "zib zib" && heslo === "zab zab") {
        localStorage.setItem('prihlasenyUzivatel', jmeno);
        nastavPrihlasenyVzhled(jmeno);
        zavriModal();
        if (document.getElementById('loginForm')) document.getElementById('loginForm').reset();
    } else {
        alert("ZIB ZIB!!! Špatné heslo nebo jméno.");
    }
}

// Vykreslení horní lišty (had funguje všude) + správa obsahu (PŮSOBÍ POUZE NA INDEXU)
function nastavPrihlasenyVzhled(jmeno) {
    let kontejner = document.getElementById('loginContainer');
    
    let seznamOznámení = "";
    if (odeslanaHodnoceni.length === 0) {
        seznamOznámení = `<div class="notification-item" style="font-style: italic;">Žádná nová hodnocení v Matrixu.</div>`;
    } else {
        [...odeslanaHodnoceni].reverse().forEach(h => {
            seznamOznámení += `
                <div class="notification-item">
                    Uživatel <strong>${h.od}</strong> ohodnotil knihu <strong>${h.kniha}</strong> známkou <strong>${h.znamka}</strong>.<br>
                    <em>"${h.komentar}"</em>
                    <span class="time">Dnes v ${h.cas}</span>
                </div>
            `;
        });
    }

    // 1. VŽDYCKY A VŠUDE vykreslíme hada do top-baru
    if (kontejner) {
        kontejner.innerHTML = `
            <div class="notification-wrapper">
                <button class="bell-btn" onclick="prepniZvonecek()">
                    🐍 ${odeslanaHodnoceni.length > 0 ? `<span class="bell-badge">${odeslanaHodnoceni.length}</span>` : ''}
                </button>
                <div class="notifications-dropdown" id="bellDropdown">
                    <h3>Zachycená hodnocení knih</h3>
                    ${seznamOznámení}
                </div>
            </div>
            <span class="user-logged">Uživatel: <strong>${jmeno}</strong></span>
            <button id="logoutBtn" onclick="provedOdhlaseni()">Odhlásit se</button>
        `;
    }
    
    // Zjistíme název aktuálního souboru v prohlížeči (např. "index.html", "statistika2.html")
    let stranka = window.location.pathname.split("/").pop().toLowerCase();
    
    // Profil se propíše DOSTUPNĚ JEN na hlavní stránce index.html
    let jeIndex = (stranka === "index.html" || stranka === "index" || stranka === "");

    if (jeIndex) {
        let hlavniObsah = document.querySelector('.content');
        if (hlavniObsah) {
            hlavniObsah.innerHTML = `
                <h2>Profil uživatele</h2>
                <div class="user-profile-box">
                    <img src="green-alien-man-green.gif" alt="Avatar" class="profile-avatar">
                    <div class="profile-info">
                        <p><span class="label">Nickname:</span> ${jmeno}</p>
                        <p><span class="label">Role:</span> Pozemšťan</p>
                        <p><span class="label">Status:</span> Online</p>
                        <p>Nyní máš plný přistup v Matrixu.</p>
                    </div>
                </div>

                <div style="display: flex; gap: 40px; flex-wrap: wrap; margin-top: 40px;">
                    <div style="flex: 1; min-width: 300px;">
                        <h2>Přidat novou knihu</h2>
                        <div class="user-profile-box" style="padding: 20px;">
                            <form id="addBookForm" onsubmit="pridejNovouKnihu(event)" style="width: 100%;">
                                <p><label class="label" style="font-size: 100%;">Název knihy:</label></p>
                                <input type="text" id="newBookTitle" placeholder="Např. Zaklínač" required style="width: 92%; background: #000; color: #00ff41; border: 1px solid #008f11; padding: 8px; margin-bottom: 15px; font-family: monospace;">
                                <p><label class="label" style="font-size: 100%;">Odkaz na soubor (HTML):</label></p>
                                <input type="text" id="newBookUrl" placeholder="Např. zaklinac.html" required style="width: 92%; background: #000; color: #00ff41; border: 1px solid #008f11; padding: 8px; margin-bottom: 15px; font-family: monospace;">
                                <button type="submit" id="submitLoginBtn" style="width: 100%; margin-top: 10px;">Zapsat do databáze</button>
                            </form>
                        </div>
                    </div>

                    <div style="flex: 1; min-width: 300px;">
                        <h2>Správa tvých knih</h2>
                        <div class="user-profile-box" style="padding: 20px; flex-direction: column; gap: 10px;" id="customBooksList"></div>
                    </div>
                </div>
            `;
            aktualizujSeznamProMazani();
        }
    }
    // Na ostatních stránkách (jako statistika2.html) se nespustí nic a obsah zůstane původní!
}

function aktualizujSeznamProMazani() {
    let seznamKontejner = document.getElementById('customBooksList');
    if (!seznamKontejner) return;

    if (pridaneKnihy.length === 0) {
        seznamKontejner.innerHTML = `<p style="color: #008f11; font-style: italic;">Zatím jsi nepřidal žádné vlastní knihy.</p>`;
        return;
    }

    let htmlSmazat = "";
    pridaneKnihy.forEach((kniha, index) => {
        htmlSmazat += `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-bottom: 1px dashed #004d1a; padding-bottom: 8px;">
                <span style="color: #00ff41;">${kniha.text}</span>
                <button onclick="smazKnihu(${index})" style="background: #200000; color: #ff3333; border: 1px solid #ff0000; padding: 4px 10px; cursor: pointer; font-family: monospace; font-size: 85%;">Smazat</button>
            </div>
        `;
    });
    seznamKontejner.innerHTML = htmlSmazat;
}

function smazKnihu(index) {
    let smazanaKniha = pridaneKnihy[index];
    if (confirm(`Opravdu chceš z Matrixu vymazat knihu "${smazanaKniha.text}"?`)) {
        pridaneKnihy.splice(index, 1);
        localStorage.setItem('mojePridaneKnihy', JSON.stringify(pridaneKnihy));
        window.location.reload();
    }
}

function pridejNovouKnihu(event) {
    event.preventDefault();
    let nazev = document.getElementById('newBookTitle').value;
    let url = document.getElementById('newBookUrl').value;

    let novaKniha = { value: url, text: nazev };
    pridaneKnihy.push(novaKniha);
    localStorage.setItem('mojePridaneKnihy', JSON.stringify(pridaneKnihy));
    puvodniKnihy.push(novaKniha);

    let knihySelect = document.getElementById('scrollKnihy');
    if (knihySelect) {
        let opt = document.createElement('option');
        opt.value = url;
        opt.text = nazev;
        knihySelect.add(opt);
    }

    aktualizujSeznamProMazani();
    document.getElementById('addBookForm').reset();
    alert(`Kniha "${nazev}" je nyní v Matrixu. Najdeš ji v horním seznamu.`);
}

function obnovStavPrihlaseni() {
    let ulozenyUzivatel = localStorage.getItem('prihlasenyUzivatel');
    if (ulozenyUzivatel) {
        nastavPrihlasenyVzhled(ulozenyUzivatel);
    }
}

function provedOdhlaseni() {
    localStorage.removeItem('prihlasenyUzivatel');
    let kontejner = document.getElementById('loginContainer');
    if (kontejner) {
        kontejner.innerHTML = `<button id="loginBtn" onclick="otevriModal()">Přihlásit se</button>`;
    }
    
    let stranka = window.location.pathname.split("/").pop().toLowerCase();
    let jeIndex = (stranka === "index.html" || stranka === "index" || stranka === "");
    
    if (jeIndex) {
        let hlavniObsah = document.querySelector('.content');
        if (hlavniObsah) {
            hlavniObsah.innerHTML = `
                <h2>Vítejte v mém deníku</h2>
                <p>Zde si můžete prohlídnout moje deníky na maturitu.</p>
                <img src="green-alien-man-green.gif" alt="GG">
            `;
        }
    }
}