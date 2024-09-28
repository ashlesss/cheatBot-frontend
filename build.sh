
if quasar build; then 
  echo "* Quasar build successful"
  if [ -d "/var/www/cheatBot/" ]; then
    rm -r -f /var/www/cheatBot/dist/
    echo "* Old dist directory removed successfully"
  else
    echo "* Directory /var/www/cheatBot/ does not exist"
    echo "* Creating /var/www/cheatBot/"
    mkdir -p /var/www/cheatBot/
  fi

  mv ./dist /var/www/cheatBot/ && echo "* ALL DONE" || echo "* Failed"
else
  echo "* Quasar build failed"
fi



