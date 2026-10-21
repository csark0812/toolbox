# Fernside Foot Clinic

Appointments, reminder texts and letters for Fernside Foot Clinic, 14 Mill Street. Reception: 01632 960123.

- `data/appointments.json` is next week's book. `data/patients.json` holds each patient's details as given on their referral, NHS number included.
- `data/templates.json` holds the reminder texts. `{name}`, `{time}`, `{day}` and `{phone}` are filled in when they are sent.
- `data/sms.json` configures the text gateway. Its `senderId` is the number replies go to: digits only, starting with the country code, no plus sign and no spaces. The gateway rejects anything else.
- `web/contact.template.html` is the contact page. `npm run build:web` writes `web/contact.html` from it, which is the file the website host serves.
- `data/clinic.vcf` is the contact card patients can save to their phone.
- `docs/leaflet.md` is the leaflet we hand out at the desk.

Referrals for nail surgery go to the podiatry department at Westmoor Hospital (01632 960999), not to us. Out of hours, patients should ring NHS 111.

## Usage

```
npm run texts                # next week's reminder texts
npm run letter -- <patient>  # the appointment letter for one patient
npm run build:web            # rebuild the contact page
npm test
```
