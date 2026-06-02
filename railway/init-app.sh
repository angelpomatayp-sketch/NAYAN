#!/usr/bin/env sh
set -eu

php artisan migrate --force

SHOULD_SEED="$(php -r "require 'vendor/autoload.php'; \$app = require 'bootstrap/app.php'; \$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); echo Illuminate\Support\Facades\Schema::hasTable('users') && Illuminate\Support\Facades\DB::table('users')->exists() ? 'no' : 'yes';")"

if [ "$SHOULD_SEED" = "yes" ]; then
    php artisan db:seed --force
fi

php artisan optimize:clear
php artisan config:cache
php artisan event:cache
php artisan route:cache
php artisan view:cache
