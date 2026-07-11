# GPG key — second machine

Toolbox encrypts `personal/raw/**` with git-crypt. Your machines need the same GPG secret key.

## First machine (this one)

After `git-crypt init` and `git-crypt add-gpg-user`:

```bash
./scripts/export-gpg-key.sh
# Store ~/toolbox-gpg-secret-<key-id>.asc in 1Password or offline backup
# Delete local .asc after storing securely
```

## Second machine

```bash
brew install git-crypt gnupg
gpg --import /path/to/toolbox-gpg-secret.asc   # from secure storage
gpg --list-secret-keys                          # verify

git clone git@github.com:csark0812/toolbox.git ~/Repositories/toolbox
cd ~/Repositories/toolbox
git-crypt unlock
./scripts/bootstrap.sh
```

## Rotate / add key

```bash
gpg --gen-key
cd ~/Repositories/toolbox
git-crypt add-gpg-user <new-key-id>
git commit -m "Add git-crypt user"
```

## Troubleshooting

- `git-crypt unlock` fails → key not imported or wrong key
- Encrypted files show as binary in `git show` — expected
- After `git pull`, run `git-crypt unlock` if encrypted files changed
