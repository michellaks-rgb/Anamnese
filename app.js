const T=(label,hint='')=>({label,hint,type:'text'}),S=(label,low='Aucune difficulté',high='Difficulté maximale')=>({label,type:'scale',low,high}),C=(label,options)=>({label,type:'choice',options});
const sections=[
{title:'Bienvenue',sub:'Un espace pour vous',intro:'Après avoir renseigné vos coordonnées, vous choisissez les réponses que vous souhaitez partager.',fields:[]},
{title:'Mes coordonnées',sub:'Mes coordonnées',intro:'Renseignez les cinq champs pour poursuivre le questionnaire.',fields:[{label:'Votre prénom',type:'input',autocomplete:'given-name',key:'identity-first'},{label:'Votre nom',type:'input',autocomplete:'family-name',key:'identity-last'},{label:'Votre adresse mail',type:'email',key:'1-5'},{label:'Votre numéro de téléphone',type:'tel',key:'1-4'},{label:'Votre date de naissance',type:'date',key:'identity-birth'}]},
{title:'Ma demande',sub:'Ce qui m’amène',intro:'Commencez par ce qui compte le plus pour vous aujourd’hui.',fields:[{...T('Qu’est-ce qui vous amène à consulter maintenant ?'),examples:[['Motifs de consultation','Un deuil ou une séparation, des tensions dans le couple ou la famille, un changement de vie, une surcharge au travail ou le besoin de retrouver confiance en soi.'],['Symptômes fréquents','Des inquiétudes qui tournent en boucle, des montées d’angoisse, de la tristesse, une perte d’envie, des nuits agitées, de la fatigue, de l’irritabilité ou des difficultés à se concentrer.']]},T('Depuis quand ces difficultés sont-elles présentes ?','Date approximative, apparition progressive ou soudaine, périodes d’amélioration ou d’aggravation.'),{...S('Sur les 7 derniers jours, quelle a été l’intensité de votre souffrance ?','Aucune souffrance','Souffrance maximale imaginable'),key:'2-4'},{...T('Qu’avez-vous déjà essayé ? Qu’est-ce qui aide, même un peu ?'),key:'2-5'}]},
{title:'Mon quotidien',sub:'Comment je me sens',intro:'Ces repères portent sur les 7 derniers jours. Chaque valeur est à sélectionner : une absence de réponse n’équivaut jamais à zéro.',fields:[S('Anxiété, inquiétudes ou tensions'),S('Tristesse ou perte d’élan'),S('Difficultés de sommeil'),S('Fatigue ou manque d’énergie'),S('Difficultés de concentration'),S('Retentissement sur le travail ou les études'),S('Retentissement sur les relations'),S('Retentissement sur les tâches du quotidien')]},
{
  title:'Ma santé',sub:'Mon parcours de soins',intro:'Quelques repères sur vos traitements, votre suivi et vos antécédents familiaux.',
  fields:[
    {...T('Quels traitements ou produits prenez-vous actuellement ?','Nom et dose si connus, compléments, effets indésirables. Ne modifiez pas un traitement sans avis du prescripteur.'),key:'4-1'},
    {...C('Avez-vous déjà bénéficié d’un accompagnement psychologique ou psychiatrique ?',['Oui','Non']),key:'health-support'},
    {label:'Addictions',type:'checks',key:'health-addictions',hint:'Cochez les substances ou comportements qui vous préoccupent. Plusieurs réponses sont possibles.',options:[
      'Alcool','Tabac ou nicotine','Cannabis','Cocaïne ou crack','Opioïdes (héroïne, antidouleurs opioïdes)','Anxiolytiques ou somnifères','Autres substances',
      'Jeux d’argent ou paris','Jeux vidéo','Réseaux sociaux ou usage d’Internet','Achats compulsifs','Pornographie ou comportements sexuels compulsifs','Autre comportement'
    ]},
    {...C('Y a-t-il des antécédents de difficultés de santé mentale ou d’addiction dans votre famille ?',['Oui','Non','Je ne sais pas']),key:'health-family'}
  ]
},
{title:'Mes attentes',sub:'Construire la suite ensemble',intro:'Des objectifs concrets pourront être ajustés avec votre psychologue.',fields:[T('Quels seraient vos trois objectifs prioritaires ?'),T('À quoi verrez-vous concrètement que les choses s’améliorent ?','Un changement observable dans votre quotidien, même modeste.'),T('Quel petit pas aimeriez-vous essayer ?'),S('À quel point ce petit pas vous semble-t-il réalisable ?','Pas réalisable actuellement','Tout à fait réalisable'),T('Qu’attendez-vous de votre psychologue ?','Rythme, manière de travailler, préférences, appréhensions, limites à respecter.'),T('Y a-t-il autre chose que vous souhaiteriez partager ou réserver pour la séance ?')].map((field,index)=>({...field,key:'9-'+index}))},
{title:'Ma synthèse',sub:'Prêt·e pour notre rencontre',intro:'Relisez et choisissez ce que vous souhaitez conserver. Vous pouvez modifier vos réponses en revenant aux étapes précédentes.',fields:[]}
];
let answers={},current=0,remember=false;const KEY='ombaliz-anamnese-v1';try{const saved=localStorage.getItem(KEY);if(saved){answers=JSON.parse(saved);remember=true}}catch{}const $=id=>document.getElementById(id);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const key=(i,j)=>sections[i].fields[j].key??i+'-'+j;
const activeKeys=new Set(sections.flatMap((section,i)=>section.fields.map((_,j)=>key(i,j))));
answers=Object.fromEntries(Object.entries(answers??{}).filter(([k])=>activeKeys.has(k)));
const total=sections.reduce((n,s)=>n+s.fields.length,0);function persist(){if(remember)try{localStorage.setItem(KEY,JSON.stringify(answers));$('count').textContent='Enregistré sur cet appareil'}catch{$('count').textContent='Enregistrement impossible : exportez vos réponses'}}
function updateCount(){$('count').textContent=Object.keys(answers).length+' / '+total+' réponses'}
function field(f,j){const k=key(current,j),v=answers[k];const required=current===1?'required':'';let control='';
if(f.type==='checks'){
  const selected=(v??'').split(', ');
  return `<fieldset class="field check-group"><legend>${esc(f.label)}</legend><p class="hint">${esc(f.hint)}</p>${f.options.map(option=>`<label><input type="checkbox" data-k="${k}" value="${esc(option)}" ${selected.includes(option)?'checked':''}> ${esc(option)}</label>`).join('')}</fieldset>`;
}
if(f.type==='scale'){control=`<output class="value" id="o${k}">${v===undefined||typeof v==='string'?'—':v+'/10'}</output><input id="f${k}" data-k="${k}" type="range" min="0" max="10" step="1" value="${typeof v==='number'?v:5}" aria-label="${esc(f.label)}" aria-describedby="a${k}"><div class="anchors" id="a${k}"><span>0 · ${f.low}</span><span>10 · ${f.high}</span></div><p class="hint">Déplacez le curseur pour répondre. Valeur initiale non enregistrée.</p>`}else if(f.type==='choice'){control=`<select id="f${k}" data-k="${k}"><option value="">Choisir une réponse</option>${f.options.map(o=>`<option ${o===v?'selected':''}>${esc(o)}</option>`).join('')}</select>`}else if(f.type==='tel'||f.type==='email'){control=`<input id="f${k}" data-k="${k}" type="${f.type}" ${required} autocomplete="${f.type}" maxlength="254" value="${esc(v)}" placeholder="${f.type==='tel'?'+33 6 12 34 56 78':'vous@exemple.fr'}"><p class="hint" id="e${k}" role="status"></p>` }else if(f.type==='input'||f.type==='date'){control=`<input class="identity" id="f${k}" data-k="${k}" type="${f.type==='input'?'text':'date'}" ${required} autocomplete="${f.autocomplete??'bday'}" maxlength="254" value="${esc(v)}">`}else control=`<textarea id="f${k}" data-k="${k}" maxlength="6000" placeholder="Quelques mots, si vous le souhaitez…">${esc(v)}</textarea>`;return `<div class="field"><label for="f${k}">${esc(f.label)}</label>${f.hint?`<p class="hint">${esc(f.hint)}</p>`:''}${f.examples?.map(([label,example])=>`<p class="hint"><strong>${esc(label)}</strong> · ${esc(example)}</p>`).join('')??''}${control}${current===1?'':`<button class="skip" data-skip="${k}">En parler en séance</button>`}</div>`}
function reportSections(){
  return sections.slice(1,-1).map((section,index)=>({
    title:section.title,
    fields:section.fields.map((field,j)=>{
      const value=answers[key(index+1,j)];
      const formatted=value===undefined?'Non renseigné':typeof value==='number'
        ?value+'/10 · 0 = '+field.low+' ; 10 = '+field.high
        :field.type==='date'&&/^\d{4}-\d{2}-\d{2}$/.test(value)?value.split('-').reverse().join('/'):value;
      return {label:field.label,value:formatted};
    })
  }));
}
function summary(html=true){
  return reportSections().map(({title,fields})=>html
    ?`<h3>${esc(title)}</h3>`+fields.map(({label,value})=>`<p><b>${esc(label)}</b><br>${esc(value)}</p>`).join('')
    :'\n'+title+'\n'+fields.map(({label,value})=>label+'\n'+value+'\n\n').join('')
  ).join('');
}
const stepDrawings=[
  '<path d="M5 17c5 0 6-10 13-10M14 4l4 3-2 4M6 9v4m-2-2h4"/><circle cx="18" cy="16" r="2"/>',
  '<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="8" cy="10" r="2"/><path d="M5 16c1-3 5-3 6 0m3-6h4m-4 4h4"/>',
  '<path d="M4 5h16v10H9l-4 4v-4H4zM8 10h.01m4 0h.01m4 0h.01"/>',
  '<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  '<path d="M12 20 4 12c-4-5 3-9 8-4 5-5 12-1 8 4z"/><path d="M7 13h3l2-3 2 3h3"/>',
  '<path d="M12 21V4m0 1c3-2 5 2 8 0v8c-3 2-5-2-8 0m-5 8h10"/>',
  '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="m8 9 1 1 2-2m2 2h3m-8 6 1 1 2-2m2 2h3"/>'
];
function stepIcon(index){
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${stepDrawings[index]}</svg>`;
}
async function downloadPdf(){
  const button=$('pdf'),status=$('pdf-status');
  button.disabled=true;
  status.textContent='Préparation du PDF…';
  try {
    const bytes=await buildAnamnesisPdf(reportSections(),new Date().toLocaleDateString('fr-FR'));
    const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
    const link=document.createElement('a');
    link.href=url;
    link.download='Ombaliz-Mon-histoire-Synthese.pdf';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
    status.textContent='PDF prêt. Si vous souhaitez le partager, joignez-le à votre message.';
  } catch {
    status.textContent='Le PDF n’a pas pu être généré. Réessayez ou utilisez « Imprimer / PDF ».';
  } finally {
    button.disabled=false;
  }
}
function render(){const s=sections[current];$('nav').innerHTML=sections.map((s,i)=>`<button class="${i===current?'active':''}" ${i===current?'aria-current="step"':''} data-page="${i}"><b>${String(i+1).padStart(2,'0')}</b>${stepIcon(i)}${s.title}</button>`).join('');$('step').textContent='ÉTAPE '+(current+1)+' SUR '+sections.length;updateCount();$('bar').style.width=((current+1)/sections.length*100)+'%';$('content').innerHTML=`<div class="step-illustration">${stepIcon(current)}</div><div class="badge">${current===0?'BIENVENUE DANS VOTRE PARCOURS':'MON ANAMNÈSE'}</div><h2 tabindex="-1">${s.sub}</h2><p>${s.intro}</p>`+(current===0?`<div class="cards"><div><b>7 étapes</b>ou plusieurs petits moments</div><div><b>À votre choix</b>les réponses au questionnaire sont facultatives après vos coordonnées</div></div><p class="note">Ce parcours prépare un échange avec votre psychologue. Vous n’avez pas à revivre ni à détailler des expériences difficiles ici.</p><h3>Vos réponses vous appartiennent</h3><p>Elles restent dans cette page. Activez la conservation sur cet appareil dans « Mes données » uniquement si vous le souhaitez. Aucun envoi automatique.</p><p class="hint">Avant de fermer : téléchargez vos réponses ou activez la conservation locale. Vous pourrez imprimer votre synthèse en PDF.</p>`:s.fields.map(field).join(''))+(current===sections.length-1?`<div class="note">Une synthèse descriptive, à discuter ensemble. Les réponses non renseignées restent signalées. Aucun score total ni diagnostic n’est calculé.</div><div class="share-panel"><h3>Télécharger et partager</h3><p>Téléchargez le PDF, puis joignez-le au message si vous souhaitez le transmettre au cabinet.</p><div class="actions"><button id="pdf">Télécharger le PDF</button><a class="share-link" href="mailto:contact@ombaliz.com?subject=Synth%C3%A8se%20d%E2%80%99anamn%C3%A8se">Envoyer par e-mail</a><a class="share-link" href="https://wa.me/33626751917" target="_blank" rel="noopener noreferrer">Ouvrir WhatsApp</a></div><p id="pdf-status" class="hint" role="status"></p><details><summary>Autres options</summary><div class="actions"><button id="print" class="secondary">Imprimer / PDF</button><button id="download" class="secondary">Télécharger en texte non chiffré</button><button id="secure" class="secondary">Préparer un envoi chiffré</button></div></details></div><div class="review">${summary()}</div>`:'');$('prev').disabled=current===0;$('next').textContent=current===sections.length-1?'Revenir à l’accueil':'Continuer →';document.querySelectorAll('[data-page]').forEach(el=>el.onclick=()=>go(+el.dataset.page));document.querySelectorAll('[data-k]').forEach(el=>{const handler=()=>{const k=el.dataset.k;
if(current===1)el.setCustomValidity('');
if(el.type==='checkbox'){
  const selected=[...el.closest('fieldset').querySelectorAll('input:checked')].map(input=>input.value);
  if(selected.length)answers[k]=selected.join(', ');else delete answers[k];
  persist();updateCount();return;
}
if(el.type==='email')$('e'+k).textContent=el.validity.valid?'':'Vérifiez le format de votre adresse mail.';if(el.value==='')delete answers[k];else answers[k]=el.type==='range'?+el.value:el.value;if(el.type==='range')$('o'+k).textContent=el.value+'/10';persist();updateCount()};el.addEventListener('input',handler);el.addEventListener('change',handler)});document.querySelectorAll('[data-skip]').forEach(el=>el.onclick=()=>{answers[el.dataset.skip]='À aborder en séance';persist();render()});if($('pdf'))$('pdf').onclick=downloadPdf;if($('secure'))$('secure').onclick=openSecure;if($('print'))$('print').onclick=()=>{$('report').innerHTML='<img src="logo.svg" alt="Ombaliz Thérapie"><h2>Mon histoire · Anamnèse</h2><p>Document personnel et confidentiel · '+new Date().toLocaleDateString('fr-FR')+'</p><p>Déclarations du patient. Repères 0–10 non diagnostiques. À relire avec le psychologue.</p>'+summary();window.print()};if($('download'))$('download').onclick=()=>{const blob=new Blob(['OMBALIZ THÉRAPIE · ANAMNÈSE\nDocument personnel et confidentiel\n'+new Date().toLocaleDateString('fr-FR')+'\nAutoévaluations non diagnostiques.\n'+summary(false)],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mon-anamnese-ombaliz.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}}
function go(i){
  if(i>1&&current<=1){
    if(current!==1){current=1;render()}
    const inputs=sections[1].fields.map((_,index)=>$('f'+key(1,index)));
    for(const input of inputs){
      const missing=!input.value.trim()||input.value==='À aborder en séance';
      input.setCustomValidity(missing?'Veuillez renseigner ce champ.':'');
      if(!input.reportValidity())return;
    }
  }
  current=i;render();$('content').querySelector('h2').focus({preventScroll:true});window.scrollTo({top:0,behavior:'smooth'})}$('prev').onclick=()=>go(Math.max(0,current-1));$('next').onclick=()=>go((current+1)%sections.length);$('privacy').onclick=()=>{$('remember').checked=remember;$('dialog').showModal()};$('close').onclick=()=>$('dialog').close();$('remember').onchange=e=>{remember=e.target.checked;if(remember)persist();else try{localStorage.removeItem(KEY)}catch{}};$('erase').onclick=()=>{if(confirm('Effacer toutes les réponses sur cet appareil et dans cette page ?')){answers={};remember=false;$('remember').checked=false;try{localStorage.removeItem(KEY)}catch{}render();$('dialog').close()}};render();

function openSecure(){const dialog=document.getElementById('send-dialog');document.getElementById('secret').value=OmbalizSecure.password();document.getElementById('secret-saved').checked=false;document.getElementById('send-status').textContent='';document.getElementById('mail-ready').hidden=true;dialog.showModal()}
document.getElementById('send-close').onclick=()=>{document.getElementById('secret').value='';document.getElementById('send-dialog').close()};
document.getElementById('encrypted-download').onclick=async()=>{const status=document.getElementById('send-status'),btn=document.getElementById('encrypted-download');if(!document.getElementById('secret-saved').checked){status.textContent='Notez le mot de passe et cochez la case avant de télécharger.';return}btn.disabled=true;try{const text='OMBALIZ THÉRAPIE · ANAMNÈSE\nDocument confidentiel · '+new Date().toLocaleDateString('fr-FR')+'\nRepères non diagnostiques.\n'+summary(false);const encrypted=await OmbalizSecure.encrypt(text,document.getElementById('secret').value),url=URL.createObjectURL(new Blob([encrypted],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='reponses-ombaliz.ombaliz';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);status.textContent='Fichier préparé. Joignez reponses-ombaliz.ombaliz à votre message. Rien n’a encore été envoyé. Communiquez le mot de passe séparément, par téléphone ou en séance.';document.getElementById('mail-ready').hidden=false}catch{status.textContent='La préparation a échoué. Aucun envoi effectué. Réessayez dans un navigateur récent en HTTPS.'}finally{btn.disabled=false}};
