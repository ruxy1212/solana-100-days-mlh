@echo off
setlocal enabledelayedexpansion

if "%~1"=="--create-week" (

  set "week=%~2"

  set /a end=week*7
  set /a start=end-6

  mkdir "week!week!"
  echo Created folder for week !week!

  for /L %%i in (!start!,1,!end!) do (
    mkdir "week!week!\day%%i"
    echo Created folder for day %%i
  )
)

echo Execution complete!
endlocal