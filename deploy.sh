#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

for command in git yarn pm2; do
  if ! command -v "$command" >/dev/null 2>&1; then
    printf 'Required command is missing: %s\n' "$command" >&2
    exit 1
  fi
done

printf 'Stopping PM2 processes...\n'
pm2 stop all

printf 'Updating repository to origin/master...\n'
git fetch origin master
git reset --hard origin/master

printf 'Installing dependencies...\n'
yarn install --frozen-lockfile --non-interactive --production=false

printf 'Testing the Telegram bot...\n'
yarn test:bot

printf 'Building the website...\n'
yarn build

printf 'Starting project processes from pm2.json...\n'
pm2 startOrRestart pm2.json --update-env

printf 'Restarting all PM2 processes and saving the list...\n'
pm2 restart all --update-env
pm2 save
pm2 ls
