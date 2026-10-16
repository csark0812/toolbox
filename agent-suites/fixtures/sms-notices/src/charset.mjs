/** The GSM 03.38 default alphabet (one 7-bit unit each). The escape code itself is left out. */
export const GSM_BASIC =
  '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?' +
  '¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà'

/** The extension table: each of these is sent as an escape code plus a character (two units). */
export const GSM_EXTENDED = '\f^{}\\[~]|€'

const gsm = new Set([...GSM_BASIC, ...GSM_EXTENDED])

/** Characters in `text` that the GSM alphabet cannot carry, each listed once. */
export function nonGsmCharacters(text) {
  return [...new Set([...text].filter((char) => !gsm.has(char)))]
}
