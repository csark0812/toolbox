// Switches the form between English and Welsh, and shows the error messages on Send.
const TEXT = {
  en: {
    title: 'Enter the Eisteddfod',
    intro: 'Entries for the Cwm Teifi Eisteddfod close on Friday 3 April. One form per competitor.',
    name: 'Full name',
    nameHint: 'As it should appear in the programme.',
    nameError: 'Please tell us your name.',
    email: 'Email',
    emailHint: 'We send your entry number here.',
    emailError: 'Please enter an email address.',
    phone: 'Mobile number',
    competition: 'Competition',
    competitionError: 'Please choose a competition.',
    choose: 'Choose…',
    c1: 'Solo, under 12',
    c2: 'Recitation, under 16',
    c3: 'Folk song, open',
    c4: 'Piano solo, open',
    accompanist: 'Accompanist',
    accompanistHint: 'Leave blank to use the official accompanist.',
    fee: 'Entry fee',
    feeHint: '£4 for under 16s, £6 for everyone else.',
    needs: 'Access needs',
    needsHint: 'Anything that would help you on the day.',
    send: 'Send entry',
    save: 'Save for later',
  },
  cy: {
    title: 'Cystadlu yn yr Eisteddfod',
    intro:
      'Mae’r cyfnod cystadlu ar gyfer Eisteddfod Cwm Teifi yn cau ddydd Gwener 3 Ebrill. Un ffurflen i bob cystadleuydd.',
    name: 'Enw llawn',
    nameHint: 'Fel y dylai ymddangos yn y rhaglen.',
    nameError:
      'Rhowch eich enw llawn, os gwelwch yn dda, fel y gallwn ei argraffu’n gywir yn rhaglen y dydd.',
    email: 'Cyfeiriad e-bost',
    emailHint: 'Byddwn yn anfon rhif eich cais i’r cyfeiriad hwn.',
    emailError:
      'Rhowch gyfeiriad e-bost, os gwelwch yn dda, er mwyn i ni allu anfon rhif eich cais atoch.',
    phone: 'Rhif ffôn symudol',
    competition: 'Cystadleuaeth',
    competitionError:
      'Dewiswch gystadleuaeth, os gwelwch yn dda, cyn anfon y ffurflen at ysgrifennydd yr eisteddfod.',
    choose: 'Dewiswch…',
    c1: 'Unawd, dan 12',
    c2: 'Llefaru, dan 16',
    c3: 'Cân werin, agored',
    c4: 'Unawd piano, agored',
    accompanist: 'Enw’r cyfeilydd',
    accompanistHint: 'Gadewch yn wag i ddefnyddio cyfeilydd swyddogol yr eisteddfod.',
    fee: 'Ffi gystadlu',
    feeHint: '£4 i rai dan 16, £6 i bawb arall.',
    needs: 'Unrhyw anghenion hygyrchedd neu gymorth ychwanegol',
    needsHint: 'Unrhyw beth a fyddai’n eich helpu ar y diwrnod.',
    send: 'Anfon y cais',
    save: 'Cadw a gorffen wedyn',
  },
}

function setLanguage(lang) {
  document.documentElement.lang = lang
  for (const el of document.querySelectorAll('[data-i18n]'))
    el.textContent = TEXT[lang][el.dataset.i18n]
  for (const button of document.querySelectorAll('.lang button'))
    button.setAttribute('aria-pressed', String(button.dataset.lang === lang))
}

for (const button of document.querySelectorAll('.lang button'))
  button.addEventListener('click', () => setLanguage(button.dataset.lang))

document.querySelector('.entry-form').addEventListener('submit', (event) => {
  event.preventDefault()
  for (const error of document.querySelectorAll('.error')) {
    const field = document.getElementById(error.dataset.for)
    const empty = !field.value.trim()
    error.hidden = !empty
    field.toggleAttribute('aria-invalid', empty)
  }
})
